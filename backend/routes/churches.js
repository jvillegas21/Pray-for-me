const express = require('express');
const { query, validationResult } = require('express-validator');
const axios = require('axios');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/churches/nearby
// @desc    Find churches near a location
// @access  Public
router.get('/nearby', optionalAuth, [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Radius must be between 1 and 50 km'),
  query('denomination')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Denomination must not be empty'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      latitude,
      longitude,
      radius = 10,
      denomination,
      limit = 20
    } = req.query;

    // Use Google Places API to find churches
    const googlePlacesKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!googlePlacesKey) {
      // Fallback to mock data if no API key
      return res.json({
        churches: getMockChurches(latitude, longitude),
        message: 'Using mock data. Configure GOOGLE_PLACES_API_KEY for real data.',
        location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
      });
    }

    try {
      // Build search query
      let keyword = 'church';
      if (denomination) {
        keyword = `${denomination} church`;
      }

      const placesResponse = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: {
          location: `${latitude},${longitude}`,
          radius: radius * 1000, // Convert km to meters
          keyword: keyword,
          type: 'church',
          key: googlePlacesKey
        }
      });

      const places = placesResponse.data.results || [];
      
      // Format church data
      const churches = places.slice(0, parseInt(limit)).map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        location: {
          type: 'Point',
          coordinates: [place.geometry.location.lng, place.geometry.location.lat]
        },
        rating: place.rating || null,
        totalRatings: place.user_ratings_total || 0,
        priceLevel: place.price_level || null,
        isOpen: place.opening_hours?.open_now || null,
        types: place.types || [],
        photos: place.photos ? place.photos.slice(0, 3).map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${googlePlacesKey}`
        })) : [],
        distance: calculateDistance(
          parseFloat(latitude), 
          parseFloat(longitude), 
          place.geometry.location.lat, 
          place.geometry.location.lng
        )
      }));

      // Sort by distance
      churches.sort((a, b) => a.distance - b.distance);

      res.json({
        churches,
        location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        radius: parseInt(radius),
        count: churches.length,
        denomination: denomination || 'all'
      });

    } catch (apiError) {
      console.error('Google Places API error:', apiError.message);
      
      // Fallback to mock data if API fails
      return res.json({
        churches: getMockChurches(latitude, longitude),
        message: 'Google Places API unavailable. Using fallback data.',
        location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
      });
    }

  } catch (error) {
    console.error('Find churches error:', error);
    res.status(500).json({
      error: 'Failed to find churches',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/churches/:id/details
// @desc    Get detailed information about a specific church
// @access  Public
router.get('/:id/details', [
  query('fields')
    .optional()
    .isIn(['basic', 'contact', 'hours', 'photos', 'reviews', 'all'])
    .withMessage('Invalid fields parameter'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { fields = 'basic' } = req.query;

    const googlePlacesKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!googlePlacesKey) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Church details service requires Google Places API configuration'
      });
    }

    // Define field mappings
    const fieldMappings = {
      basic: 'name,vicinity,geometry,rating,user_ratings_total',
      contact: 'name,vicinity,formatted_phone_number,website,geometry',
      hours: 'name,vicinity,opening_hours,geometry',
      photos: 'name,vicinity,photos,geometry',
      reviews: 'name,vicinity,reviews,geometry',
      all: 'name,vicinity,formatted_address,formatted_phone_number,website,opening_hours,photos,reviews,geometry,rating,user_ratings_total,price_level'
    };

    try {
      const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          place_id: id,
          fields: fieldMappings[fields],
          key: googlePlacesKey
        }
      });

      const place = detailsResponse.data.result;
      
      if (!place) {
        return res.status(404).json({
          error: 'Church not found',
          message: 'The requested church was not found'
        });
      }

      // Format church details
      const churchDetails = {
        id: id,
        name: place.name,
        address: place.formatted_address || place.vicinity,
        location: place.geometry ? {
          type: 'Point',
          coordinates: [place.geometry.location.lng, place.geometry.location.lat]
        } : null,
        phone: place.formatted_phone_number || null,
        website: place.website || null,
        rating: place.rating || null,
        totalRatings: place.user_ratings_total || 0,
        priceLevel: place.price_level || null,
        openingHours: place.opening_hours ? {
          isOpen: place.opening_hours.open_now || null,
          periods: place.opening_hours.periods || [],
          weekdayText: place.opening_hours.weekday_text || []
        } : null,
        photos: place.photos ? place.photos.slice(0, 10).map(photo => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
          url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${googlePlacesKey}`
        })) : [],
        reviews: place.reviews ? place.reviews.slice(0, 5).map(review => ({
          authorName: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.time,
          relativeTime: review.relative_time_description
        })) : []
      };

      res.json({
        church: churchDetails,
        requestedFields: fields
      });

    } catch (apiError) {
      console.error('Google Places Details API error:', apiError.message);
      res.status(503).json({
        error: 'Service unavailable',
        message: 'Unable to fetch church details at this time'
      });
    }

  } catch (error) {
    console.error('Get church details error:', error);
    res.status(500).json({
      error: 'Failed to get church details',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/churches/denominations
// @desc    Get list of common church denominations
// @access  Public
router.get('/denominations', (req, res) => {
  const denominations = [
    { name: 'Catholic', searchTerms: ['catholic', 'roman catholic'] },
    { name: 'Baptist', searchTerms: ['baptist', 'southern baptist'] },
    { name: 'Methodist', searchTerms: ['methodist', 'united methodist'] },
    { name: 'Presbyterian', searchTerms: ['presbyterian', 'pca', 'pcusa'] },
    { name: 'Lutheran', searchTerms: ['lutheran', 'elca', 'lcms'] },
    { name: 'Pentecostal', searchTerms: ['pentecostal', 'assemblies of god'] },
    { name: 'Episcopal', searchTerms: ['episcopal', 'anglican'] },
    { name: 'Non-denominational', searchTerms: ['non-denominational', 'community church'] },
    { name: 'Orthodox', searchTerms: ['orthodox', 'eastern orthodox', 'greek orthodox'] },
    { name: 'Evangelical', searchTerms: ['evangelical', 'evangelical free'] },
    { name: 'Reformed', searchTerms: ['reformed', 'christian reformed'] },
    { name: 'Adventist', searchTerms: ['adventist', 'seventh-day adventist'] },
    { name: 'Congregational', searchTerms: ['congregational', 'ucc'] },
    { name: 'Nazarene', searchTerms: ['nazarene', 'church of nazarene'] }
  ];

  res.json({
    denominations,
    count: denominations.length
  });
});

// Utility function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

// Mock church data for fallback
function getMockChurches(latitude, longitude) {
  return [
    {
      id: 'mock_church_1',
      name: 'Grace Community Church',
      address: 'Near your location',
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude) + 0.01, parseFloat(latitude) + 0.01]
      },
      rating: 4.5,
      totalRatings: 125,
      isOpen: true,
      types: ['church', 'place_of_worship'],
      photos: [],
      distance: 1.2
    },
    {
      id: 'mock_church_2',
      name: 'First Baptist Church',
      address: 'Near your location',
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude) - 0.02, parseFloat(latitude) + 0.015]
      },
      rating: 4.8,
      totalRatings: 89,
      isOpen: null,
      types: ['church', 'place_of_worship'],
      photos: [],
      distance: 2.1
    },
    {
      id: 'mock_church_3',
      name: 'St. Mary\'s Catholic Church',
      address: 'Near your location',
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude) + 0.005, parseFloat(latitude) - 0.02]
      },
      rating: 4.3,
      totalRatings: 67,
      isOpen: false,
      types: ['church', 'place_of_worship'],
      photos: [],
      distance: 2.8
    }
  ];
}

module.exports = router;
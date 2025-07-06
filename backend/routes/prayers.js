const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Prayer = require('../models/Prayer');
const StudyGuide = require('../models/StudyGuide');
const { auth, optionalAuth } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// @route   POST /api/prayers
// @desc    Create a new prayer
// @access  Private
router.post('/', auth, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content is required and must be less than 2000 characters'),
  body('category')
    .isIn(['healing', 'family', 'work', 'relationships', 'financial', 'spiritual', 'guidance', 'thanksgiving', 'forgiveness', 'protection', 'strength', 'peace', 'other'])
    .withMessage('Invalid category'),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid urgency level'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  body('visibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Invalid visibility setting'),
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
      title,
      content,
      category,
      urgency,
      latitude,
      longitude,
      address,
      city,
      country,
      isAnonymous,
      visibility
    } = req.body;

    // Create prayer object
    const prayer = new Prayer({
      title,
      content,
      category,
      urgency: urgency || 'medium',
      author: req.user._id,
      isAnonymous: isAnonymous || false,
      visibility: visibility || 'public',
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address: address || '',
        city: city || '',
        country: country || '',
      },
    });

    // Save prayer first
    await prayer.save();

    // Generate AI-powered Bible verses and tags in background
    try {
      const [bibleVerses, tags] = await Promise.all([
        aiService.generateBibleVersesForPrayer(content, category, urgency),
        aiService.enhancePrayerTags(content, category)
      ]);

      // Update prayer with AI-generated content
      prayer.bibleVerses = bibleVerses;
      prayer.tags = tags;
      await prayer.save();
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      // Prayer is still saved, just without AI enhancements
    }

    // Update user statistics
    await req.user.updateOne({
      $inc: { 'stats.prayersSubmitted': 1 }
    });

    // Populate author information
    await prayer.populate('author', 'username firstName lastName profilePicture');

    res.status(201).json({
      message: 'Prayer created successfully',
      prayer: prayer
    });
  } catch (error) {
    console.error('Create prayer error:', error);
    res.status(500).json({
      error: 'Failed to create prayer',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/prayers
// @desc    Get prayers (with optional location filtering)
// @access  Public
router.get('/', optionalAuth, [
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Radius must be between 1 and 100 km'),
  query('category')
    .optional()
    .isIn(['healing', 'family', 'work', 'relationships', 'financial', 'spiritual', 'guidance', 'thanksgiving', 'forgiveness', 'protection', 'strength', 'peace', 'other'])
    .withMessage('Invalid category'),
  query('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid urgency level'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'popular', 'trending'])
    .withMessage('Invalid sort option'),
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
      category,
      urgency,
      limit = 20,
      page = 1,
      sort = 'newest',
      answered
    } = req.query;

    let query = {
      isActive: true,
      visibility: 'public',
      moderationStatus: 'approved'
    };

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add urgency filter
    if (urgency) {
      query.urgency = urgency;
    }

    // Add answered filter
    if (answered !== undefined) {
      query.answered = answered === 'true';
    }

    let prayers;
    const skip = (page - 1) * limit;

    if (latitude && longitude) {
      // Location-based query
      prayers = await Prayer.findPrayersNearLocation(
        parseFloat(longitude),
        parseFloat(latitude),
        parseInt(radius),
        { category, urgency, answered, limit: parseInt(limit) }
      );
    } else {
      // Regular query
      let sortOption = {};
      switch (sort) {
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'popular':
          sortOption = { viewsCount: -1, prayedForCount: -1, createdAt: -1 };
          break;
        case 'trending':
          sortOption = { viewsCount: -1, prayedForCount: -1, createdAt: -1 };
          break;
        case 'newest':
        default:
          sortOption = { createdAt: -1 };
      }

      prayers = await Prayer.find(query)
        .populate('author', 'username firstName lastName profilePicture')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));
    }

    // Get total count for pagination
    const totalCount = await Prayer.countDocuments(query);

    res.json({
      prayers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      filters: {
        category,
        urgency,
        answered,
        location: latitude && longitude ? { latitude, longitude, radius } : null
      }
    });
  } catch (error) {
    console.error('Get prayers error:', error);
    res.status(500).json({
      error: 'Failed to get prayers',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/prayers/trending
// @desc    Get trending prayers
// @access  Public
router.get('/trending', optionalAuth, [
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

    const { limit = 20 } = req.query;

    const prayers = await Prayer.findTrendingPrayers({
      limit: parseInt(limit)
    });

    res.json({
      prayers,
      message: 'Trending prayers retrieved successfully'
    });
  } catch (error) {
    console.error('Get trending prayers error:', error);
    res.status(500).json({
      error: 'Failed to get trending prayers',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/prayers/my
// @desc    Get current user's prayers
// @access  Private
router.get('/my', auth, [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const prayers = await Prayer.find({
      author: req.user._id,
      isActive: true
    })
      .populate('author', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Prayer.countDocuments({
      author: req.user._id,
      isActive: true
    });

    res.json({
      prayers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      }
    });
  } catch (error) {
    console.error('Get my prayers error:', error);
    res.status(500).json({
      error: 'Failed to get prayers',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/prayers/:id
// @desc    Get a specific prayer
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id)
      .populate('author', 'username firstName lastName profilePicture')
      .populate('comments.user', 'username firstName lastName profilePicture');

    if (!prayer) {
      return res.status(404).json({
        error: 'Prayer not found',
        message: 'The requested prayer does not exist'
      });
    }

    // Check if user has permission to view this prayer
    if (prayer.visibility === 'private' && (!req.user || prayer.author._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to view this prayer'
      });
    }

    // Track view for ranking algorithm (anonymous)
    const sessionId = req.headers['x-session-id'] || req.ip;
    await prayer.addView(req.user?._id, sessionId);

    res.json({
      prayer,
      userInteraction: req.user ? {
        hasPrayedFor: prayer.isPrayedForByUser(req.user._id)
      } : null
    });
  } catch (error) {
    console.error('Get prayer error:', error);
    res.status(500).json({
      error: 'Failed to get prayer',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/prayers/:id
// @desc    Update a prayer
// @access  Private
router.put('/:id', auth, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be less than 2000 characters'),
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid urgency level'),
  body('visibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Invalid visibility setting'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const prayer = await Prayer.findById(req.params.id);

    if (!prayer) {
      return res.status(404).json({
        error: 'Prayer not found',
        message: 'The requested prayer does not exist'
      });
    }

    // Check if user owns this prayer
    if (prayer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own prayers'
      });
    }

    // Update allowed fields
    const allowedFields = ['title', 'content', 'urgency', 'visibility'];
    const updateFields = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Add update to updates array if content changed
    if (req.body.content && req.body.content !== prayer.content) {
      updateFields.$push = {
        updates: {
          content: `Prayer content updated`,
          updatedAt: new Date()
        }
      };
    }

    const updatedPrayer = await Prayer.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate('author', 'username firstName lastName profilePicture');

    res.json({
      message: 'Prayer updated successfully',
      prayer: updatedPrayer
    });
  } catch (error) {
    console.error('Update prayer error:', error);
    res.status(500).json({
      error: 'Failed to update prayer',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/prayers/:id
// @desc    Delete a prayer
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id);

    if (!prayer) {
      return res.status(404).json({
        error: 'Prayer not found',
        message: 'The requested prayer does not exist'
      });
    }

    // Check if user owns this prayer
    if (prayer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own prayers'
      });
    }

    // Soft delete - mark as inactive
    await Prayer.findByIdAndUpdate(req.params.id, {
      isActive: false
    });

    res.json({
      message: 'Prayer deleted successfully'
    });
  } catch (error) {
    console.error('Delete prayer error:', error);
    res.status(500).json({
      error: 'Failed to delete prayer',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/prayers/:id/pray
// @desc    Mark that user prayed for this prayer
// @access  Private
router.post('/:id/pray', auth, async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id);

    if (!prayer) {
      return res.status(404).json({
        error: 'Prayer not found',
        message: 'The requested prayer does not exist'
      });
    }

    const hasPrayedFor = prayer.isPrayedForByUser(req.user._id);

    if (!hasPrayedFor) {
      await prayer.addPrayerRecord(req.user._id);
      
      // Update user stats
      await req.user.updateOne({ $inc: { 'stats.prayersOffered': 1 } });
      
      // Update prayer author's stats
      await prayer.populate('author');
      if (prayer.author) {
        await prayer.author.updateOne({ $inc: { 'stats.prayersReceived': 1 } });
      }
    }

    res.json({
      message: hasPrayedFor ? 'Already praying for this request' : 'Thank you for praying!',
      prayedFor: true,
      prayedForCount: prayer.prayedForCount
    });
  } catch (error) {
    console.error('Pray for prayer error:', error);
    res.status(500).json({
      error: 'Failed to record prayer',
      message: 'Internal server error'
    });
  }
});



// @route   POST /api/prayers/:id/comment
// @desc    Add a comment to a prayer
// @access  Private
router.post('/:id/comment', auth, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const prayer = await Prayer.findById(req.params.id);

    if (!prayer) {
      return res.status(404).json({
        error: 'Prayer not found',
        message: 'The requested prayer does not exist'
      });
    }

    const { content } = req.body;

    await prayer.addComment(req.user._id, content);

    // Get updated prayer with populated comments
    const updatedPrayer = await Prayer.findById(req.params.id)
      .populate('comments.user', 'username firstName lastName profilePicture');

    res.json({
      message: 'Comment added successfully',
      comments: updatedPrayer.comments
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      error: 'Failed to add comment',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/prayers/:id/answered
// @desc    Mark prayer as answered
// @access  Private
router.post('/:id/answered', auth, [
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const prayer = await Prayer.findById(req.params.id);

    if (!prayer) {
      return res.status(404).json({
        error: 'Prayer not found',
        message: 'The requested prayer does not exist'
      });
    }

    // Check if user owns this prayer
    if (prayer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only mark your own prayers as answered'
      });
    }

    const { description } = req.body;

    await prayer.markAsAnswered(description);

    res.json({
      message: 'Prayer marked as answered',
      prayer: prayer
    });
  } catch (error) {
    console.error('Mark answered error:', error);
    res.status(500).json({
      error: 'Failed to mark prayer as answered',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/prayers/:id/study-guide
// @desc    Generate study guide for a prayer
// @access  Private
router.post('/:id/study-guide', auth, async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id);

    if (!prayer) {
      return res.status(404).json({
        error: 'Prayer not found',
        message: 'The requested prayer does not exist'
      });
    }

    // Check if study guide already exists
    const existingStudyGuide = await StudyGuide.findOne({
      prayerRequest: prayer._id
    });

    if (existingStudyGuide) {
      return res.json({
        message: 'Study guide already exists',
        studyGuide: existingStudyGuide
      });
    }

    // Generate study guide using AI
    const studyGuideData = await aiService.generateStudyGuide(
      prayer,
      prayer.bibleVerses || []
    );

    // Create study guide
    const studyGuide = new StudyGuide({
      ...studyGuideData,
      prayerRequest: prayer._id,
    });

    await studyGuide.save();

    // Update prayer with study guide reference
    prayer.studyGuide = studyGuide._id;
    await prayer.save();

    res.json({
      message: 'Study guide generated successfully',
      studyGuide: studyGuide
    });
  } catch (error) {
    console.error('Generate study guide error:', error);
    res.status(500).json({
      error: 'Failed to generate study guide',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/prayers/search
// @desc    Search prayers
// @access  Public
router.get('/search', optionalAuth, [
  query('q')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query is required'),
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

    const { q, limit = 20 } = req.query;

    const prayers = await Prayer.find({
      $text: { $search: q },
      isActive: true,
      visibility: 'public',
      moderationStatus: 'approved'
    })
      .populate('author', 'username firstName lastName profilePicture')
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit));

    res.json({
      prayers,
      query: q,
      count: prayers.length
    });
  } catch (error) {
    console.error('Search prayers error:', error);
    res.status(500).json({
      error: 'Failed to search prayers',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
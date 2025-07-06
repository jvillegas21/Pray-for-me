const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Prayer = require('../models/Prayer');
const User = require('../models/User');
const { generateBibleVerses } = require('../services/bibleService');

// @route   POST /api/prayers
// @desc    Create a new prayer
// @access  Private
router.post('/', [
  auth,
  body('title').not().isEmpty().trim().withMessage('Title is required'),
  body('content').not().isEmpty().trim().withMessage('Content is required'),
  body('category').optional().isIn(['healing', 'guidance', 'thanksgiving', 'protection', 'family', 'financial', 'spiritual', 'other']),
  body('visibility').optional().isIn(['public', 'local', 'private'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, visibility, location } = req.body;

    // Create prayer object
    const prayerData = {
      user: req.user.id,
      title,
      content,
      category: category || 'other',
      visibility: visibility || 'public',
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      city: location.city,
      country: location.country
    };

    const prayer = new Prayer(prayerData);
    await prayer.save();

    // Generate Bible verses using AI
    try {
      const verses = await generateBibleVerses(content, category);
      prayer.bibleVerses = verses;
      await prayer.save();
    } catch (error) {
      console.error('Error generating Bible verses:', error);
    }

    // Update user's submitted prayers
    await User.findByIdAndUpdate(req.user.id, {
      $push: { prayersSubmitted: prayer._id }
    });

    // Populate user info before sending response
    await prayer.populate('user', 'name');

    res.json(prayer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/prayers/nearby
// @desc    Get prayers near user's location
// @access  Private
router.get('/nearby', auth, async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 50000 } = req.query; // maxDistance in meters (default 50km)

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Location coordinates required' });
    }

    const prayers = await Prayer.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      visibility: { $in: ['public', 'local'] }
    })
    .populate('user', 'name')
    .sort('-createdAt')
    .limit(50);

    res.json(prayers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/prayers/trending
// @desc    Get trending prayers (most liked)
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const prayers = await Prayer.find({ visibility: 'public' })
      .populate('user', 'name')
      .sort('-likeCount -createdAt')
      .limit(20);

    res.json(prayers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/prayers/:id
// @desc    Get a specific prayer
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id)
      .populate('user', 'name')
      .populate('likes', 'name');

    if (!prayer) {
      return res.status(404).json({ message: 'Prayer not found' });
    }

    // Check if user has access to this prayer
    if (prayer.visibility === 'private' && prayer.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(prayer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Prayer not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/prayers/:id/like
// @desc    Like or unlike a prayer
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id);

    if (!prayer) {
      return res.status(404).json({ message: 'Prayer not found' });
    }

    // Check if prayer is accessible
    if (prayer.visibility === 'private' && prayer.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const userIndex = prayer.likes.indexOf(req.user.id);
    
    if (userIndex === -1) {
      // Like the prayer
      prayer.likes.push(req.user.id);
      prayer.likeCount = prayer.likes.length;
      
      // Add to user's liked prayers
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { prayersLiked: prayer._id }
      });
    } else {
      // Unlike the prayer
      prayer.likes.splice(userIndex, 1);
      prayer.likeCount = prayer.likes.length;
      
      // Remove from user's liked prayers
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { prayersLiked: prayer._id }
      });
    }

    await prayer.save();
    res.json({ likeCount: prayer.likeCount, liked: userIndex === -1 });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Prayer not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/prayers/:id/pray
// @desc    Increment prayer count
// @access  Private
router.put('/:id/pray', auth, async (req, res) => {
  try {
    const prayer = await Prayer.findByIdAndUpdate(
      req.params.id,
      { $inc: { prayerCount: 1 } },
      { new: true }
    );

    if (!prayer) {
      return res.status(404).json({ message: 'Prayer not found' });
    }

    res.json({ prayerCount: prayer.prayerCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/prayers/:id/answered
// @desc    Mark prayer as answered
// @access  Private (owner only)
router.put('/:id/answered', auth, async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id);

    if (!prayer) {
      return res.status(404).json({ message: 'Prayer not found' });
    }

    // Check if user owns this prayer
    if (prayer.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    prayer.answered = true;
    prayer.answeredDate = Date.now();
    await prayer.save();

    res.json(prayer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/prayers/user/:userId
// @desc    Get prayers by user
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const prayers = await Prayer.find({ 
      user: req.params.userId,
      $or: [
        { visibility: 'public' },
        { visibility: 'local' },
        { user: req.user.id } // Include private prayers if viewing own prayers
      ]
    })
    .populate('user', 'name')
    .sort('-createdAt');

    res.json(prayers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
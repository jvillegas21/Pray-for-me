const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Prayer = require('../models/Prayer');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get users (search/discover)
// @access  Public
router.get('/', optionalAuth, [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty'),
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
      search,
      latitude,
      longitude,
      radius = 10,
      limit = 20
    } = req.query;

    let query = {
      isActive: true,
      'preferences.showProfilePicture': true
    };

    let users;

    if (search) {
      // Text search
      users = await User.find({
        ...query,
        $text: { $search: search }
      })
        .select('username firstName lastName profilePicture bio stats location')
        .sort({ score: { $meta: 'textScore' } })
        .limit(parseInt(limit));
    } else if (latitude && longitude) {
      // Location-based search
      users = await User.findUsersNearLocation(
        parseFloat(longitude),
        parseFloat(latitude),
        parseInt(radius)
      )
        .select('username firstName lastName profilePicture bio stats location')
        .limit(parseInt(limit));
    } else {
      // Recent users
      users = await User.find(query)
        .select('username firstName lastName profilePicture bio stats')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
    }

    res.json({
      users,
      count: users.length,
      filters: {
        search,
        location: latitude && longitude ? { latitude, longitude, radius } : null
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Get user's public prayers
    const prayers = await Prayer.find({
      author: user._id,
      visibility: 'public',
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'username firstName lastName profilePicture');

    // Check if current user is friends with this user
    let friendshipStatus = null;
    if (req.user) {
      const friendship = user.friends.find(
        friend => friend.user.toString() === req.user._id.toString()
      );
      friendshipStatus = friendship ? friendship.status : null;
    }

    res.json({
      user: user.getPublicProfile(),
      prayers,
      friendshipStatus,
      isOwnProfile: req.user ? req.user._id.toString() === user._id.toString() : false
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Failed to get user profile',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/users/:id/prayers
// @desc    Get user's prayers
// @access  Public
router.get('/:id/prayers', optionalAuth, [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
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

    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Determine prayer visibility based on relationship
    let visibilityFilter = ['public'];
    
    if (req.user && req.user._id.toString() === user._id.toString()) {
      // User viewing their own prayers
      visibilityFilter = ['public', 'friends', 'private'];
    } else if (req.user) {
      // Check if they're friends
      const friendship = user.friends.find(
        friend => friend.user.toString() === req.user._id.toString()
      );
      if (friendship && friendship.status === 'accepted') {
        visibilityFilter = ['public', 'friends'];
      }
    }

    const prayers = await Prayer.find({
      author: user._id,
      visibility: { $in: visibilityFilter },
      isActive: true
    })
      .populate('author', 'username firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Prayer.countDocuments({
      author: user._id,
      visibility: { $in: visibilityFilter },
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
    console.error('Get user prayers error:', error);
    res.status(500).json({
      error: 'Failed to get user prayers',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/users/:id/friend
// @desc    Send friend request
// @access  Private
router.post('/:id/friend', auth, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'You cannot send a friend request to yourself'
      });
    }

    const targetUser = await User.findById(req.params.id);

    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Check if friendship already exists
    const existingFriendship = targetUser.friends.find(
      friend => friend.user.toString() === req.user._id.toString()
    );

    if (existingFriendship) {
      return res.status(400).json({
        error: 'Friend request already exists',
        message: `Friend request is ${existingFriendship.status}`
      });
    }

    // Add friend request to target user
    targetUser.friends.push({
      user: req.user._id,
      status: 'pending'
    });

    await targetUser.save();

    res.json({
      message: 'Friend request sent successfully',
      status: 'pending'
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      error: 'Failed to send friend request',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/users/:id/friend
// @desc    Accept/reject friend request
// @access  Private
router.put('/:id/friend', auth, async (req, res) => {
  try {
    const { action } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'Action must be either "accept" or "reject"'
      });
    }

    const requesterUser = await User.findById(req.params.id);

    if (!requesterUser || !requesterUser.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Find the friend request
    const friendRequest = req.user.friends.find(
      friend => friend.user.toString() === requesterUser._id.toString()
    );

    if (!friendRequest) {
      return res.status(404).json({
        error: 'Friend request not found',
        message: 'No pending friend request from this user'
      });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Friend request is not pending'
      });
    }

    if (action === 'accept') {
      // Update both users' friend lists
      friendRequest.status = 'accepted';
      
      // Add reciprocal friendship
      const reciprocalFriendship = requesterUser.friends.find(
        friend => friend.user.toString() === req.user._id.toString()
      );
      
      if (reciprocalFriendship) {
        reciprocalFriendship.status = 'accepted';
      } else {
        requesterUser.friends.push({
          user: req.user._id,
          status: 'accepted'
        });
      }
      
      await Promise.all([req.user.save(), requesterUser.save()]);
      
      res.json({
        message: 'Friend request accepted',
        status: 'accepted'
      });
    } else {
      // Remove friend request
      req.user.friends = req.user.friends.filter(
        friend => friend.user.toString() !== requesterUser._id.toString()
      );
      
      await req.user.save();
      
      res.json({
        message: 'Friend request rejected',
        status: 'rejected'
      });
    }
  } catch (error) {
    console.error('Handle friend request error:', error);
    res.status(500).json({
      error: 'Failed to handle friend request',
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/users/:id/friend
// @desc    Remove friend/cancel friend request
// @access  Private
router.delete('/:id/friend', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Remove from both users' friend lists
    req.user.friends = req.user.friends.filter(
      friend => friend.user.toString() !== targetUser._id.toString()
    );

    targetUser.friends = targetUser.friends.filter(
      friend => friend.user.toString() !== req.user._id.toString()
    );

    await Promise.all([req.user.save(), targetUser.save()]);

    res.json({
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      error: 'Failed to remove friend',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/users/me/friends
// @desc    Get current user's friends
// @access  Private
router.get('/me/friends', auth, [
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'blocked'])
    .withMessage('Invalid status filter'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { status } = req.query;

    await req.user.populate({
      path: 'friends.user',
      select: 'username firstName lastName profilePicture bio lastSeen'
    });

    let friends = req.user.friends;

    if (status) {
      friends = friends.filter(friend => friend.status === status);
    }

    res.json({
      friends: friends.map(friend => ({
        user: friend.user,
        status: friend.status,
        createdAt: friend.createdAt
      })),
      count: friends.length
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      error: 'Failed to get friends',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/users/me/stats
// @desc    Get current user's detailed stats
// @access  Private
router.get('/me/stats', auth, async (req, res) => {
  try {
    // Get detailed prayer statistics
    const prayerStats = await Prayer.aggregate([
      {
        $match: {
          author: req.user._id,
          isActive: true
        }
      },
      {
        $group: {
                  _id: null,
        totalPrayers: { $sum: 1 },
        totalViews: { $sum: '$viewsCount' },
        totalPrayedFor: { $sum: '$prayedForCount' },
          answeredPrayers: {
            $sum: {
              $cond: [{ $eq: ['$answered', true] }, 1, 0]
            }
          },
          categoryCounts: {
            $push: '$category'
          }
        }
      }
    ]);

    // Count prayers by category
    const categoryStats = await Prayer.aggregate([
      {
        $match: {
          author: req.user._id,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = prayerStats[0] || {
      totalPrayers: 0,
      totalViews: 0,
      totalPrayedFor: 0,
      answeredPrayers: 0
    };

    const categoryBreakdown = categoryStats.reduce((acc, category) => {
      acc[category._id] = category.count;
      return acc;
    }, {});

    res.json({
      stats: {
        ...req.user.stats,
        detailed: {
          ...stats,
          categoryBreakdown,
          answerRate: stats.totalPrayers > 0 ? 
            (stats.answeredPrayers / stats.totalPrayers * 100).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to get user stats',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get user leaderboard
// @access  Public
router.get('/leaderboard', [
  query('type')
    .optional()
    .isIn(['prayers', 'prayers-offered', 'helped'])
    .withMessage('Invalid leaderboard type'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { type = 'prayers', limit = 20 } = req.query;

    let sortField;
    switch (type) {
      case 'prayers-offered':
        sortField = 'stats.prayersOffered';
        break;
      case 'helped':
        sortField = 'stats.prayersReceived';
        break;
      case 'prayers':
      default:
        sortField = 'stats.prayersSubmitted';
        break;
    }

    const users = await User.find({
      isActive: true,
      'preferences.showProfilePicture': true
    })
      .select('username firstName lastName profilePicture stats')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit));

    res.json({
      leaderboard: users.map((user, index) => ({
        rank: index + 1,
        user: {
          id: user._id,
          username: user.username,
          fullName: user.getFullName(),
          profilePicture: user.profilePicture
        },
        score: user.stats[sortField.split('.')[1]]
      })),
      type
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to get leaderboard',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const StudyGuide = require('../models/StudyGuide');
const Prayer = require('../models/Prayer');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/study/guides
// @desc    Get study guides
// @access  Public
router.get('/guides', optionalAuth, [
  query('category')
    .optional()
    .isIn(['healing', 'family', 'work', 'relationships', 'financial', 'spiritual', 'guidance', 'thanksgiving', 'forgiveness', 'protection', 'strength', 'peace', 'other'])
    .withMessage('Invalid category'),
  query('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'popular', 'rating'])
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
      category,
      difficulty,
      limit = 20,
      page = 1,
      sort = 'newest'
    } = req.query;

    let query = {
      isActive: true,
      isPublic: true
    };

    // Add filters
    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Set sort options
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { usageCount: -1, createdAt: -1 };
        break;
      case 'rating':
        sortOption = { 'rating.average': -1, 'rating.count': -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const studyGuides = await StudyGuide.find(query)
      .populate('prayerRequest', 'title category author')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await StudyGuide.countDocuments(query);

    res.json({
      studyGuides,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      filters: {
        category,
        difficulty,
        sort
      }
    });
  } catch (error) {
    console.error('Get study guides error:', error);
    res.status(500).json({
      error: 'Failed to get study guides',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/study/guides/:id
// @desc    Get specific study guide
// @access  Public
router.get('/guides/:id', optionalAuth, async (req, res) => {
  try {
    const studyGuide = await StudyGuide.findById(req.params.id)
      .populate('prayerRequest', 'title content category author')
      .populate('prayerRequest.author', 'username firstName lastName');

    if (!studyGuide) {
      return res.status(404).json({
        error: 'Study guide not found',
        message: 'The requested study guide does not exist'
      });
    }

    if (!studyGuide.isActive || !studyGuide.isPublic) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'This study guide is not available'
      });
    }

    // Check if user has started this study
    let userProgress = null;
    if (req.user) {
      const completion = studyGuide.completions.find(
        c => c.user.toString() === req.user._id.toString()
      );
      
      if (completion) {
        userProgress = {
          startedAt: completion.startedAt,
          completedAt: completion.completedAt,
          progress: completion.progress,
          notes: completion.notes,
          answers: completion.answers
        };
      }
    }

    res.json({
      studyGuide,
      userProgress,
      isStarted: userProgress !== null,
      isCompleted: userProgress?.completedAt !== undefined
    });
  } catch (error) {
    console.error('Get study guide error:', error);
    res.status(500).json({
      error: 'Failed to get study guide',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/study/guides/:id/start
// @desc    Start a study guide
// @access  Private
router.post('/guides/:id/start', auth, async (req, res) => {
  try {
    const studyGuide = await StudyGuide.findById(req.params.id);

    if (!studyGuide) {
      return res.status(404).json({
        error: 'Study guide not found',
        message: 'The requested study guide does not exist'
      });
    }

    if (!studyGuide.isActive || !studyGuide.isPublic) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'This study guide is not available'
      });
    }

    // Check if user has already started this study
    const existingCompletion = studyGuide.completions.find(
      c => c.user.toString() === req.user._id.toString()
    );

    if (existingCompletion && !existingCompletion.completedAt) {
      return res.status(400).json({
        error: 'Study already started',
        message: 'You have already started this study guide'
      });
    }

    await studyGuide.startStudy(req.user._id);

    res.json({
      message: 'Study guide started successfully',
      studyGuide: {
        id: studyGuide._id,
        title: studyGuide.title,
        estimatedDuration: studyGuide.estimatedDuration
      }
    });
  } catch (error) {
    console.error('Start study guide error:', error);
    res.status(500).json({
      error: 'Failed to start study guide',
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/study/guides/:id/progress
// @desc    Update study progress
// @access  Private
router.put('/guides/:id/progress', auth, [
  body('progress')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const studyGuide = await StudyGuide.findById(req.params.id);

    if (!studyGuide) {
      return res.status(404).json({
        error: 'Study guide not found',
        message: 'The requested study guide does not exist'
      });
    }

    const { progress, notes } = req.body;

    await studyGuide.updateProgress(req.user._id, progress, notes);

    // Update user stats if completed
    if (progress >= 100) {
      await req.user.updateOne({
        $inc: { 'stats.studiesCompleted': 1 }
      });
    }

    res.json({
      message: progress >= 100 ? 'Study guide completed!' : 'Progress updated successfully',
      progress,
      completed: progress >= 100
    });
  } catch (error) {
    console.error('Update study progress error:', error);
    res.status(500).json({
      error: 'Failed to update progress',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/study/guides/:id/answer
// @desc    Save answer to study question
// @access  Private
router.post('/guides/:id/answer', auth, [
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required'),
  body('answer')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Answer must be between 1 and 1000 characters'),
  body('reflections')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Reflections must be less than 1000 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const studyGuide = await StudyGuide.findById(req.params.id);

    if (!studyGuide) {
      return res.status(404).json({
        error: 'Study guide not found',
        message: 'The requested study guide does not exist'
      });
    }

    const { questionId, answer, reflections } = req.body;

    await studyGuide.saveAnswer(req.user._id, questionId, answer, reflections);

    res.json({
      message: 'Answer saved successfully',
      questionId,
      answer
    });
  } catch (error) {
    console.error('Save answer error:', error);
    res.status(500).json({
      error: 'Failed to save answer',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/study/guides/:id/rating
// @desc    Rate a study guide
// @access  Private
router.post('/guides/:id/rating', auth, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review must be less than 500 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const studyGuide = await StudyGuide.findById(req.params.id);

    if (!studyGuide) {
      return res.status(404).json({
        error: 'Study guide not found',
        message: 'The requested study guide does not exist'
      });
    }

    const { rating, review } = req.body;

    await studyGuide.addRating(req.user._id, rating, review);

    res.json({
      message: 'Rating submitted successfully',
      rating: {
        average: studyGuide.rating.average,
        count: studyGuide.rating.count
      }
    });
  } catch (error) {
    console.error('Rate study guide error:', error);
    res.status(500).json({
      error: 'Failed to rate study guide',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/study/my
// @desc    Get current user's study activities
// @access  Private
router.get('/my', auth, [
  query('status')
    .optional()
    .isIn(['in-progress', 'completed', 'all'])
    .withMessage('Invalid status filter'),
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

    const { status = 'all', limit = 20 } = req.query;

    let studies;

    if (status === 'in-progress') {
      studies = await StudyGuide.findStudiesByUser(req.user._id, false);
    } else if (status === 'completed') {
      studies = await StudyGuide.findStudiesByUser(req.user._id, true);
    } else {
      // Get all studies
      const [inProgress, completed] = await Promise.all([
        StudyGuide.findStudiesByUser(req.user._id, false),
        StudyGuide.findStudiesByUser(req.user._id, true)
      ]);
      studies = [...inProgress, ...completed];
    }

    // Add user progress to each study
    const studiesWithProgress = studies.map(study => {
      const completion = study.completions.find(
        c => c.user.toString() === req.user._id.toString()
      );
      
      return {
        ...study.toObject(),
        userProgress: completion ? {
          startedAt: completion.startedAt,
          completedAt: completion.completedAt,
          progress: completion.progress,
          notes: completion.notes
        } : null
      };
    }).slice(0, parseInt(limit));

    res.json({
      studies: studiesWithProgress,
      count: studiesWithProgress.length,
      filter: status
    });
  } catch (error) {
    console.error('Get my studies error:', error);
    res.status(500).json({
      error: 'Failed to get studies',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/study/recommended
// @desc    Get recommended study guides
// @access  Private
router.get('/recommended', auth, [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { limit = 10 } = req.query;

    // Get user's completed studies to determine preferences
    const completedStudies = await StudyGuide.findStudiesByUser(req.user._id, true);
    
    // Determine preferred categories and difficulty
    const categoryCount = {};
    let totalCompleted = 0;
    
    completedStudies.forEach(study => {
      categoryCount[study.category] = (categoryCount[study.category] || 0) + 1;
      totalCompleted++;
    });

    // Determine difficulty based on completion count
    let recommendedDifficulty;
    if (totalCompleted === 0) {
      recommendedDifficulty = 'beginner';
    } else if (totalCompleted < 5) {
      recommendedDifficulty = 'beginner';
    } else if (totalCompleted < 15) {
      recommendedDifficulty = 'intermediate';
    } else {
      recommendedDifficulty = 'advanced';
    }

    // Get most frequent category
    const mostFrequentCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, null
    );

    // Get recommendations
    const recommendations = await StudyGuide.findRecommendedStudies(
      mostFrequentCategory,
      recommendedDifficulty,
      parseInt(limit)
    );

    // Filter out already completed studies
    const completedStudyIds = completedStudies.map(s => s._id.toString());
    const filteredRecommendations = recommendations.filter(
      study => !completedStudyIds.includes(study._id.toString())
    );

    res.json({
      recommendations: filteredRecommendations,
      recommendationCriteria: {
        preferredCategory: mostFrequentCategory,
        recommendedDifficulty,
        completedStudies: totalCompleted
      },
      count: filteredRecommendations.length
    });
  } catch (error) {
    console.error('Get recommended studies error:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/study/stats
// @desc    Get study statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await StudyGuide.aggregate([
      {
        $match: {
          isActive: true,
          isPublic: true
        }
      },
      {
        $group: {
          _id: null,
          totalStudies: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          averageRating: { $avg: '$rating.average' },
          categoryBreakdown: {
            $push: '$category'
          },
          difficultyBreakdown: {
            $push: '$difficulty'
          }
        }
      }
    ]);

    // Count by category
    const categoryStats = await StudyGuide.aggregate([
      {
        $match: {
          isActive: true,
          isPublic: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          averageRating: { $avg: '$rating.average' }
        }
      }
    ]);

    // Count by difficulty
    const difficultyStats = await StudyGuide.aggregate([
      {
        $match: {
          isActive: true,
          isPublic: true
        }
      },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          averageRating: { $avg: '$rating.average' }
        }
      }
    ]);

    const result = stats[0] || {
      totalStudies: 0,
      totalUsage: 0,
      averageRating: 0
    };

    const categoryBreakdown = categoryStats.reduce((acc, category) => {
      acc[category._id] = {
        count: category.count,
        totalUsage: category.totalUsage,
        averageRating: category.averageRating || 0
      };
      return acc;
    }, {});

    const difficultyBreakdown = difficultyStats.reduce((acc, difficulty) => {
      acc[difficulty._id] = {
        count: difficulty.count,
        totalUsage: difficulty.totalUsage,
        averageRating: difficulty.averageRating || 0
      };
      return acc;
    }, {});

    res.json({
      stats: {
        ...result,
        categoryBreakdown,
        difficultyBreakdown,
        averageRating: parseFloat(result.averageRating.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get study stats error:', error);
    res.status(500).json({
      error: 'Failed to get study statistics',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/study/search
// @desc    Search study guides
// @access  Public
router.get('/search', [
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

    const studyGuides = await StudyGuide.find({
      $text: { $search: q },
      isActive: true,
      isPublic: true
    })
      .populate('prayerRequest', 'title category')
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit));

    res.json({
      studyGuides,
      query: q,
      count: studyGuides.length
    });
  } catch (error) {
    console.error('Search study guides error:', error);
    res.status(500).json({
      error: 'Failed to search study guides',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
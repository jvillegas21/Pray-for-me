const express = require('express');
const { query, validationResult } = require('express-validator');
const bibleService = require('../services/bibleService');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/bible/verse-of-the-day
// @desc    Get verse of the day
// @access  Public
router.get('/verse-of-the-day', async (req, res) => {
  try {
    const verse = await bibleService.getVerseOfTheDay();
    
    if (!verse) {
      return res.status(404).json({
        error: 'Verse not found',
        message: 'Could not retrieve verse of the day'
      });
    }

    res.json({
      verse: {
        text: verse.content,
        reference: verse.reference,
        translation: 'NIV'
      },
      message: 'Verse of the day retrieved successfully'
    });
  } catch (error) {
    console.error('Get verse of the day error:', error);
    res.status(500).json({
      error: 'Failed to get verse of the day',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/bible/search
// @desc    Search Bible verses
// @access  Public
router.get('/search', [
  query('q')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query is required'),
  query('translation')
    .optional()
    .isIn(['NIV', 'KJV', 'NLT', 'ESV', 'NASB'])
    .withMessage('Invalid Bible translation'),
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

    const { q, translation = 'NIV', limit = 10 } = req.query;

    // Get Bible ID for translation
    const translations = bibleService.getBibleTranslations();
    const selectedTranslation = translations.find(t => t.abbreviation === translation);
    const bibleId = selectedTranslation ? selectedTranslation.id : translations[0].id;

    const verses = await bibleService.searchVerses(q, bibleId, parseInt(limit));

    const formattedVerses = verses.map(verse => ({
      text: verse.text,
      reference: verse.reference,
      translation: translation
    }));

    res.json({
      verses: formattedVerses,
      query: q,
      translation: translation,
      count: formattedVerses.length
    });
  } catch (error) {
    console.error('Search verses error:', error);
    res.status(500).json({
      error: 'Failed to search verses',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/bible/verse/:reference
// @desc    Get specific verse by reference
// @access  Public
router.get('/verse/:reference', [
  query('translation')
    .optional()
    .isIn(['NIV', 'KJV', 'NLT', 'ESV', 'NASB'])
    .withMessage('Invalid Bible translation'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { reference } = req.params;
    const { translation = 'NIV' } = req.query;

    // Get Bible ID for translation
    const translations = bibleService.getBibleTranslations();
    const selectedTranslation = translations.find(t => t.abbreviation === translation);
    const bibleId = selectedTranslation ? selectedTranslation.id : translations[0].id;

    const verse = await bibleService.getVerseByReference(reference, bibleId);

    if (!verse) {
      return res.status(404).json({
        error: 'Verse not found',
        message: 'The requested verse reference was not found'
      });
    }

    res.json({
      verse: {
        text: verse.content,
        reference: verse.reference,
        translation: translation
      }
    });
  } catch (error) {
    console.error('Get verse by reference error:', error);
    res.status(500).json({
      error: 'Failed to get verse',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/bible/verse/:reference/translations
// @desc    Get verse in multiple translations
// @access  Public
router.get('/verse/:reference/translations', [
  query('translations')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const translations = value.split(',');
      const validTranslations = ['NIV', 'KJV', 'NLT', 'ESV', 'NASB'];
      return translations.every(t => validTranslations.includes(t.trim()));
    })
    .withMessage('Invalid translation(s). Valid options: NIV, KJV, NLT, ESV, NASB'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { reference } = req.params;
    const { translations: requestedTranslations = 'NIV,KJV,NLT' } = req.query;

    const translationsArray = requestedTranslations.split(',').map(t => t.trim());

    const verses = await bibleService.getMultipleTranslations(reference, translationsArray);

    if (verses.length === 0) {
      return res.status(404).json({
        error: 'Verse not found',
        message: 'The requested verse reference was not found in any translation'
      });
    }

    res.json({
      reference,
      verses,
      count: verses.length
    });
  } catch (error) {
    console.error('Get verse translations error:', error);
    res.status(500).json({
      error: 'Failed to get verse translations',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/bible/verses/category/:category
// @desc    Get verses by category/theme
// @access  Public
router.get('/verses/category/:category', [
  query('translation')
    .optional()
    .isIn(['NIV', 'KJV', 'NLT', 'ESV', 'NASB'])
    .withMessage('Invalid Bible translation'),
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

    const { category } = req.params;
    const { translation = 'NIV', limit = 5 } = req.query;

    // Validate category
    const validCategories = [
      'healing', 'family', 'work', 'relationships', 'financial', 'spiritual',
      'guidance', 'thanksgiving', 'forgiveness', 'protection', 'strength', 'peace', 'other'
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    // Get Bible ID for translation
    const translations = bibleService.getBibleTranslations();
    const selectedTranslation = translations.find(t => t.abbreviation === translation);
    const bibleId = selectedTranslation ? selectedTranslation.id : translations[0].id;

    const verses = await bibleService.getVersesByCategory(category, bibleId, parseInt(limit));

    res.json({
      category,
      verses,
      translation,
      count: verses.length
    });
  } catch (error) {
    console.error('Get verses by category error:', error);
    res.status(500).json({
      error: 'Failed to get verses by category',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/bible/translations
// @desc    Get available Bible translations
// @access  Public
router.get('/translations', async (req, res) => {
  try {
    const translations = bibleService.getBibleTranslations();

    res.json({
      translations,
      count: translations.length
    });
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({
      error: 'Failed to get translations',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/bible/books
// @desc    Get Bible books list
// @access  Public
router.get('/books', [
  query('translation')
    .optional()
    .isIn(['NIV', 'KJV', 'NLT', 'ESV', 'NASB'])
    .withMessage('Invalid Bible translation'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { translation = 'NIV' } = req.query;

    // Get Bible ID for translation
    const translations = bibleService.getBibleTranslations();
    const selectedTranslation = translations.find(t => t.abbreviation === translation);
    const bibleId = selectedTranslation ? selectedTranslation.id : translations[0].id;

    const books = await bibleService.getBooks(bibleId);

    res.json({
      books,
      translation,
      count: books.length
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      error: 'Failed to get books',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/bible/books/:bookId/chapters
// @desc    Get chapters for a specific book
// @access  Public
router.get('/books/:bookId/chapters', [
  query('translation')
    .optional()
    .isIn(['NIV', 'KJV', 'NLT', 'ESV', 'NASB'])
    .withMessage('Invalid Bible translation'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { bookId } = req.params;
    const { translation = 'NIV' } = req.query;

    // Get Bible ID for translation
    const translations = bibleService.getBibleTranslations();
    const selectedTranslation = translations.find(t => t.abbreviation === translation);
    const bibleId = selectedTranslation ? selectedTranslation.id : translations[0].id;

    const chapters = await bibleService.getChapters(bibleId, bookId);

    res.json({
      bookId,
      chapters,
      translation,
      count: chapters.length
    });
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({
      error: 'Failed to get chapters',
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/bible/validate-reference
// @desc    Validate a Bible reference
// @access  Public
router.post('/validate-reference', [
  query('reference')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Reference is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { reference } = req.query;

    const isValid = await bibleService.validateReference(reference);

    res.json({
      reference,
      isValid,
      message: isValid ? 'Reference is valid' : 'Reference is not valid'
    });
  } catch (error) {
    console.error('Validate reference error:', error);
    res.status(500).json({
      error: 'Failed to validate reference',
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/bible/random
// @desc    Get random verses (for inspiration)
// @access  Public
router.get('/random', [
  query('category')
    .optional()
    .isIn(['healing', 'family', 'work', 'relationships', 'financial', 'spiritual', 'guidance', 'thanksgiving', 'forgiveness', 'protection', 'strength', 'peace', 'other'])
    .withMessage('Invalid category'),
  query('translation')
    .optional()
    .isIn(['NIV', 'KJV', 'NLT', 'ESV', 'NASB'])
    .withMessage('Invalid Bible translation'),
  query('count')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Count must be between 1 and 10'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { category, translation = 'NIV', count = 3 } = req.query;

    // Get Bible ID for translation
    const translations = bibleService.getBibleTranslations();
    const selectedTranslation = translations.find(t => t.abbreviation === translation);
    const bibleId = selectedTranslation ? selectedTranslation.id : translations[0].id;

    let verses = [];

    if (category) {
      verses = await bibleService.getVersesByCategory(category, bibleId, parseInt(count));
    } else {
      // Get random verses from different categories
      const categories = ['healing', 'family', 'spiritual', 'guidance', 'peace', 'strength'];
      const promises = categories.slice(0, parseInt(count)).map(cat => 
        bibleService.getVersesByCategory(cat, bibleId, 1)
      );
      
      const results = await Promise.all(promises);
      verses = results.flat();
    }

    res.json({
      verses,
      category: category || 'mixed',
      translation,
      count: verses.length
    });
  } catch (error) {
    console.error('Get random verses error:', error);
    res.status(500).json({
      error: 'Failed to get random verses',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BibleStudy = require('../models/BibleStudy');
const Prayer = require('../models/Prayer');
const { generateBibleStudy, searchBibleVerses, getBibleVerse } = require('../services/bibleService');

// @route   POST /api/bible/study
// @desc    Create a Bible study for a prayer
// @access  Private
router.post('/study', auth, async (req, res) => {
  try {
    const { prayerId } = req.body;

    // Get the prayer
    const prayer = await Prayer.findById(prayerId).populate('user', 'name');
    
    if (!prayer) {
      return res.status(404).json({ message: 'Prayer not found' });
    }

    // Check if user has access to this prayer
    if (prayer.visibility === 'private' && prayer.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if study already exists for this prayer and user
    let existingStudy = await BibleStudy.findOne({
      user: req.user.id,
      prayer: prayerId
    });

    if (existingStudy) {
      await existingStudy.updateAccess();
      return res.json(existingStudy);
    }

    // Generate Bible study content using AI
    const studyContent = await generateBibleStudy(prayer);

    // Create new Bible study
    const bibleStudy = new BibleStudy({
      user: req.user.id,
      prayer: prayerId,
      ...studyContent
    });

    await bibleStudy.save();
    res.json(bibleStudy);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/bible/study/:id
// @desc    Get a specific Bible study
// @access  Private
router.get('/study/:id', auth, async (req, res) => {
  try {
    const study = await BibleStudy.findById(req.params.id)
      .populate('prayer')
      .populate('user', 'name');

    if (!study) {
      return res.status(404).json({ message: 'Bible study not found' });
    }

    // Check if user owns this study
    if (study.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await study.updateAccess();
    res.json(study);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Bible study not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/bible/studies
// @desc    Get user's Bible studies
// @access  Private
router.get('/studies', auth, async (req, res) => {
  try {
    const studies = await BibleStudy.find({ user: req.user.id })
      .populate('prayer', 'title category')
      .sort('-lastAccessedAt');

    res.json(studies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/bible/study/:id/answer
// @desc    Submit answer to a study question
// @access  Private
router.put('/study/:id/answer', auth, async (req, res) => {
  try {
    const { questionIndex, answer } = req.body;

    const study = await BibleStudy.findById(req.params.id);

    if (!study) {
      return res.status(404).json({ message: 'Bible study not found' });
    }

    // Check if user owns this study
    if (study.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update the answer
    if (study.questions[questionIndex]) {
      study.questions[questionIndex].userAnswer = answer;
      study.questions[questionIndex].answeredAt = Date.now();
      
      // Update progress
      await study.updateProgress();
    }

    res.json(study);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/bible/search
// @desc    Search Bible verses by keyword
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { keyword, limit = 10 } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: 'Keyword is required' });
    }

    const verses = await searchBibleVerses(keyword, limit);
    res.json(verses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/bible/verse
// @desc    Get a specific Bible verse
// @access  Private
router.get('/verse', auth, async (req, res) => {
  try {
    const { reference, version = 'NIV' } = req.query;

    if (!reference) {
      return res.status(400).json({ message: 'Bible reference is required' });
    }

    const verseText = await getBibleVerse(reference, version);
    res.json({ reference, text: verseText, version });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/bible/study/:id
// @desc    Delete a Bible study
// @access  Private
router.delete('/study/:id', auth, async (req, res) => {
  try {
    const study = await BibleStudy.findById(req.params.id);

    if (!study) {
      return res.status(404).json({ message: 'Bible study not found' });
    }

    // Check if user owns this study
    if (study.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await study.deleteOne();
    res.json({ message: 'Bible study deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
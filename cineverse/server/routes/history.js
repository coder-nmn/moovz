const express = require('express');
const History = require('../models/History');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/history
// @desc    Get user's watch history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const history = await History.find({ userId: req.user._id })
      .sort({ watchedAt: -1 })
      .limit(parseInt(limit));
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/history
// @desc    Add movie to watch history
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { movieId, title, posterPath, mediaType, source } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({ message: 'Movie ID and title are required' });
    }

    // Update existing entry or create new one (upsert pattern)
    // This avoids duplicate entries — just updates the timestamp
    const history = await History.findOneAndUpdate(
      { userId: req.user._id, movieId: movieId.toString() },
      {
        userId: req.user._id,
        movieId: movieId.toString(),
        title,
        posterPath: posterPath || '',
        mediaType: mediaType || 'movie',
        source: source || 'tmdb',
        watchedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/history
// @desc    Clear all watch history
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await History.deleteMany({ userId: req.user._id });
    res.json({ message: 'Watch history cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

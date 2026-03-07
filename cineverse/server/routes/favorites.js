const express = require('express');
const Favorite = require('../models/Favorite');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/favorites
// @desc    Add movie to favorites
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { movieId, title, posterPath, rating, releaseDate, mediaType, source } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({ message: 'Movie ID and title are required' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      userId: req.user._id,
      movieId: movieId.toString(),
      source: source || 'tmdb'
    });

    if (existing) {
      return res.status(400).json({ message: 'Movie already in favorites' });
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      movieId: movieId.toString(),
      title,
      posterPath: posterPath || '',
      rating: rating || 0,
      releaseDate: releaseDate || '',
      mediaType: mediaType || 'movie',
      source: source || 'tmdb'
    });

    res.status(201).json(favorite);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Movie already in favorites' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/favorites/:movieId
// @desc    Remove movie from favorites
// @access  Private
router.delete('/:movieId', protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      userId: req.user._id,
      movieId: req.params.movieId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/favorites/check/:movieId
// @desc    Check if movie is favorited
// @access  Private
router.get('/check/:movieId', protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user._id,
      movieId: req.params.movieId
    });
    res.json({ isFavorited: !!favorite });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const Movie = require('../models/Movie');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/movies
// @desc    Get all admin-added movies (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, genre, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (genre) query.genre = { $in: [genre] };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const movies = await Movie.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('addedBy', 'name');

    const total = await Movie.countDocuments(query);

    res.json({
      movies,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalMovies: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/movies/:id
// @desc    Get single movie
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('addedBy', 'name');
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/movies
// @desc    Add a new movie (admin only)
// @access  Private/Admin
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { title, posterUrl, description, tmdbId, releaseDate, trailerUrl, genre, category, rating } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Movie title is required' });
    }

    const movie = await Movie.create({
      title,
      posterUrl: posterUrl || '',
      description: description || 'Description not available',
      tmdbId: tmdbId || '',
      releaseDate: releaseDate || '',
      trailerUrl: trailerUrl || '',
      genre: genre || [],
      category: category || 'movie',
      rating: rating || 0,
      addedBy: req.user._id,
      source: 'admin'
    });

    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/movies/:id
// @desc    Update movie (admin only)
// @access  Private/Admin
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/movies/:id
// @desc    Delete movie (admin only)
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await Movie.findByIdAndDelete(req.params.id);
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

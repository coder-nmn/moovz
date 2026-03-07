const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true
  },
  posterUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: 'Description not available'
  },
  tmdbId: {
    type: String,
    default: ''
  },
  releaseDate: {
    type: String,
    default: ''
  },
  trailerUrl: {
    type: String,
    default: ''
  },
  genre: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['movie', 'tv', 'other'],
    default: 'movie'
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  source: {
    type: String,
    enum: ['admin', 'tmdb'],
    default: 'admin'
  }
}, {
  timestamps: true
});

// Text index for search
movieSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Movie', movieSchema);

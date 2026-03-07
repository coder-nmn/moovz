const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  posterPath: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0
  },
  releaseDate: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['movie', 'tv'],
    default: 'movie'
  },
  source: {
    type: String,
    enum: ['tmdb', 'admin'],
    default: 'tmdb'
  }
}, {
  timestamps: true
});

// Prevent duplicate favorites
favoriteSchema.index({ userId: 1, movieId: 1, source: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);

import { IMAGE_BASE, POSTER_SIZE, BACKDROP_SIZE, PROFILE_SIZE } from '../api/tmdb';

export const getPosterUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/500x750?text=No+Poster';
  return `${IMAGE_BASE}${POSTER_SIZE}${path}`;
};

export const getBackdropUrl = (path) => {
  if (!path) return '';
  return `${IMAGE_BASE}${BACKDROP_SIZE}${path}`;
};

export const getProfileUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/185x278?text=No+Image';
  return `${IMAGE_BASE}${PROFILE_SIZE}${path}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatRating = (rating) => {
  if (!rating) return 'N/A';
  return Number(rating).toFixed(1);
};

export const truncateText = (text, maxLength = 200) => {
  if (!text) return 'Description not available';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getYouTubeTrailerKey = (videos) => {
  if (!videos || videos.length === 0) return null;
  const trailer = videos.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  ) || videos.find((v) => v.site === 'YouTube');
  return trailer?.key || null;
};

export const getGenreNames = (genreIds, genres) => {
  if (!genreIds || !genres?.length) return [];
  return genreIds.map((id) => {
    const genre = genres.find((g) => g.id === id);
    return genre?.name || '';
  }).filter(Boolean);
};

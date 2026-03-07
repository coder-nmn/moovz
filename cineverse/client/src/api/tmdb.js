import axios from 'axios';

const tmdbApi = axios.create({
  baseURL: import.meta.env.VITE_TMDB_BASE_URL,
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
  },
});

// Rate limit handling with retry
tmdbApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 2;
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return tmdbApi.request(error.config);
    }
    return Promise.reject(error);
  }
);

export const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE;
export const POSTER_SIZE = '/w500';
export const BACKDROP_SIZE = '/original';
export const PROFILE_SIZE = '/w185';

export default tmdbApi;

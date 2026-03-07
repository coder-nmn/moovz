import axios from 'axios';

// Determine the base URL dynamically
// If VITE_BACKEND_URL is localhost, but we are running on a real domain, use the current domain instead
let baseURL = import.meta.env.VITE_BACKEND_URL;
if (import.meta.env.PROD && baseURL.includes('localhost')) {
  baseURL = `${window.location.origin}/api`;
}

const backendApi = axios.create({
  baseURL,
});

// Attach JWT token to every request
backendApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('cineverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cineverse_token');
      localStorage.removeItem('cineverse_user');
      // Don't redirect here — let the auth slice handle it
    }
    return Promise.reject(error);
  }
);

export default backendApi;

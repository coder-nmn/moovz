import axios from 'axios';

const backendApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
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

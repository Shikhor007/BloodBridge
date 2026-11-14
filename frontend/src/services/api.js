
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL
    ? `${API_URL.replace(/\/+$/, '')}/api`
    : '/api',

  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bloodbridge_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired or invalid sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register')
      ) {
        localStorage.removeItem('bloodbridge_token');
        localStorage.removeItem('bloodbridge_user');

        window.location.href = '/login?expired=1';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

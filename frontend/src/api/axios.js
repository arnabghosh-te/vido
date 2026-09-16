import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Centralized error handling
    if (error.response?.status === 401) {
      console.error('Unauthorized, redirecting to login...');
      // Implement redirect logic later
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blood_care_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors uniformly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired, clear local storage
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('blood_care_token')) {
        localStorage.removeItem('blood_care_token');
        localStorage.removeItem('blood_care_user');
        // Do not force redirect if already on login/register
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

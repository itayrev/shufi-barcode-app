import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (username, password) =>
    api.post('/api/auth/register', { username, password }),
  
  login: (username, password) =>
    api.post('/api/auth/login', { username, password }),
  
  verify: () =>
    api.get('/api/auth/verify'),
};

// Barcode API calls
export const barcodeAPI = {
  getAll: () =>
    api.get('/api/barcodes'),
  
  getById: (id) =>
    api.get(`/api/barcodes/${id}`),
  
  upload: (formData) =>
    api.post('/api/barcodes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  update: (id, data) =>
    api.put(`/api/barcodes/${id}`, data),
  
  delete: (id) =>
    api.delete(`/api/barcodes/${id}`),
};

export default api;
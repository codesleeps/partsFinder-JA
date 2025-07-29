import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const vehicleService = {
  getMakes: () => api.get('/vehicles/makes'),
  getModels: (make) => api.get(`/vehicles/models/${make}`),
  getYears: (make, model) => api.get(`/vehicles/years/${make}/${model}`),
  getVehicleDetails: (make, model, year) => api.get(`/vehicles/details/${make}/${model}/${year}`),
};

export const partsService = {
  searchParts: (searchData) => api.post('/parts/search', searchData),
  getPartDetails: (partId) => api.get(`/parts/${partId}`),
  getPartsByCategory: (category, vehicleInfo) => api.post('/parts/category', { category, ...vehicleInfo }),
  getPopularParts: (vehicleInfo) => api.post('/parts/popular', vehicleInfo),
};

export const userService = {
  getSearchHistory: (userId) => api.get(`/search-history/${userId}`),
  saveSearch: (searchData) => api.post('/search-history', searchData),
  getFavorites: (userId) => api.get(`/favorites/${userId}`),
  addToFavorites: (userId, partId) => api.post('/favorites', { userId, partId }),
  removeFromFavorites: (userId, partId) => api.delete(`/favorites/${userId}/${partId}`),
};

export const cartService = {
  getCart: (userId) => api.get(`/cart/${userId}`),
  addToCart: (userId, partId, quantity = 1) => api.post('/cart', { userId, partId, quantity }),
  updateCartItem: (cartItemId, quantity) => api.put(`/cart/${cartItemId}`, { quantity }),
  removeFromCart: (cartItemId) => api.delete(`/cart/${cartItemId}`),
  clearCart: (userId) => api.delete(`/cart/clear/${userId}`),
};

export default api;
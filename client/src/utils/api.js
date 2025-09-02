// client/src/utils/api.js
import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://skillswap-jfq6.onrender.com';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, ''); // removes trailing slashes

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  signup: (userData) => api.post('/api/auth/signup', userData),
  getCurrentUser: () => api.get('/api/users/me').then(res => {
    console.log('Current user response:', res.data);
    return res.data.data.user;
  }),
};

export const usersAPI = {
  getUsers: () => api.get(`/api/users?exclude=${user._id}`),
  updateProfile: (userData) => api.patch('/api/users/me', userData),
};

export const swapRequestsAPI = {
  sendRequest: (requestData) => api.post('/api/swap-requests', requestData),
  getReceivedRequests: () => api.get('/api/swap-requests/received'),
  getSentRequests: () => api.get('/api/swap-requests/sent'),
  updateRequest: (requestId, status) => api.patch(`/api/swap-requests/${requestId}`, { status }),
};

export default api;
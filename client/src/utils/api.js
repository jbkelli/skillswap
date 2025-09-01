// client/src/utils/api.js
import axios from 'axios';

const API_BASE_URL = 'https://skillswap-jfq6.onrender.com/';

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
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (userData) => api.post('/auth/signup', userData),
  getCurrentUser: () => api.get('/users/me').then(res => {
    console.log('Current user response:', res.data);
    return res.data.data.user;
  }),
};

export const usersAPI = {
  getUsers: () => api.get('/users'),
  updateProfile: (userData) => api.patch('/users/me', userData),
};

export const swapRequestsAPI = {
  sendRequest: (requestData) => api.post('/swap-requests', requestData),
  getReceivedRequests: () => api.get('/swap-requests/received'),
  getSentRequests: () => api.get('/swap-requests/sent'),
  updateRequest: (requestId, status) => api.patch(`/swap-requests/${requestId}`, { status }),
};

export default api;
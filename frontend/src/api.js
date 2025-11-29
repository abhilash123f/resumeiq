import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const deleteAccount = () => api.delete('/auth/delete-account');

// Resume
export const uploadResume = (formData) => {
  return api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getResume = (id) => api.get(`/resume/${id}`);
export const listResumes = (userId) => api.get(`/resume/user/${userId}`);
export const deleteResume = (id) => api.delete(`/resume/${id}`);

// Match
export const createMatch = (data) => api.post('/match', data);
export const getMatch = (id) => api.get(`/match/${id}`);
export const getUserMatches = (userId, includeDeleted = false) => 
  api.get(`/match/user/${userId}?includeDeleted=${includeDeleted}`);
export const submitFeedback = (data) => api.post('/match/feedback', data);

// Match Delete Operations
export const softDeleteMatch = (id) => api.delete(`/match/${id}/soft`);
export const hardDeleteMatch = (id) => api.delete(`/match/${id}/hard`);
export const bulkDeleteMatches = (matchIds) => api.post('/match/bulk-delete', { matchIds });
export const clearAllMatches = () => api.delete('/match/clear-all');
export const restoreMatch = (id) => api.post(`/match/${id}/restore`);

export default api;

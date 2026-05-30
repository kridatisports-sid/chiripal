import axios from 'axios';

// Use your actual GitHub Codespaces backend URL
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', new URLSearchParams({ username: email, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  seed: () => api.post('/auth/seed'),
};

// Tournament API
export const tournamentAPI = {
  getAll: (params) => api.get('/tournaments/', { params }),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments/', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  getStats: () => api.get('/tournaments/dashboard/stats'),
  getCalendar: () => api.get('/tournaments/calendar/upcoming'),
};

// Athlete API
export const athleteAPI = {
  getAll: (params) => api.get('/athletes/', { params }),
  getById: (id) => api.get(`/athletes/${id}`),
  create: (data) => api.post('/athletes/', data),
  update: (id, data) => api.put(`/athletes/${id}`, data),
  delete: (id) => api.delete(`/athletes/${id}`),
  getStats: () => api.get('/athletes/dashboard/stats'),
};

// Finance API
export const financeAPI = {
  getBudget: (year) => api.get('/finance/budgets/current', { params: { fiscal_year: year } }),
  createBudget: (data) => api.post('/finance/budgets', data),
  updateBudget: (id, data) => api.put(`/finance/budgets/${id}`, data),
  getTransactions: (params) => api.get('/finance/transactions', { params }),
  createTransaction: (data) => api.post('/finance/transactions', data),
  getStats: () => api.get('/finance/dashboard/stats'),
};

// Stakeholder API
export const stakeholderAPI = {
  getAll: (params) => api.get('/stakeholders/', { params }),
  getById: (id) => api.get(`/stakeholders/${id}`),
  create: (data) => api.post('/stakeholders/', data),
  update: (id, data) => api.put(`/stakeholders/${id}`, data),
  delete: (id) => api.delete(`/stakeholders/${id}`),
  createTouchpoint: (data) => api.post('/stakeholders/touchpoints', data),
  getRecentTouchpoints: () => api.get('/stakeholders/touchpoints/recent'),
  getPendingFollowups: () => api.get('/stakeholders/touchpoints/follow-ups'),
};

// Marketing API
export const marketingAPI = {
  getAssets: (params) => api.get('/marketing/assets', { params }),
  createAsset: (data) => api.post('/marketing/assets', data),
  getPosts: (params) => api.get('/marketing/posts', { params }),
  createPost: (data) => api.post('/marketing/posts', data),
  updatePost: (id, data) => api.put(`/marketing/posts/${id}`, data),
  deletePost: (id) => api.delete(`/marketing/posts/${id}`),
  getStats: () => api.get('/marketing/dashboard/stats'),
};
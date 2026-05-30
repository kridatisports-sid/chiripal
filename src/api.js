import axios from 'axios';

const API_URL = 'https://squash-crm-api.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (email, password) => api.post('/auth/login', new URLSearchParams({ username: email, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  me: () => api.get('/auth/me'),
};

export const tournamentAPI = {
  getAll: (params) => api.get('/tournaments/', { params }),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments/', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  getStats: () => api.get('/tournaments/dashboard/stats'),
  getCalendar: () => api.get('/tournaments/calendar/upcoming'),
};

export const athleteAPI = {
  getAll: (params) => api.get('/athletes/', { params }),
  getById: (id) => api.get(`/athletes/${id}`),
  create: (data) => api.post('/athletes/', data),
  update: (id, data) => api.put(`/athletes/${id}`, data),
  delete: (id) => api.delete(`/athletes/${id}`),
  getStats: () => api.get('/athletes/dashboard/stats'),
};

export const financeAPI = {
  getBudget: (year) => api.get('/finance/budgets/current', { params: { fiscal_year: year } }),
  getStats: () => api.get('/finance/dashboard/stats'),
};

export const stakeholderAPI = {
  getAll: (params) => api.get('/stakeholders/', { params }),
  getById: (id) => api.get(`/stakeholders/${id}`),
  create: (data) => api.post('/stakeholders/', data),
  update: (id, data) => api.put(`/stakeholders/${id}`, data),
  delete: (id) => api.delete(`/stakeholders/${id}`),
};

export const marketingAPI = {
  getAssets: (params) => api.get('/marketing/assets', { params }),
  getPosts: (params) => api.get('/marketing/posts', { params }),
  createPost: (data) => api.post('/marketing/posts', data),
  updatePost: (id, data) => api.put(`/marketing/posts/${id}`, data),
  deletePost: (id) => api.delete(`/marketing/posts/${id}`),
  getStats: () => api.get('/marketing/dashboard/stats'),
};

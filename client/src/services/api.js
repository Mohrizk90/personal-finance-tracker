import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Contexts API
export const contextsAPI = {
  getAll: () => api.get('/contexts'),
  getById: (id) => api.get(`/contexts/${id}`),
  create: (data) => api.post('/contexts', data),
  update: (id, data) => api.put(`/contexts/${id}`, data),
  delete: (id) => api.delete(`/contexts/${id}`),
};

// Transactions API
export const transactionsAPI = {
  getAll: (contextId) => api.get(`/transactions${contextId ? `?context_id=${contextId}` : ''}`),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// Subscriptions API
export const subscriptionsAPI = {
  getAll: (contextId) => api.get(`/subscriptions${contextId ? `?context_id=${contextId}` : ''}`),
  getById: (id) => api.get(`/subscriptions/${id}`),
  create: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data),
  delete: (id) => api.delete(`/subscriptions/${id}`),
};

// Savings API
export const savingsAPI = {
  getAll: (contextId) => api.get(`/savings${contextId ? `?context_id=${contextId}` : ''}`),
  getById: (id) => api.get(`/savings/${id}`),
  create: (data) => api.post('/savings', data),
  update: (id, data) => api.put(`/savings/${id}`, data),
  delete: (id) => api.delete(`/savings/${id}`),
};

// Budgets API
export const budgetsAPI = {
  getAll: (contextId, month) => {
    const params = new URLSearchParams();
    if (contextId) params.append('context_id', contextId);
    if (month) params.append('month', month);
    return api.get(`/budgets?${params.toString()}`);
  },
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

// Investments API
export const investmentsAPI = {
  getAll: (contextId) => api.get(`/investments${contextId ? `?context_id=${contextId}` : ''}`),
  getById: (id) => api.get(`/investments/${id}`),
  create: (data) => api.post('/investments', data),
  update: (id, data) => api.put(`/investments/${id}`, data),
  delete: (id) => api.delete(`/investments/${id}`),
};

export default api;

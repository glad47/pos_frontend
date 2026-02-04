import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productApi = {
  getAll: () => api.get('/products'),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Loyalty API
export const loyaltyApi = {
  getAll: () => api.get('/loyalty'),
  getActive: () => api.get('/loyalty/active'),
  create: (loyalty) => api.post('/loyalty', loyalty),
  update: (id, loyalty) => api.put(`/loyalty/${id}`, loyalty),
  delete: (id) => api.delete(`/loyalty/${id}`),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/loyalty/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Promotions API
export const promotionApi = {
  getAll: () => api.get('/promotions'),
  getActive: () => api.get('/promotions/active'),
  create: (promotion) => api.post('/promotions', promotion),
  update: (id, promotion) => api.put(`/promotions/${id}`, promotion),
  delete: (id) => api.delete(`/promotions/${id}`),
};

// Sessions API
export const sessionApi = {
  getAll: () => api.get('/sessions'),
  getOpen: () => api.get('/sessions/open'),
  getById: (id) => api.get(`/sessions/${id}`),
  getByCashier: (cashierName) => api.get(`/sessions/cashier/${cashierName}`),
  open: (data) => api.post('/sessions/open', data),
  close: (id, data) => api.post(`/sessions/${id}/close`, data),
};

// Orders API
export const orderApi = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  getBySession: (sessionId) => api.get(`/orders/session/${sessionId}`),
  create: (order) => api.post('/orders', order),
};

export default api;

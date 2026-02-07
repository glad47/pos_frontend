import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productApi = {
  getAll: () => api.get('/products'),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
  importExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const loyaltyApi = {
  getAll: () => api.get('/loyalty'),
  getActive: () => api.get('/loyalty/active'),
  create: (loyalty) => api.post('/loyalty', loyalty),
  update: (id, loyalty) => api.put(`/loyalty/${id}`, loyalty),
  delete: (id) => api.delete(`/loyalty/${id}`),
  importExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/loyalty/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const sessionApi = {
  // Open session (will return existing active session if found)
  open: (data) => api.post('/sessions/open', data),
  
  // Close session
  close: (sessionId, data) => api.post(`/sessions/${sessionId}/close`, data),
  
  // Get current session (deprecated - use checkActiveSession instead)
  getCurrent: () => api.get('/sessions/current'),
  
  // Get session by ID
  getById: (sessionId) => api.get(`/sessions/${sessionId}`),
  
  // Check if cashier has active session
  checkActiveSession: (cashierName) => api.get(`/sessions/check/${encodeURIComponent(cashierName)}`),
  
  // Get active session for cashier
  getActiveSession: (cashierName) => api.get(`/sessions/active/${encodeURIComponent(cashierName)}`),
  
  // Get all open sessions
  getOpenSessions: () => api.get('/sessions/open'),
};

export const orderApi = {
  create: (sessionId, orderData) => api.post(`/orders/session/${sessionId}`, orderData),
  getSessionOrders: (sessionId) => api.get(`/orders/session/${sessionId}`),
  getByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  search: (searchDTO) => api.post('/orders/search', searchDTO),
  updateSyncStatus: (orderId, synced) => api.put(`/orders/${orderId}/sync?synced=${synced}`),
  getUnsyncedOrders: () => api.get('/orders/unsynced'),
  getOrderJson: (orderId) => api.get(`/orders/${orderId}/json`),
};

export default api;

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
  uploadCsv: (formData) => api.post('/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const loyaltyApi = {
  getAll: () => api.get('/loyalty'),
  getActive: () => api.get('/loyalty/active'),
  getById: (id) => api.get(`/loyalty/${id}`),
  create: (loyalty) => api.post('/loyalty', loyalty),
  update: (id, loyalty) => api.put(`/loyalty/${id}`, loyalty),
  delete: (id) => api.delete(`/loyalty/${id}`),
  uploadCsv: (formData) => api.post('/loyalty/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const sessionApi = {
  getAll: () => api.get('/sessions'),
  getOpen: () => api.get('/sessions/open'),
  getById: (id) => api.get(`/sessions/${id}`),
  checkActive: (cashierName) => api.get(`/sessions/check/${cashierName}`),
  getActive: (cashierName) => api.get(`/sessions/active/${cashierName}`),
  open: (dto) => api.post('/sessions/open', dto),
  close: (id, dto) => api.post(`/sessions/${id}/close`, dto),
};

export const orderApi = {
  create: (order) => api.post('/orders', order),
  getAll: () => api.get('/orders'),
  getBySessionId: (sessionId) => api.get(`/orders/session/${sessionId}`),
  search: (criteria) => api.post('/orders/search', criteria),
  getById: (id) => api.get(`/orders/${id}`),
};

export const employeeApi = {
  login: (credentials) => api.post('/employees/login', credentials),
  getAll: () => api.get('/employees'),
  getActive: () => api.get('/employees/active'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (employee) => api.post('/employees', employee),
  update: (id, employee) => api.put(`/employees/${id}`, employee),
  updatePin: (id, pin) => api.put(`/employees/${id}/pin`, { pin }),
  deactivate: (id) => api.delete(`/employees/${id}`),
  activate: (id) => api.put(`/employees/${id}/activate`),
};

export default api;

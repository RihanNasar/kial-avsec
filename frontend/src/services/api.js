import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
  (error) => {
    return Promise.reject(error);
  }
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

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Admin/CSO APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Entities
  getEntities: (params) => api.get('/admin/entities', { params }),
  getEntity: (id) => api.get(`/admin/entities/${id}`),
  createEntity: (data) => api.post('/admin/entities', data),
  updateEntity: (id, data) => api.put(`/admin/entities/${id}`, data),
  deleteEntity: (id) => api.delete(`/admin/entities/${id}`),
  
  // Staff
  getStaff: (params) => api.get('/admin/staff', { params }),
  getAllStaff: (params) => api.get('/admin/staff', { params }),
  deleteStaff: (id) => api.delete(`/admin/staff/${id}`),
  
  // Certificates
  getCertificates: (params) => api.get('/admin/certificates', { params }),
  createCertificate: (data) => api.post('/admin/certificates', data),
  createEntityCertificate: (data) => api.post('/admin/entity-certificates', data),
  updateCertificate: (id, data) => api.put(`/admin/certificates/${id}`, data),
  deleteCertificate: (id) => api.delete(`/admin/certificates/${id}`),
  
  // Approvals
  getPendingApprovals: () => api.get('/admin/approvals/pending'),
  getApprovalHistory: () => api.get('/admin/approvals/history'),
  approveCertificate: (id, data) => api.put(`/admin/approvals/${id}`, data),
  
  // Import
  importEntities: (formData) => api.post('/admin/import/entities', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  importKialStaff: (formData) => api.post('/admin/import/kial-staff', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  importEntityStaff: (entityId, formData) => api.post(`/admin/import/entity-staff/${entityId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Entity Head APIs
export const entityAPI = {
  getDashboard: () => api.get('/entity/dashboard'),
  
  // Staff
  getStaff: () => api.get('/entity/staff'),
  createStaff: (data) => api.post('/entity/staff', data),
  updateStaff: (id, data) => api.put(`/entity/staff/${id}`, data),
  
  // Certificates
  getCertificates: () => api.get('/entity/certificates'),
  createCertificate: (data) => api.post('/entity/certificates', data),
  updateCertificate: (id, data) => api.put(`/entity/certificates/${id}`, data),
  deleteCertificate: (id) => api.delete(`/entity/certificates/${id}`),
  renewCertificate: (data) => api.post('/entity/certificates/renew', data),
};

// Staff APIs
export const staffAPI = {
  getProfile: () => api.get('/staff/profile'),
  updateProfile: (data) => api.put('/staff/profile', data),
  
  // Certificates
  getCertificates: () => api.get('/staff/certificates'),
  createCertificate: (data) => api.post('/staff/certificates', data),
  updateCertificate: (id, data) => api.put(`/staff/certificates/${id}`, data),
  deleteCertificate: (id) => api.delete(`/staff/certificates/${id}`),
};

export default api;

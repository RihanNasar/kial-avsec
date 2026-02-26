// KIAL AVSEC Mobile - Admin (CSO) API
import client from './client';

const adminApi = {
    // Dashboard
    getDashboard: () => client.get('/admin/dashboard'),

    // Entities
    getEntities: (params) => client.get('/admin/entities', { params }),
    getEntity: (id) => client.get(`/admin/entities/${id}`),
    createEntity: (data) => client.post('/admin/entities', data),
    updateEntity: (id, data) => client.put(`/admin/entities/${id}`, data),
    deleteEntity: (id) => client.delete(`/admin/entities/${id}`),
    resetEntityPassword: (id) => client.post(`/admin/entities/${id}/reset-password`),

    // Staff
    getStaff: (params) => client.get('/admin/staff', { params }),
    getStaffById: (id) => client.get(`/admin/staff/${id}`),
    createStaff: (data) => client.post('/admin/staff', data),
    updateStaff: (id, data) => client.put(`/admin/staff/${id}`, data),
    deleteStaff: (id) => client.delete(`/admin/staff/${id}`),
    resetStaffPassword: (id) => client.post(`/admin/staff/${id}/reset-password`),

    // Certificates
    getCertificates: (params) => client.get('/admin/certificates', { params }),
    createCertificate: (formData) =>
        client.post('/admin/certificates', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    updateCertificate: (id, formData) =>
        client.put(`/admin/certificates/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    deleteCertificate: (id) => client.delete(`/admin/certificates/${id}`),

    // Entity Certificates
    createEntityCertificate: (data) => client.post('/admin/entity-certificates', data),
    updateEntityCertificate: (id, data) => client.put(`/admin/entity-certificates/${id}`, data),
    deleteEntityCertificate: (id) => client.delete(`/admin/entity-certificates/${id}`),

    // Approvals
    getPendingApprovals: () => client.get('/admin/approvals/pending'),
    getApprovalHistory: () => client.get('/admin/approvals/history'),
    reviewApproval: (id, data) => client.put(`/admin/approvals/${id}`, data),

    // Certificate Types
    getCertificateTypes: (params) => client.get('/admin/certificate-types', { params }),
    createCertificateType: (data) => client.post('/admin/certificate-types', data),
    updateCertificateType: (id, data) => client.put(`/admin/certificate-types/${id}`, data),
    deleteCertificateType: (id) => client.delete(`/admin/certificate-types/${id}`),

    // Document upload
    uploadDocument: (formData) =>
        client.post('/admin/upload/document', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};

export default adminApi;

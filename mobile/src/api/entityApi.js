// KIAL AVSEC Mobile - Entity Head API
import client from './client';

const entityApi = {
    // Dashboard
    getDashboard: () => client.get('/entity/dashboard'),

    // Staff
    getStaff: () => client.get('/entity/staff'),
    createStaff: (data) => client.post('/entity/staff', data),
    updateStaff: (id, data) => client.put(`/entity/staff/${id}`, data),
    deleteStaff: (id) => client.delete(`/entity/staff/${id}`),

    // Certificates
    getCertificates: () => client.get('/entity/certificates'),
    createCertificate: (formData) =>
        client.post('/entity/certificates', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    updateCertificate: (id, formData) =>
        client.put(`/entity/certificates/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    deleteCertificate: (id) => client.delete(`/entity/certificates/${id}`),
    renewCertificate: (data) => client.post('/entity/certificates/renew', data),

    // Entity Certificates
    createEntityCertificate: (formData) =>
        client.post('/entity/entity-certificates', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    updateEntityCertificate: (id, formData) =>
        client.put(`/entity/entity-certificates/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    deleteEntityCertificate: (id) => client.delete(`/entity/entity-certificates/${id}`),
};

export default entityApi;

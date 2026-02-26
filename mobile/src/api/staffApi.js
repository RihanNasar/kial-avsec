// KIAL AVSEC Mobile - Staff API
import client from './client';

const staffApi = {
    // Profile
    getProfile: () => client.get('/staff/profile'),
    updateProfile: (data) => client.put('/staff/profile', data),

    // Certificates
    getCertificates: () => client.get('/staff/certificates'),
    createCertificate: (formData) =>
        client.post('/staff/certificates', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    updateCertificate: (id, formData) =>
        client.put(`/staff/certificates/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    deleteCertificate: (id) => client.delete(`/staff/certificates/${id}`),
};

export default staffApi;

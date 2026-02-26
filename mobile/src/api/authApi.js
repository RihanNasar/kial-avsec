// KIAL AVSEC Mobile - Auth API
import client from './client';

const authApi = {
    login: (email, password) => client.post('/auth/login', { email, password }),
    getMe: () => client.get('/auth/me'),
    changePassword: (data) => client.post('/auth/change-password', data),
    getCertificateTypes: (params) => client.get('/auth/certificate-types', { params }),
};

export default authApi;

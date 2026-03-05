// KIAL AVSEC Mobile - Axios API Client
// Central HTTP client with JWT token injection and error handling

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Default to localhost; change in .env or set at runtime
// 🔧 DEV: paste your `ngrok http 5000` URL here when developing over tunnel
const API_BASE_URL = 'https://bf38-103-175-88-33.ngrok-free.app/api';

const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// Token management helpers
let logoutCallback = null;

/**
 * Register a logout callback (called by AuthContext)
 */
export const setLogoutCallback = (cb) => {
    logoutCallback = cb;
};

// Request interceptor — inject Bearer token
client.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            // SecureStore may fail on web; silently continue
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 auto-logout
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                await SecureStore.deleteItemAsync('auth_token');
                await SecureStore.deleteItemAsync('user_data');
            } catch (e) {
                // Ignore SecureStore errors
            }
            if (logoutCallback) {
                logoutCallback();
            }
        }
        return Promise.reject(error);
    }
);

export default client;

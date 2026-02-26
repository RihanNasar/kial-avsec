// KIAL AVSEC Mobile - Auth Context
// Manages authentication state, login/logout, and token persistence

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import authApi from '../api/authApi';
import { setLogoutCallback } from '../api/client';

const AuthContext = createContext(null);

/**
 * Hook to access auth state and actions
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

/**
 * Auth Provider — wraps the entire app
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Logout — clear everything
    const logout = useCallback(async () => {
        try {
            await SecureStore.deleteItemAsync('auth_token');
            await SecureStore.deleteItemAsync('user_data');
        } catch (e) {
            // Ignore SecureStore errors
        }
        setUser(null);
    }, []);

    // Register the logout callback for 401 interceptor
    useEffect(() => {
        setLogoutCallback(logout);
    }, [logout]);

    // On mount — restore session from SecureStore
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const token = await SecureStore.getItemAsync('auth_token');
                const userData = await SecureStore.getItemAsync('user_data');

                if (token && userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (e) {
                // If restore fails, user stays logged out
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    // Login — authenticate and persist token + user
    const login = async (email, password) => {
        try {
            const response = await authApi.login(email, password);
            const { token, user: userData } = response.data.data;

            // Persist to SecureStore
            await SecureStore.setItemAsync('auth_token', token);
            await SecureStore.setItemAsync('user_data', JSON.stringify(userData));

            setUser(userData);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed. Please try again.',
            };
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

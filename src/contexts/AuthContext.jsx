import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const register = async (userData) => {
        try {
            setError(null);
            const response = await registerUser(userData);
            const userData = await getCurrentUser();
            setUser(userData);
            return response;
        } catch (error) {
            setError(error.response?.data || { message: 'Registration failed' });
            throw error;
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await loginUser(credentials);
            const userData = await getCurrentUser();
            setUser(userData);
            return response;
        } catch (error) {
            setError(error.response?.data || { message: 'Login failed' });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
            setUser(null);
        } catch (error) {
            setError(error.response?.data || { message: 'Logout failed' });
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            register,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 
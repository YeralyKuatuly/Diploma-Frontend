import React, { createContext, useState, useEffect, useContext } from 'react';
import { createAuthAxios, API_URL } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkLoginStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      const authAxios = createAuthAxios();
      const response = await authAxios.get('/auth/profile/');
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();

    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        checkLoginStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (username, password) => {
    try {
      console.log("Login API URL used in AuthContext:", `${API_URL}/auth/login/`);
      const authAxios = createAuthAxios();
      const response = await authAxios.post('/auth/login/', { username, password });
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      await checkLoginStatus();
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const authAxios = createAuthAxios();
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAxios.post('/auth/logout/', { refresh: refreshToken });
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, user, login, logout }}>
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
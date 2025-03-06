import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAccessToken, createAuthAxios } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check login status on mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      try {
        // Try to make an authenticated request to verify token
        const authAxios = createAuthAxios();
        await authAxios.get('/auth/profile/');
        setIsLoggedIn(true);
      } catch (error) {
        // If token is invalid or expired, clear it and set logged out state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check on mount
    checkLoginStatus();
    
    // Listen for storage events (when token is added/removed in another tab)
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);
  
  // Function to update login state
  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);
  
  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
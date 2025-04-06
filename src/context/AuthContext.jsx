import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAccessToken, createAuthAxios, API_URL } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check login status on mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = async () => {
      console.log('Checking login status...');
      const token = getAccessToken();
      console.log('Token exists:', !!token);
      
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      try {
        // Try to make an authenticated request to verify token
        const authAxios = createAuthAxios();
        await authAxios.get(`${API_URL}/auth/profile/`);
        console.log('Token is valid, user is logged in');
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Token validation failed:', error);
        if (error.response) {
          console.error('Error response:', error.response.status, error.response.data);
        }
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
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        checkLoginStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Function to update login state
  const login = () => {
    console.log('Setting logged in state to true');
    setIsLoggedIn(true);
  };
  
  const logout = () => {
    console.log('Setting logged in state to false');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
  };
  
  // Add debug output to see current state
  console.log('AuthContext state:', { isLoggedIn, isLoading });
  
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
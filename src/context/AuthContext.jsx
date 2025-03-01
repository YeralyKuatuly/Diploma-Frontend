import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAccessToken } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check login status on mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = getAccessToken();
      setIsLoggedIn(!!token);
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
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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
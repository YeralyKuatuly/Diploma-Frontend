import axios from 'axios';

// Set the default base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:8000';

// Add a request interceptor to include the JWT token in the headers
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add debug logs
    console.log(`Request to: ${config.url}`, {
      headers: config.headers,
      hasToken: !!token
    });
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle 401 Unauthorized errors by logging out
    if (error.response && error.response.status === 401) {
      console.log('Authentication error detected, clearing tokens');
      // Clear token from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios; 
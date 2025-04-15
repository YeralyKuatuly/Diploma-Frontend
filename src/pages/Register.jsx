import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, API_URL } from "../api";
import axios from "axios";
import "../styles/Register.css";

// Default API URL as fallback when environment variable is not set
const DEFAULT_API_URL = "http://localhost:8000/api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [effectiveApiUrl, setEffectiveApiUrl] = useState("");
  const navigate = useNavigate();

  // Set the effective API URL once on mount
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
    setEffectiveApiUrl(apiUrl);
    console.log("Using API URL:", apiUrl);
  }, []);

  // Test API connection on mount
  useEffect(() => {
    const testApiConnection = async () => {
      if (!effectiveApiUrl) return; // Wait until we have an API URL
      
      try {
        setApiStatus({ status: 'testing', message: 'Testing API connection...' });
        const apiUrl = effectiveApiUrl;
        
        // Test if the base API URL is accessible
        // If URL ends with /api, remove it for the health check
        const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
        const healthCheckUrl = `${baseUrl}/health/`;
        console.log("Testing health check URL:", healthCheckUrl);
        
        const healthResponse = await axios.get(healthCheckUrl);
        console.log("Health check response:", healthResponse.data);
        
        setApiStatus({ 
          status: 'success', 
          message: 'API is accessible!',
          data: healthResponse.data
        });
      } catch (error) {
        console.error("API test failed:", error);
        setApiStatus({ 
          status: 'error', 
          message: 'API connection failed.',
          error: error.message
        });
      }
    };
    
    if (effectiveApiUrl) {
      testApiConnection();
    }
  }, [effectiveApiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.password2) {
        throw new Error("Passwords do not match");
      }

      // Register the user
      const data = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };

      console.log("Using API URL:", effectiveApiUrl);
      console.log("Sending registration data to:", `${effectiveApiUrl}/auth/register/`);
      
      await registerUser(data);
      
      // Redirect to login page with success message
      navigate("/login", { state: { message: "Registration successful! Please log in." } });
    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.response?.data) {
        // Handle validation errors from API
        const serverErrors = err.response.data;
        const errorMessages = [];
        
        for (const field in serverErrors) {
          if (Array.isArray(serverErrors[field])) {
            errorMessages.push(`${field}: ${serverErrors[field].join(' ')}`);
          } else if (typeof serverErrors[field] === 'string') {
            errorMessages.push(`${field}: ${serverErrors[field]}`);
          }
        }
        
        setError(errorMessages.join('; ') || "Registration failed");
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectRegistration = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      if (formData.password !== formData.password2) {
        throw new Error("Passwords do not match");
      }
      
      const registerUrl = `${effectiveApiUrl}/auth/register/`;
      
      console.log("Making direct registration request to:", registerUrl);
      
      const response = await axios.post(
        registerUrl,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      
      console.log("Direct registration response:", response);
      navigate("/login", { state: { message: "Registration successful! Please log in." } });
    } catch (err) {
      console.error("Direct registration error:", err);
      
      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectConnection = async () => {
    setError("");
    setApiStatus({ status: 'testing', message: 'Testing direct connection...' });
    
    try {
      // Try multiple URLs to diagnose the issue
      const urls = [
        'http://localhost:8000/health/',
        'http://127.0.0.1:8000/health/',
        'http://host.docker.internal:8000/health/'
      ];
      
      const results = {};
      
      for (const url of urls) {
        try {
          console.log(`Testing direct connection to: ${url}`);
          const response = await axios.get(url, { timeout: 5000 });
          results[url] = { 
            success: true, 
            status: response.status,
            data: response.data
          };
        } catch (err) {
          results[url] = { 
            success: false, 
            error: err.message
          };
        }
      }
      
      console.log("Direct connection test results:", results);
      
      setApiStatus({
        status: Object.values(results).some(r => r.success) ? 'success' : 'error',
        message: 'Direct connection test completed',
        data: results
      });
    } catch (err) {
      console.error("Test direct connection error:", err);
      setApiStatus({
        status: 'error',
        message: 'Failed to test direct connection',
        error: err.message
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2>Create an Account</h2>
        
        {/* API Status Display */}
        {apiStatus && (
          <div className={`api-status ${apiStatus.status}`}>
            <strong>API Status:</strong> {apiStatus.message}
            {apiStatus.data && (
              <pre>{JSON.stringify(apiStatus.data, null, 2)}</pre>
            )}
            {apiStatus.error && (
              <div className="error-details">
                Error: {apiStatus.error}
              </div>
            )}
            <button 
              type="button" 
              onClick={testDirectConnection}
              className="test-connection-button"
            >
              Test Direct Connection
            </button>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              minLength="8"
            />
          </div>
          
          <div className="button-group">
            <button type="submit" disabled={isLoading} className="register-button">
              {isLoading ? "Registering..." : "Register (API)"}
            </button>
            
            <button 
              type="button" 
              onClick={handleDirectRegistration} 
              disabled={isLoading} 
              className="register-button direct"
            >
              Register (Direct)
            </button>
          </div>
        </form>
        
        <div className="debug-info">
          <h3>Debug Information</h3>
          <div><strong>ENV VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</div>
          <div><strong>From API module:</strong> {API_URL || 'Not set'}</div>
          <div><strong>Effective API URL:</strong> {effectiveApiUrl || 'Not set'}</div>
          <div><strong>Window Origin:</strong> {window.location.origin}</div>
          <div><strong>Browser:</strong> {navigator.userAgent}</div>
        </div>
        
        <div className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 
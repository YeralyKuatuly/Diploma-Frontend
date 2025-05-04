import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { registerUser, API_URL } from "../api";
import "../styles/Register.css";

// Default API URL as fallback when environment variable is not set
const DEFAULT_API_URL = "http://46.101.105.28/api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [effectiveApiUrl, setEffectiveApiUrl] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get returnUrl from location state
  const returnUrl = location.state?.returnUrl || "/";

  // Set the effective API URL once on mount
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
    setEffectiveApiUrl(apiUrl);
  }, []);

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
      
      await registerUser(data);
      
      // Redirect to login page with success message and returnUrl
      navigate("/login", { 
        state: { 
          message: "Registration successful! Please log in.",
          returnUrl: returnUrl
        } 
      });
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

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2>Create an Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        {returnUrl !== "/" && (
          <div className="info-message">
            Register to continue to your destination
          </div>
        )}
        
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
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
        
        <div className="login-link">
          Already have an account? <Link to="/login" state={{ returnUrl }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api';
import '../styles/Authentication.css';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous error
    setError('');
    
    // Validate passwords
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Submit request
    try {
      setIsSubmitting(true);
      await resetPassword(uid, token, password);
      
      // Show success message and redirect after delay
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      console.error('Password reset failed:', err);
      
      // Handle different error responses
      if (err.response?.data?.token) {
        setError('This password reset link has expired or is invalid.');
      } else if (err.response?.data?.password) {
        setError(err.response.data.password);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-success">
            <h2>Password Reset Successful!</h2>
            <p>Your password has been updated. You will be redirected to the login page shortly.</p>
            <Link to="/login" className="auth-button">Log In Now</Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Set New Password</h1>
        <p className="auth-description">
          Enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
          
          <div className="auth-links">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 
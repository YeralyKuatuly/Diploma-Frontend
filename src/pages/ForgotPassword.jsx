import React, { useState } from 'react';
import { forgotPassword } from '../api';
import { Link } from 'react-router-dom';
import '../styles/Authentication.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setMessage('');
    
    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    // Submit request
    try {
      setIsSubmitting(true);
      await forgotPassword(email);
      
      // Show success message
      setMessage('If an account with that email exists, we have sent password reset instructions.');
      setSubmitted(true);
    } catch (err) {
      // Show error message
      console.error('Password reset request failed:', err);
      
      // Check if it's a timeout or network error
      if (err.message && (
          err.message.includes('timeout') || 
          err.message.includes('Network Error') ||
          err.message.includes('too long to respond')
        )) {
        setError('Server is taking too long to respond. The password reset email will still be processed in the background. Please check your email in a few minutes.');
      } else {
        setError(
          err.response?.data?.email || 
          err.response?.data?.detail || 
          err.message ||
          'Failed to send password reset email. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Reset Your Password</h1>
        <p className="auth-description">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        
        {submitted ? (
          <div className="auth-success">
            <div className="auth-success-message">
              <h2>Check Your Email</h2>
              <p>{message}</p>
              <p>
                Didn't receive the email? Check your spam folder or{' '}
                <button 
                  className="text-button" 
                  onClick={() => setSubmitted(false)}
                >
                  try again
                </button>
              </p>
              <div className="auth-links">
                <Link to="/login">Return to Login</Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Reset Password'}
            </button>
            
            <div className="auth-links">
              <Link to="/login">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 
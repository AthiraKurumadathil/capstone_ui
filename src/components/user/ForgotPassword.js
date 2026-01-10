import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../services/userService';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailRegex);
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      await forgotPassword(email.trim());

      setSuccess('Password reset email sent successfully! Check your inbox for further instructions.');
      setEmail('');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      const errorMsg = err.message || 'Failed to send password reset email';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p className="forgot-password-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="forgot-password-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {success && (
          <div className="forgot-password-success">
            <span>✓ {success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="forgot-password-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email address"
              disabled={isLoading}
              required
            />
          </div>

          <div className="forgot-password-actions">
            <button
              type="submit"
              className="btn-primary forgot-password-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              className="btn-secondary forgot-password-btn"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </div>
        </form>

        <p className="forgot-password-footer">
          Remember your password? <a href="/" className="login-link">Sign in here</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

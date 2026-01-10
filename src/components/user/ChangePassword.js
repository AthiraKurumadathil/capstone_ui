import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../services/userService';
import './ChangePassword.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!form.oldPassword.trim()) {
      setError('Current password is required');
      return false;
    }
    if (!form.newPassword.trim()) {
      setError('New password is required');
      return false;
    }
    if (!form.confirmPassword.trim()) {
      setError('Please confirm your new password');
      return false;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    if (form.oldPassword === form.newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user || !user.email) {
      setError('Unable to determine user email. Please log in again.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      await changePassword(user.email, form.oldPassword, form.newPassword);
      
      setSuccess('Password changed successfully!');
      setForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      const errorMsg = err.message || 'Failed to change password';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <h2>Change Password</h2>
        
        {error && (
          <div className="change-password-error">
            <span>⚠️ {error}</span>
          </div>
        )}
        
        {success && (
          <div className="change-password-success">
            <span>✓ {success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <div className="password-field">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                id="oldPassword"
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('old')}
                disabled={isLoading}
                tabIndex="-1"
              >
                {showPasswords.old ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="password-field">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('new')}
                disabled={isLoading}
                tabIndex="-1"
              >
                {showPasswords.new ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-field">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isLoading}
                tabIndex="-1"
              >
                {showPasswords.confirm ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <div className="change-password-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/home')}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>

          <p className="password-hint">
            Password must be at least 6 characters and different from your current password.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

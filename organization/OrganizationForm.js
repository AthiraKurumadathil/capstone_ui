import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createOrganization, updateOrganization, getOrganization } from '../../services/organizationService';
import './OrganizationForm.css';

const OrganizationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    state: '',
    phone: '',
    email: '',
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const navigate = useNavigate();
  const { orgId } = useParams();

  useEffect(() => {
    if (orgId) {
      loadOrganization();
    }
  }, [orgId]);

  const loadOrganization = async () => {
    try {
      setPageLoading(true);
      setIsEditMode(true);
      const data = await getOrganization(orgId);
      setFormData(data);
    } catch (err) {
      setServerError(err.message || 'Failed to load organization');
    } finally {
      setPageLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\-\+\(\)\s]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode) {
        await updateOrganization(orgId, formData);
      } else {
        await createOrganization(formData);
      }
      navigate('/organizations');
    } catch (err) {
      setServerError(err.message || 'Failed to save organization');
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="org-form-loading">Loading organization...</div>;
  }

  return (
    <div className="org-form-container">
      <div className="org-form-card">
        <h2>{isEditMode ? 'Edit Organization' : 'Create Organization'}</h2>

        {serverError && (
          <div className="org-form-error">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="org-form-row">
            <div className="org-form-group">
              <label htmlFor="name">Organization Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter organization name"
                className={`org-form-input ${errors.name ? 'input-error' : ''}`}
                disabled={isLoading}
              />
              {errors.name && <span className="org-form-error-msg">{errors.name}</span>}
            </div>

            <div className="org-form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={`org-form-input ${errors.email ? 'input-error' : ''}`}
                disabled={isLoading}
              />
              {errors.email && <span className="org-form-error-msg">{errors.email}</span>}
            </div>
          </div>

          <div className="org-form-row">
            <div className="org-form-group">
              <label htmlFor="phone">Phone *</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={`org-form-input ${errors.phone ? 'input-error' : ''}`}
                disabled={isLoading}
              />
              {errors.phone && <span className="org-form-error-msg">{errors.phone}</span>}
            </div>

            <div className="org-form-group">
              <label htmlFor="address">Address *</label>
              <input
                id="address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter street address"
                className={`org-form-input ${errors.address ? 'input-error' : ''}`}
                disabled={isLoading}
              />
              {errors.address && <span className="org-form-error-msg">{errors.address}</span>}
            </div>
          </div>

          <div className="org-form-row">
            <div className="org-form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                className="org-form-input"
                disabled={isLoading}
              />
            </div>

            <div className="org-form-group">
              <label htmlFor="state">State</label>
              <input
                id="state"
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                className="org-form-input"
                disabled={isLoading}
              />
            </div>

            <div className="org-form-group">
              <label htmlFor="zip">Zip Code</label>
              <input
                id="zip"
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="Enter zip code"
                className="org-form-input"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="org-form-group">
            <label htmlFor="active" className="org-checkbox-label">
              <input
                id="active"
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>Active</span>
            </label>
          </div>

          <div className="org-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/organizations')}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationForm;

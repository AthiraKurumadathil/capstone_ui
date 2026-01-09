import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTrainer, updateTrainer, getTrainer } from '../../services/trainerService';
import { getAllOrganizations } from '../../services/organizationService';
import './TrainerForm.css';

const TrainerForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    org_id: '',
    email: '',
    phone: '',
    hire_date: '',
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);

  const navigate = useNavigate();
  const { trainerId } = useParams();

  useEffect(() => {
    fetchOrganizations();
    if (trainerId) {
      loadTrainer();
    }
  }, [trainerId]);

  const fetchOrganizations = async () => {
    try {
      setOrgsLoading(true);
      const data = await getAllOrganizations();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setServerError('Failed to load organizations');
    } finally {
      setOrgsLoading(false);
    }
  };

  const loadTrainer = async () => {
    try {
      setPageLoading(true);
      setIsEditMode(true);
      const data = await getTrainer(trainerId);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        org_id: data.org_id || '',
        email: data.email || '',
        phone: data.phone || '',
        hire_date: data.hire_date || '',
        active: data.active !== undefined ? data.active : true,
      });
    } catch (err) {
      setServerError(err.message || 'Failed to load trainer');
    } finally {
      setPageLoading(false);
    }
  };

  const validateEmail = (email) => {
    // RFC 5322 simplified email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Additional checks for common invalid patterns
    if (!emailRegex.test(email)) {
      return false;
    }
    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }
    // Check if starts or ends with dot
    if (email.startsWith('.') || email.endsWith('.')) {
      return false;
    }
    // Check local part (before @) length
    const [localPart] = email.split('@');
    if (localPart.length > 64) {
      return false;
    }
    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.org_id) {
      newErrors.org_id = 'Organization is required';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
    }

    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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
    // Real-time validation for email
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        setErrors(prev => ({
          ...prev,
          [name]: 'Please enter a valid email address (e.g., user@example.com)',
        }));
      } else if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    } else if (errors[name]) {
      // Clear error for this field when user starts typing
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
      const submitData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        org_id: parseInt(formData.org_id, 10),
        email: formData.email ? formData.email.trim() : undefined,
        phone: formData.phone ? formData.phone.trim() : undefined,
        hire_date: formData.hire_date || undefined,
        active: formData.active,
      };

      if (isEditMode) {
        await updateTrainer(trainerId, submitData);
      } else {
        await createTrainer(submitData);
      }
      navigate('/trainers');
    } catch (err) {
      setServerError(err.message || 'Failed to save trainer');
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="trainer-form-container">
        <div className="trainer-form-loading">Loading trainer details...</div>
      </div>
    );
  }

  return (
    <div className="trainer-form-container">
      <div className="trainer-form-card">
        <h2>{isEditMode ? 'Edit Trainer' : 'Create New Trainer'}</h2>

        {serverError && <div className="trainer-form-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="trainer-form-row">
            <div className="trainer-form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? 'trainer-form-input error' : 'trainer-form-input'}
                placeholder="Enter first name"
              />
              {errors.first_name && <span className="trainer-form-error-msg">{errors.first_name}</span>}
            </div>

            <div className="trainer-form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? 'trainer-form-input error' : 'trainer-form-input'}
                placeholder="Enter last name"
              />
              {errors.last_name && <span className="trainer-form-error-msg">{errors.last_name}</span>}
            </div>
          </div>

          <div className="trainer-form-group">
            <label htmlFor="org_id">Organization *</label>
            {orgsLoading ? (
              <select className="trainer-form-input" disabled>
                <option>Loading organizations...</option>
              </select>
            ) : (
              <>
                <select
                  id="org_id"
                  name="org_id"
                  value={formData.org_id}
                  onChange={handleChange}
                  className={errors.org_id ? 'trainer-form-input error' : 'trainer-form-input'}
                >
                  <option value="">Select an organization</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                {errors.org_id && <span className="trainer-form-error-msg">{errors.org_id}</span>}
              </>
            )}
          </div>

          <div className="trainer-form-row">
            <div className="trainer-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'trainer-form-input error' : 'trainer-form-input'}
                placeholder="Enter email address"
              />
              {errors.email && <span className="trainer-form-error-msg">{errors.email}</span>}
            </div>

            <div className="trainer-form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'trainer-form-input error' : 'trainer-form-input'}
                placeholder="Enter phone number"
              />
              {errors.phone && <span className="trainer-form-error-msg">{errors.phone}</span>}
            </div>
          </div>

          <div className="trainer-form-group">
            <label htmlFor="hire_date">Hire Date</label>
            <input
              type="date"
              id="hire_date"
              name="hire_date"
              value={formData.hire_date}
              onChange={handleChange}
              className="trainer-form-input"
            />
          </div>

          <div className="trainer-form-group trainer-form-checkbox">
            <label htmlFor="active">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              <span>Active</span>
            </label>
          </div>

          <div className="trainer-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update Trainer' : 'Create Trainer')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/trainers')}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainerForm;

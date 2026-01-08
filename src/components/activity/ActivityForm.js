import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createActivity, updateActivity, getActivity } from '../../services/activityService';
import { getAllOrganizations } from '../../services/organizationService';
import { getAllCategories } from '../../services/categoryService';
import './ActivityForm.css';

const ActivityForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    org_id: '',
    category_id: '',
    description: '',
    default_fee: '',
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const navigate = useNavigate();
  const { activityId } = useParams();

  useEffect(() => {
    fetchOrganizations();
    fetchCategories();
    if (activityId) {
      loadActivity();
    }
  }, [activityId]);

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

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setServerError('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      setPageLoading(true);
      setIsEditMode(true);
      const data = await getActivity(activityId);
      setFormData({
        name: data.name || '',
        org_id: data.org_id || '',
        category_id: data.category_id || '',
        description: data.description || '',
        default_fee: data.default_fee || '',
        active: data.active !== undefined ? data.active : true,
      });
    } catch (err) {
      setServerError(err.message || 'Failed to load activity');
    } finally {
      setPageLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Activity name is required';
    }

    if (!formData.org_id) {
      newErrors.org_id = 'Organization is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (formData.default_fee && isNaN(formData.default_fee)) {
      newErrors.default_fee = 'Default fee must be a valid number';
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
      const submitData = {
        name: formData.name,
        org_id: parseInt(formData.org_id),
        category_id: parseInt(formData.category_id),
        description: formData.description || undefined,
        default_fee: formData.default_fee ? parseFloat(formData.default_fee) : undefined,
        active: formData.active,
      };

      if (isEditMode) {
        await updateActivity(activityId, submitData);
      } else {
        await createActivity(submitData);
      }
      navigate('/activities');
    } catch (err) {
      setServerError(err.message || 'Failed to save activity');
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="activity-form-loading">Loading activity...</div>;
  }

  return (
    <div className="activity-form-container">
      <div className="activity-form-card">
        <h2>{isEditMode ? 'Edit Activity' : 'Create Activity'}</h2>

        {serverError && (
          <div className="activity-form-error">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="activity-form-row">
            <div className="activity-form-group">
              <label htmlFor="name">Activity Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter activity name"
                className={`activity-form-input ${errors.name ? 'input-error' : ''}`}
                disabled={isLoading}
              />
              {errors.name && <span className="activity-form-error-msg">{errors.name}</span>}
            </div>

            <div className="activity-form-group">
              <label htmlFor="org_id">Organization *</label>
              <select
                id="org_id"
                name="org_id"
                value={formData.org_id}
                onChange={handleChange}
                className={`activity-form-input ${errors.org_id ? 'input-error' : ''}`}
                disabled={isLoading || orgsLoading}
              >
                <option value="">
                  {orgsLoading ? 'Loading organizations...' : 'Select an organization'}
                </option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id || org.org_id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {errors.org_id && <span className="activity-form-error-msg">{errors.org_id}</span>}
            </div>
          </div>

          <div className="activity-form-row">
            <div className="activity-form-group">
              <label htmlFor="category_id">Category *</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`activity-form-input ${errors.category_id ? 'input-error' : ''}`}
                disabled={isLoading || categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                </option>
                {categories.map(category => (
                  <option key={category.id} value={category.id || category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <span className="activity-form-error-msg">{errors.category_id}</span>}
            </div>

            <div className="activity-form-group">
              <label htmlFor="default_fee">Default Fee</label>
              <input
                id="default_fee"
                type="number"
                name="default_fee"
                value={formData.default_fee}
                onChange={handleChange}
                placeholder="Enter default fee"
                step="0.01"
                min="0"
                className={`activity-form-input ${errors.default_fee ? 'input-error' : ''}`}
                disabled={isLoading}
              />
              {errors.default_fee && <span className="activity-form-error-msg">{errors.default_fee}</span>}
            </div>
          </div>

          <div className="activity-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter activity description (optional)"
              className="activity-form-textarea"
              disabled={isLoading}
              rows="4"
            />
          </div>

          <div className="activity-form-group">
            <label htmlFor="active" className="activity-checkbox-label">
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

          <div className="activity-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/activities')}
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

export default ActivityForm;

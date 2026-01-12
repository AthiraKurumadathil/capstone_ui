import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBatch, updateBatch, getBatch } from '../../services/batchService';
import { getAllOrganizations } from '../../services/organizationService';
import { getAllActivities } from '../../services/activityService';
import { getAllFeePlans } from '../../services/feePlanService';
import './BatchForm.css';

const BatchForm = () => {
  const [formData, setFormData] = useState({
    org_id: '',
    activity_id: '',
    fee_plan_id: '',
    name: '',
    start_date: '',
    end_date: '',
    capacity: '',
    location: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [feePlans, setFeePlans] = useState([]);
  const [feePlansLoading, setFeePlansLoading] = useState(true);

  const navigate = useNavigate();
  const { batchId } = useParams();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchOrganizations();
    fetchActivities();
    fetchFeePlans();
    if (batchId) {
      loadBatch();
    }
  }, [batchId]);

  const fetchOrganizations = async () => {
    try {
      setOrganizationsLoading(true);
      const data = await getAllOrganizations();
      let orgList = Array.isArray(data) ? data : [];
      
      // If user is org admin, show only their organization
      if (isOrgAdmin && userOrgId) {
        orgList = orgList.filter(org => org.id === userOrgId);
        // Auto-select user's organization
        setFormData(prev => ({ ...prev, org_id: userOrgId.toString() }));
      }
      
      setOrganizations(orgList);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setOrganizations([]);
    } finally {
      setOrganizationsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const data = await getAllActivities();
      let activityList = Array.isArray(data) ? data : [];
      
      // If user is org admin, show only their organization's activities
      if (isOrgAdmin && userOrgId) {
        activityList = activityList.filter(activity => activity.org_id === userOrgId);
      }
      
      setActivities(activityList);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchFeePlans = async () => {
    try {
      setFeePlansLoading(true);
      const data = await getAllFeePlans();
      let feePlanList = Array.isArray(data) ? data : [];
      
      // If user is org admin, show only their organization's fee plans
      if (isOrgAdmin && userOrgId) {
        feePlanList = feePlanList.filter(plan => plan.org_id === userOrgId);
      }
      
      setFeePlans(feePlanList);
    } catch (err) {
      console.error('Error fetching fee plans:', err);
      setFeePlans([]);
    } finally {
      setFeePlansLoading(false);
    }
  };

  const loadBatch = async () => {
    try {
      setPageLoading(true);
      setIsEditMode(true);
      const data = await getBatch(batchId);
      setFormData({
        org_id: data.org_id || '',
        activity_id: data.activity_id || '',
        fee_plan_id: data.fee_plan_id || '',
        name: data.name || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        capacity: data.capacity || '',
        location: data.location || '',
        status: data.status || 'active',
      });
    } catch (err) {
      setServerError(err.message || 'Failed to load batch');
    } finally {
      setPageLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.org_id) {
      newErrors.org_id = 'Organization is required';
    }

    if (!formData.activity_id) {
      newErrors.activity_id = 'Activity is required';
    }

    if (!formData.fee_plan_id) {
      newErrors.fee_plan_id = 'Fee Plan ID is required';
    }

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Batch name is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
      setServerError('Please fix the errors below before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        org_id: parseInt(formData.org_id, 10),
        activity_id: parseInt(formData.activity_id, 10),
        fee_plan_id: parseInt(formData.fee_plan_id, 10),
        name: formData.name.trim(),
        start_date: formData.start_date,
        status: formData.status.trim(),
      };

      // Add optional fields
      if (formData.end_date) {
        submitData.end_date = formData.end_date;
      }
      if (formData.capacity) {
        submitData.capacity = parseInt(formData.capacity, 10);
      }
      if (formData.location) {
        submitData.location = formData.location.trim();
      }

      if (isEditMode) {
        await updateBatch(batchId, submitData);
        alert('Batch updated successfully');
      } else {
        await createBatch(submitData);
        alert('Batch created successfully');
      }
      navigate('/batches');
    } catch (error) {
      const message = error.message || error.detail || 'Failed to save batch';
      setServerError(message);
      console.error('Error saving batch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="batch-form-loading">Loading batch data...</div>;
  }

  return (
    <div className="batch-form-container">
      <div className="batch-form-card">
        <h2>{isEditMode ? 'Edit Batch' : 'Create New Batch'}</h2>

        {serverError && <div className="batch-form-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="batch-form-row">
            <div className="batch-form-group">
              <label htmlFor="org_id">Organization *</label>
              <select
                id="org_id"
                name="org_id"
                value={formData.org_id}
                onChange={handleChange}
                className={errors.org_id ? 'batch-form-input error' : 'batch-form-input'}
                disabled={organizationsLoading}
              >
                <option value="">Select an organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={String(org.id)}>
                    {org.name}
                  </option>
                ))}
              </select>
              {errors.org_id && <span className="batch-form-error-msg">{errors.org_id}</span>}
            </div>

            <div className="batch-form-group">
              <label htmlFor="activity_id">Activity *</label>
              <select
                id="activity_id"
                name="activity_id"
                value={formData.activity_id}
                onChange={handleChange}
                className={errors.activity_id ? 'batch-form-input error' : 'batch-form-input'}
                disabled={activitiesLoading}
              >
                <option value="">Select an activity</option>
                {activities.map(activity => (
                  <option key={activity.id} value={String(activity.id)}>
                    {activity.name}
                  </option>
                ))}
              </select>
              {errors.activity_id && <span className="batch-form-error-msg">{errors.activity_id}</span>}
            </div>
          </div>

          <div className="batch-form-row">
            <div className="batch-form-group">
              <label htmlFor="name">Batch Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'batch-form-input error' : 'batch-form-input'}
                placeholder="Enter batch name"
              />
              {errors.name && <span className="batch-form-error-msg">{errors.name}</span>}
            </div>

            <div className="batch-form-group">
              <label htmlFor="fee_plan_id">Fee Plan *</label>
              <select
                id="fee_plan_id"
                name="fee_plan_id"
                value={formData.fee_plan_id}
                onChange={handleChange}
                className={errors.fee_plan_id ? 'batch-form-input error' : 'batch-form-input'}
                disabled={feePlansLoading}
              >
                <option value="">Select a fee plan</option>
                {feePlans.map(plan => (
                  <option key={plan.id} value={String(plan.id)}>
                    {plan.name}
                  </option>
                ))}
              </select>
              {errors.fee_plan_id && <span className="batch-form-error-msg">{errors.fee_plan_id}</span>}
            </div>
          </div>

          <div className="batch-form-row">
            <div className="batch-form-group">
              <label htmlFor="start_date">Start Date *</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={errors.start_date ? 'batch-form-input error' : 'batch-form-input'}
              />
              {errors.start_date && <span className="batch-form-error-msg">{errors.start_date}</span>}
            </div>

            <div className="batch-form-group">
              <label htmlFor="end_date">End Date</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="batch-form-input"
              />
            </div>
          </div>

          <div className="batch-form-row">
            <div className="batch-form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="batch-form-input"
                placeholder="Enter capacity"
              />
            </div>

            <div className="batch-form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={errors.status ? 'batch-form-input error' : 'batch-form-input'}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && <span className="batch-form-error-msg">{errors.status}</span>}
            </div>
          </div>

          <div className="batch-form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="batch-form-input"
              placeholder="Enter location"
            />
          </div>

          <div className="batch-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Batch' : 'Create Batch'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/batches')}
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

export default BatchForm;

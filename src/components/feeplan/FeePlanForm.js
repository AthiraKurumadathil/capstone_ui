import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createFeePlan, updateFeePlan, getFeePlan } from '../../services/feePlanService';
import { getAllOrganizations } from '../../services/organizationService';
import './FeePlanForm.css';

const FeePlanForm = () => {
  const [formData, setFormData] = useState({
    org_id: '',
    name: '',
    billing_type: '',
    amount: '',
    currency: '',
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
  const { feePlanId } = useParams();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchOrganizations();
    if (feePlanId) {
      loadFeePlan();
    }
  }, [feePlanId]);

  const fetchOrganizations = async () => {
    try {
      setOrgsLoading(true);
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
      setOrgsLoading(false);
    }
  };

  const loadFeePlan = async () => {
    try {
      setPageLoading(true);
      setIsEditMode(true);
      const feePlanIdInt = parseInt(feePlanId, 10);
      if (isNaN(feePlanIdInt)) {
        setServerError('Invalid fee plan ID');
        return;
      }
      const data = await getFeePlan(feePlanIdInt);
      setFormData({
        org_id: data.org_id || '',
        name: data.name || '',
        billing_type: data.billing_type || '',
        amount: data.amount || '',
        currency: data.currency || '',
        active: data.active !== undefined ? data.active : true,
      });
    } catch (err) {
      setServerError(err.message || 'Failed to load fee plan');
    } finally {
      setPageLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.org_id) {
      newErrors.org_id = 'Organization is required';
    }

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Fee plan name is required';
    }

    if (!formData.billing_type) {
      newErrors.billing_type = 'Billing type is required';
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.currency || formData.currency.length !== 3) {
      newErrors.currency = 'Currency code (3 characters) is required';
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
        name: formData.name.trim(),
        billing_type: formData.billing_type.trim(),
        amount: parseFloat(formData.amount),
        currency: formData.currency.trim().toUpperCase(),
        active: formData.active,
      };

      if (isEditMode) {
        const feePlanIdInt = parseInt(feePlanId, 10);
        await updateFeePlan(feePlanIdInt, submitData);
        alert('Fee plan updated successfully');
      } else {
        await createFeePlan(submitData);
        alert('Fee plan created successfully');
      }
      navigate('/feeplans');
    } catch (error) {
      let message = 'Failed to save fee plan';
      
      if (error.errors && Array.isArray(error.errors)) {
        message = error.errors.map(err => `${err.loc?.[1] || 'Field'}: ${err.msg}`).join(', ');
      } else if (error.detail) {
        message = error.detail;
      } else if (error.message) {
        message = error.message;
      }
      
      setServerError(message);
      console.error('Error saving fee plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="feeplan-form-loading">Loading fee plan data...</div>;
  }

  return (
    <div className="feeplan-form-container">
      <div className="feeplan-form-card">
        <h2>{isEditMode ? 'Edit Fee Plan' : 'Create New Fee Plan'}</h2>

        {serverError && <div className="feeplan-form-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="feeplan-form-row">
            <div className="feeplan-form-group">
              <label htmlFor="org_id">Organization *</label>
              <select
                id="org_id"
                name="org_id"
                value={formData.org_id}
                onChange={handleChange}
                className={errors.org_id ? 'feeplan-form-input error' : 'feeplan-form-input'}
                disabled={orgsLoading}
              >
                <option value="">Select an organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={String(org.id)}>
                    {org.name}
                  </option>
                ))}
              </select>
              {errors.org_id && <span className="feeplan-form-error-msg">{errors.org_id}</span>}
            </div>

            <div className="feeplan-form-group">
              <label htmlFor="name">Fee Plan Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'feeplan-form-input error' : 'feeplan-form-input'}
                placeholder="Enter fee plan name"
              />
              {errors.name && <span className="feeplan-form-error-msg">{errors.name}</span>}
            </div>
          </div>

          <div className="feeplan-form-row">
            <div className="feeplan-form-group">
              <label htmlFor="billing_type">Billing Type *</label>
              <input
                id="billing_type"
                type="text"
                name="billing_type"
                value={formData.billing_type}
                onChange={handleChange}
                className={errors.billing_type ? 'feeplan-form-input error' : 'feeplan-form-input'}
                placeholder="e.g., Monthly, Annual"
              />
              {errors.billing_type && <span className="feeplan-form-error-msg">{errors.billing_type}</span>}
            </div>

            <div className="feeplan-form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                className={errors.amount ? 'feeplan-form-input error' : 'feeplan-form-input'}
                placeholder="Enter amount"
              />
              {errors.amount && <span className="feeplan-form-error-msg">{errors.amount}</span>}
            </div>
          </div>

          <div className="feeplan-form-row">
            <div className="feeplan-form-group">
              <label htmlFor="currency">Currency Code *</label>
              <input
                id="currency"
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                maxLength="3"
                className={errors.currency ? 'feeplan-form-input error' : 'feeplan-form-input'}
                placeholder="e.g., USD, EUR, INR"
              />
              {errors.currency && <span className="feeplan-form-error-msg">{errors.currency}</span>}
            </div>

            <div className="feeplan-form-group">
              <label htmlFor="active">
                <input
                  id="active"
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>
          </div>

          <div className="feeplan-form-actions">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/feeplans')}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Fee Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeePlanForm;

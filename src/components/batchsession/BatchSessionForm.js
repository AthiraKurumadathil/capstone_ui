import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBatchSession, updateBatchSession, getBatchSession } from '../../services/batchSessionService';
import { getAllBatches } from '../../services/batchService';
import './BatchSessionForm.css';

const BatchSessionForm = () => {
  const [formData, setFormData] = useState({
    session_name: '',
    batch_id: '',
    session_date: '',
    start_time: '',
    end_time: '',
    status: 'scheduled',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);

  const navigate = useNavigate();
  const { sessionId } = useParams();

  // Get user and org info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role_name?.toLowerCase().trim() === 'super admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchBatches();
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const fetchBatches = async () => {
    try {
      setBatchesLoading(true);
      const data = await getAllBatches();
      let batchesData = Array.isArray(data) ? data : [];
      
      console.log('All batches:', batchesData);
      console.log('User org_id:', userOrgId, 'Is Super Admin:', isSuperAdmin);
      
      // If not Super Admin, filter by user organization
      if (!isSuperAdmin && userOrgId) {
        batchesData = batchesData.filter(batch => batch.org_id === userOrgId);
        console.log('Batches filtered to org:', batchesData);
      }
      
      setBatches(batchesData);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setBatches([]);
    } finally {
      setBatchesLoading(false);
    }
  };

  const loadSession = async () => {
    try {
      setPageLoading(true);
      setIsEditMode(true);
      const sessionIdInt = parseInt(sessionId, 10);
      if (isNaN(sessionIdInt)) {
        setServerError('Invalid session ID');
        return;
      }
      const data = await getBatchSession(sessionIdInt);
      setFormData({
        session_name: data.session_name || '',
        batch_id: data.batch_id || '',
        session_date: data.session_date || '',
        start_time: data.start_time || '',
        end_time: data.end_time || '',
        status: data.status || 'scheduled',
        notes: data.notes || '',
      });
    } catch (err) {
      setServerError(err.message || 'Failed to load batch session');
    } finally {
      setPageLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.session_name || formData.session_name.trim().length === 0) {
      newErrors.session_name = 'Session name is required';
    }

    if (!formData.batch_id) {
      newErrors.batch_id = 'Batch is required';
    }

    if (!formData.session_date) {
      newErrors.session_date = 'Session date is required';
    } else if (formData.batch_id) {
      // Validate that session date is between batch start and end date
      const selectedBatch = batches.find(b => String(b.id) === formData.batch_id);
      if (selectedBatch && selectedBatch.start_date && selectedBatch.end_date) {
        const sessionDate = new Date(formData.session_date).toISOString().split('T')[0];
        const batchStart = new Date(selectedBatch.start_date).toISOString().split('T')[0];
        const batchEnd = new Date(selectedBatch.end_date).toISOString().split('T')[0];
        
        if (sessionDate < batchStart || sessionDate > batchEnd) {
          newErrors.session_date = `Session date must be between ${batchStart} and ${batchEnd}`;
        }
      }
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
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
        session_name: formData.session_name ? formData.session_name.trim() : null,
        batch_id: formData.batch_id ? parseInt(formData.batch_id, 10) : null,
        session_date: formData.session_date || null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        status: formData.status ? formData.status.trim() : null,
      };

      // Add optional notes
      if (formData.notes && formData.notes.trim()) {
        submitData.notes = formData.notes.trim();
      } else {
        submitData.notes = null;
      }

      if (isEditMode) {
        const sessionIdInt = parseInt(sessionId, 10);
        await updateBatchSession(sessionIdInt, submitData);
        alert('Batch session updated successfully');
      } else {
        await createBatchSession(submitData);
        alert('Batch session created successfully');
      }
      navigate('/batchsessions');
    } catch (error) {
      let message = 'Failed to save batch session';
      
      // Handle detailed error responses
      if (error.errors && Array.isArray(error.errors)) {
        message = error.errors.map(err => `${err.loc?.[1] || 'Field'}: ${err.msg}`).join(', ');
      } else if (error.detail) {
        message = error.detail;
      } else if (error.message) {
        message = error.message;
      }
      
      setServerError(message);
      console.error('Error saving batch session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="batchsession-form-loading">Loading batch session data...</div>;
  }

  return (
    <div className="batchsession-form-container">
      <div className="batchsession-form-card">
        <h2>{isEditMode ? 'Edit Batch Session' : 'Create New Batch Session'}</h2>

        {serverError && <div className="batchsession-form-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="batchsession-form-row">
            <div className="batchsession-form-group">
              <label htmlFor="session_name">Session Name *</label>
              <input
                type="text"
                id="session_name"
                name="session_name"
                value={formData.session_name}
                onChange={handleChange}
                className={errors.session_name ? 'batchsession-form-input error' : 'batchsession-form-input'}
                placeholder="Enter session name"
              />
              {errors.session_name && <span className="batchsession-form-error-msg">{errors.session_name}</span>}
            </div>

            <div className="batchsession-form-group">
              <label htmlFor="batch_id">Batch *</label>
              <select
                id="batch_id"
                name="batch_id"
                value={formData.batch_id}
                onChange={handleChange}
                className={errors.batch_id ? 'batchsession-form-input error' : 'batchsession-form-input'}
                disabled={batchesLoading}
              >
                <option value="">Select a batch</option>
                {batches.map(batch => (
                  <option key={batch.id} value={String(batch.id)}>
                    {batch.name}
                  </option>
                ))}
              </select>
              {errors.batch_id && <span className="batchsession-form-error-msg">{errors.batch_id}</span>}
            </div>

            <div className="batchsession-form-group">
              <label htmlFor="session_date">Session Date *</label>
              <input
                type="date"
                id="session_date"
                name="session_date"
                value={formData.session_date}
                onChange={handleChange}
                className={errors.session_date ? 'batchsession-form-input error' : 'batchsession-form-input'}
              />
              {errors.session_date && <span className="batchsession-form-error-msg">{errors.session_date}</span>}
            </div>
          </div>

          <div className="batchsession-form-row">
            <div className="batchsession-form-group">
              <label htmlFor="start_time">Start Time *</label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className={errors.start_time ? 'batchsession-form-input error' : 'batchsession-form-input'}
              />
              {errors.start_time && <span className="batchsession-form-error-msg">{errors.start_time}</span>}
            </div>

            <div className="batchsession-form-group">
              <label htmlFor="end_time">End Time *</label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className={errors.end_time ? 'batchsession-form-input error' : 'batchsession-form-input'}
              />
              {errors.end_time && <span className="batchsession-form-error-msg">{errors.end_time}</span>}
            </div>
          </div>

          <div className="batchsession-form-row">
            <div className="batchsession-form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={errors.status ? 'batchsession-form-input error' : 'batchsession-form-input'}
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {errors.status && <span className="batchsession-form-error-msg">{errors.status}</span>}
            </div>
          </div>

          <div className="batchsession-form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="batchsession-form-input"
              placeholder="Enter session notes (optional)"
              rows="4"
            />
          </div>

          <div className="batchsession-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Session' : 'Create Session'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/batchsessions')}
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

export default BatchSessionForm;

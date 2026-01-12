import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createStudent, updateStudent, getStudent } from '../../services/studentService';
import { getAllOrganizations } from '../../services/organizationService';
import './StudentForm.css';

const StudentForm = () => {
  const [formData, setFormData] = useState({
    org_id: '',
    first_name: '',
    last_name: '',
    dob: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    notes: '',
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(true);

  const navigate = useNavigate();
  const { studentId } = useParams();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchOrganizations();
    if (studentId) {
      loadStudent();
    }
  }, [studentId]);

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

  const loadStudent = async () => {
    try {
      setPageLoading(true);
      setIsEditMode(true);
      const data = await getStudent(studentId);
      setFormData({
        org_id: data.org_id || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        dob: data.dob || '',
        guardian_name: data.guardian_name || '',
        guardian_phone: data.guardian_phone || '',
        guardian_email: data.guardian_email || '',
        notes: data.notes || '',
        active: data.active !== false,
      });
    } catch (err) {
      setServerError(err.message || 'Failed to load student');
    } finally {
      setPageLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.org_id) {
      newErrors.org_id = 'Organization is required';
    }

    if (!formData.first_name || formData.first_name.trim().length === 0) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name || formData.last_name.trim().length === 0) {
      newErrors.last_name = 'Last name is required';
    }

    if (formData.guardian_email && !validateEmail(formData.guardian_email.trim())) {
      newErrors.guardian_email = 'Please enter a valid email address';
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
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        active: formData.active,
      };

      // Add optional fields
      if (formData.dob) {
        submitData.dob = formData.dob;
      }
      if (formData.guardian_name) {
        submitData.guardian_name = formData.guardian_name.trim();
      }
      if (formData.guardian_phone) {
        submitData.guardian_phone = formData.guardian_phone.trim();
      }
      if (formData.guardian_email) {
        submitData.guardian_email = formData.guardian_email.trim();
      }
      if (formData.notes) {
        submitData.notes = formData.notes.trim();
      }

      if (isEditMode) {
        await updateStudent(studentId, submitData);
        alert('Student updated successfully');
      } else {
        await createStudent(submitData);
        alert('Student created successfully');
      }
      navigate('/students');
    } catch (error) {
      const message = error.message || error.detail || 'Failed to save student';
      setServerError(message);
      console.error('Error saving student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="student-form-loading">Loading student data...</div>;
  }

  return (
    <div className="student-form-container">
      <div className="student-form-card">
        <h2>{isEditMode ? 'Edit Student' : 'Create New Student'}</h2>

        {serverError && <div className="student-form-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="student-form-row">
            <div className="student-form-group">
              <label htmlFor="org_id">Organization *</label>
              <select
                id="org_id"
                name="org_id"
                value={formData.org_id}
                onChange={handleChange}
                className={errors.org_id ? 'student-form-input error' : 'student-form-input'}
                disabled={organizationsLoading}
              >
                <option value="">Select an organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={String(org.id)}>
                    {org.name}
                  </option>
                ))}
              </select>
              {errors.org_id && <span className="student-form-error-msg">{errors.org_id}</span>}
            </div>
          </div>

          <div className="student-form-row">
            <div className="student-form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? 'student-form-input error' : 'student-form-input'}
                placeholder="Enter first name"
              />
              {errors.first_name && <span className="student-form-error-msg">{errors.first_name}</span>}
            </div>

            <div className="student-form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? 'student-form-input error' : 'student-form-input'}
                placeholder="Enter last name"
              />
              {errors.last_name && <span className="student-form-error-msg">{errors.last_name}</span>}
            </div>
          </div>

          <div className="student-form-row">
            <div className="student-form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="student-form-input"
              />
            </div>

            <div className="student-form-group">
              <label htmlFor="active">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  style={{ marginRight: '8px' }}
                />
                Active
              </label>
            </div>
          </div>

          <div className="student-form-row">
            <div className="student-form-group">
              <label htmlFor="guardian_name">Guardian Name</label>
              <input
                type="text"
                id="guardian_name"
                name="guardian_name"
                value={formData.guardian_name}
                onChange={handleChange}
                className="student-form-input"
                placeholder="Enter guardian name"
              />
            </div>

            <div className="student-form-group">
              <label htmlFor="guardian_phone">Guardian Phone</label>
              <input
                type="tel"
                id="guardian_phone"
                name="guardian_phone"
                value={formData.guardian_phone}
                onChange={handleChange}
                className="student-form-input"
                placeholder="Enter guardian phone"
              />
            </div>
          </div>

          <div className="student-form-row">
            <div className="student-form-group">
              <label htmlFor="guardian_email">Guardian Email</label>
              <input
                type="email"
                id="guardian_email"
                name="guardian_email"
                value={formData.guardian_email}
                onChange={handleChange}
                className={errors.guardian_email ? 'student-form-input error' : 'student-form-input'}
                placeholder="Enter guardian email"
              />
              {errors.guardian_email && <span className="student-form-error-msg">{errors.guardian_email}</span>}
            </div>
          </div>

          <div className="student-form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="student-form-input"
              placeholder="Enter additional notes"
              rows="4"
            />
          </div>

          <div className="student-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Student' : 'Create Student'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/students')}
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

export default StudentForm;

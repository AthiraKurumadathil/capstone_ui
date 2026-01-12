import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEnrollment, createEnrollment, updateEnrollment } from '../../services/enrollmentService';
import { getAllOrganizations } from '../../services/organizationService';
import { getAllBatches } from '../../services/batchService';
import { getAllStudents } from '../../services/studentService';
import './EnrollmentForm.css';

const EnrollmentForm = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role_name?.toLowerCase().trim() === 'super admin';
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;
  
  const [form, setForm] = useState({
    org_id: '',
    batch_id: '',
    student_id: '',
    enrolled_on: '',
    status: 'Active'
  });
  const [organizations, setOrganizations] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizations();
    fetchBatches();
    fetchStudents();
    if (enrollmentId) {
      fetchEnrollment();
    }
  }, [enrollmentId]);

  const fetchEnrollment = async () => {
    try {
      setIsLoading(true);
      const data = await getEnrollment(enrollmentId);
      setForm({
        org_id: data.org_id,
        batch_id: data.batch_id,
        student_id: data.student_id,
        enrolled_on: data.enrolled_on,
        status: data.status || 'Active'
      });
    } catch (err) {
      setError(err.message || 'Failed to load enrollment');
      console.error('Fetch enrollment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const data = await getAllOrganizations();
      let orgList = Array.isArray(data) ? data : [];
      
      // If user is org admin, show only their organization
      if (isOrgAdmin && userOrgId) {
        orgList = orgList.filter(org => org.id === userOrgId);
        // Auto-select user's organization
        setForm(prev => ({ ...prev, org_id: userOrgId.toString() }));
      }
      
      setOrganizations(orgList);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await getAllBatches();
      let batchList = Array.isArray(data) ? data : [];
      
      // Store all batches
      setAllBatches(batchList);
      
      // For Super Admin, don't show any batches initially - wait for organization selection
      if (isSuperAdmin) {
        setBatches([]);
      }
      // For Organization Admin, show only their organization's batches
      else if (isOrgAdmin && userOrgId) {
        batchList = batchList.filter(batch => batch.org_id === userOrgId);
        setBatches(batchList);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await getAllStudents();
      let studentList = Array.isArray(data) ? data : [];
      
      // Store all students
      setAllStudents(studentList);
      
      // For Super Admin, don't show any students initially - wait for organization selection
      if (isSuperAdmin) {
        setStudents([]);
      }
      // For Organization Admin, show only their organization's students
      else if (isOrgAdmin && userOrgId) {
        studentList = studentList.filter(student => student.org_id === userOrgId);
        setStudents(studentList);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const filterByOrganization = (orgId) => {
    if (!orgId) {
      setBatches([]);
      setStudents([]);
      return;
    }
    
    // Filter batches by organization
    const filteredBatches = allBatches.filter(batch => batch.org_id === parseInt(orgId));
    setBatches(filteredBatches);
    
    // Filter students by organization
    const filteredStudents = allStudents.filter(student => student.org_id === parseInt(orgId));
    setStudents(filteredStudents);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    
    // Filter students and batches when organization changes (for Super Admin)
    if (name === 'org_id' && isSuperAdmin) {
      filterByOrganization(value);
    }
  };

  const validateForm = () => {
    if (!form.org_id) return 'Organization is required';
    if (!form.batch_id) return 'Batch is required';
    if (!form.student_id) return 'Student is required';
    if (!form.enrolled_on) return 'Enrollment date is required';
    if (!form.status) return 'Status is required';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      let enrollmentResponse;
      if (enrollmentId) {
        enrollmentResponse = await updateEnrollment(enrollmentId, form);
        navigate(`/enrollments/${enrollmentId}`);
      } else {
        enrollmentResponse = await createEnrollment(form);
        navigate(`/enrollments/${enrollmentResponse.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save enrollment');
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && enrollmentId) {
    return <div className="enrollment-form-loading">Loading enrollment...</div>;
  }

  return (
    <div className="enrollment-form-container">
      <div className="enrollment-form-card">
        <div className="enrollment-form-header">
          <h1>{enrollmentId ? 'Edit Enrollment' : 'Create Enrollment'}</h1>
          <p>{enrollmentId ? 'Update enrollment details' : 'Add a new enrollment record'}</p>
        </div>

        {error && <div className="enrollment-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="enrollment-form-group">
            <label htmlFor="org_id">
              Organization <span className="required">*</span>
            </label>
            <select 
              id="org_id"
              name="org_id" 
              value={form.org_id} 
              onChange={handleChange}
              disabled={isOrgAdmin}
              required
            >
              <option value="">-- Select Organization --</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="enrollment-form-group">
            <label htmlFor="batch_id">
              Batch <span className="required">*</span>
            </label>
            <select 
              id="batch_id"
              name="batch_id" 
              value={form.batch_id} 
              onChange={handleChange}
              required
            >
              <option value="">-- Select Batch --</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </div>

          <div className="enrollment-form-group">
            <label htmlFor="student_id">
              Student <span className="required">*</span>
            </label>
            <select 
              id="student_id"
              name="student_id" 
              value={form.student_id} 
              onChange={handleChange}
              required
            >
              <option value="">-- Select Student --</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.first_name} {student.last_name}</option>
              ))}
            </select>
          </div>

          <div className="enrollment-form-group">
            <label htmlFor="enrolled_on">
              Enrollment Date <span className="required">*</span>
            </label>
            <input 
              type="date" 
              id="enrolled_on"
              name="enrolled_on" 
              value={form.enrolled_on} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="enrollment-form-group">
            <label htmlFor="status">
              Status <span className="required">*</span>
            </label>
            <select 
              id="status"
              name="status" 
              value={form.status} 
              onChange={handleChange}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Completed">Completed</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>

          <div className="enrollment-form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : enrollmentId ? 'Update Enrollment' : 'Create Enrollment'}
            </button>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/enrollments')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentForm;

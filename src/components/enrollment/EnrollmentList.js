import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEnrollments, deleteEnrollment } from '../../services/enrollmentService';
import { getAllOrganizations } from '../../services/organizationService';
import { getAllBatches } from '../../services/batchService';
import { getAllStudents } from '../../services/studentService';
import './EnrollmentList.css';

const EnrollmentList = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchEnrollments();
    fetchOrganizations();
    fetchBatches();
    fetchStudents();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      const data = await getAllEnrollments();
      let filteredData = Array.isArray(data) ? data : [];
      
      // If user is org admin, filter by their organization
      if (isOrgAdmin && userOrgId) {
        filteredData = filteredData.filter(enrollment => enrollment.org_id === userOrgId);
      }
      
      console.log('Enrollments fetched:', filteredData);
      setEnrollments(filteredData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load enrollments');
      console.error('Fetch enrollments error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const data = await getAllOrganizations();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await getAllBatches();
      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await getAllStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const getOrgName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : `Organization ${orgId}`;
  };

  const getBatchName = (batchId) => {
    const batch = batches.find(b => b.id === batchId);
    return batch ? batch.name : `Batch ${batchId}`;
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : `Student ${studentId}`;
  };

  const handleDelete = async () => {
    try {
      await deleteEnrollment(deleteConfirm.id);
      setEnrollments(enrollments.filter(e => e.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete enrollment');
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (enrollment) => {
    navigate(`/enrollments/edit/${enrollment.id}`);
  };

  const handleView = (enrollment) => {
    navigate(`/enrollments/${enrollment.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <div className="enrollment-loading">Loading enrollments...</div>;
  }

  return (
    <div className="enrollment-list-container">
      <button 
        className="btn btn-secondary enrollment-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>

      <div className="enrollment-list-header">
        <h1>Enrollments</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/enrollments/create')}
        >
          + Create Enrollment
        </button>
      </div>

      {error && <div className="enrollment-error">{error}</div>}

      {enrollments.length === 0 ? (
        <div className="enrollment-empty">
          <h2>No Enrollments Found</h2>
          <p>Create your first enrollment to get started.</p>
        </div>
      ) : (
        <div className="enrollment-table-wrapper">
        <table className="enrollment-table">
          <thead>
            <tr>
              <th>Enrollment ID</th>
              <th>Organization</th>
              <th>Batch</th>
              <th>Student</th>
              <th>Enrolled On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map(enrollment => (
              <tr key={enrollment.id}>
                <td>#{enrollment.id}</td>
                <td>{getOrgName(enrollment.org_id)}</td>
                <td>{getBatchName(enrollment.batch_id)}</td>
                <td>{getStudentName(enrollment.student_id)}</td>
                <td>{formatDate(enrollment.enrolled_on)}</td>
                <td>
                  <span className={`status-badge ${enrollment.status ? enrollment.status.toLowerCase() : 'unknown'}`}>
                    {enrollment.status || 'Unknown'}
                  </span>
                </td>
                <td className="enrollment-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleView(enrollment)}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={() => handleEdit(enrollment)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => setDeleteConfirm(enrollment)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {deleteConfirm && (
        <div className="enrollment-modal-overlay">
          <div className="enrollment-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete enrollment #{deleteConfirm.id}?</p>
            <div className="enrollment-modal-actions">
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentList;

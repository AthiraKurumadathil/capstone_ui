import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEnrollment, deleteEnrollment } from '../../services/enrollmentService';
import { getAllOrganizations } from '../../services/organizationService';
import { getAllBatches } from '../../services/batchService';
import { getAllStudents } from '../../services/studentService';
import './EnrollmentDetail.css';

const EnrollmentDetail = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchEnrollment();
    fetchOrganizations();
    fetchBatches();
    fetchStudents();
  }, [enrollmentId]);

  const fetchEnrollment = async () => {
    try {
      setIsLoading(true);
      console.log(`Fetching enrollment ${enrollmentId}`);
      const data = await getEnrollment(enrollmentId);
      console.log('Enrollment fetched:', data);
      setEnrollment(data);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load enrollment';
      console.error('Fetch error details:', err);
      
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Token')) {
        setError('Your session has expired. Please log in again.');
      } else if (errorMsg.includes('Not found') || errorMsg.includes('Enrollment')) {
        setError(`Enrollment #${enrollmentId} not found`);
        setTimeout(() => {
          console.log('Redirecting to enrollments list...');
          navigate('/enrollments');
        }, 3000);
      } else {
        setError(errorMsg);
      }
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

  const handleDelete = async () => {
    try {
      await deleteEnrollment(enrollmentId);
      navigate('/enrollments');
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete enrollment';
      setError(errorMsg);
      setDeleteConfirm(false);
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
    return <div className="enrollment-loading">Loading enrollment...</div>;
  }

  if (!enrollment) {
    const isTokenError = error.includes('session has expired') || error.includes('Unauthorized');
    return (
      <div className="enrollment-detail-container">
        <div style={{ 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '6px', 
          color: '#721c24', 
          padding: '20px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginTop: 0 }}>{isTokenError ? 'Session Expired' : 'Enrollment Not Found'}</h3>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            <strong>Error:</strong> {error || 'The enrollment could not be found in the system.'}
          </p>
          {!isTokenError && (
            <>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                Tried to fetch Enrollment ID: <code style={{backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px'}}>{enrollmentId}</code>
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                Redirecting to enrollments list in 3 seconds...
              </p>
            </>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              if (isTokenError) {
                window.location.href = '/';
              } else {
                navigate('/enrollments');
              }
            }}
            style={{ marginTop: '10px' }}
          >
            {isTokenError ? 'Go to Login' : 'Go to Enrollments List Now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollment-detail-container">
      <button 
        className="btn btn-secondary enrollment-detail-back-btn"
        onClick={() => navigate('/enrollments')}
      >
        ← Back to Enrollments
      </button>

      <div className="enrollment-detail-card">
        <div className="enrollment-detail-header">
          <h1>Enrollment Details</h1>
          <div className="enrollment-detail-actions">
            <button 
              className="btn btn-warning"
              onClick={() => navigate(`/enrollments/edit/${enrollment.id}`)}
            >
              Edit
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => setDeleteConfirm(true)}
            >
              Delete
            </button>
          </div>
        </div>

        {error && <div className="enrollment-detail-error">{error}</div>}

        <div className="enrollment-detail-grid">
          <div className="enrollment-detail-item">
            <label>Enrollment ID</label>
            <p>#{enrollment.id}</p>
          </div>

          <div className="enrollment-detail-item">
            <label>Organization</label>
            <p>{getOrgName(enrollment.org_id)}</p>
          </div>

          <div className="enrollment-detail-item">
            <label>Batch</label>
            <p>{getBatchName(enrollment.batch_id)}</p>
          </div>

          <div className="enrollment-detail-item">
            <label>Student</label>
            <p>{getStudentName(enrollment.student_id)}</p>
          </div>

          <div className="enrollment-detail-item">
            <label>Enrolled On</label>
            <p>{formatDate(enrollment.enrolled_on)}</p>
          </div>

          <div className="enrollment-detail-item">
            <label>Status</label>
            <p>
              <span className={`status-badge ${enrollment.status ? enrollment.status.toLowerCase() : 'unknown'}`}>
                {enrollment.status || 'Unknown'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="enrollment-modal-overlay">
          <div className="enrollment-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete enrollment #{enrollment.id}?</p>
            <p style={{ color: '#666', fontSize: '12px' }}>This action cannot be undone.</p>
            <div className="enrollment-modal-actions">
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete Enrollment
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(false)}
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

export default EnrollmentDetail;

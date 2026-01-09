import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStudent } from '../../services/studentService';
import './StudentDetail.css';

const StudentDetail = () => {
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { studentId } = useParams();

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    try {
      setIsLoading(true);
      const data = await getStudent(studentId);
      setStudent(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load student');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="student-detail-loading">Loading student details...</div>;
  }

  if (error) {
    return (
      <div className="student-detail-error">
        <p>{error}</p>
        <button className="btn-back" onClick={() => navigate('/students')}>
          Back to Students
        </button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-detail-error">
        <p>Student record not found</p>
        <button className="btn-back" onClick={() => navigate('/students')}>
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="student-detail-container">
      <div className="student-detail-header">
        <h2>Student Details</h2>
        <div className="student-detail-actions">
          <button 
            className="btn-edit"
            onClick={() => navigate(`/students/edit/${studentId}`)}
          >
            Edit
          </button>
          <button 
            className="btn-back"
            onClick={() => navigate('/students')}
          >
            Back
          </button>
        </div>
      </div>

      <div className="student-detail-card">
        <div className="student-detail-grid">
          <div className="student-detail-item">
            <label>Student ID</label>
            <p>{student.id || '-'}</p>
          </div>

          <div className="student-detail-item">
            <label>First Name</label>
            <p>{student.first_name || '-'}</p>
          </div>

          <div className="student-detail-item">
            <label>Last Name</label>
            <p>{student.last_name || '-'}</p>
          </div>

          <div className="student-detail-item">
            <label>Organization ID</label>
            <p>{student.org_id || '-'}</p>
          </div>

          <div className="student-detail-item">
            <label>Date of Birth</label>
            <p>{student.dob ? new Date(student.dob).toLocaleDateString() : '-'}</p>
          </div>

          <div className="student-detail-item">
            <label>Status</label>
            <span className={`student-status ${student.active ? 'active' : 'inactive'}`}>
              {student.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="student-detail-item">
            <label>Guardian Name</label>
            <p>{student.guardian_name || '-'}</p>
          </div>

          <div className="student-detail-item">
            <label>Guardian Phone</label>
            <p>{student.guardian_phone || '-'}</p>
          </div>

          <div className="student-detail-item">
            <label>Guardian Email</label>
            <p>{student.guardian_email || '-'}</p>
          </div>

          <div className="student-detail-item">
            <label>Notes</label>
            <p>{student.notes || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;

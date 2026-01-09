import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAttendance } from '../../services/attendanceService';
import './AttendanceDetail.css';

const AttendanceDetail = () => {
  const [attendance, setAttendance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { attendanceId } = useParams();

  useEffect(() => {
    loadAttendance();
  }, [attendanceId]);

  const loadAttendance = async () => {
    try {
      setIsLoading(true);
      const data = await getAttendance(attendanceId);
      setAttendance(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load attendance');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="attendance-detail-loading">Loading attendance details...</div>;
  }

  if (error) {
    return (
      <div className="attendance-detail-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/attendance')}>
          Back to Attendance
        </button>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="attendance-detail-error">
        <p>Attendance record not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/attendance')}>
          Back to Attendance
        </button>
      </div>
    );
  }

  return (
    <div className="attendance-detail-container">
      <div className="attendance-detail-header">
        <h2>Attendance Details</h2>
        <div className="attendance-detail-actions">
          <button 
            className="btn btn-warning"
            onClick={() => navigate(`/attendance/edit/${attendanceId}`)}
          >
            Edit
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/attendance')}
          >
            Back
          </button>
        </div>
      </div>

      <div className="attendance-detail-card">
        <div className="attendance-detail-grid">
          <div className="attendance-detail-item">
            <label>Attendance ID</label>
            <p>{attendance.id || '-'}</p>
          </div>

          <div className="attendance-detail-item">
            <label>Session ID</label>
            <p>{attendance.session_id || '-'}</p>
          </div>

          <div className="attendance-detail-item">
            <label>Enrollment ID</label>
            <p>{attendance.enrollment_id || '-'}</p>
          </div>

          <div className="attendance-detail-item">
            <label>Status</label>
            <span className={`attendance-status ${attendance.status ? attendance.status.toLowerCase() : ''}`}>
              {attendance.status || '-'}
            </span>
          </div>

          <div className="attendance-detail-item">
            <label>Marked At</label>
            <p>{attendance.marked_at ? new Date(attendance.marked_at).toLocaleString() : '-'}</p>
          </div>

          <div className="attendance-detail-item">
            <label>Marked By</label>
            <p>{attendance.marked_by || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetail;

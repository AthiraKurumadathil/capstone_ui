import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAttendance, deleteAttendance } from '../../services/attendanceService';
import './AttendanceList.css';

const AttendanceList = () => {
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const data = await getAllAttendance();
      let filteredData = Array.isArray(data) ? data : [];
      
      // If user is org admin, filter by their organization
      if (isOrgAdmin && userOrgId) {
        filteredData = filteredData.filter(record => record.org_id === userOrgId);
      }
      
      setAttendance(filteredData);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load attendance records';
      setError(errorMsg);
      console.error('Fetch error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (attendanceId) => {
    try {
      await deleteAttendance(attendanceId);
      setAttendance(attendance.filter(att => att.id !== attendanceId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete attendance');
    }
  };

  const handleEdit = (attendanceId) => {
    navigate(`/attendance/edit/${attendanceId}`);
  };

  const handleView = (attendanceId) => {
    navigate(`/attendance/${attendanceId}`);
  };

  if (isLoading) {
    return <div className="attendance-loading">Loading attendance records...</div>;
  }

  return (
    <div className="attendance-list-container">
      <button 
        className="btn btn-secondary attendance-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="attendance-list-header">
        <h2>Attendance Records</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/attendance/create')}
        >
          + Record Attendance
        </button>
      </div>

      {error && <div className="attendance-error">{error}</div>}

      {attendance.length === 0 ? (
        <div className="attendance-empty">
          <p>No attendance records found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/attendance/create')}
          >
            Create your first attendance record
          </button>
        </div>
      ) : (
        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Attendance ID</th>
                <th>Session ID</th>
                <th>Enrollment ID</th>
                <th>Status</th>
                <th>Marked At</th>
                <th>Marked By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(att => (
                <tr key={att.id}>
                  <td className="attendance-id">{att.id}</td>
                  <td>{att.session_id || '-'}</td>
                  <td>{att.enrollment_id || '-'}</td>
                  <td>
                    <span className={`attendance-status ${att.status ? att.status.toLowerCase() : ''}`}>
                      {att.status || '-'}
                    </span>
                  </td>
                  <td>{att.marked_at ? new Date(att.marked_at).toLocaleString() : '-'}</td>
                  <td>{att.marked_by || '-'}</td>
                  <td className="attendance-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleView(att.id)}
                      title="View attendance details"
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(att.id)}
                      title="Edit attendance"
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(att.id)}
                      title="Delete attendance"
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
        <div className="attendance-delete-modal">
          <div className="attendance-delete-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this attendance record? This action cannot be undone.</p>
            <div className="attendance-delete-actions">
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
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

export default AttendanceList;

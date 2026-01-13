import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAttendance, deleteAttendance } from '../../services/attendanceService';
import { getAllSessions } from '../../services/sessionService';
import { getAllBatches } from '../../services/batchService';
import './AttendanceList.css';

const AttendanceList = () => {
  const [attendance, setAttendance] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role_name?.toLowerCase().trim() === 'super admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchSessions();
    fetchAttendance();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await getAllSessions();
      let sessionsData = Array.isArray(data) ? data : [];
      
      console.log('All sessions:', sessionsData);
      console.log('User org_id:', userOrgId, 'Is Super Admin:', isSuperAdmin);
      
      // If not Super Admin, filter by user organization
      if (!isSuperAdmin && userOrgId) {
        // Get all batches to filter by organization
        const allBatches = await getAllBatches();
        const userOrgBatches = Array.isArray(allBatches)
          ? allBatches.filter(batch => batch.org_id === userOrgId)
          : [];
        
        const userOrgBatchIds = userOrgBatches.map(batch => batch.id || batch.batch_id);
        console.log('User org batches:', userOrgBatchIds);
        
        // Filter sessions to only those in user's org batches
        sessionsData = sessionsData.filter(session =>
          userOrgBatchIds.includes(session.batch_id)
        );
        
        console.log('Sessions filtered to org:', sessionsData);
      }
      
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setSessions([]);
    }
  };

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const data = await getAllAttendance();
      let attendanceData = Array.isArray(data) ? data : [];
      
      console.log('All attendance records:', attendanceData.length);
      console.log('User org_id:', userOrgId, 'Is Super Admin:', isSuperAdmin);
      
      // If not Super Admin, filter by user organization
      if (!isSuperAdmin && userOrgId) {
        // Get all sessions for the user's organization
        const allSessions = await getAllSessions();
        let userOrgSessions = Array.isArray(allSessions) ? allSessions : [];
        
        // Filter sessions by user organization
        const allBatches = await getAllBatches();
        const userOrgBatches = Array.isArray(allBatches)
          ? allBatches.filter(batch => batch.org_id === userOrgId)
          : [];
        
        const userOrgBatchIds = userOrgBatches.map(batch => batch.id || batch.batch_id);
        userOrgSessions = userOrgSessions.filter(session =>
          userOrgBatchIds.includes(session.batch_id)
        );
        
        const userOrgSessionIds = userOrgSessions.map(session => session.id || session.session_id);
        console.log('User org sessions:', userOrgSessionIds);
        
        // Filter attendance to only those for user's org sessions
        attendanceData = attendanceData.filter(att =>
          userOrgSessionIds.includes(att.session_id)
        );
        
        console.log('Attendance filtered to org:', attendanceData);
      }
      
      setAttendance(attendanceData);
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

  const getSessionName = (sessionId) => {
    const session = sessions.find(s => s.session_id === sessionId || s.id === sessionId);
    return session ? session.session_name : `Session ${sessionId}`;
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
                <th>Session Name</th>
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
                  <td>{getSessionName(att.session_id)}</td>
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

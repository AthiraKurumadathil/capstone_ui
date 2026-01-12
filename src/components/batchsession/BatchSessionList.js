import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBatchSessions, deleteBatchSession } from '../../services/batchSessionService';
import { getAllBatches } from '../../services/batchService';
import './BatchSessionList.css';

const BatchSessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (batches.length > 0 || !isOrgAdmin) {
      fetchSessions();
    }
  }, [batches]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await getAllBatchSessions();
      let sessionsArray = Array.isArray(data) ? data : data?.data || [];
      
      // If user is org admin, filter sessions by their organization
      // Sessions are linked to batches, so filter by batch's org_id
      if (isOrgAdmin && userOrgId) {
        sessionsArray = sessionsArray.filter(session => {
          // Find the batch for this session and check its org_id
          const batch = batches.find(b => b.id === session.batch_id || b.batch_id === session.batch_id);
          return batch && batch.org_id === userOrgId;
        });
      }
      
      console.log('Fetched sessions:', sessionsArray);
      setSessions(sessionsArray);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load batch sessions';
      setError(errorMsg);
      console.error('Fetch error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await getAllBatches();
      let batchesArray = Array.isArray(data) ? data : [];
      
      // If user is org admin, filter batches by their organization
      if (isOrgAdmin && userOrgId) {
        batchesArray = batchesArray.filter(batch => batch.org_id === userOrgId);
      }
      
      setBatches(batchesArray);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const handleDelete = async (sessionId) => {
    try {
      await deleteBatchSession(sessionId);
      setSessions(sessions.filter(session => session.session_id !== sessionId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete batch session');
    }
  };

  const handleEdit = (sessionId) => {
    if (!sessionId) {
      setError('Session ID is missing. Please refresh and try again.');
      return;
    }
    navigate(`/batchsessions/edit/${sessionId}`);
  };

  const handleView = (sessionId) => {
    if (!sessionId) {
      setError('Session ID is missing. Please refresh and try again.');
      return;
    }
    navigate(`/batchsessions/${sessionId}`);
  };

  const getBatchName = (batchId) => {
    const batch = batches.find(b => b.id === batchId);
    return batch ? batch.name : `Batch ${batchId}`;
  };

  if (isLoading) {
    return <div className="batchsession-loading">Loading batch sessions...</div>;
  }

  return (
    <div className="batchsession-list-container">
      <button 
        className="btn btn-secondary batchsession-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="batchsession-list-header">
        <h2>Batch Sessions</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/batchsessions/create')}
        >
          + Create Session
        </button>
      </div>

      {error && <div className="batchsession-error">{error}</div>}

      {sessions.length === 0 ? (
        <div className="batchsession-empty-state">
          <p>No batch sessions found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/batchsessions/create')}
          >
            Create your first batch session
          </button>
        </div>
      ) : (
        <div className="batchsession-list-table-wrapper">
          <table className="batchsession-list-table">
            <thead>
              <tr>
                <th>Session Name</th>
                <th>Session Date</th>
                <th>Batch</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr key={session.session_id}>
                  <td>{session.session_name || '-'}</td>
                  <td>{session.session_date ? new Date(session.session_date).toLocaleDateString() : '-'}</td>
                  <td>{getBatchName(session.batch_id)}</td>
                  <td>{session.start_time || '-'}</td>
                  <td>{session.end_time || '-'}</td>
                  <td>
                    <span className={`batchsession-status ${session.status ? session.status.toLowerCase() : ''}`}>
                      {session.status}
                    </span>
                  </td>
                  <td>{session.notes ? session.notes.substring(0, 50) + '...' : '-'}</td>
                  <td className="batchsession-actions">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleView(session.session_id)}
                      title="View Session Details"
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(session.session_id)}
                      title="Edit Session"
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(session.session_id)}
                      title="Delete Session"
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Batch Session</h3>
            <p>Are you sure you want to delete this batch session?</p>
            <div className="modal-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchSessionList;

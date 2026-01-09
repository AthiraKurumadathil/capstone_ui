import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBatchSession } from '../../services/batchSessionService';
import { getAllBatches } from '../../services/batchService';
import './BatchSessionDetail.css';

const BatchSessionDetail = () => {
  const [session, setSession] = useState(null);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { sessionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadSession();
    fetchBatches();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      const sessionIdInt = parseInt(sessionId, 10);
      if (isNaN(sessionIdInt)) {
        setError('Invalid session ID');
        return;
      }
      const data = await getBatchSession(sessionIdInt);
      setSession(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load batch session');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
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

  const getBatchName = (batchId) => {
    const batch = batches.find(b => b.id === batchId);
    return batch ? batch.name : `Batch ${batchId}`;
  };

  if (isLoading) {
    return <div className="batchsession-detail-loading">Loading batch session details...</div>;
  }

  if (error) {
    return (
      <div className="batchsession-detail-container">
        <div className="batchsession-detail-error">{error}</div>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/batchsessions')}
        >
          Back to Batch Sessions
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="batchsession-detail-container">
        <div className="batchsession-detail-error">Batch session not found</div>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/batchsessions')}
        >
          Back to Batch Sessions
        </button>
      </div>
    );
  }

  return (
    <div className="batchsession-detail-container">
      <button 
        className="btn btn-secondary batchsession-detail-back-btn"
        onClick={() => navigate('/batchsessions')}
      >
        ← Back to Batch Sessions
      </button>

      <div className="batchsession-detail-card">
        <h2>Batch Session Details</h2>

        <div className="batchsession-detail-grid">
          <div className="batchsession-detail-item">
            <label>Session ID</label>
            <p>{session.session_id}</p>
          </div>

          <div className="batchsession-detail-item">
            <label>Batch</label>
            <p>{getBatchName(session.batch_id)}</p>
          </div>

          <div className="batchsession-detail-item">
            <label>Session Date</label>
            <p>{session.session_date ? new Date(session.session_date).toLocaleDateString() : '-'}</p>
          </div>

          <div className="batchsession-detail-item">
            <label>Start Time</label>
            <p>{session.start_time || '-'}</p>
          </div>

          <div className="batchsession-detail-item">
            <label>End Time</label>
            <p>{session.end_time || '-'}</p>
          </div>

          <div className="batchsession-detail-item">
            <label>Status</label>
            <p>
              <span className={`batchsession-status ${session.status ? session.status.toLowerCase() : ''}`}>
                {session.status}
              </span>
            </p>
          </div>

          {session.notes && (
            <div className="batchsession-detail-item batchsession-detail-full-width">
              <label>Notes</label>
              <p>{session.notes}</p>
            </div>
          )}
        </div>

        <div className="batchsession-detail-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/batchsessions/edit/${session.session_id}`)}
          >
            Edit Session
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/batchsessions')}
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchSessionDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBatch } from '../../services/batchService';
import './BatchDetail.css';

const BatchDetail = () => {
  const [batch, setBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { batchId } = useParams();

  useEffect(() => {
    loadBatch();
  }, [batchId]);

  const loadBatch = async () => {
    try {
      setIsLoading(true);
      const data = await getBatch(batchId);
      setBatch(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load batch');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="batch-detail-loading">Loading batch details...</div>;
  }

  if (error) {
    return (
      <div className="batch-detail-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/batches')}>
          Back to Batches
        </button>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="batch-detail-error">
        <p>Batch record not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/batches')}>
          Back to Batches
        </button>
      </div>
    );
  }

  return (
    <div className="batch-detail-container">
      <div className="batch-detail-header">
        <h2>Batch Details</h2>
        <div className="batch-detail-actions">
          <button 
            className="btn btn-warning"
            onClick={() => navigate(`/batches/edit/${batchId}`)}
          >
            Edit
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/batches')}
          >
            Back
          </button>
        </div>
      </div>

      <div className="batch-detail-card">
        <div className="batch-detail-grid">
          <div className="batch-detail-item">
            <label>Batch ID</label>
            <p>{batch.id || '-'}</p>
          </div>

          <div className="batch-detail-item">
            <label>Batch Name</label>
            <p>{batch.name || '-'}</p>
          </div>

          <div className="batch-detail-item">
            <label>Organization ID</label>
            <p>{batch.org_id || '-'}</p>
          </div>

          <div className="batch-detail-item">
            <label>Activity ID</label>
            <p>{batch.activity_id || '-'}</p>
          </div>

          <div className="batch-detail-item">
            <label>Fee Plan ID</label>
            <p>{batch.fee_plan_id || '-'}</p>
          </div>

          <div className="batch-detail-item">
            <label>Status</label>
            <span className={`batch-status ${batch.status ? batch.status.toLowerCase() : ''}`}>
              {batch.status || '-'}
            </span>
          </div>

          <div className="batch-detail-item">
            <label>Start Date</label>
            <p>{batch.start_date ? new Date(batch.start_date).toLocaleDateString() : '-'}</p>
          </div>

          <div className="batch-detail-item">
            <label>End Date</label>
            <p>{batch.end_date ? new Date(batch.end_date).toLocaleDateString() : '-'}</p>
          </div>

          <div className="batch-detail-item">
            <label>Capacity</label>
            <p>{batch.capacity || '-'}</p>
          </div>

          <div className="batch-detail-item">
            <label>Location</label>
            <p>{batch.location || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainer } from '../../services/trainerService';
import './TrainerDetail.css';

const TrainerDetail = () => {
  const [trainer, setTrainer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { trainerId } = useParams();

  useEffect(() => {
    loadTrainer();
  }, [trainerId]);

  const loadTrainer = async () => {
    try {
      setIsLoading(true);
      const data = await getTrainer(trainerId);
      setTrainer(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load trainer');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="trainer-detail-loading">Loading trainer details...</div>;
  }

  if (error) {
    return (
      <div className="trainer-detail-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/trainers')}>
          Back to Trainers
        </button>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="trainer-detail-error">
        <p>Trainer not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/trainers')}>
          Back to Trainers
        </button>
      </div>
    );
  }

  return (
    <div className="trainer-detail-container">
      <div className="trainer-detail-header">
        <h2>{trainer.first_name} {trainer.last_name}</h2>
        <div className="trainer-detail-actions">
          <button 
            className="btn btn-warning"
            onClick={() => navigate(`/trainers/edit/${trainerId}`)}
          >
            Edit
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/trainers')}
          >
            Back
          </button>
        </div>
      </div>

      <div className="trainer-detail-card">
        <div className="trainer-detail-grid">
          <div className="trainer-detail-item">
            <label>Status</label>
            <span className={`trainer-status ${trainer.active ? 'active' : 'inactive'}`}>
              {trainer.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="trainer-detail-item">
            <label>Organization ID</label>
            <p>{trainer.org_id || '-'}</p>
          </div>

          <div className="trainer-detail-item">
            <label>Email</label>
            <p>{trainer.email ? <a href={`mailto:${trainer.email}`}>{trainer.email}</a> : '-'}</p>
          </div>

          <div className="trainer-detail-item">
            <label>Phone</label>
            <p>{trainer.phone ? <a href={`tel:${trainer.phone}`}>{trainer.phone}</a> : '-'}</p>
          </div>

          <div className="trainer-detail-item">
            <label>Hire Date</label>
            <p>{trainer.hire_date ? new Date(trainer.hire_date).toLocaleDateString() : '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDetail;

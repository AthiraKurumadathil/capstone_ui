import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getActivityTrainer } from '../../services/activityTrainerService';
import { getTrainer } from '../../services/trainerService';
import './ActivityTrainerDetail.css';

const ActivityTrainerDetail = () => {
  const [activityTrainer, setActivityTrainer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { activityId, trainerId } = useParams();

  useEffect(() => {
    loadActivityTrainer();
  }, [activityId, trainerId]);

  const loadActivityTrainer = async () => {
    try {
      setIsLoading(true);
      const data = await getActivityTrainer(activityId, trainerId);
      
      // Fetch trainer details to get trainer name
      try {
        const trainer = await getTrainer(trainerId);
        data.trainer_name = `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim();
      } catch (err) {
        console.error('Error fetching trainer details:', err);
        // Continue without trainer name if fetch fails
      }
      
      setActivityTrainer(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load activity trainer assignment');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="activity-trainer-detail-loading">Loading assignment details...</div>;
  }

  if (error) {
    return (
      <div className="activity-trainer-detail-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/activitytrainers')}>
          Back to Activity Trainers
        </button>
      </div>
    );
  }

  if (!activityTrainer) {
    return (
      <div className="activity-trainer-detail-error">
        <p>Assignment not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/activitytrainers')}>
          Back to Activity Trainers
        </button>
      </div>
    );
  }

  return (
    <div className="activity-trainer-detail-container">
      <div className="activity-trainer-detail-header">
        <h2>Assignment Details</h2>
        <div className="activity-trainer-detail-actions">
          <button 
            className="btn btn-warning"
            onClick={() => navigate(`/activitytrainers/edit/${activityId}/${trainerId}`)}
          >
            Edit
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/activitytrainers')}
          >
            Back
          </button>
        </div>
      </div>

      <div className="activity-trainer-detail-card">
        <div className="activity-trainer-detail-grid">
          <div className="activity-trainer-detail-item">
            <label>Activity ID</label>
            <p>{activityTrainer.activity_id || '-'}</p>
          </div>

          <div className="activity-trainer-detail-item">
            <label>Trainer ID</label>
            <p>{activityTrainer.trainer_id || '-'}</p>
          </div>

          <div className="activity-trainer-detail-item">
            <label>Trainer Name</label>
            <p>{activityTrainer.trainer_name || '-'}</p>
          </div>

          <div className="activity-trainer-detail-item">
            <label>Role</label>
            <p>{activityTrainer.role || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTrainerDetail;

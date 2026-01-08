import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getActivity } from '../../services/activityService';
import './ActivityDetail.css';

const ActivityDetail = () => {
  const [activity, setActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { activityId } = useParams();

  useEffect(() => {
    loadActivity();
  }, [activityId]);

  const loadActivity = async () => {
    try {
      setIsLoading(true);
      const data = await getActivity(activityId);
      setActivity(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load activity');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="activity-detail-loading">Loading activity details...</div>;
  }

  if (error) {
    return (
      <div className="activity-detail-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/activities')}>
          Back to Activities
        </button>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="activity-detail-error">
        <p>Activity not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/activities')}>
          Back to Activities
        </button>
      </div>
    );
  }

  return (
    <div className="activity-detail-container">
      <div className="activity-detail-header">
        <h2>{activity.name}</h2>
        <div className="activity-detail-actions">
          <button 
            className="btn btn-warning"
            onClick={() => navigate(`/activities/edit/${activityId}`)}
          >
            Edit
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/activities')}
          >
            Back
          </button>
        </div>
      </div>

      <div className="activity-detail-card">
        <div className="activity-detail-grid">
          <div className="activity-detail-item">
            <label>Status</label>
            <span className={`activity-status ${activity.active ? 'active' : 'inactive'}`}>
              {activity.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="activity-detail-item">
            <label>Organization ID</label>
            <p>{activity.org_id || '-'}</p>
          </div>

          <div className="activity-detail-item">
            <label>Category ID</label>
            <p>{activity.category_id || '-'}</p>
          </div>

          <div className="activity-detail-item">
            <label>Default Fee</label>
            <p>${activity.default_fee ? activity.default_fee.toFixed(2) : '0.00'}</p>
          </div>
        </div>

        {activity.description && (
          <div className="activity-detail-section">
            <label>Description</label>
            <p>{activity.description}</p>
          </div>
        )}

        <div className="activity-detail-footer">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/activities')}
          >
            Back to Activities
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;

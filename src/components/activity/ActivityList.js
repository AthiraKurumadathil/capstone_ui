import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllActivities, deleteActivity } from '../../services/activityService';
import './ActivityList.css';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const data = await getAllActivities();
      let filteredData = Array.isArray(data) ? data : [];
      
      // If user is org admin, filter by their organization
      if (isOrgAdmin && userOrgId) {
        filteredData = filteredData.filter(activity => activity.org_id === userOrgId);
      }
      
      setActivities(filteredData);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load activities';
      setError(errorMsg);
      console.error('Fetch error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (activityId) => {
    try {
      await deleteActivity(activityId);
      setActivities(activities.filter(activity => activity.id !== activityId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete activity');
    }
  };

  const handleEdit = (activityId) => {
    navigate(`/activities/edit/${activityId}`);
  };

  const handleView = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  if (isLoading) {
    return <div className="activity-loading">Loading activities...</div>;
  }

  return (
    <div className="activity-list-container">
      <button 
        className="btn btn-secondary activity-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="activity-list-header">
        <h2>Activities</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/activities/create')}
        >
          + Create Activity
        </button>
      </div>

      {error && <div className="activity-error">{error}</div>}

      {activities.length === 0 ? (
        <div className="activity-empty">
          <p>No activities found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/activities/create')}
          >
            Create your first activity
          </button>
        </div>
      ) : (
        <div className="activity-table-wrapper">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category ID</th>
                <th>Organization ID</th>
                <th>Default Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(activity => (
                <tr key={activity.id}>
                  <td className="activity-name">{activity.name}</td>
                  <td>{activity.category_id || '-'}</td>
                  <td>{activity.org_id || '-'}</td>
                  <td>${activity.default_fee ? activity.default_fee.toFixed(2) : '0.00'}</td>
                  <td>
                    <span className={`activity-status ${activity.active ? 'active' : 'inactive'}`}>
                      {activity.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="activity-actions">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleView(activity.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(activity.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(activity.id)}
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
        <div className="activity-modal-overlay">
          <div className="activity-modal">
            <h3>Delete Activity</h3>
            <p>Are you sure you want to delete this activity?</p>
            <div className="activity-modal-actions">
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

export default ActivityList;

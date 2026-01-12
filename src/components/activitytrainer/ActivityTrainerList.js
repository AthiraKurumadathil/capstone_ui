import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllActivityTrainers, deleteActivityTrainer } from '../../services/activityTrainerService';
import { getAllActivities, getActivity } from '../../services/activityService';
import { getTrainer } from '../../services/trainerService';
import './ActivityTrainerList.css';

const ActivityTrainerList = () => {
  const [activityTrainers, setActivityTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  // Get user and org info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const isSuperAdmin = user.role_name?.toLowerCase().trim() === 'super admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchActivityTrainers();
  }, []);

  const fetchActivityTrainers = async () => {
    try {
      setIsLoading(true);
      
      // Get all activity trainers
      const allActivityTrainers = await getAllActivityTrainers();
      let activityTrainersData = Array.isArray(allActivityTrainers) ? allActivityTrainers : [];
      
      console.log('All activity trainers from API:', activityTrainersData);
      console.log('User org_id:', userOrgId, 'Is Super Admin:', isSuperAdmin, 'Is Org Admin:', isOrgAdmin);
      
      // Get all activities to filter by organization and map activity names
      const allActivities = await getAllActivities();
      const activitiesMap = {};
      const validActivityIds = [];
      
      if (Array.isArray(allActivities)) {
        allActivities.forEach(activity => {
          activitiesMap[activity.id || activity.activity_id] = {
            name: activity.name || activity.activity_name || `Activity ${activity.id || activity.activity_id}`,
            org_id: activity.org_id
          };
          validActivityIds.push(activity.id || activity.activity_id);
        });
      }
      
      console.log('Activities map:', activitiesMap);
      
      // If not Super Admin, filter by user organization
      if (!isSuperAdmin && userOrgId) {
        const userOrgActivityIds = allActivities
          .filter(activity => activity.org_id === userOrgId)
          .map(activity => activity.id || activity.activity_id);
        
        console.log('User org activities:', userOrgActivityIds);
        
        // Filter activity trainers to only those in user's org activities
        activityTrainersData = activityTrainersData.filter(at => 
          userOrgActivityIds.includes(at.activity_id)
        );
      }
      
      // Fetch trainer details for remaining activity trainers
      activityTrainersData = await Promise.all(
        activityTrainersData.map(async (at) => {
          try {
            const trainer = await getTrainer(at.trainer_id);
            const trainer_name = `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || `Trainer ${at.trainer_id}`;
            const activity_name = activitiesMap[at.activity_id]?.name || `Activity ${at.activity_id}`;
            
            return {
              ...at,
              trainer_name,
              activity_name
            };
          } catch (err) {
            console.error(`Error fetching trainer ${at.trainer_id}:`, err);
            const activity_name = activitiesMap[at.activity_id]?.name || `Activity ${at.activity_id}`;
            return {
              ...at,
              trainer_name: `Trainer ${at.trainer_id}`,
              activity_name
            };
          }
        })
      );
      
      console.log('Final activity trainers with names:', activityTrainersData);
      setActivityTrainers(activityTrainersData);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load activity trainers';
      setError(errorMsg);
      console.error('Fetch error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (activityId, trainerId) => {
    try {
      await deleteActivityTrainer(activityId, trainerId);
      setActivityTrainers(activityTrainers.filter(
        at => !(at.activity_id === activityId && at.trainer_id === trainerId)
      ));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete activity trainer');
    }
  };

  const handleEdit = (activityId, trainerId) => {
    navigate(`/activitytrainers/edit/${activityId}/${trainerId}`);
  };

  const handleView = (activityId, trainerId) => {
    navigate(`/activitytrainers/${activityId}/${trainerId}`);
  };

  if (isLoading) {
    return <div className="activity-trainer-loading">Loading activity trainers...</div>;
  }

  return (
    <div className="activity-trainer-list-container">
      <button 
        className="btn btn-secondary activity-trainer-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="activity-trainer-list-header">
        <h2>Activity Trainers</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/activitytrainers/create')}
        >
          + Assign Trainer to Activity
        </button>
      </div>

      {error && <div className="activity-trainer-error">{error}</div>}

      {activityTrainers.length === 0 ? (
        <div className="activity-trainer-empty">
          <p>No activity-trainer assignments found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/activitytrainers/create')}
          >
            Create your first assignment
          </button>
        </div>
      ) : (
        <div className="activity-trainer-table-wrapper">
          <table className="activity-trainer-table">
            <thead>
              <tr>
                <th>Activity Name</th>
                <th>Trainer Name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activityTrainers.map(at => (
                <tr key={at.id}>
                  <td>{at.activity_name || `Activity ${at.activity_id}`}</td>
                  <td>
                    {at.trainer_name ? (
                      <span>{at.trainer_name}</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>{at.role || '-'}</td>
                  <td className="activity-trainer-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleView(at.activity_id, at.trainer_id)}
                      title="View assignment details"
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(at.activity_id, at.trainer_id)}
                      title="Edit assignment"
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm({ activityId: at.activity_id, trainerId: at.trainer_id })}
                      title="Delete assignment"
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
        <div className="activity-trainer-delete-modal">
          <div className="activity-trainer-delete-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this activity-trainer assignment? This action cannot be undone.</p>
            <div className="activity-trainer-delete-actions">
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm.activityId, deleteConfirm.trainerId)}
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

export default ActivityTrainerList;

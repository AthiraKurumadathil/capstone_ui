import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createActivityTrainer, updateActivityTrainer, getActivityTrainer } from '../../services/activityTrainerService';
import { getAllActivities } from '../../services/activityService';
import { getAllTrainers } from '../../services/trainerService';
import './ActivityTrainerForm.css';

const ActivityTrainerForm = () => {
  const [formData, setFormData] = useState({
    activity_id: '',
    trainer_id: '',
    role: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [trainers, setTrainers] = useState([]);
  const [trainersLoading, setTrainersLoading] = useState(true);

  const navigate = useNavigate();
  const { activityId, trainerId } = useParams();

  useEffect(() => {
    fetchActivities();
    fetchTrainers();
    if (activityId && trainerId) {
      loadActivityTrainer();
    }
  }, [activityId, trainerId]);

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const data = await getAllActivities();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setServerError('Failed to load activities');
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      setTrainersLoading(true);
      const data = await getAllTrainers();
      setTrainers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching trainers:', err);
      setServerError('Failed to load trainers');
    } finally {
      setTrainersLoading(false);
    }
  };

  const loadActivityTrainer = async () => {
    try {
      setPageLoading(true);
      setIsEditMode(true);
      const data = await getActivityTrainer(activityId, trainerId);
      setFormData({
        activity_id: data.activity_id || '',
        trainer_id: data.trainer_id || '',
        role: data.role || '',
      });
    } catch (err) {
      setServerError(err.message || 'Failed to load activity trainer');
    } finally {
      setPageLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.activity_id) {
      newErrors.activity_id = 'Activity is required';
    }

    if (!formData.trainer_id) {
      newErrors.trainer_id = 'Trainer is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        activity_id: parseInt(formData.activity_id, 10),
        trainer_id: parseInt(formData.trainer_id, 10),
        role: formData.role ? formData.role.trim() : undefined,
      };

      if (isEditMode) {
        await updateActivityTrainer(activityId, trainerId, submitData);
      } else {
        await createActivityTrainer(submitData);
      }
      navigate('/activitytrainers');
    } catch (err) {
      setServerError(err.message || 'Failed to save activity trainer assignment');
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="activity-trainer-form-container">
        <div className="activity-trainer-form-loading">Loading assignment details...</div>
      </div>
    );
  }

  return (
    <div className="activity-trainer-form-container">
      <div className="activity-trainer-form-card">
        <h2>{isEditMode ? 'Edit Assignment' : 'Assign Trainer to Activity'}</h2>

        {serverError && <div className="activity-trainer-form-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="activity-trainer-form-group">
            <label htmlFor="activity_id">Activity *</label>
            {activitiesLoading ? (
              <select className="activity-trainer-form-input" disabled>
                <option>Loading activities...</option>
              </select>
            ) : (
              <>
                <select
                  id="activity_id"
                  name="activity_id"
                  value={formData.activity_id}
                  onChange={handleChange}
                  className={errors.activity_id ? 'activity-trainer-form-input error' : 'activity-trainer-form-input'}
                >
                  <option value="">Select an activity</option>
                  {activities.map(activity => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
                {errors.activity_id && <span className="activity-trainer-form-error-msg">{errors.activity_id}</span>}
              </>
            )}
          </div>

          <div className="activity-trainer-form-group">
            <label htmlFor="trainer_id">Trainer *</label>
            {trainersLoading ? (
              <select className="activity-trainer-form-input" disabled>
                <option>Loading trainers...</option>
              </select>
            ) : (
              <>
                <select
                  id="trainer_id"
                  name="trainer_id"
                  value={formData.trainer_id}
                  onChange={handleChange}
                  className={errors.trainer_id ? 'activity-trainer-form-input error' : 'activity-trainer-form-input'}
                >
                  <option value="">Select a trainer</option>
                  {trainers.map(trainer => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.first_name} {trainer.last_name}
                    </option>
                  ))}
                </select>
                {errors.trainer_id && <span className="activity-trainer-form-error-msg">{errors.trainer_id}</span>}
              </>
            )}
          </div>

          <div className="activity-trainer-form-group">
            <label htmlFor="role">Role</label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="activity-trainer-form-input"
              placeholder="Enter trainer role (e.g., Primary, Assistant)"
            />
          </div>

          <div className="activity-trainer-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update Assignment' : 'Create Assignment')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/activitytrainers')}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityTrainerForm;

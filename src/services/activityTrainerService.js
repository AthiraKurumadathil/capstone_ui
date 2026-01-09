import apiClient, { getToken } from './authService';

// Check if interceptor is already added to avoid duplicates
let interceptorAdded = false;

if (!interceptorAdded) {
  // Add Authorization header to all requests (except OPTIONS)
  apiClient.interceptors.request.use((config) => {
    // Don't add auth header for preflight requests
    if (config.method !== 'options') {
      const token = getToken();
      console.log('Token available:', !!token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set for:', config.url);
      } else {
        console.warn('No token found for request');
      }
    }
    return config;
  });

  // Add response interceptor for error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log full error details
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
      return Promise.reject(error);
    }
  );

  interceptorAdded = true;
}

// Get all activity trainers
export const getAllActivityTrainers = async () => {
  try {
    console.log('Fetching activity trainers from:', apiClient.defaults.baseURL + '/activitytrainers');
    const response = await apiClient.get('/activitytrainers');
    console.log('Activity trainers raw response:', response.data);
    
    let activityTrainers = response.data;
    if (Array.isArray(activityTrainers)) {
      activityTrainers = activityTrainers.map(at => ({
        ...at,
        id: `${at.activity_id}-${at.trainer_id}`
      }));
    }
    
    console.log('Activity trainers after normalization:', activityTrainers);
    return activityTrainers;
  } catch (error) {
    console.error('Error fetching activity trainers:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch activity trainers';
    throw { message: errorMessage };
  }
};

// Get trainers by activity
export const getTrainersByActivity = async (activityId) => {
  try {
    console.log('Fetching trainers for activity:', activityId);
    const response = await apiClient.get(`/activitytrainers/activity/${activityId}`);
    console.log('Trainers by activity response:', response.data);
    
    let activityTrainers = response.data;
    if (Array.isArray(activityTrainers)) {
      activityTrainers = activityTrainers.map(at => ({
        ...at,
        id: `${at.activity_id}-${at.trainer_id}`
      }));
    }
    
    return activityTrainers;
  } catch (error) {
    console.error('Error fetching trainers by activity:', error);
    throw error.response?.data || { message: 'Failed to fetch trainers' };
  }
};

// Get activities by trainer
export const getActivitiesByTrainer = async (trainerId) => {
  try {
    console.log('Fetching activities for trainer:', trainerId);
    const response = await apiClient.get(`/activitytrainers/trainer/${trainerId}`);
    console.log('Activities by trainer response:', response.data);
    
    let activityTrainers = response.data;
    if (Array.isArray(activityTrainers)) {
      activityTrainers = activityTrainers.map(at => ({
        ...at,
        id: `${at.activity_id}-${at.trainer_id}`
      }));
    }
    
    return activityTrainers;
  } catch (error) {
    console.error('Error fetching activities by trainer:', error);
    throw error.response?.data || { message: 'Failed to fetch activities' };
  }
};

// Get single activity trainer
export const getActivityTrainer = async (activityId, trainerId) => {
  try {
    console.log('Fetching activity trainer:', activityId, trainerId);
    const response = await apiClient.get(`/activitytrainers/${activityId}/${trainerId}`);
    const activityTrainer = response.data;
    
    console.log('Activity trainer response:', activityTrainer);
    
    return {
      ...activityTrainer,
      id: `${activityTrainer.activity_id}-${activityTrainer.trainer_id}`
    };
  } catch (error) {
    console.error('Error fetching activity trainer:', error);
    throw error.response?.data || { message: 'Failed to fetch activity trainer' };
  }
};

// Create activity trainer
export const createActivityTrainer = async (activityTrainerData) => {
  try {
    console.log('Creating activity trainer with data:', activityTrainerData);
    const response = await apiClient.post('/activitytrainers', activityTrainerData);
    console.log('Create activity trainer response:', response.data);
    
    const activityTrainer = response.data;
    return {
      ...activityTrainer,
      id: `${activityTrainer.activity_id}-${activityTrainer.trainer_id}`
    };
  } catch (error) {
    console.error('Error creating activity trainer:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to create activity trainer';
    throw { message: errorMessage };
  }
};

// Update activity trainer
export const updateActivityTrainer = async (activityId, trainerId, activityTrainerData) => {
  try {
    console.log('Updating activity trainer:', activityId, trainerId, 'with data:', activityTrainerData);
    const response = await apiClient.put(`/activitytrainers/${activityId}/${trainerId}`, activityTrainerData);
    console.log('Update activity trainer response:', response.data);
    
    const activityTrainer = response.data;
    return {
      ...activityTrainer,
      id: `${activityTrainer.activity_id}-${activityTrainer.trainer_id}`
    };
  } catch (error) {
    console.error('Error updating activity trainer:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to update activity trainer';
    throw { message: errorMessage };
  }
};

// Delete activity trainer
export const deleteActivityTrainer = async (activityId, trainerId) => {
  try {
    console.log('Deleting activity trainer:', activityId, trainerId);
    const response = await apiClient.delete(`/activitytrainers/${activityId}/${trainerId}`);
    console.log('Delete activity trainer response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting activity trainer:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to delete activity trainer';
    throw { message: errorMessage };
  }
};

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

// Get all trainers
export const getAllTrainers = async () => {
  try {
    console.log('Fetching trainers from:', apiClient.defaults.baseURL + '/trainers');
    const response = await apiClient.get('/trainers');
    console.log('Trainers raw response:', response.data);
    
    // Log first trainer structure to understand ID field
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('First trainer structure:', response.data[0]);
      console.log('Available ID fields:', {
        id: response.data[0].id,
        trainer_id: response.data[0].trainer_id,
        trainerId: response.data[0].trainerId,
      });
    }
    
    // Normalize the response - use trainer_id as primary since API path uses trainer_id
    let trainers = response.data;
    if (Array.isArray(trainers)) {
      trainers = trainers.map(trainer => ({
        ...trainer,
        id: trainer.trainer_id || trainer.id || trainer.trainerId
      }));
    }
    
    console.log('Trainers after normalization:', trainers);
    return trainers;
  } catch (error) {
    console.error('Error fetching trainers:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch trainers';
    throw { message: errorMessage };
  }
};

// Get single trainer
export const getTrainer = async (trainerId) => {
  try {
    console.log('Fetching trainer with ID:', trainerId);
    const response = await apiClient.get(`/trainers/${trainerId}`);
    const trainer = response.data;
    
    console.log('Trainer response:', trainer);
    
    // Normalize to ensure id field exists - use trainer_id as primary
    return {
      ...trainer,
      id: trainer.trainer_id || trainer.id || trainer.trainerId
    };
  } catch (error) {
    console.error('Error fetching trainer:', error);
    throw error.response?.data || { message: 'Failed to fetch trainer' };
  }
};

// Get trainers by organization
export const getTrainersByOrganization = async (orgId) => {
  try {
    console.log('Fetching trainers for organization:', orgId);
    const response = await apiClient.get(`/trainers/organization/${orgId}`);
    console.log('Trainers by org response:', response.data);
    
    let trainers = response.data;
    if (Array.isArray(trainers)) {
      trainers = trainers.map(trainer => ({
        ...trainer,
        id: trainer.trainer_id || trainer.id || trainer.trainerId
      }));
    }
    
    return trainers;
  } catch (error) {
    console.error('Error fetching trainers by organization:', error);
    throw error.response?.data || { message: 'Failed to fetch trainers' };
  }
};

// Create trainer
export const createTrainer = async (trainerData) => {
  try {
    console.log('Creating trainer with data:', trainerData);
    const response = await apiClient.post('/trainers', trainerData);
    console.log('Create trainer response:', response.data);
    
    const trainer = response.data;
    return {
      ...trainer,
      id: trainer.trainer_id || trainer.id || trainer.trainerId
    };
  } catch (error) {
    console.error('Error creating trainer:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to create trainer';
    throw { message: errorMessage };
  }
};

// Update trainer
export const updateTrainer = async (trainerId, trainerData) => {
  try {
    console.log('Updating trainer:', trainerId, 'with data:', trainerData);
    const response = await apiClient.put(`/trainers/${trainerId}`, trainerData);
    console.log('Update trainer response:', response.data);
    
    const trainer = response.data;
    return {
      ...trainer,
      id: trainer.trainer_id || trainer.id || trainer.trainerId
    };
  } catch (error) {
    console.error('Error updating trainer:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to update trainer';
    throw { message: errorMessage };
  }
};

// Delete trainer
export const deleteTrainer = async (trainerId) => {
  try {
    console.log('Deleting trainer:', trainerId);
    const response = await apiClient.delete(`/trainers/${trainerId}`);
    console.log('Delete trainer response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting trainer:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to delete trainer';
    throw { message: errorMessage };
  }
};

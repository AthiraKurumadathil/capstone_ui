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

// Get all activities
export const getAllActivities = async () => {
  try {
    console.log('Fetching activities from:', apiClient.defaults.baseURL + '/activities');
    const response = await apiClient.get('/activities');
    console.log('Activities raw response:', response.data);
    
    // Log first activity structure to understand ID field
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('First activity structure:', response.data[0]);
      console.log('Available ID fields:', {
        id: response.data[0].id,
        activity_id: response.data[0].activity_id,
        activityId: response.data[0].activityId,
      });
    }
    
    // Normalize the response - use activity_id as primary since API path uses activity_id
    let activities = response.data;
    if (Array.isArray(activities)) {
      activities = activities.map(activity => ({
        ...activity,
        id: activity.activity_id || activity.id || activity.activityId
      }));
    }
    
    console.log('Activities after normalization:', activities);
    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch activities';
    throw { message: errorMessage };
  }
};

// Get single activity
export const getActivity = async (activityId) => {
  try {
    console.log('Fetching activity with ID:', activityId);
    const response = await apiClient.get(`/activities/${activityId}`);
    const activity = response.data;
    
    console.log('Activity response:', activity);
    
    // Normalize to ensure id field exists - use activity_id as primary
    return {
      ...activity,
      id: activity.activity_id || activity.id || activity.activityId
    };
  } catch (error) {
    console.error('Error fetching activity:', error);
    throw error.response?.data || { message: 'Failed to fetch activity' };
  }
};

// Create activity
export const createActivity = async (activityData) => {
  try {
    const response = await apiClient.post('/activities', activityData);
    const activity = response.data;
    
    console.log('Created activity response:', activity);
    
    // Normalize to ensure id field exists - use activity_id as primary
    return {
      ...activity,
      id: activity.activity_id || activity.id || activity.activityId
    };
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error.response?.data || { message: 'Failed to create activity' };
  }
};

// Update activity
export const updateActivity = async (activityId, activityData) => {
  try {
    const response = await apiClient.put(`/activities/${activityId}`, activityData);
    const activity = response.data;
    
    console.log('Updated activity response:', activity);
    
    // Normalize to ensure id field exists - use activity_id as primary
    return {
      ...activity,
      id: activity.activity_id || activity.id || activity.activityId
    };
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error.response?.data || { message: 'Failed to update activity' };
  }
};

// Delete activity
export const deleteActivity = async (activityId) => {
  try {
    const response = await apiClient.delete(`/activities/${activityId}`);
    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error.response?.data || { message: 'Failed to delete activity' };
  }
};

// Get activities by organization
export const getActivitiesByOrganization = async (orgId) => {
  try {
    console.log('Fetching activities for organization:', orgId);
    const response = await apiClient.get(`/activities/organization/${orgId}`);
    console.log('Activities by organization response:', response.data);
    
    // Normalize the response
    let activities = response.data;
    if (Array.isArray(activities)) {
      activities = activities.map(activity => ({
        ...activity,
        id: activity.activity_id || activity.id || activity.activityId
      }));
    }
    
    return activities;
  } catch (error) {
    console.error('Error fetching activities by organization:', error);
    throw error.response?.data || { message: 'Failed to fetch activities' };
  }
};

export default apiClient;

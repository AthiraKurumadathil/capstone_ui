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

// Get all batch sessions
export const getAllSessions = async () => {
  try {
    console.log('Fetching batch sessions from:', apiClient.defaults.baseURL + '/batchsessions');
    const response = await apiClient.get('/batchsessions');
    console.log('Batch sessions raw response:', response.data);
    
    let sessions = response.data;
    if (Array.isArray(sessions)) {
      sessions = sessions.map(session => ({
        ...session,
        id: session.session_id || session.id
      }));
    } else if (sessions && typeof sessions === 'object' && sessions.data) {
      // Handle case where response has a data property
      sessions = Array.isArray(sessions.data) ? sessions.data : [sessions.data];
      sessions = sessions.map(session => ({
        ...session,
        id: session.session_id || session.id
      }));
    }
    
    console.log('Batch sessions after normalization:', sessions);
    return sessions || [];
  } catch (error) {
    console.error('Error fetching batch sessions:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch batch sessions';
    console.error('Detailed error message:', errorMessage);
    throw { message: errorMessage };
  }
};

// Get single session
export const getSession = async (sessionId) => {
  try {
    console.log('Fetching session with ID:', sessionId);
    const response = await apiClient.get(`/sessions/${sessionId}`);
    const session = response.data;
    
    console.log('Session response:', session);
    
    return {
      ...session,
      id: session.session_id || session.id
    };
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error.response?.data || { message: 'Failed to fetch session' };
  }
};

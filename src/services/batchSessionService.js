import apiClient from './authService';

// Get all batch sessions
export const getAllBatchSessions = async () => {
  try {
    const response = await apiClient.get('/batchsessions');
    // Handle both wrapped and direct array responses
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching batch sessions:', error);
    throw error.response?.data || { message: 'Failed to fetch batch sessions' };
  }
};

// Get single batch session
export const getBatchSession = async (sessionId) => {
  if (!sessionId || sessionId === 'undefined' || isNaN(sessionId)) {
    throw { message: 'Invalid Session ID - must be a valid number' };
  }
  try {
    const numericId = parseInt(sessionId, 10);
    const response = await apiClient.get(`/batchsessions/${numericId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching batch session:', error);
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to fetch batch session';
    throw error.response?.data || { message: errorMsg };
  }
};

// Get sessions by batch ID
export const getSessionsByBatch = async (batchId) => {
  try {
    const response = await apiClient.get(`/batchsessions/batch/${batchId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching sessions by batch:', error);
    throw error.response?.data || { message: 'Failed to fetch sessions' };
  }
};

// Create batch session
export const createBatchSession = async (sessionData) => {
  try {
    console.log('=== BATCH SESSION CREATE ===');
    console.log('Data being sent:', JSON.stringify(sessionData, null, 2));
    
    const response = await apiClient.post('/batchsessions', sessionData);
    
    console.log('Create response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== ERROR CREATING BATCH SESSION ===');
    console.error('Full error object:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to create batch session';
    throw error.response?.data || { message: errorMsg };
  }
};

// Update batch session
export const updateBatchSession = async (sessionId, sessionData) => {
  if (!sessionId || sessionId === 'undefined' || isNaN(sessionId)) {
    throw { message: 'Invalid Session ID - must be a valid number' };
  }
  try {
    const numericId = parseInt(sessionId, 10);
    const dataToSend = {
      batch_id: sessionData.batch_id,
      session_date: sessionData.session_date,
      start_time: sessionData.start_time,
      end_time: sessionData.end_time,
      status: sessionData.status,
      notes: sessionData.notes
    };
    
    console.log('=== BATCH SESSION UPDATE ===');
    console.log('Session ID:', numericId);
    console.log('URL: /batchsessions/' + numericId);
    console.log('Data being sent:', JSON.stringify(dataToSend, null, 2));
    
    const response = await apiClient.put(`/batchsessions/${numericId}`, dataToSend);
    
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== ERROR UPDATING BATCH SESSION ===');
    console.error('Full error object:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to update batch session';
    throw error.response?.data || { message: errorMsg };
  }
};

// Delete batch session
export const deleteBatchSession = async (sessionId) => {
  if (!sessionId || sessionId === 'undefined' || isNaN(sessionId)) {
    throw { message: 'Invalid Session ID - must be a valid number' };
  }
  try {
    const numericId = parseInt(sessionId, 10);
    const response = await apiClient.delete(`/batchsessions/${numericId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting batch session:', error);
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Failed to delete batch session';
    throw error.response?.data || { message: errorMsg };
  }
};

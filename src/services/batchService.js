import apiClient from './authService';

// Get all batches
export const getAllBatches = async () => {
  try {
    console.log('Fetching batches from:', apiClient.defaults.baseURL + '/batches');
    const response = await apiClient.get('/batches');
    console.log('Batches raw response:', response.data);
    
    let batches = response.data;
    if (Array.isArray(batches)) {
      batches = batches.map(batch => ({
        ...batch,
        id: batch.batch_id || batch.id
      }));
    } else if (batches && typeof batches === 'object' && batches.data) {
      batches = Array.isArray(batches.data) ? batches.data : [batches.data];
      batches = batches.map(batch => ({
        ...batch,
        id: batch.batch_id || batch.id
      }));
    }
    
    console.log('Batches after normalization:', batches);
    return batches || [];
  } catch (error) {
    console.error('Error fetching batches:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch batches';
    throw { message: errorMessage };
  }
};

// Get single batch
export const getBatch = async (batchId) => {
  try {
    console.log('Fetching batch with ID:', batchId);
    const response = await apiClient.get(`/batches/${batchId}`);
    const batch = response.data;
    
    console.log('Batch response:', batch);
    
    return {
      ...batch,
      id: batch.batch_id || batch.id
    };
  } catch (error) {
    console.error('Error fetching batch:', error);
    throw error.response?.data || { message: 'Failed to fetch batch' };
  }
};

// Create batch
export const createBatch = async (batchData) => {
  try {
    console.log('Creating batch with data:', batchData);
    const response = await apiClient.post('/batches', batchData);
    
    console.log('Batch created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating batch:', error);
    throw error.response?.data || { message: 'Failed to create batch' };
  }
};

// Update batch
export const updateBatch = async (batchId, batchData) => {
  try {
    console.log('Updating batch:', batchId, 'with data:', batchData);
    const response = await apiClient.put(`/batches/${batchId}`, batchData);
    
    console.log('Batch updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating batch:', error);
    throw error.response?.data || { message: 'Failed to update batch' };
  }
};

// Delete batch
export const deleteBatch = async (batchId) => {
  try {
    console.log('Deleting batch:', batchId);
    const response = await apiClient.delete(`/batches/${batchId}`);
    
    console.log('Batch deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Error deleting batch:', error);
    throw error.response?.data || { message: 'Failed to delete batch' };
  }
};

// Get batches by organization
export const getBatchesByOrganization = async (orgId) => {
  try {
    console.log('Fetching batches for organization:', orgId);
    const response = await apiClient.get(`/batches/organization/${orgId}`);
    
    let batches = response.data;
    if (Array.isArray(batches)) {
      batches = batches.map(batch => ({
        ...batch,
        id: batch.batch_id || batch.id
      }));
    }
    
    return batches || [];
  } catch (error) {
    console.error('Error fetching batches by organization:', error);
    throw error.response?.data || { message: 'Failed to fetch batches' };
  }
};

// Get batches by activity
export const getBatchesByActivity = async (activityId) => {
  try {
    console.log('Fetching batches for activity:', activityId);
    const response = await apiClient.get(`/batches/activity/${activityId}`);
    
    let batches = response.data;
    if (Array.isArray(batches)) {
      batches = batches.map(batch => ({
        ...batch,
        id: batch.batch_id || batch.id
      }));
    }
    
    return batches || [];
  } catch (error) {
    console.error('Error fetching batches by activity:', error);
    throw error.response?.data || { message: 'Failed to fetch batches' };
  }
};

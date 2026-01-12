import apiClient from './authService';

export const getAllFeePlans = async () => {
  try {
    const response = await apiClient.get('/feeplans');
    console.log('Fee plans response:', response.data);
    
    let feePlans = response.data;
    
    // Handle wrapped response
    if (feePlans && typeof feePlans === 'object' && feePlans.data && Array.isArray(feePlans.data)) {
      feePlans = feePlans.data;
    }
    
    // Ensure it's an array
    if (!Array.isArray(feePlans)) {
      console.warn('Fee plans response is not an array:', feePlans);
      return [];
    }
    
    console.log('Parsed fee plans:', feePlans);
    
    // Map fee_plan_id to id for consistency
    const mapped = feePlans.map(plan => ({
      ...plan,
      id: plan.id || plan.fee_plan_id,
    }));
    console.log('Mapped fee plans:', mapped);
    return mapped;
  } catch (error) {
    console.error('Error fetching fee plans from /feeplans:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch fee plans';
    console.error('Error details:', errorMessage);
    const err = new Error(errorMessage);
    err.detail = errorMessage;
    throw err;
  }
};

export const getFeePlan = async (feePlanId) => {
  try {
    const response = await apiClient.get(`/feeplans/${feePlanId}`);
    const feePlan = response.data;
    
    // Map fee_plan_id to id for consistency
    return {
      ...feePlan,
      id: feePlan.id || feePlan.fee_plan_id,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch fee plan';
    console.error(`Error fetching fee plan ${feePlanId}:`, errorMessage);
    const err = new Error(errorMessage);
    err.detail = errorMessage;
    throw err;
  }
};
// Create fee plan
export const createFeePlan = async (feePlanData) => {
  try {
    console.log('=== FEE PLAN CREATE ===');
    console.log('Data being sent:', JSON.stringify(feePlanData, null, 2));
    
    const response = await apiClient.post('/feeplans', feePlanData);
    
    console.log('Create response:', response.data);
    const feePlan = response.data;
    return {
      ...feePlan,
      id: feePlan.id || feePlan.fee_plan_id,
    };
  } catch (error) {
    console.error('=== ERROR CREATING FEE PLAN ===');
    console.error('Full error object:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to create fee plan';
    throw error.response?.data || { message: errorMsg };
  }
};

// Update fee plan
export const updateFeePlan = async (feePlanId, feePlanData) => {
  try {
    const numericId = parseInt(feePlanId, 10);
    const dataToSend = {
      org_id: feePlanData.org_id,
      name: feePlanData.name,
      billing_type_id: feePlanData.billing_type_id,
      amount: feePlanData.amount,
      currency: feePlanData.currency,
      active: feePlanData.active,
    };
    
    console.log('=== FEE PLAN UPDATE ===');
    console.log('Fee Plan ID:', numericId);
    console.log('URL: /feeplans/' + numericId);
    console.log('Data being sent:', JSON.stringify(dataToSend, null, 2));
    
    const response = await apiClient.put(`/feeplans/${numericId}`, dataToSend);
    
    console.log('Update response:', response.data);
    const feePlan = response.data;
    return {
      ...feePlan,
      id: feePlan.id || feePlan.fee_plan_id,
    };
  } catch (error) {
    console.error('=== ERROR UPDATING FEE PLAN ===');
    console.error('Full error object:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to update fee plan';
    throw error.response?.data || { message: errorMsg };
  }
};

// Delete fee plan
export const deleteFeePlan = async (feePlanId) => {
  try {
    if (!feePlanId || feePlanId === 'undefined' || isNaN(feePlanId)) {
      const errorMsg = 'Invalid Fee Plan ID - must be a valid number';
      console.error(errorMsg);
      throw { message: errorMsg };
    }
    
    const numericId = parseInt(feePlanId, 10);
    console.log('=== FEE PLAN DELETE ===');
    console.log('Fee Plan ID:', numericId);
    console.log('URL: /feeplans/' + numericId);
    
    const response = await apiClient.delete(`/feeplans/${numericId}`);
    
    console.log('Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('=== ERROR DELETING FEE PLAN ===');
    console.error('Full error object:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to delete fee plan';
    throw error.response?.data || { message: errorMsg };
  }
};

export default apiClient;
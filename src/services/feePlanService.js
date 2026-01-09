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

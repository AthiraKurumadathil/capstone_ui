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

// Get all organizations
export const getAllOrganizations = async () => {
  try {
    console.log('Fetching organizations from:', apiClient.defaults.baseURL + '/organizations');
    const response = await apiClient.get('/organizations');
    console.log('Organizations raw response:', response.data);
    
    // Log first org structure to understand ID field
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('First organization structure:', response.data[0]);
      console.log('Available ID fields:', {
        id: response.data[0].id,
        organisation_id: response.data[0].organisation_id,
        org_id: response.data[0].org_id,
        orgId: response.data[0].orgId,
      });
    }
    
    // Normalize the response - use org_id as primary since API path uses org_id
    let organizations = response.data;
    if (Array.isArray(organizations)) {
      organizations = organizations.map(org => ({
        ...org,
        id: org.org_id || org.id || org.organisation_id || org.orgId
      }));
    }
    
    console.log('Organizations after normalization:', organizations);
    return organizations;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch organizations';
    throw { message: errorMessage };
  }
};

// Get single organization
export const getOrganization = async (orgId) => {
  try {
    console.log('Fetching organization with ID:', orgId);
    const response = await apiClient.get(`/organizations/${orgId}`);
    const org = response.data;
    
    console.log('Organization response:', org);
    
    // Normalize to ensure id field exists - use org_id as primary
    return {
      ...org,
      id: org.org_id || org.id || org.organisation_id || org.orgId
    };
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw error.response?.data || { message: 'Failed to fetch organization' };
  }
};

// Create organization
export const createOrganization = async (organizationData) => {
  try {
    const response = await apiClient.post('/organizations', organizationData);
    const org = response.data;
    
    console.log('Created organization response:', org);
    
    // Normalize to ensure id field exists - use org_id as primary
    return {
      ...org,
      id: org.org_id || org.id || org.organisation_id || org.orgId
    };
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error.response?.data || { message: 'Failed to create organization' };
  }
};

// Update organization
export const updateOrganization = async (orgId, organizationData) => {
  try {
    const response = await apiClient.put(`/organizations/${orgId}`, organizationData);
    console.log('Updated organization response:', org);
    
    // Normalize to ensure id field exists - use org_id as primary
    
    // Normalize to ensure id field exists
    return {
      ...org,
      id: org.id || org.organisation_id || org.orgId
    };
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error.response?.data || { message: 'Failed to update organization' };
  }
};

// Delete organization
export const deleteOrganization = async (orgId) => {
  try {
    const response = await apiClient.delete(`/organizations/${orgId}`);
    return response.status === 204;
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error.response?.data || { message: 'Failed to delete organization' };
  }
};

export default apiClient;

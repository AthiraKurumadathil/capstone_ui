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

// Get all enrollments from Enrollments table
export const getAllEnrollments = async () => {
  try {
    console.log('Fetching enrollment_id from Enrollments table...');
    console.log('API Endpoint:', apiClient.defaults.baseURL + '/enrollments');
    
    const response = await apiClient.get('/enrollments');
    
    console.log('✓ Successfully fetched from /enrollments');
    console.log('Response data:', response.data);
    console.log('Response status:', response.status);
    
    let enrollments = [];
    
    // Handle direct array response
    if (Array.isArray(response.data)) {
      enrollments = response.data;
      console.log('Response is array with', enrollments.length, 'items');
    }
    // Handle wrapped response with data property
    else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      enrollments = response.data.data;
      console.log('Response.data.data is array with', enrollments.length, 'items');
    }
    // Handle other object responses
    else if (response.data && typeof response.data === 'object') {
      enrollments = [response.data];
      console.log('Response is single object, wrapping as array');
    }
    
    // Log first item structure to verify enrollment_id field exists
    if (enrollments.length > 0) {
      console.log('First enrollment item:', JSON.stringify(enrollments[0], null, 2));
      console.log('Fields in first item:', Object.keys(enrollments[0]));
      console.log('enrollment_id value:', enrollments[0].enrollment_id);
    }
    
    // Map data - use enrollment_id as the id field
    const mappedEnrollments = enrollments.map((item, index) => {
      const enrollmentId = item.enrollment_id;
      if (index === 0) {
        console.log('Mapping first item:', {
          original_enrollment_id: item.enrollment_id,
          mapped_id: enrollmentId
        });
      }
      return {
        ...item,
        id: enrollmentId
      };
    });
    
    console.log('✓ Enrollment mapping complete');
    console.log('Total enrollments mapped:', mappedEnrollments.length);
    console.log('Sample mapped enrollments:', mappedEnrollments.slice(0, 3).map(e => ({ id: e.id, enrollment_id: e.enrollment_id })));
    
    return mappedEnrollments;
    
  } catch (error) {
    console.error('✗ Error fetching enrollments from /enrollments:', error.message);
    console.error('Error status:', error.response?.status);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch enrollments';
    
    console.error('Final error message:', errorMessage);
    throw { message: errorMessage };
  }
};

// Get single enrollment
export const getEnrollment = async (enrollmentId) => {
  try {
    console.log('Fetching enrollment with ID:', enrollmentId);
    const response = await apiClient.get(`/enrollments/${enrollmentId}`);
    const enrollment = response.data;
    
    console.log('Enrollment response:', enrollment);
    
    return {
      ...enrollment,
      id: enrollment.enrollment_id || enrollment.id
    };
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    throw error.response?.data || { message: 'Failed to fetch enrollment' };
  }
};

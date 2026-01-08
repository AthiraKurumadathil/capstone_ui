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

// Get all categories
export const getAllCategories = async () => {
  try {
    console.log('Fetching categories from:', apiClient.defaults.baseURL + '/categories');
    const response = await apiClient.get('/categories');
    console.log('Categories raw response:', response.data);
    
    // Log first category structure to understand ID field
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('First category structure:', response.data[0]);
      console.log('Available ID fields:', {
        id: response.data[0].id,
        category_id: response.data[0].category_id,
        categoryId: response.data[0].categoryId,
      });
    }
    
    // Normalize the response - use category_id as primary since API path uses category_id
    let categories = response.data;
    if (Array.isArray(categories)) {
      categories = categories.map(category => ({
        ...category,
        id: category.category_id || category.id || category.categoryId
      }));
    }
    
    console.log('Categories after normalization:', categories);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch categories';
    throw { message: errorMessage };
  }
};

// Get single category
export const getCategory = async (categoryId) => {
  try {
    console.log('Fetching category with ID:', categoryId);
    const response = await apiClient.get(`/categories/${categoryId}`);
    const category = response.data;
    
    console.log('Category response:', category);
    
    // Normalize to ensure id field exists - use category_id as primary
    return {
      ...category,
      id: category.category_id || category.id || category.categoryId
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error.response?.data || { message: 'Failed to fetch category' };
  }
};

export default apiClient;

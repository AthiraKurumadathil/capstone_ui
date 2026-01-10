import axios from 'axios';

// Function to decode JWT token
const decodeToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid token format');
      return null;
    }
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle 401 (token expired) errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      console.warn('🔐 Token expired or invalid (401 error)');
      // Clear stored credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      if (window.location.pathname !== '/') {
        console.log('Redirecting to login page...');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/users/authenticate/login', {
      email,
      password,
    });
    
    console.log('Login response (full):', response.data);
    
    // Store token - handle different response structures
    const token = response.data.token || response.data.access_token;
    
    if (token) {
      localStorage.setItem('token', token);
      
      // Decode token to extract role_id
      const decodedToken = decodeToken(token);
      console.log('Decoded token:', decodedToken);
      
      // Store user data - handle different response structures
      let userData = response.data.user || {
        email: email,
        id: response.data.user_id || response.data.id,
      };
      
      // Add role_id from decoded token if not already in userData
      if (decodedToken && decodedToken.role_id && !userData.role_id) {
        userData.role_id = decodedToken.role_id;
      }
      
      console.log('User data to be stored:', userData);
      console.log('role_id in userData:', userData.role_id);
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { token, user: userData };
    } else {
      throw new Error('No token received from server');
    }
  } catch (error) {
    console.error('Login error details:', error);
    throw error.response?.data || error || { message: 'An error occurred during login' };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export default apiClient;

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/users/authenticate/login', {
      email,
      password,
    });
    
    console.log('Login response:', response.data);
    
    // Store token - handle different response structures
    const token = response.data.token || response.data.access_token;
    
    if (token) {
      localStorage.setItem('token', token);
      
      // Store user data - handle different response structures
      const userData = response.data.user || {
        email: email,
        id: response.data.user_id || response.data.id,
      };
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

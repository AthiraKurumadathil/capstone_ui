import apiClient from './authService';

const userService = {
  async getAllUsers() {
    try {
      const response = await apiClient.get('/users');
      const users = Array.isArray(response.data) ? response.data : [];
      return users.map(user => ({
        ...user,
        id: user.user_id || user.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch users';
      throw new Error(errorMsg);
    }
  },

  async getUser(userId) {
    try {
      if (!userId || userId === 'undefined' || isNaN(userId)) {
        throw new Error('Invalid User ID - must be a valid number');
      }
      const url = `/users/${userId}`;
      console.log(`Fetching user from: ${url}`);
      const response = await apiClient.get(url);
      const user = response.data;
      console.log('User API response:', user);
      console.log('Response status:', response.status);
      
      // Handle both user_id and id field names
      const userId_ = user.user_id || user.id;
      if (!userId_) {
        console.error('User response missing ID field:', user);
        throw new Error('User response missing ID field');
      }
      
      console.log('Successfully fetched user with ID:', userId_);
      return {
        ...user,
        id: userId_
      };
    } catch (error) {
      const statusCode = error.response?.status;
      const detail = error.response?.data?.detail;
      const errorMsg = detail || error.message || 'Failed to fetch user';
      console.error(`Get user error (Status ${statusCode}):`, errorMsg);
      console.error('Full error details:', error);
      throw new Error(errorMsg);
    }
  },

  async createUser(data) {
    try {
      const payload = {
        org_id: data.org_id,
        role_id: data.role_id,
        email: data.email,
        phone: data.phone || null,
        active: data.active,
        password_hash: data.password_hash || null
      };
      console.log('Creating user with payload:', payload);
      const response = await apiClient.post('/users', payload);
      const user = response.data;
      console.log('Create user response:', user);
      console.log('Response status:', response.status);
      
      // Handle both user_id and id field names
      const userId = user.user_id || user.id;
      if (!userId) {
        console.error('User response missing ID field:', user);
        throw new Error('Backend did not return user ID');
      }
      
      console.log(`User created with ID: ${userId}`);
      return {
        ...user,
        id: userId
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to create user';
      console.error('Create user error:', errorMsg, 'Full error:', error);
      throw new Error(errorMsg);
    }
  },

  async updateUser(userId, data) {
    try {
      if (!userId || userId === 'undefined' || isNaN(userId)) {
        throw new Error('Invalid User ID - must be a valid number');
      }
      const payload = {
        org_id: data.org_id,
        role_id: data.role_id,
        email: data.email,
        phone: data.phone || null,
        active: data.active,
        password_hash: data.password_hash || null
      };
      const response = await apiClient.put(`/users/${userId}`, payload);
      const user = response.data;
      return {
        ...user,
        id: user.user_id || user.id
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update user';
      throw new Error(errorMsg);
    }
  },

  async deleteUser(userId) {
    try {
      if (!userId || userId === 'undefined' || isNaN(userId)) {
        throw new Error('Invalid User ID - must be a valid number');
      }
      console.log(`Deleting user at: /users/${userId}`);
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete user';
      console.error('Delete error details:', error.response?.data);
      throw new Error(errorMsg);
    }
  },

  async getUsersByOrganization(orgId) {
    try {
      const response = await apiClient.get(`/users/organization/${orgId}`);
      const users = Array.isArray(response.data) ? response.data : [];
      return users.map(user => ({
        ...user,
        id: user.user_id || user.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch users';
      throw new Error(errorMsg);
    }
  },

  async getUserByEmail(email) {
    try {
      const response = await apiClient.get(`/users/email/${email}`);
      const user = response.data;
      return {
        ...user,
        id: user.user_id || user.id
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch user';
      throw new Error(errorMsg);
    }
  },

  async updateLastLogin(userId) {
    try {
      if (!userId || userId === 'undefined' || isNaN(userId)) {
        throw new Error('Invalid User ID - must be a valid number');
      }
      const response = await apiClient.put(`/users/${userId}/last-login`);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update last login';
      throw new Error(errorMsg);
    }
  },

  async changePassword(email, oldPassword, newPassword) {
    try {
      if (!email || !oldPassword || !newPassword) {
        throw new Error('Email, old password, and new password are required');
      }
      const payload = {
        old_password: oldPassword,
        new_password: newPassword
      };
      const response = await apiClient.put(`/users/change-password/${email}`, payload);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to change password';
      throw new Error(errorMsg);
    }
  },

  async forgotPassword(email) {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      const payload = { email };
      const response = await apiClient.post('/users/forgot-password', payload);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to send password reset email';
      throw new Error(errorMsg);
    }
  }
};

export const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUsersByOrganization,
  getUserByEmail,
  updateLastLogin,
  changePassword,
  forgotPassword
} = userService;

export default apiClient;

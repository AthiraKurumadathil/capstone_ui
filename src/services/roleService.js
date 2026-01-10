import apiClient from './authService';

const roleService = {
  async getAllRoles() {
    try {
      const response = await apiClient.get('/roles');
      const roles = Array.isArray(response.data) ? response.data : [];
      return roles.map(role => ({
        ...role,
        id: role.role_id || role.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch roles';
      throw new Error(errorMsg);
    }
  },

  async getRole(roleId) {
    try {
      if (!roleId || roleId === 'undefined' || isNaN(roleId)) {
        throw new Error('Invalid Role ID - must be a valid number');
      }
      const url = `/roles/${roleId}`;
      console.log(`Fetching role from: ${url}`);
      const response = await apiClient.get(url);
      const role = response.data;
      console.log('Role API response:', role);
      console.log('Response status:', response.status);
      
      // Handle both role_id and id field names
      const roleId_ = role.role_id || role.id;
      if (!roleId_) {
        console.error('Role response missing ID field:', role);
        throw new Error('Role response missing ID field');
      }
      
      console.log('Successfully fetched role with ID:', roleId_);
      return {
        ...role,
        id: roleId_
      };
    } catch (error) {
      const statusCode = error.response?.status;
      const detail = error.response?.data?.detail;
      const errorMsg = detail || error.message || 'Failed to fetch role';
      console.error(`Get role error (Status ${statusCode}):`, errorMsg);
      console.error('Full error details:', error);
      throw new Error(errorMsg);
    }
  },

  async createRole(data) {
    try {
      const payload = {
        org_id: data.org_id,
        name: data.name
      };
      console.log('Creating role with payload:', payload);
      const response = await apiClient.post('/roles', payload);
      const role = response.data;
      console.log('Create role response:', role);
      console.log('Response status:', response.status);
      
      // Handle both role_id and id field names
      const roleId = role.role_id || role.id;
      if (!roleId) {
        console.error('Role response missing ID field:', role);
        throw new Error('Backend did not return role ID');
      }
      
      console.log(`Role created with ID: ${roleId}`);
      return {
        ...role,
        id: roleId
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to create role';
      console.error('Create role error:', errorMsg, 'Full error:', error);
      throw new Error(errorMsg);
    }
  },

  async updateRole(roleId, data) {
    try {
      if (!roleId || roleId === 'undefined' || isNaN(roleId)) {
        throw new Error('Invalid Role ID - must be a valid number');
      }
      const payload = {
        org_id: data.org_id,
        name: data.name
      };
      const response = await apiClient.put(`/roles/${roleId}`, payload);
      const role = response.data;
      return {
        ...role,
        id: role.role_id || role.id
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update role';
      throw new Error(errorMsg);
    }
  },

  async deleteRole(roleId) {
    try {
      if (!roleId || roleId === 'undefined' || isNaN(roleId)) {
        throw new Error('Invalid Role ID - must be a valid number');
      }
      console.log(`Deleting role at: /roles/${roleId}`);
      const response = await apiClient.delete(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete role';
      console.error('Delete error details:', error.response?.data);
      throw new Error(errorMsg);
    }
  },

  async getRolesByOrganization(orgId) {
    try {
      const response = await apiClient.get(`/roles/organization/${orgId}`);
      const roles = Array.isArray(response.data) ? response.data : [];
      return roles.map(role => ({
        ...role,
        id: role.role_id || role.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch roles';
      throw new Error(errorMsg);
    }
  }
};

export const {
  getAllRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRolesByOrganization
} = roleService;

export default apiClient;

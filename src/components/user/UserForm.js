import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser, createUser, updateUser } from '../../services/userService';
import { getAllOrganizations } from '../../services/organizationService';
import { getAllRoles } from '../../services/roleService';
import './UserForm.css';

const UserForm = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role_name?.toLowerCase().trim() === 'super admin';
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;
  
  const [form, setForm] = useState({
    org_id: '',
    role_id: '',
    email: '',
    phone: '',
    active: true
  });
  const [organizations, setOrganizations] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizations();
    fetchRoles();
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const data = await getUser(userId);
      setForm({
        org_id: data.org_id,
        role_id: data.role_id,
        email: data.email,
        phone: data.phone || '',
        active: data.active
      });
    } catch (err) {
      setError(err.message || 'Failed to load user');
      console.error('Fetch user error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const data = await getAllOrganizations();
      let orgList = Array.isArray(data) ? data : [];
      
      // If user is org admin, show only their organization
      if (isOrgAdmin && userOrgId) {
        orgList = orgList.filter(org => org.id === userOrgId);
        // Auto-select user's organization
        setForm(prev => ({ ...prev, org_id: userOrgId.toString() }));
      }
      
      setOrganizations(orgList);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();
      let roleList = Array.isArray(data) ? data : [];
      
      // Store all roles
      setAllRoles(roleList);
      
      // For Super Admin, don't show any roles initially - wait for organization selection
      if (isSuperAdmin) {
        setRoles([]);
      } 
      // For Organization Admin, show only their organization's roles
      else if (isOrgAdmin && userOrgId) {
        roleList = roleList.filter(role => role.org_id === userOrgId);
        setRoles(roleList);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const filterRolesByOrganization = (orgId) => {
    if (!orgId) {
      setRoles([]);
      return;
    }
    
    let filteredRoles = allRoles.filter(role => role.org_id === parseInt(orgId));
    setRoles(filteredRoles);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
    
    // Filter roles when organization changes
    if (name === 'org_id' && isSuperAdmin) {
      filterRolesByOrganization(value);
    }
  };

  const validateForm = () => {
    if (!form.org_id) return 'Organization is required';
    if (!form.role_id) return 'Role is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email format';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const submitData = {
        org_id: parseInt(form.org_id),
        role_id: parseInt(form.role_id),
        email: form.email.trim(),
        phone: form.phone?.trim() || null,
        active: form.active
      };

      if (userId) {
        console.log('Updating user:', userId, submitData);
        await updateUser(userId, submitData);
        navigate(`/users/${userId}`);
      } else {
        console.log('Creating new user with data:', submitData);
        const newUser = await createUser(submitData);
        console.log('✓ User created successfully');
        console.log('Response object:', newUser);
        console.log('User ID from response:', newUser.id);
        
        if (!newUser.id) {
          console.error('ERROR: User created but no ID returned!');
          setError('User was created but system could not retrieve its ID. Check console logs.');
          return;
        }
        
        console.log(`Navigating to /users/${newUser.id}`);
        navigate(`/users/${newUser.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save user');
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && userId) {
    return <div className="user-loading">Loading...</div>;
  }

  return (
    <div className="user-form-container">
      <div className="user-form-card">
        <h2>{userId ? 'Edit User' : 'Create User'}</h2>
        
        {error && <div className="user-form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="user-form">
          <div className="user-form-group">
            <label htmlFor="org_id">Organization *</label>
            <select
              id="org_id"
              name="org_id"
              value={form.org_id}
              onChange={handleChange}
              disabled={isOrgAdmin}
              required
            >
              <option value="">Select Organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="user-form-group">
            <label htmlFor="role_id">Role *</label>
            <select
              id="role_id"
              name="role_id"
              value={form.role_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="user-form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="user-form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g., +1-234-567-8900"
            />
          </div>

          <div className="user-form-group checkbox">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            <label htmlFor="active">Active User</label>
          </div>

          <div className="user-form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (userId ? 'Update User' : 'Create User')}
            </button>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/users')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

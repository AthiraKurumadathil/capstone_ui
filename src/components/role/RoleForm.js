import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRole, createRole, updateRole } from '../../services/roleService';
import { getAllOrganizations } from '../../services/organizationService';
import './RoleForm.css';

const RoleForm = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role_name?.toLowerCase().trim() === 'super admin';
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;
  
  const [form, setForm] = useState({
    org_id: '',
    name: ''
  });
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizations();
    if (roleId) {
      fetchRole();
    } else if (isSuperAdmin) {
      // If Super Admin is creating a new role, pre-fill with "Admin"
      setForm(prev => ({ ...prev, name: 'Admin' }));
    }
  }, [roleId]);

  const fetchRole = async () => {
    try {
      setIsLoading(true);
      const data = await getRole(roleId);
      setForm({
        org_id: data.org_id,
        name: data.name
      });
    } catch (err) {
      setError(err.message || 'Failed to load role');
      console.error('Fetch role error:', err);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!form.org_id) return 'Organization is required';
    if (!form.name.trim()) return 'Role name is required';
    if (form.name.trim().length < 2) return 'Role name must be at least 2 characters';
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
        name: form.name.trim()
      };

      if (roleId) {
        console.log('Updating role:', roleId, submitData);
        await updateRole(roleId, submitData);
        navigate(`/roles/${roleId}`);
      } else {
        console.log('Creating new role with data:', submitData);
        const newRole = await createRole(submitData);
        console.log('✓ Role created successfully');
        console.log('Response object:', newRole);
        console.log('Role ID from response:', newRole.id);
        
        if (!newRole.id) {
          console.error('ERROR: Role created but no ID returned!');
          setError('Role was created but system could not retrieve its ID. Check console logs.');
          return;
        }
        
        console.log(`Navigating to /roles/${newRole.id}`);
        navigate(`/roles/${newRole.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save role');
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && roleId) {
    return <div className="role-loading">Loading...</div>;
  }

  return (
    <div className="role-form-container">
      <div className="role-form-card">
        <h2>{roleId ? 'Edit Role' : 'Create Role'}</h2>
        
        {error && <div className="role-form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="role-form">
          <div className="role-form-group">
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

          <div className="role-form-group">
            <label htmlFor="name">Role Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Manager, Coordinator, etc."
              disabled={isSuperAdmin && !roleId}
              required
            />
          </div>

          <div className="role-form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (roleId ? 'Update Role' : 'Create Role')}
            </button>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/roles')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;

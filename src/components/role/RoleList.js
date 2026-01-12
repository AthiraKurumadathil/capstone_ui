import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoles, deleteRole } from '../../services/roleService';
import { getAllOrganizations } from '../../services/organizationService';
import './RoleList.css';

const RoleList = () => {
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role_name?.toLowerCase().trim() === 'super admin';
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;
  
  const [roles, setRoles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchOrganizations();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await getAllRoles();
      let roleList = Array.isArray(data) ? data : [];
      
      // If user is org admin, show only their organization's roles (excluding Admin role)
      if (isOrgAdmin && userOrgId) {
        roleList = roleList.filter(role => role.org_id === userOrgId && role.name.toLowerCase() !== 'admin');
      }
      
      setRoles(roleList);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load roles');
      console.error('Fetch roles error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const data = await getAllOrganizations();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  const getOrgName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : `Organization ${orgId}`;
  };

  const handleDelete = async () => {
    try {
      await deleteRole(deleteConfirm.id);
      setRoles(roles.filter(r => r.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete role');
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (role) => {
    navigate(`/roles/edit/${role.id}`);
  };

  const handleView = (role) => {
    navigate(`/roles/${role.id}`);
  };

  if (isLoading) {
    return <div className="role-loading">Loading roles...</div>;
  }

  return (
    <div className="role-list-container">
      <button 
        className="btn btn-secondary role-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="role-list-header">
        <h1>Roles</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/roles/create')}
        >
          + Create Role
        </button>
      </div>

      {error && <div className="role-list-error">{error}</div>}

      {roles.length === 0 ? (
        <div className="role-list-empty">
          <p>No roles found. Create your first role to get started.</p>
        </div>
      ) : (
        <table className="role-list-table">
          <thead>
            <tr>
              <th>Role ID</th>
              <th>Name</th>
              <th>Organization</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td>#{role.id}</td>
                <td>{role.name}</td>
                <td>{getOrgName(role.org_id)}</td>
                <td className="role-actions">
                  <button 
                    className="btn btn-sm btn-info"
                    onClick={() => handleView(role)}
                    disabled={role.name.toLowerCase() === 'admin' && isOrgAdmin}
                    title={role.name.toLowerCase() === 'admin' && isOrgAdmin ? 'Admin role cannot be viewed by organization admin' : ''}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => handleEdit(role)}
                    disabled={role.name.toLowerCase() === 'admin' && isOrgAdmin}
                    title={role.name.toLowerCase() === 'admin' && isOrgAdmin ? 'Admin role cannot be edited by organization admin' : ''}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => setDeleteConfirm(role)}
                    disabled={role.name.toLowerCase() === 'admin' && isOrgAdmin}
                    title={role.name.toLowerCase() === 'admin' && isOrgAdmin ? 'Admin role cannot be deleted by organization admin' : ''}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {deleteConfirm && (
        <div className="role-modal-overlay">
          <div className="role-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete role "{deleteConfirm.name}"?</p>
            <div className="role-modal-actions">
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleList;

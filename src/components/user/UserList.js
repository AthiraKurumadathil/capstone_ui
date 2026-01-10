import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser } from '../../services/userService';
import { getAllOrganizations } from '../../services/organizationService';
import { getAllRoles } from '../../services/roleService';
import './UserList.css';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      console.log('Users fetched:', data);
      console.log('Last login values:', data.map(u => ({ id: u.id, email: u.email, last_login_at: u.last_login_at })));
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load users');
      console.error('Fetch users error:', err);
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

  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const getOrgName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : `Organization ${orgId}`;
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : `Role ${roleId}`;
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteConfirm.id);
      setUsers(users.filter(u => u.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (user) => {
    navigate(`/users/edit/${user.id}`);
  };

  const handleView = (user) => {
    navigate(`/users/${user.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <div className="user-loading">Loading users...</div>;
  }

  return (
    <div className="user-list-container">
      <button 
        className="btn btn-secondary user-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>

      <div className="user-list-header">
        <h1>Users</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/users/create')}
        >
          + Create User
        </button>
      </div>

      {error && <div className="user-error">{error}</div>}

      {users.length === 0 ? (
        <div className="user-empty">
          <h2>No Users Found</h2>
          <p>Create your first user to get started.</p>
        </div>
      ) : (
        <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email</th>
              <th>Organization</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Active</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>{user.email}</td>
                <td>{getOrgName(user.org_id)}</td>
                <td>{getRoleName(user.role_id)}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>{formatDate(user.last_login_at)}</td>
                <td className="user-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleView(user)}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => setDeleteConfirm(user)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {deleteConfirm && (
        <div className="user-modal-overlay">
        create a back to menu button on the enrollments page
        
        Edited
        EnrollmentList.js+7-0
        Now add the CSS styling for the button:
        
        
          <div className="user-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete user "{deleteConfirm.email}"?</p>
            <div className="user-modal-actions">
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

export default UserList;

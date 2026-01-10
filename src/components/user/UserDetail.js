import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser, deleteUser } from '../../services/userService';
import { getAllOrganizations } from '../../services/organizationService';
import { getAllRoles } from '../../services/roleService';
import './UserDetail.css';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchOrganizations();
    fetchRoles();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      console.log(`Fetching user ${userId}`);
      const data = await getUser(userId);
      console.log('User fetched:', data);
      setUser(data);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load user';
      console.error('Fetch error details:', err);
      
      // Check if it's a token-related error
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Token')) {
        setError('Your session has expired. Please log in again.');
        // Redirect will be handled by authService interceptor
      } else if (errorMsg.includes('Not found') || errorMsg.includes('User')) {
        setError(`User #${userId} not found`);
        // Auto-redirect to list after 3 seconds if user not found
        setTimeout(() => {
          console.log('Redirecting to users list...');
          navigate('/users');
        }, 3000);
      } else {
        setError(errorMsg);
      }
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

  const handleDelete = async () => {
    try {
      await deleteUser(userId);
      navigate('/users');
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete user';
      setError(errorMsg);
      setDeleteConfirm(false);
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
    return <div className="user-loading">Loading user...</div>;
  }

  if (!user) {
    const isTokenError = error.includes('session has expired') || error.includes('Unauthorized');
    return (
      <div className="user-detail-container">
        <div style={{ 
          backgroundColor: isTokenError ? '#f8d7da' : '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '6px', 
          color: '#721c24', 
          padding: '20px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginTop: 0 }}>{isTokenError ? 'Session Expired' : 'User Not Found'}</h3>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            <strong>Error:</strong> {error || 'The user could not be found in the system.'}
          </p>
          {!isTokenError && (
            <>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                Tried to fetch User ID: <code style={{backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px'}}>{userId}</code>
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                Redirecting to users list in 3 seconds...
              </p>
            </>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              if (isTokenError) {
                window.location.href = '/';
              } else {
                navigate('/users');
              }
            }}
            style={{ marginTop: '10px' }}
          >
            {isTokenError ? 'Go to Login' : 'Go to Users List Now'}
          </button>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
            Check browser console for detailed error logs (F12 → Console tab)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-detail-container">
      <button 
        className="btn btn-secondary user-detail-back-btn"
        onClick={() => navigate('/users')}
      >
        ← Back to Users
      </button>

      <div className="user-detail-card">
        <div className="user-detail-header">
          <h1>User Details</h1>
          <div className="user-detail-actions">
            <button 
              className="btn btn-warning"
              onClick={() => navigate(`/users/edit/${user.id}`)}
            >
              Edit
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => setDeleteConfirm(true)}
            >
              Delete
            </button>
          </div>
        </div>

        {error && <div className="user-detail-error">{error}</div>}

        <div className="user-detail-grid">
          <div className="user-detail-item">
            <label>User ID</label>
            <p>#{user.id}</p>
          </div>

          <div className="user-detail-item">
            <label>Email</label>
            <p>{user.email}</p>
          </div>

          <div className="user-detail-item">
            <label>Organization</label>
            <p>{getOrgName(user.org_id)}</p>
          </div>

          <div className="user-detail-item">
            <label>Role</label>
            <p>{getRoleName(user.role_id)}</p>
          </div>

          <div className="user-detail-item">
            <label>Phone</label>
            <p>{user.phone || '-'}</p>
          </div>

          <div className="user-detail-item">
            <label>Active</label>
            <p>
              <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                {user.active ? 'Yes' : 'No'}
              </span>
            </p>
          </div>

          {user.created_at && (
            <div className="user-detail-item">
              <label>Created</label>
              <p>{formatDate(user.created_at)}</p>
            </div>
          )}

          {user.last_login_at && (
            <div className="user-detail-item">
              <label>Last Login</label>
              <p>{formatDate(user.last_login_at)}</p>
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="user-modal-overlay">
          <div className="user-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete user "{user.email}"?</p>
            <p style={{ color: '#666', fontSize: '12px' }}>This action cannot be undone.</p>
            <div className="user-modal-actions">
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete User
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(false)}
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

export default UserDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRole, deleteRole } from '../../services/roleService';
import { getAllOrganizations } from '../../services/organizationService';
import './RoleDetail.css';

const RoleDetail = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchRole();
    fetchOrganizations();
  }, [roleId]);

  const fetchRole = async () => {
    try {
      setIsLoading(true);
      console.log(`Fetching role ${roleId}`);
      const data = await getRole(roleId);
      console.log('Role fetched:', data);
      setRole(data);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load role';
      console.error('Fetch error details:', err);
      
      // Check if it's a token-related error
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Token')) {
        setError('Your session has expired. Please log in again.');
        // Redirect will be handled by authService interceptor
      } else if (errorMsg.includes('Not found') || errorMsg.includes('Role')) {
        setError(`Role #${roleId} not found`);
        // Auto-redirect to list after 3 seconds if role not found
        setTimeout(() => {
          console.log('Redirecting to roles list...');
          navigate('/roles');
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

  const handleDelete = async () => {
    try {
      await deleteRole(roleId);
      navigate('/roles');
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete role';
      setError(errorMsg);
      setDeleteConfirm(false);
    }
  };

  const getOrgName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : `Organization ${orgId}`;
  };

  if (isLoading) {
    return <div className="role-loading">Loading role...</div>;
  }

  if (!role) {
    const isTokenError = error.includes('session has expired') || error.includes('Unauthorized');
    return (
      <div className="role-detail-container">
        <div style={{ 
          backgroundColor: isTokenError ? '#f8d7da' : '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '6px', 
          color: '#721c24', 
          padding: '20px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginTop: 0 }}>{isTokenError ? 'Session Expired' : 'Role Not Found'}</h3>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            <strong>Error:</strong> {error || 'The role could not be found in the system.'}
          </p>
          {!isTokenError && (
            <>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                Tried to fetch Role ID: <code style={{backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px'}}>{roleId}</code>
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                Redirecting to roles list in 3 seconds...
              </p>
            </>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              if (isTokenError) {
                window.location.href = '/';
              } else {
                navigate('/roles');
              }
            }}
            style={{ marginTop: '10px' }}
          >
            {isTokenError ? 'Go to Login' : 'Go to Roles List Now'}
          </button>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
            Check browser console for detailed error logs (F12 → Console tab)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="role-detail-container">
      <button 
        className="btn btn-secondary role-detail-back-btn"
        onClick={() => navigate('/roles')}
      >
        ← Back to Roles
      </button>

      <div className="role-detail-card">
        <div className="role-detail-header">
          <h1>Role Details</h1>
          <div className="role-detail-actions">
            <button 
              className="btn btn-warning"
              onClick={() => navigate(`/roles/edit/${role.id}`)}
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

        {error && <div className="role-detail-error">{error}</div>}

        <div className="role-detail-grid">
          <div className="role-detail-item">
            <label>Role ID</label>
            <p>#{role.id}</p>
          </div>

          <div className="role-detail-item">
            <label>Name</label>
            <p>{role.name}</p>
          </div>

          <div className="role-detail-item">
            <label>Organization</label>
            <p>{getOrgName(role.org_id)}</p>
          </div>

          {role.created_at && (
            <div className="role-detail-item">
              <label>Created</label>
              <p>{new Date(role.created_at).toLocaleDateString()}</p>
            </div>
          )}

          {role.updated_at && (
            <div className="role-detail-item">
              <label>Updated</label>
              <p>{new Date(role.updated_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="role-modal-overlay">
          <div className="role-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the role "{role.name}"?</p>
            <p style={{ color: '#666', fontSize: '12px' }}>This action cannot be undone.</p>
            <div className="role-modal-actions">
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
              >
                Delete Role
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

export default RoleDetail;

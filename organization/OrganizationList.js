import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrganizations, deleteOrganization } from '../../services/organizationService';
import './OrganizationList.css';

const OrganizationList = () => {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const data = await getAllOrganizations();
      setOrganizations(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load organizations';
      setError(errorMsg);
      console.error('Fetch error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (orgId) => {
    try {
      await deleteOrganization(orgId);
      setOrganizations(organizations.filter(org => org.id !== orgId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete organization');
    }
  };

  const handleEdit = (orgId) => {
    navigate(`/organizations/edit/${orgId}`);
  };

  const handleView = (orgId) => {
    navigate(`/organizations/${orgId}`);
  };

  if (isLoading) {
    return <div className="org-loading">Loading organizations...</div>;
  }

  return (
    <div className="org-list-container">
      <button 
        className="btn btn-secondary org-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="org-list-header">
        <h2>Organizations</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/organizations/create')}
        >
          + Create Organization
        </button>
      </div>

      {error && <div className="org-error">{error}</div>}

      {organizations.length === 0 ? (
        <div className="org-empty">
          <p>No organizations found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/organizations/create')}
          >
            Create your first organization
          </button>
        </div>
      ) : (
        <div className="org-table-wrapper">
          <table className="org-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map(org => (
                <tr key={org.id}>
                  <td className="org-name">{org.name}</td>
                  <td>{org.email}</td>
                  <td>{org.phone}</td>
                  <td>{org.city || '-'}</td>
                  <td>
                    <span className={`org-status ${org.active ? 'active' : 'inactive'}`}>
                      {org.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="org-actions">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleView(org.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(org.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(org.id)}
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
        <div className="org-modal-overlay">
          <div className="org-modal">
            <h3>Delete Organization</h3>
            <p>Are you sure you want to delete this organization?</p>
            <div className="org-modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationList;

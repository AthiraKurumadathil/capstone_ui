import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBatches, deleteBatch } from '../../services/batchService';
import { getAllOrganizations } from '../../services/organizationService';
import { getAllActivities } from '../../services/activityService';
import { getAllFeePlans } from '../../services/feePlanService';
import './BatchList.css';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [feePlans, setFeePlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchBatches();
    fetchOrganizations();
    fetchActivities();
    fetchFeePlans();
  }, []);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const data = await getAllBatches();
      let filteredData = Array.isArray(data) ? data : [];
      
      // If user is org admin, filter by their organization
      if (isOrgAdmin && userOrgId) {
        filteredData = filteredData.filter(batch => batch.org_id === userOrgId);
      }
      
      setBatches(filteredData);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load batches';
      setError(errorMsg);
      console.error('Fetch error details:', err);
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

  const fetchActivities = async () => {
    try {
      const data = await getAllActivities();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const fetchFeePlans = async () => {
    try {
      const data = await getAllFeePlans();
      setFeePlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching fee plans:', err);
    }
  };

  const handleDelete = async (batchId) => {
    try {
      await deleteBatch(batchId);
      setBatches(batches.filter(batch => batch.id !== batchId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete batch');
    }
  };

  const handleEdit = (batchId) => {
    navigate(`/batches/edit/${batchId}`);
  };

  const handleView = (batchId) => {
    navigate(`/batches/${batchId}`);
  };

  const getOrganizationName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : `Org ${orgId}`;
  };

  const getActivityName = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    return activity ? activity.name : `Activity ${activityId}`;
  };

  const getFeePlanName = (feePlanId) => {
    const plan = feePlans.find(p => p.id === feePlanId);
    return plan ? plan.name : `Plan ${feePlanId}`;
  };

  if (isLoading) {
    return <div className="batch-loading">Loading batches...</div>;
  }

  return (
    <div className="batch-list-container">
      <button 
        className="btn btn-secondary batch-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="batch-list-header">
        <h2>Batches</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/batches/create')}
        >
          + Create Batch
        </button>
      </div>

      {error && <div className="batch-error">{error}</div>}

      {batches.length === 0 ? (
        <div className="batch-empty">
          <p>No batches found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/batches/create')}
          >
            Create your first batch
          </button>
        </div>
      ) : (
        <div className="batch-table-wrapper">
          <table className="batch-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organization</th>
                <th>Activity</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Fee Plan</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(batch => (
                <tr key={batch.id}>
                  <td className="batch-name">{batch.name}</td>
                  <td>{getOrganizationName(batch.org_id)}</td>
                  <td>{getActivityName(batch.activity_id)}</td>
                  <td>{batch.start_date ? new Date(batch.start_date).toLocaleDateString() : '-'}</td>
                  <td>{batch.end_date ? new Date(batch.end_date).toLocaleDateString() : '-'}</td>
                  <td>{batch.capacity || '-'}</td>
                  <td>{batch.location || '-'}</td>
                  <td>{getFeePlanName(batch.fee_plan_id)}</td>
                  <td>
                    <span className={`batch-status ${batch.status ? batch.status.toLowerCase() : ''}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="batch-actions">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleView(batch.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(batch.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(batch.id)}
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
        <div className="batch-modal-overlay">
          <div className="batch-modal">
            <h3>Delete Batch</h3>
            <p>Are you sure you want to delete this batch?</p>
            <div className="batch-modal-actions">
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

export default BatchList;

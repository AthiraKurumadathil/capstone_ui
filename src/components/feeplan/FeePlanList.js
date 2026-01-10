import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFeePlans, deleteFeePlan } from '../../services/feePlanService';
import { getAllOrganizations } from '../../services/organizationService';
import './FeePlanList.css';

const FeePlanList = () => {
  const [feePlans, setFeePlans] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeePlans();
    fetchOrganizations();
  }, []);

  const fetchFeePlans = async () => {
    try {
      setIsLoading(true);
      const data = await getAllFeePlans();
      setFeePlans(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load fee plans';
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

  const handleDelete = async (feePlanId) => {
    try {
      console.log('Deleting fee plan with ID:', feePlanId);
      await deleteFeePlan(feePlanId);
      setFeePlans(feePlans.filter(plan => plan.id !== feePlanId));
      setDeleteConfirm(null);
      setError('');
    } catch (err) {
      console.error('Delete error:', err);
      
      // Check if it's a constraint violation error
      if (err.detail && err.detail.includes('23000')) {
        setError('Cannot delete this fee plan because it is being used by other records (students, batches, or payments). Please remove those dependencies first.');
      } else {
        setError(err.message || 'Failed to delete fee plan');
      }
    }
  };

  const handleEdit = (feePlanId) => {
    navigate(`/feeplans/edit/${feePlanId}`);
  };

  const handleView = (feePlanId) => {
    navigate(`/feeplans/${feePlanId}`);
  };

  const getOrgName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : `Organization ${orgId}`;
  };

  if (isLoading) {
    return <div className="feeplan-loading">Loading fee plans...</div>;
  }

  return (
    <div className="feeplan-list-container">
      <button 
        className="btn btn-secondary feeplan-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="feeplan-list-header">
        <h2>Fee Plans</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/feeplans/create')}
        >
          + Create Fee Plan
        </button>
      </div>

      {error && <div className="feeplan-error">{error}</div>}

      {feePlans.length === 0 ? (
        <div className="feeplan-empty-state">
          <p>No fee plans found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/feeplans/create')}
          >
            Create your first fee plan
          </button>
        </div>
      ) : (
        <div className="feeplan-table-wrapper">
          <table className="feeplan-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Name</th>
                <th>Billing Type</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feePlans.map(plan => (
                <tr key={plan.id}>
                  <td>{getOrgName(plan.org_id)}</td>
                  <td className="feeplan-name">{plan.name}</td>
                  <td>{plan.billing_type}</td>
                  <td className="feeplan-amount">{plan.amount}</td>
                  <td>{plan.currency}</td>
                  <td>
                    <span className={`feeplan-status ${plan.active ? 'active' : 'inactive'}`}>
                      {plan.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="feeplan-actions">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleView(plan.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(plan.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(plan.id)}
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Fee Plan</h3>
            <p>Are you sure you want to delete this fee plan?</p>
            <div className="modal-buttons">
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

export default FeePlanList;

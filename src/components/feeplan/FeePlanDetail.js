import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFeePlan, deleteFeePlan } from '../../services/feePlanService';
import { getAllOrganizations } from '../../services/organizationService';
import './FeePlanDetail.css';

const FeePlanDetail = () => {
  const [feePlan, setFeePlan] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const { feePlanId } = useParams();

  useEffect(() => {
    loadFeePlan();
    fetchOrganizations();
  }, [feePlanId]);

  const loadFeePlan = async () => {
    try {
      setIsLoading(true);
      const feePlanIdInt = parseInt(feePlanId, 10);
      if (isNaN(feePlanIdInt)) {
        setError('Invalid fee plan ID');
        return;
      }
      const data = await getFeePlan(feePlanIdInt);
      setFeePlan(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load fee plan');
      console.error('Error loading fee plan:', err);
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
      console.log('Fee plan object before delete:', feePlan);
      console.log('Fee plan ID:', feePlan.id);
      console.log('Fee plan fee_plan_id:', feePlan.fee_plan_id);
      
      if (!feePlan.id && !feePlan.fee_plan_id) {
        setError('Fee plan ID is missing. Cannot delete.');
        return;
      }
      
      const idToUse = feePlan.id || feePlan.fee_plan_id;
      await deleteFeePlan(idToUse);
      alert('Fee plan deleted successfully');
      navigate('/feeplans');
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

  const handleEdit = () => {
    navigate(`/feeplans/edit/${feePlan.id}`);
  };

  const getOrgName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : `Organization ${orgId}`;
  };

  if (isLoading) {
    return <div className="feeplan-detail-loading">Loading fee plan details...</div>;
  }

  if (error) {
    return <div className="feeplan-detail-error">{error}</div>;
  }

  if (!feePlan) {
    return <div className="feeplan-detail-error">Fee plan not found</div>;
  }

  return (
    <div className="feeplan-detail-container">
      <button 
        className="btn btn-secondary feeplan-detail-back-btn"
        onClick={() => navigate('/feeplans')}
      >
        ← Back to Fee Plans
      </button>

      <div className="feeplan-detail-card">
        <h2>Fee Plan Details</h2>

        <div className="feeplan-detail-grid">
          <div className="feeplan-detail-item">
            <label>Organization</label>
            <p>{getOrgName(feePlan.org_id)}</p>
          </div>

          <div className="feeplan-detail-item">
            <label>Name</label>
            <p>{feePlan.name}</p>
          </div>

          <div className="feeplan-detail-item">
            <label>Billing Type</label>
            <p>{feePlan.billing_type}</p>
          </div>

          <div className="feeplan-detail-item">
            <label>Amount</label>
            <p>{feePlan.amount}</p>
          </div>

          <div className="feeplan-detail-item">
            <label>Currency</label>
            <p>{feePlan.currency}</p>
          </div>

          <div className="feeplan-detail-item">
            <label>Status</label>
            <span className={`feeplan-status ${feePlan.active ? 'active' : 'inactive'}`}>
              {feePlan.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="feeplan-detail-actions">
          <button 
            className="btn btn-primary"
            onClick={handleEdit}
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

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Fee Plan</h3>
            <p>Are you sure you want to delete this fee plan?</p>
            <div className="modal-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
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

export default FeePlanDetail;

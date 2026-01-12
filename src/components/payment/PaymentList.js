import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPayments, deletePayment } from '../../services/paymentService';
import { getAllOrganizations } from '../../services/organizationService';
import './PaymentList.css';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchPayments();
    fetchOrganizations();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const data = await getAllPayments();
      let filteredData = Array.isArray(data) ? data : [];
      
      // If user is org admin, filter by their organization
      if (isOrgAdmin && userOrgId) {
        filteredData = filteredData.filter(payment => payment.org_id === userOrgId);
      }
      
      setPayments(filteredData);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load payments';
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

  const handleDelete = async (paymentId) => {
    try {
      await deletePayment(paymentId);
      setPayments(payments.filter(payment => payment.id !== paymentId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete payment');
    }
  };

  const handleEdit = (paymentId) => {
    navigate(`/payments/edit/${paymentId}`);
  };

  const handleView = (paymentId) => {
    navigate(`/payments/${paymentId}`);
  };

  const getOrgName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : `Organization ${orgId}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <div className="payment-loading">Loading payments...</div>;
  }

  return (
    <div className="payment-list-container">
      <button 
        className="btn btn-secondary payment-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="payment-list-header">
        <h2>Payments</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/payments/create')}
        >
          + Create Payment
        </button>
      </div>

      {error && <div className="payment-error">{error}</div>}

      {payments.length === 0 ? (
        <div className="payment-empty-state">
          <p>No payments found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/payments/create')}
          >
            Create your first payment
          </button>
        </div>
      ) : (
        <div className="payment-table-wrapper">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Organization</th>
                <th>Invoice ID</th>
                <th>Payment Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference No.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td className="payment-number">#{payment.id}</td>
                  <td>{getOrgName(payment.org_id)}</td>
                  <td>{payment.invoice_id}</td>
                  <td>{formatDate(payment.payment_date)}</td>
                  <td className="payment-amount">${parseFloat(payment.amount || 0).toFixed(2)}</td>
                  <td>{payment.method}</td>
                  <td>{payment.reference_no || '-'}</td>
                  <td className="payment-actions">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleView(payment.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(payment.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(payment.id)}
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
            <h3>Delete Payment</h3>
            <p>Are you sure you want to delete this payment?</p>
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

export default PaymentList;

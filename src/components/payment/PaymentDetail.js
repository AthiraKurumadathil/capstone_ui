import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPayment, deletePayment } from '../../services/paymentService';
import { getAllOrganizations } from '../../services/organizationService';
import './PaymentDetail.css';

const PaymentDetail = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchPayment();
    fetchOrganizations();
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      setIsLoading(true);
      console.log(`Fetching payment ${paymentId}`);
      const data = await getPayment(paymentId);
      console.log('Payment fetched:', data);
      setPayment(data);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load payment';
      console.error('Fetch error details:', err);
      
      // Check if it's a token-related error
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Token')) {
        setError('Your session has expired. Please log in again.');
        // Redirect will be handled by authService interceptor
      } else if (errorMsg.includes('Not found') || errorMsg.includes('Payment')) {
        setError(`Payment #${paymentId} not found`);
        // Auto-redirect to list after 3 seconds if payment not found
        setTimeout(() => {
          console.log('Redirecting to payments list...');
          navigate('/payments');
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
      await deletePayment(paymentId);
      navigate('/payments');
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete payment';
      setError(errorMsg);
      setDeleteConfirm(false);
    }
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

  const formatMethod = (method) => {
    if (!method) return '-';
    return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (isLoading) {
    return <div className="payment-loading">Loading payment...</div>;
  }

  if (!payment) {
    const isTokenError = error.includes('session has expired') || error.includes('Unauthorized');
    return (
      <div className="payment-detail-container">
        <div style={{ 
          backgroundColor: isTokenError ? '#f8d7da' : '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '6px', 
          color: '#721c24', 
          padding: '20px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginTop: 0 }}>{isTokenError ? 'Session Expired' : 'Payment Not Found'}</h3>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            <strong>Error:</strong> {error || 'The payment could not be found in the system.'}
          </p>
          {!isTokenError && (
            <>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                Tried to fetch Payment ID: <code style={{backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '3px'}}>{paymentId}</code>
              </p>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                🔄 Redirecting to payments list in 3 seconds...
              </p>
            </>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              if (isTokenError) {
                window.location.href = '/';
              } else {
                navigate('/payments');
              }
            }}
            style={{ marginTop: '10px' }}
          >
            {isTokenError ? 'Go to Login' : 'Go to Payments List Now'}
          </button>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
            Check browser console for detailed error logs (F12 → Console tab)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-detail-container">
      <button 
        className="btn btn-secondary payment-detail-back-btn"
        onClick={() => navigate('/payments')}
      >
        ← Back to Payments
      </button>

      <div className="payment-detail-card">
        <div className="payment-detail-header">
          <h2>Payment #{payment.id}</h2>
          <span className="payment-detail-method">
            {formatMethod(payment.method)}
          </span>
        </div>

        {error && <div className="payment-detail-error">{error}</div>}

        <div className="payment-detail-grid">
          <div className="payment-detail-item">
            <span className="payment-detail-label">Payment ID:</span>
            <span className="payment-detail-value">#{payment.id}</span>
          </div>

          <div className="payment-detail-item">
            <span className="payment-detail-label">Organization:</span>
            <span className="payment-detail-value">{getOrgName(payment.org_id)}</span>
          </div>

          <div className="payment-detail-item">
            <span className="payment-detail-label">Invoice ID:</span>
            <span className="payment-detail-value">#{payment.invoice_id}</span>
          </div>

          <div className="payment-detail-item">
            <span className="payment-detail-label">Payment Date:</span>
            <span className="payment-detail-value">{formatDate(payment.payment_date)}</span>
          </div>

          <div className="payment-detail-item">
            <span className="payment-detail-label">Amount:</span>
            <span className="payment-detail-value payment-amount">${parseFloat(payment.amount || 0).toFixed(2)}</span>
          </div>

          <div className="payment-detail-item">
            <span className="payment-detail-label">Payment Method:</span>
            <span className="payment-detail-value">{formatMethod(payment.method)}</span>
          </div>

          {payment.reference_no && (
            <div className="payment-detail-item">
              <span className="payment-detail-label">Reference Number:</span>
              <span className="payment-detail-value">{payment.reference_no}</span>
            </div>
          )}

          {payment.notes && (
            <div className="payment-detail-item">
              <span className="payment-detail-label">Notes:</span>
              <span className="payment-detail-value">{payment.notes}</span>
            </div>
          )}

          {payment.created_at && (
            <div className="payment-detail-item">
              <span className="payment-detail-label">Created:</span>
              <span className="payment-detail-value">{formatDate(payment.created_at)}</span>
            </div>
          )}

          {payment.updated_at && (
            <div className="payment-detail-item">
              <span className="payment-detail-label">Updated:</span>
              <span className="payment-detail-value">{formatDate(payment.updated_at)}</span>
            </div>
          )}
        </div>

        <div className="payment-detail-actions">
          <button 
            className="btn btn-warning"
            onClick={() => navigate(`/payments/edit/${payment.id}`)}
          >
            Edit Payment
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => setDeleteConfirm(true)}
          >
            Delete Payment
          </button>
        </div>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Payment</h3>
            <p>Are you sure you want to delete this payment? This action cannot be undone.</p>
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

export default PaymentDetail;

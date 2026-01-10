import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInvoice, deleteInvoice } from '../../services/invoiceService';
import { getAllOrganizations } from '../../services/organizationService';
import './InvoiceDetail.css';

const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchInvoice();
    fetchOrganizations();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      const data = await getInvoice(invoiceId);
      setInvoice(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load invoice');
      console.error('Fetch error:', err);
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
      await deleteInvoice(invoiceId);
      navigate('/invoices');
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete invoice';
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

  if (isLoading) {
    return <div className="invoice-loading">Loading invoice...</div>;
  }

  if (!invoice) {
    return (
      <div className="invoice-detail-container">
        <div className="invoice-error">Invoice not found</div>
        <button className="btn btn-secondary" onClick={() => navigate('/invoices')}>
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="invoice-detail-container">
      <button 
        className="btn btn-secondary invoice-detail-back-btn"
        onClick={() => navigate('/invoices')}
      >
        ← Back to Invoices
      </button>

      <div className="invoice-detail-card">
        <div className="invoice-detail-header">
          <h2>Invoice #{invoice.id}</h2>
          <span className={`invoice-detail-status ${invoice.status ? invoice.status.toLowerCase() : ''}`}>
            {invoice.status}
          </span>
        </div>

        {error && <div className="invoice-detail-error">{error}</div>}

        <div className="invoice-detail-grid">
          <div className="invoice-detail-item">
            <span className="invoice-detail-label">Invoice ID:</span>
            <span className="invoice-detail-value">#{invoice.id}</span>
          </div>

          <div className="invoice-detail-item">
            <span className="invoice-detail-label">Organization:</span>
            <span className="invoice-detail-value">{getOrgName(invoice.org_id)}</span>
          </div>

          <div className="invoice-detail-item">
            <span className="invoice-detail-label">Enrollment ID:</span>
            <span className="invoice-detail-value">{invoice.enrollment_id}</span>
          </div>

          <div className="invoice-detail-item">
            <span className="invoice-detail-label">Invoice Date:</span>
            <span className="invoice-detail-value">{formatDate(invoice.invoice_date)}</span>
          </div>

          <div className="invoice-detail-item">
            <span className="invoice-detail-label">Due Date:</span>
            <span className="invoice-detail-value">{formatDate(invoice.due_date)}</span>
          </div>

          <div className="invoice-detail-item">
            <span className="invoice-detail-label">Total Amount:</span>
            <span className="invoice-detail-value invoice-amount">${parseFloat(invoice.total_amount || 0).toFixed(2)}</span>
          </div>

          <div className="invoice-detail-item">
            <span className="invoice-detail-label">Status:</span>
            <span className={`invoice-status ${invoice.status ? invoice.status.toLowerCase() : ''}`}>
              {invoice.status}
            </span>
          </div>

          {invoice.created_at && (
            <div className="invoice-detail-item">
              <span className="invoice-detail-label">Created:</span>
              <span className="invoice-detail-value">{formatDate(invoice.created_at)}</span>
            </div>
          )}

          {invoice.updated_at && (
            <div className="invoice-detail-item">
              <span className="invoice-detail-label">Updated:</span>
              <span className="invoice-detail-value">{formatDate(invoice.updated_at)}</span>
            </div>
          )}
        </div>

        <div className="invoice-detail-actions">
          <button 
            className="btn btn-warning"
            onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
          >
            Edit Invoice
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => setDeleteConfirm(true)}
          >
            Delete Invoice
          </button>
        </div>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Invoice</h3>
            <p>Are you sure you want to delete this invoice? This action cannot be undone.</p>
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

export default InvoiceDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllInvoices, deleteInvoice } from '../../services/invoiceService';
import { getAllOrganizations } from '../../services/organizationService';
import './InvoiceList.css';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
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
    fetchInvoices();
    fetchOrganizations();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await getAllInvoices();
      let filteredData = Array.isArray(data) ? data : [];
      
      // If user is org admin, filter by their organization
      if (isOrgAdmin && userOrgId) {
        filteredData = filteredData.filter(invoice => invoice.org_id === userOrgId);
      }
      
      setInvoices(filteredData);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load invoices';
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

  const handleDelete = async (invoiceId) => {
    try {
      await deleteInvoice(invoiceId);
      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete invoice');
    }
  };

  const handleEdit = (invoiceId) => {
    navigate(`/invoices/edit/${invoiceId}`);
  };

  const handleView = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
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
    return <div className="invoice-loading">Loading invoices...</div>;
  }

  return (
    <div className="invoice-list-container">
      <button 
        className="btn btn-secondary invoice-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="invoice-list-header">
        <h2>Invoices</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/invoices/create')}
        >
          + Create Invoice
        </button>
      </div>

      {error && <div className="invoice-error">{error}</div>}

      {invoices.length === 0 ? (
        <div className="invoice-empty-state">
          <p>No invoices found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/invoices/create')}
          >
            Create your first invoice
          </button>
        </div>
      ) : (
        <div className="invoice-table-wrapper">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Organization</th>
                <th>Enrollment ID</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="invoice-number">#{invoice.id}</td>
                  <td>{getOrgName(invoice.org_id)}</td>
                  <td>{invoice.enrollment_id}</td>
                  <td>{formatDate(invoice.invoice_date)}</td>
                  <td>{formatDate(invoice.due_date)}</td>
                  <td className="invoice-amount">${parseFloat(invoice.total_amount || 0).toFixed(2)}</td>
                  <td>
                    <span className={`invoice-status ${invoice.status ? invoice.status.toLowerCase() : ''}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="invoice-actions">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleView(invoice.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(invoice.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(invoice.id)}
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
            <h3>Delete Invoice</h3>
            <p>Are you sure you want to delete this invoice?</p>
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

export default InvoiceList;

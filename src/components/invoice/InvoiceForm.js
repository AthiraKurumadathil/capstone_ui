import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createInvoice, updateInvoice, getInvoice } from '../../services/invoiceService';
import { getAllOrganizations } from '../../services/organizationService';
import './InvoiceForm.css';

const InvoiceForm = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;
  
  const [organizations, setOrganizations] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    org_id: '',
    enrollment_id: '',
    invoice_date: '',
    due_date: '',
    total_amount: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchOrganizations();
    if (invoiceId) {
      fetchInvoice(invoiceId);
    }
  }, [invoiceId]);

  const fetchOrganizations = async () => {
    try {
      const data = await getAllOrganizations();
      let orgList = Array.isArray(data) ? data : [];
      
      // If user is org admin, show only their organization
      if (isOrgAdmin && userOrgId) {
        orgList = orgList.filter(org => org.id === userOrgId);
        // Auto-select user's organization
        setForm(prev => ({ ...prev, org_id: userOrgId.toString() }));
      }
      
      setOrganizations(orgList);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Failed to load organizations');
    }
  };

  const fetchInvoice = async (id) => {
    try {
      setIsLoading(true);
      const data = await getInvoice(id);
      setForm({
        org_id: data.org_id || '',
        enrollment_id: data.enrollment_id || '',
        invoice_date: data.invoice_date ? data.invoice_date.split('T')[0] : '',
        due_date: data.due_date ? data.due_date.split('T')[0] : '',
        total_amount: data.total_amount || '',
        status: data.status || 'pending'
      });
    } catch (err) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!form.org_id) return 'Organization is required';
    if (!form.enrollment_id) return 'Enrollment ID is required';
    if (!form.invoice_date) return 'Invoice date is required';
    if (!form.due_date) return 'Due date is required';
    if (!form.total_amount || form.total_amount <= 0) return 'Amount must be greater than 0';
    if (!form.status) return 'Status is required';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const submitData = {
        org_id: parseInt(form.org_id),
        enrollment_id: parseInt(form.enrollment_id),
        invoice_date: form.invoice_date,
        due_date: form.due_date,
        total_amount: parseFloat(form.total_amount),
        status: form.status
      };

      if (invoiceId) {
        await updateInvoice(invoiceId, submitData);
        navigate(`/invoices/${invoiceId}`);
      } else {
        const newInvoice = await createInvoice(submitData);
        navigate(`/invoices/${newInvoice.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save invoice');
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && invoiceId) {
    return <div className="invoice-loading">Loading...</div>;
  }

  return (
    <div className="invoice-form-container">
      <div className="invoice-form-card">
        <h2>{invoiceId ? 'Edit Invoice' : 'Create Invoice'}</h2>
        
        {error && <div className="invoice-form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="invoice-form-grid">
            <div className="invoice-form-group">
              <label htmlFor="org_id">Organization *</label>
              <select 
                id="org_id"
                name="org_id" 
                value={form.org_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            <div className="invoice-form-group">
              <label htmlFor="enrollment_id">Enrollment ID *</label>
              <input 
                type="number" 
                id="enrollment_id"
                name="enrollment_id" 
                value={form.enrollment_id}
                onChange={handleChange}
                placeholder="Enter enrollment ID"
                min="1"
                required
              />
            </div>

            <div className="invoice-form-group">
              <label htmlFor="invoice_date">Invoice Date *</label>
              <input 
                type="date" 
                id="invoice_date"
                name="invoice_date" 
                value={form.invoice_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="invoice-form-group">
              <label htmlFor="due_date">Due Date *</label>
              <input 
                type="date" 
                id="due_date"
                name="due_date" 
                value={form.due_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="invoice-form-group">
              <label htmlFor="total_amount">Amount *</label>
              <input 
                type="number" 
                id="total_amount"
                name="total_amount" 
                value={form.total_amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="invoice-form-group">
              <label htmlFor="status">Status *</label>
              <select 
                id="status"
                name="status" 
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="invoice-form-buttons">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/invoices')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : invoiceId ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;

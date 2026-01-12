import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPayment, updatePayment, getPayment } from '../../services/paymentService';
import { getAllOrganizations } from '../../services/organizationService';
import { getInvoicesByOrganization } from '../../services/invoiceService';
import './PaymentForm.css';

const PaymentForm = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  
  // Get user and org info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrgAdmin = user.role_name?.toLowerCase().trim() === 'admin';
  const userOrgId = parseInt(user.org_id) || null;
  
  const [organizations, setOrganizations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    org_id: '',
    invoice_id: '',
    payment_date: '',
    amount: '',
    method: 'credit_card',
    reference_no: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrganizations();
    if (paymentId) {
      fetchPayment(paymentId);
    }
  }, [paymentId]);

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

  const fetchInvoicesByOrg = async (orgId) => {
    if (!orgId) {
      console.log('No org_id provided, clearing invoices');
      setInvoices([]);
      return;
    }
    try {
      console.log(`Fetching invoices for organization ${orgId}`);
      const data = await getInvoicesByOrganization(orgId);
      console.log('Invoices fetched:', data);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setInvoices([]);
    }
  };

  const fetchPayment = async (id) => {
    try {
      setIsLoading(true);
      console.log(`Fetching payment ${id}`);
      const data = await getPayment(id);
      console.log('Payment fetched:', data);
      setForm({
        org_id: data.org_id || '',
        invoice_id: data.invoice_id || '',
        payment_date: data.payment_date ? data.payment_date.split('T')[0] : '',
        amount: data.amount || '',
        method: data.method || 'credit_card',
        reference_no: data.reference_no || '',
        notes: data.notes || ''
      });
      // Fetch invoices for the organization
      if (data.org_id) {
        await fetchInvoicesByOrg(data.org_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load payment');
      console.error('Fetch payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Fetch invoices when organization changes
    if (name === 'org_id') {
      console.log(`Organization selected: ${value}, fetching invoices...`);
      fetchInvoicesByOrg(value);
    }
  };

  const validateForm = () => {
    if (!form.org_id) return 'Organization is required';
    if (!form.invoice_id) return 'Invoice ID is required';
    if (!form.payment_date) return 'Payment date is required';
    if (!form.amount || form.amount <= 0) return 'Amount must be greater than 0';
    if (!form.method) return 'Payment method is required';
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
        invoice_id: parseInt(form.invoice_id),
        payment_date: form.payment_date,
        amount: parseFloat(form.amount),
        method: form.method,
        reference_no: form.reference_no || null,
        notes: form.notes || null
      };

      if (paymentId) {
        console.log('Updating payment:', paymentId, submitData);
        await updatePayment(paymentId, submitData);
        navigate(`/payments/${paymentId}`);
      } else {
        console.log('Creating new payment with data:', submitData);
        const newPayment = await createPayment(submitData);
        console.log('✓ Payment created successfully');
        console.log('Response object:', newPayment);
        console.log('Payment ID from response:', newPayment.id);
        
        if (!newPayment.id) {
          console.error('ERROR: Payment created but no ID returned!');
          setError('Payment was created but system could not retrieve its ID. Check console logs.');
          return;
        }
        
        console.log(`Navigating to /payments/${newPayment.id}`);
        navigate(`/payments/${newPayment.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save payment');
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && paymentId) {
    return <div className="payment-loading">Loading...</div>;
  }

  return (
    <div className="payment-form-container">
      <div className="payment-form-card">
        <h2>{paymentId ? 'Edit Payment' : 'Create Payment'}</h2>
        
        {error && <div className="payment-form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="payment-form-grid">
            <div className="payment-form-group">
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

            <div className="payment-form-group">
              <label htmlFor="invoice_id">Invoice ID *</label>
              <select 
                id="invoice_id"
                name="invoice_id" 
                value={form.invoice_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Invoice</option>
                {invoices.map(invoice => (
                  <option key={invoice.id} value={invoice.id}>
                    Invoice #{invoice.id} - ${parseFloat(invoice.total_amount || 0).toFixed(2)}
                  </option>
                ))}
              </select>
              {form.org_id && invoices.length === 0 && (
                <small style={{ color: '#dc3545', marginTop: '4px' }}>No invoices found for this organization</small>
              )}
            </div>

            <div className="payment-form-group">
              <label htmlFor="payment_date">Payment Date *</label>
              <input 
                type="date" 
                id="payment_date"
                name="payment_date" 
                value={form.payment_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="payment-form-group">
              <label htmlFor="amount">Amount *</label>
              <input 
                type="number" 
                id="amount"
                name="amount" 
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="payment-form-group">
              <label htmlFor="method">Payment Method *</label>
              <select 
                id="method"
                name="method" 
                value={form.method}
                onChange={handleChange}
                required
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            <div className="payment-form-group">
              <label htmlFor="reference_no">Reference Number</label>
              <input 
                type="text" 
                id="reference_no"
                name="reference_no" 
                value={form.reference_no}
                onChange={handleChange}
                placeholder="Optional: Transaction/Reference number"
              />
            </div>

            <div className="payment-form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea 
                id="notes"
                name="notes" 
                value={form.notes}
                onChange={handleChange}
                placeholder="Optional: Additional payment notes"
                rows="3"
              />
            </div>
          </div>

          <div className="payment-form-buttons">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/payments')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : paymentId ? 'Update Payment' : 'Create Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;

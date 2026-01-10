import apiClient from './authService';

const paymentService = {
  async getAllPayments() {
    try {
      const response = await apiClient.get('/payments');
      const payments = Array.isArray(response.data) ? response.data : [];
      return payments.map(payment => ({
        ...payment,
        id: payment.payment_id || payment.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch payments';
      throw new Error(errorMsg);
    }
  },

  async getPayment(paymentId) {
    try {
      if (!paymentId || paymentId === 'undefined' || isNaN(paymentId)) {
        throw new Error('Invalid Payment ID - must be a valid number');
      }
      const url = `/payments/${paymentId}`;
      console.log(`Fetching payment from: ${url}`);
      const response = await apiClient.get(url);
      const payment = response.data;
      console.log('Payment API response:', payment);
      console.log('Response status:', response.status);
      
      // Handle both payment_id and id field names
      const paymentId_ = payment.payment_id || payment.id;
      if (!paymentId_) {
        console.error('Payment response missing ID field:', payment);
        throw new Error('Payment response missing ID field');
      }
      
      console.log('Successfully fetched payment with ID:', paymentId_);
      return {
        ...payment,
        id: paymentId_
      };
    } catch (error) {
      const statusCode = error.response?.status;
      const detail = error.response?.data?.detail;
      const errorMsg = detail || error.message || 'Failed to fetch payment';
      console.error(`Get payment error (Status ${statusCode}):`, errorMsg);
      console.error('Full error details:', error);
      throw new Error(errorMsg);
    }
  },

  async createPayment(data) {
    try {
      const payload = {
        org_id: data.org_id,
        invoice_id: data.invoice_id,
        payment_date: data.payment_date,
        amount: data.amount,
        method: data.method,
        reference_no: data.reference_no || null,
        notes: data.notes || null
      };
      console.log('Creating payment with payload:', payload);
      const response = await apiClient.post('/payments', payload);
      const payment = response.data;
      console.log('Create payment response:', payment);
      console.log('Response status:', response.status);
      
      // Handle both payment_id and id field names
      const paymentId = payment.payment_id || payment.id;
      if (!paymentId) {
        console.error('Payment response missing ID field:', payment);
        throw new Error('Backend did not return payment ID');
      }
      
      console.log(`Payment created with ID: ${paymentId}`);
      return {
        ...payment,
        id: paymentId
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to create payment';
      console.error('Create payment error:', errorMsg, 'Full error:', error);
      throw new Error(errorMsg);
    }
  },

  async updatePayment(paymentId, data) {
    try {
      if (!paymentId || paymentId === 'undefined' || isNaN(paymentId)) {
        throw new Error('Invalid Payment ID - must be a valid number');
      }
      const payload = {
        org_id: data.org_id,
        invoice_id: data.invoice_id,
        payment_date: data.payment_date,
        amount: data.amount,
        method: data.method,
        reference_no: data.reference_no || null,
        notes: data.notes || null
      };
      const response = await apiClient.put(`/payments/${paymentId}`, payload);
      const payment = response.data;
      return {
        ...payment,
        id: payment.payment_id || payment.id
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update payment';
      throw new Error(errorMsg);
    }
  },

  async deletePayment(paymentId) {
    try {
      if (!paymentId || paymentId === 'undefined' || isNaN(paymentId)) {
        throw new Error('Invalid Payment ID - must be a valid number');
      }
      console.log(`Deleting payment at: /payments/${paymentId}`);
      const response = await apiClient.delete(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete payment';
      console.error('Delete error details:', error.response?.data);
      throw new Error(errorMsg);
    }
  },

  async getPaymentsByOrganization(orgId) {
    try {
      const response = await apiClient.get(`/payments/organization/${orgId}`);
      const payments = Array.isArray(response.data) ? response.data : [];
      return payments.map(payment => ({
        ...payment,
        id: payment.payment_id || payment.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch payments';
      throw new Error(errorMsg);
    }
  },

  async getPaymentsByInvoice(invoiceId) {
    try {
      const response = await apiClient.get(`/payments/invoice/${invoiceId}`);
      const payments = Array.isArray(response.data) ? response.data : [];
      return payments.map(payment => ({
        ...payment,
        id: payment.payment_id || payment.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch payments';
      throw new Error(errorMsg);
    }
  }
};

export const {
  getAllPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentsByOrganization,
  getPaymentsByInvoice
} = paymentService;

export default paymentService;

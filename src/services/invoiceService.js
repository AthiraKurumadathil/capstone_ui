import apiClient from './authService';

const invoiceService = {
  async getAllInvoices() {
    try {
      const response = await apiClient.get('/invoices');
      const invoices = Array.isArray(response.data) ? response.data : [];
      return invoices.map(invoice => ({
        ...invoice,
        id: invoice.invoice_id || invoice.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch invoices';
      throw new Error(errorMsg);
    }
  },

  async getInvoice(invoiceId) {
    try {
      if (!invoiceId || invoiceId === 'undefined' || isNaN(invoiceId)) {
        throw new Error('Invalid Invoice ID - must be a valid number');
      }
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      const invoice = response.data;
      return {
        ...invoice,
        id: invoice.invoice_id || invoice.id
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch invoice';
      throw new Error(errorMsg);
    }
  },

  async createInvoice(data) {
    try {
      const payload = {
        org_id: data.org_id,
        enrollment_id: data.enrollment_id,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        total_amount: data.total_amount,
        status: data.status || 'pending'
      };
      const response = await apiClient.post('/invoices', payload);
      const invoice = response.data;
      return {
        ...invoice,
        id: invoice.invoice_id || invoice.id
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create invoice';
      throw new Error(errorMsg);
    }
  },

  async updateInvoice(invoiceId, data) {
    try {
      if (!invoiceId || invoiceId === 'undefined' || isNaN(invoiceId)) {
        throw new Error('Invalid Invoice ID - must be a valid number');
      }
      const payload = {
        org_id: data.org_id,
        enrollment_id: data.enrollment_id,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        total_amount: data.total_amount,
        status: data.status || 'pending'
      };
      const response = await apiClient.put(`/invoices/${invoiceId}`, payload);
      const invoice = response.data;
      return {
        ...invoice,
        id: invoice.invoice_id || invoice.id
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update invoice';
      throw new Error(errorMsg);
    }
  },

  async deleteInvoice(invoiceId) {
    try {
      if (!invoiceId || invoiceId === 'undefined' || isNaN(invoiceId)) {
        throw new Error('Invalid Invoice ID - must be a valid number');
      }
      console.log(`Deleting invoice at: /invoices/${invoiceId}`);
      const response = await apiClient.delete(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete invoice';
      console.error('Delete error details:', error.response?.data);
      throw new Error(errorMsg);
    }
  },

  async getInvoicesByOrganization(orgId) {
    try {
      console.log(`Fetching invoices for organization ${orgId}`);
      const response = await apiClient.get(`/invoices/organization/${orgId}`);
      const invoices = Array.isArray(response.data) ? response.data : [];
      console.log(`Invoices response for org ${orgId}:`, invoices);
      return invoices.map(invoice => ({
        ...invoice,
        id: invoice.invoice_id || invoice.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch invoices';
      console.error(`Error fetching invoices for org ${orgId}:`, errorMsg);
      throw new Error(errorMsg);
    }
  },

  async getInvoicesByEnrollment(enrollmentId) {
    try {
      const response = await apiClient.get(`/invoices/enrollment/${enrollmentId}`);
      const invoices = Array.isArray(response.data) ? response.data : [];
      return invoices.map(invoice => ({
        ...invoice,
        id: invoice.invoice_id || invoice.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch invoices';
      throw new Error(errorMsg);
    }
  }
};

export const {
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByOrganization,
  getInvoicesByEnrollment
} = invoiceService;

export default invoiceService;

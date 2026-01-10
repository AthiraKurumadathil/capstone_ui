import apiClient from './authService';

const enrollmentService = {
  async getAllEnrollments() {
    try {
      const response = await apiClient.get('/enrollments');
      const enrollments = Array.isArray(response.data) ? response.data : [];
      return enrollments.map(enrollment => ({
        ...enrollment,
        id: enrollment.enrollment_id || enrollment.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch enrollments';
      throw new Error(errorMsg);
    }
  },

  async getEnrollment(enrollmentId) {
    try {
      if (!enrollmentId || enrollmentId === 'undefined' || isNaN(enrollmentId)) {
        throw new Error('Invalid Enrollment ID - must be a valid number');
      }
      const url = `/enrollments/${enrollmentId}`;
      console.log(`Fetching enrollment from: ${url}`);
      const response = await apiClient.get(url);
      const enrollment = response.data;
      console.log('Enrollment API response:', enrollment);
      
      const enrollmentId_ = enrollment.enrollment_id || enrollment.id;
      if (!enrollmentId_) {
        console.error('Enrollment response missing ID field:', enrollment);
        throw new Error('Enrollment response missing ID field');
      }
      
      console.log('Successfully fetched enrollment with ID:', enrollmentId_);
      return {
        ...enrollment,
        id: enrollmentId_
      };
    } catch (error) {
      const statusCode = error.response?.status;
      const detail = error.response?.data?.detail;
      const errorMsg = detail || error.message || 'Failed to fetch enrollment';
      console.error(`Get enrollment error (Status ${statusCode}):`, errorMsg);
      throw new Error(errorMsg);
    }
  },

  async createEnrollment(data) {
    try {
      const payload = {
        org_id: data.org_id,
        batch_id: data.batch_id,
        student_id: data.student_id,
        enrolled_on: data.enrolled_on,
        status: data.status
      };
      console.log('Creating enrollment with payload:', payload);
      const response = await apiClient.post('/enrollments', payload);
      const enrollment = response.data;
      console.log('Create enrollment response:', enrollment);
      
      const enrollmentId = enrollment.enrollment_id || enrollment.id;
      if (!enrollmentId) {
        console.error('Enrollment response missing ID field:', enrollment);
        throw new Error('Backend did not return enrollment ID');
      }
      
      console.log(`Enrollment created with ID: ${enrollmentId}`);
      return {
        ...enrollment,
        id: enrollmentId
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to create enrollment';
      console.error('Create enrollment error:', errorMsg, 'Full error:', error);
      throw new Error(errorMsg);
    }
  },

  async updateEnrollment(enrollmentId, data) {
    try {
      if (!enrollmentId || enrollmentId === 'undefined' || isNaN(enrollmentId)) {
        throw new Error('Invalid Enrollment ID - must be a valid number');
      }
      const payload = {
        org_id: data.org_id,
        batch_id: data.batch_id,
        student_id: data.student_id,
        enrolled_on: data.enrolled_on,
        status: data.status
      };
      const response = await apiClient.put(`/enrollments/${enrollmentId}`, payload);
      console.log('Update enrollment response:', response.data);
      
      const enrollment = response.data;
      const enrollment_id = enrollment.enrollment_id || enrollment.id;
      
      return {
        ...enrollment,
        id: enrollment_id
      };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to update enrollment';
      console.error('Update enrollment error:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  async deleteEnrollment(enrollmentId) {
    try {
      if (!enrollmentId || enrollmentId === 'undefined' || isNaN(enrollmentId)) {
        throw new Error('Invalid Enrollment ID - must be a valid number');
      }
      const response = await apiClient.delete(`/enrollments/${enrollmentId}`);
      console.log('Delete enrollment response:', response.data);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to delete enrollment';
      console.error('Delete enrollment error:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  async getEnrollmentsByStudent(studentId) {
    try {
      if (!studentId || isNaN(studentId)) {
        throw new Error('Invalid Student ID');
      }
      const response = await apiClient.get(`/enrollments/student/${studentId}`);
      const enrollments = Array.isArray(response.data) ? response.data : [];
      return enrollments.map(enrollment => ({
        ...enrollment,
        id: enrollment.enrollment_id || enrollment.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch enrollments';
      throw new Error(errorMsg);
    }
  },

  async getEnrollmentsByBatch(batchId) {
    try {
      if (!batchId || isNaN(batchId)) {
        throw new Error('Invalid Batch ID');
      }
      const response = await apiClient.get(`/enrollments/batch/${batchId}`);
      const enrollments = Array.isArray(response.data) ? response.data : [];
      return enrollments.map(enrollment => ({
        ...enrollment,
        id: enrollment.enrollment_id || enrollment.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch enrollments';
      throw new Error(errorMsg);
    }
  },

  async getEnrollmentsByOrganization(orgId) {
    try {
      if (!orgId || isNaN(orgId)) {
        throw new Error('Invalid Organization ID');
      }
      const response = await apiClient.get(`/enrollments/organization/${orgId}`);
      const enrollments = Array.isArray(response.data) ? response.data : [];
      return enrollments.map(enrollment => ({
        ...enrollment,
        id: enrollment.enrollment_id || enrollment.id
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch enrollments';
      throw new Error(errorMsg);
    }
  }
};

export const getAllEnrollments = enrollmentService.getAllEnrollments.bind(enrollmentService);
export const getEnrollment = enrollmentService.getEnrollment.bind(enrollmentService);
export const createEnrollment = enrollmentService.createEnrollment.bind(enrollmentService);
export const updateEnrollment = enrollmentService.updateEnrollment.bind(enrollmentService);
export const deleteEnrollment = enrollmentService.deleteEnrollment.bind(enrollmentService);
export const getEnrollmentsByStudent = enrollmentService.getEnrollmentsByStudent.bind(enrollmentService);
export const getEnrollmentsByBatch = enrollmentService.getEnrollmentsByBatch.bind(enrollmentService);
export const getEnrollmentsByOrganization = enrollmentService.getEnrollmentsByOrganization.bind(enrollmentService);

export default enrollmentService;

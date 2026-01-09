import apiClient from './authService';

export const getAllStudents = async () => {
  try {
    const response = await apiClient.get('/students');
    console.log('Students response:', response.data);
    
    let students = response.data;
    
    // Handle wrapped response
    if (students && typeof students === 'object' && students.data && Array.isArray(students.data)) {
      students = students.data;
    }
    
    // Ensure it's an array
    if (!Array.isArray(students)) {
      console.warn('Students response is not an array:', students);
      return [];
    }
    
    // Map student_id to id for consistency
    return students.map(student => ({
      ...student,
      id: student.id || student.student_id,
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch students';
    console.error('Error fetching students:', errorMessage);
    const err = new Error(errorMessage);
    err.detail = errorMessage;
    throw err;
  }
};

export const getStudent = async (studentId) => {
  try {
    const response = await apiClient.get(`/students/${studentId}`);
    const student = response.data;
    
    // Map student_id to id for consistency
    return {
      ...student,
      id: student.id || student.student_id,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch student';
    console.error(`Error fetching student ${studentId}:`, errorMessage);
    const err = new Error(errorMessage);
    err.detail = errorMessage;
    throw err;
  }
};

export const createStudent = async (studentData) => {
  try {
    const response = await apiClient.post('/students', studentData);
    console.log('Create student response:', response.data);
    
    const student = response.data;
    return {
      ...student,
      id: student.id || student.student_id,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to create student';
    console.error('Error creating student:', errorMessage);
    const err = new Error(errorMessage);
    err.detail = errorMessage;
    throw err;
  }
};

export const updateStudent = async (studentId, studentData) => {
  try {
    const response = await apiClient.put(`/students/${studentId}`, studentData);
    console.log('Update student response:', response.data);
    
    const student = response.data;
    return {
      ...student,
      id: student.id || student.student_id,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to update student';
    console.error('Error updating student:', errorMessage);
    const err = new Error(errorMessage);
    err.detail = errorMessage;
    throw err;
  }
};

export const deleteStudent = async (studentId) => {
  try {
    const response = await apiClient.delete(`/students/${studentId}`);
    console.log('Delete student response:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to delete student';
    console.error('Error deleting student:', errorMessage);
    const err = new Error(errorMessage);
    err.detail = errorMessage;
    throw err;
  }
};

export const getStudentsByOrganization = async (orgId) => {
  try {
    const response = await apiClient.get(`/students/organization/${orgId}`);
    console.log(`Students for org ${orgId}:`, response.data);
    
    let students = response.data;
    
    // Handle wrapped response
    if (students && typeof students === 'object' && students.data && Array.isArray(students.data)) {
      students = students.data;
    }
    
    // Ensure it's an array
    if (!Array.isArray(students)) {
      return [];
    }
    
    return students.map(student => ({
      ...student,
      id: student.id || student.student_id,
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch students';
    console.error(`Error fetching students for org ${orgId}:`, errorMessage);
    const err = new Error(errorMessage);
    err.detail = errorMessage;
    throw err;
  }
};

import apiClient, { getToken } from './authService';

// Check if interceptor is already added to avoid duplicates
let interceptorAdded = false;

if (!interceptorAdded) {
  // Add Authorization header to all requests (except OPTIONS)
  apiClient.interceptors.request.use((config) => {
    // Don't add auth header for preflight requests
    if (config.method !== 'options') {
      const token = getToken();
      console.log('Token available:', !!token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set for:', config.url);
      } else {
        console.warn('No token found for request');
      }
    }
    return config;
  });

  // Add response interceptor for error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log full error details
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
      return Promise.reject(error);
    }
  );

  interceptorAdded = true;
}

// Get all attendance records
export const getAllAttendance = async () => {
  try {
    console.log('Fetching attendance from:', apiClient.defaults.baseURL + '/attendance');
    const response = await apiClient.get('/attendance');
    console.log('Attendance raw response:', response.data);
    
    // Log first attendance structure
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('First attendance structure:', response.data[0]);
    }
    
    // Normalize the response
    let attendance = response.data;
    if (Array.isArray(attendance)) {
      attendance = attendance.map(att => ({
        ...att,
        id: att.attendance_id || att.id
      }));
    }
    
    console.log('Attendance after normalization:', attendance);
    return attendance;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to fetch attendance';
    throw { message: errorMessage };
  }
};

// Get single attendance record
export const getAttendance = async (attendanceId) => {
  try {
    console.log('Fetching attendance with ID:', attendanceId);
    const response = await apiClient.get(`/attendance/${attendanceId}`);
    const attendance = response.data;
    
    console.log('Attendance response:', attendance);
    
    return {
      ...attendance,
      id: attendance.attendance_id || attendance.id
    };
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error.response?.data || { message: 'Failed to fetch attendance' };
  }
};

// Get attendance by session
export const getAttendanceBySession = async (sessionId) => {
  try {
    console.log('Fetching attendance for session:', sessionId);
    const response = await apiClient.get(`/attendance/session/${sessionId}`);
    console.log('Attendance by session response:', response.data);
    
    let attendance = response.data;
    if (Array.isArray(attendance)) {
      attendance = attendance.map(att => ({
        ...att,
        id: att.attendance_id || att.id
      }));
    }
    
    return attendance;
  } catch (error) {
    console.error('Error fetching attendance by session:', error);
    throw error.response?.data || { message: 'Failed to fetch attendance' };
  }
};

// Get attendance by enrollment
export const getAttendanceByEnrollment = async (enrollmentId) => {
  try {
    console.log('Fetching attendance for enrollment:', enrollmentId);
    const response = await apiClient.get(`/attendance/enrollment/${enrollmentId}`);
    console.log('Attendance by enrollment response:', response.data);
    
    let attendance = response.data;
    if (Array.isArray(attendance)) {
      attendance = attendance.map(att => ({
        ...att,
        id: att.attendance_id || att.id
      }));
    }
    
    return attendance;
  } catch (error) {
    console.error('Error fetching attendance by enrollment:', error);
    throw error.response?.data || { message: 'Failed to fetch attendance' };
  }
};

// Create attendance
export const createAttendance = async (attendanceData) => {
  try {
    console.log('Creating attendance with data:', attendanceData);
    const response = await apiClient.post('/attendance', attendanceData);
    console.log('Create attendance response:', response.data);
    
    const attendance = response.data;
    return {
      ...attendance,
      id: attendance.attendance_id || attendance.id
    };
  } catch (error) {
    console.error('Error creating attendance:', error);
    console.error('Error response data:', error.response?.data);
    // Handle validation errors from backend
    let errorMessage = 'Failed to create attendance';
    if (error.response?.data) {
      const data = error.response.data;
      console.log('Detailed error response:', JSON.stringify(data, null, 2));
      if (data.detail) {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (typeof data === 'object') {
        // For validation error objects with field-level errors
        const errors = Object.entries(data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
        errorMessage = errors || 'Validation failed';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw { message: errorMessage };
  }
};

// Update attendance
export const updateAttendance = async (attendanceId, attendanceData) => {
  try {
    console.log('Updating attendance:', attendanceId, 'with data:', attendanceData);
    const response = await apiClient.put(`/attendance/${attendanceId}`, attendanceData);
    console.log('Update attendance response:', response.data);
    
    const attendance = response.data;
    return {
      ...attendance,
      id: attendance.attendance_id || attendance.id
    };
  } catch (error) {
    console.error('Error updating attendance:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to update attendance';
    throw { message: errorMessage };
  }
};

// Delete attendance
export const deleteAttendance = async (attendanceId) => {
  try {
    console.log('Deleting attendance:', attendanceId);
    const response = await apiClient.delete(`/attendance/${attendanceId}`);
    console.log('Delete attendance response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting attendance:', error);
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to delete attendance';
    throw { message: errorMessage };
  }
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAttendance, updateAttendance, getAttendance } from '../../services/attendanceService';
import { getAllSessions } from '../../services/sessionService';
import { getAllEnrollments } from '../../services/enrollmentService';
import { getAllBatches } from '../../services/batchService';
import { getAllStudents } from '../../services/studentService';
import './AttendanceForm.css';

const AttendanceForm = () => {
  const [formData, setFormData] = useState({
    session_id: '',
    enrollment_id: '',
    status: 'present',
    marked_at: new Date().toISOString().slice(0, 16),
    marked_by: '',
    start_time: '',
    end_time: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

  const navigate = useNavigate();
  const { attendanceId } = useParams();

  // Get user and org info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role_name?.toLowerCase().trim() === 'super admin';
  const userOrgId = parseInt(user.org_id) || null;

  useEffect(() => {
    fetchSessions();
    fetchEnrollments();
    if (attendanceId) {
      loadAttendance();
    }
  }, [attendanceId]);

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await getAllSessions();
      let sessionsData = Array.isArray(data) ? data : [];
      
      console.log('All sessions:', sessionsData);
      console.log('User org_id:', userOrgId, 'Is Super Admin:', isSuperAdmin);
      
      // If not Super Admin, filter by user organization
      if (!isSuperAdmin && userOrgId) {
        // Get all batches to filter by organization
        const allBatches = await getAllBatches();
        const userOrgBatches = Array.isArray(allBatches)
          ? allBatches.filter(batch => batch.org_id === userOrgId)
          : [];
        
        const userOrgBatchIds = userOrgBatches.map(batch => batch.id || batch.batch_id);
        console.log('User org batches:', userOrgBatchIds);
        
        // Filter sessions to only those in user's org batches
        sessionsData = sessionsData.filter(session =>
          userOrgBatchIds.includes(session.batch_id)
        );
        
        console.log('Sessions filtered to org:', sessionsData);
      }
      
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true);
      const data = await getAllEnrollments();
      let enrollmentsData = Array.isArray(data) ? data : [];
      
      console.log('All enrollments fetched:', enrollmentsData.length);
      console.log('User org_id:', userOrgId, 'Is Super Admin:', isSuperAdmin);
      
      // If not Super Admin, filter by user organization
      if (!isSuperAdmin && userOrgId) {
        // Get all students to filter by organization
        const allStudents = await getAllStudents();
        const userOrgStudents = Array.isArray(allStudents)
          ? allStudents.filter(student => student.org_id === userOrgId)
          : [];
        
        const userOrgStudentIds = userOrgStudents.map(student => student.id || student.student_id);
        console.log('User org students:', userOrgStudentIds);
        
        // Filter enrollments to only those for user's org students
        enrollmentsData = enrollmentsData.filter(enrollment =>
          userOrgStudentIds.includes(enrollment.student_id)
        );
        
        console.log('Enrollments filtered to org:', enrollmentsData);
      }
      
      setEnrollments(enrollmentsData);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      console.error('Error message:', err.message);
      console.error('Setting enrollments to empty array');
      setEnrollments([]);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      setPageLoading(true);
      setIsEditMode(true);
      const data = await getAttendance(attendanceId);
      setFormData({
        session_id: data.session_id || '',
        enrollment_id: data.enrollment_id || '',
        status: data.status || 'present',
        marked_at: data.marked_at ? data.marked_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
        marked_by: data.marked_by || '',
      });
    } catch (err) {
      setServerError(err.message || 'Failed to load attendance');
    } finally {
      setPageLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.session_id || isNaN(parseInt(formData.session_id, 10))) {
      newErrors.session_id = 'Valid session is required';
    }

    if (!formData.enrollment_id || isNaN(parseInt(formData.enrollment_id, 10))) {
      newErrors.enrollment_id = 'Valid enrollment is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (!formData.marked_at) {
      newErrors.marked_at = 'Marked at timestamp is required';
    } else if (formData.session_id) {
      // Validate that marked_at is equal to or greater than session date
      const strSessionId = String(formData.session_id).trim();
      const session = sessions.find(s => {
        const sId = String(s.session_id || s.id || '').trim();
        return sId === strSessionId;
      });

      if (session && session.session_date) {
        const sessionDate = new Date(session.session_date);
        const markedDate = new Date(formData.marked_at);
        
        // Extract date parts to compare only dates (ignoring time)
        const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
        const markedDateOnly = new Date(markedDate.getFullYear(), markedDate.getMonth(), markedDate.getDate());
        
        if (markedDateOnly < sessionDateOnly) {
          newErrors.marked_at = 'Marked date cannot be before the session date';
        }
      }
    }

    // Validate marked_by if provided - must be a valid integer
    if (formData.marked_by && typeof formData.marked_by === 'string' && formData.marked_by.trim()) {
      if (isNaN(parseInt(formData.marked_by.trim(), 10))) {
        newErrors.marked_by = 'Marked by must be a valid user ID (number)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const getSessionDate = (sessionId) => {
    if (!sessionId) return '-';
    
    // Convert to string for comparison since dropdown values are strings
    const strSessionId = String(sessionId).trim();
    
    const session = sessions.find(s => {
      const sId = String(s.session_id || s.id || '').trim();
      return sId === strSessionId;
    });
    
    if (session) {
      console.log('Found session with date:', session.session_date);
      return session.session_date 
        ? new Date(session.session_date).toLocaleDateString() 
        : '-';
    }
    
    console.log('Session not found for ID:', strSessionId, 'Available:', sessions.map(s => ({ id: s.session_id || s.id })));
    return '-';
  };

  const getSessionStartTime = (sessionId) => {
    if (!sessionId) return '-';
    
    const strSessionId = String(sessionId).trim();
    const session = sessions.find(s => {
      const sId = String(s.session_id || s.id || '').trim();
      return sId === strSessionId;
    });
    
    return session && session.start_time ? session.start_time : '-';
  };

  const getSessionEndTime = (sessionId) => {
    if (!sessionId) return '-';
    
    const strSessionId = String(sessionId).trim();
    const session = sessions.find(s => {
      const sId = String(s.session_id || s.id || '').trim();
      return sId === strSessionId;
    });
    
    return session && session.end_time ? session.end_time : '-';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      // Form has validation errors, they will be displayed
      setServerError('Please fix the errors below before submitting');
      return;
    }

    setIsLoading(true);

    try {
      // Convert marked_at from datetime-local format to full ISO 8601 format
      let markedAtISO = formData.marked_at;
      if (formData.marked_at && !formData.marked_at.includes('Z') && !formData.marked_at.includes('+')) {
        // If it's in format YYYY-MM-DDTHH:mm, add seconds and Z
        markedAtISO = formData.marked_at + ':00Z';
      }

      const submitData = {
        session_id: parseInt(formData.session_id, 10),
        enrollment_id: parseInt(formData.enrollment_id, 10),
        status: formData.status.trim(),
        marked_at: markedAtISO,
      };
      
      // Only add marked_by if it has a value and is a valid integer
      if (formData.marked_by && typeof formData.marked_by === 'string' && formData.marked_by.trim()) {
        const markedById = parseInt(formData.marked_by.trim(), 10);
        if (!isNaN(markedById)) {
          submitData.marked_by = markedById;
        }
      } else if (formData.marked_by && typeof formData.marked_by === 'number') {
        submitData.marked_by = formData.marked_by;
      }

      console.log('Submitting attendance data:', submitData);

      if (isEditMode) {
        await updateAttendance(attendanceId, submitData);
      } else {
        await createAttendance(submitData);
      }
      navigate('/attendance');
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setServerError(err.message || 'Failed to save attendance record');
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="attendance-form-container">
        <div className="attendance-form-loading">Loading attendance details...</div>
      </div>
    );
  }

  return (
    <div className="attendance-form-container">
      <button 
        className="btn btn-secondary"
        onClick={() => navigate('/attendance')}
        style={{ marginBottom: '20px' }}
      >
        ← Back to Attendance
      </button>

      <div className="attendance-form-card">
        <h2>{isEditMode ? 'Edit Attendance Record' : 'Record New Attendance'}</h2>

        {serverError && <div className="attendance-form-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="attendance-form-row">
            <div className="attendance-form-group">
              <label htmlFor="session_id">Session *</label>
              <select
                id="session_id"
                name="session_id"
                value={String(formData.session_id)}
                onChange={handleChange}
                className={errors.session_id ? 'attendance-form-input error' : 'attendance-form-input'}
                disabled={sessionsLoading}
              >
                <option value="">{sessionsLoading ? 'Loading sessions...' : 'Select a session'}</option>
                {sessions.map(session => (
                  <option key={session.session_id || session.id} value={String(session.session_id || session.id)}>
                    {session.session_name || `Session ${session.session_id || session.id}`}
                  </option>
                ))}
              </select>
              {errors.session_id && <span className="attendance-form-error-msg">{errors.session_id}</span>}
            </div>

            <div className="attendance-form-group">
              <label htmlFor="session_date">Session Date</label>
              <input
                type="text"
                id="session_date"
                name="session_date"
                value={getSessionDate(formData.session_id)}
                readOnly
                className="attendance-form-input"
                style={{ backgroundColor: '#f5f5f5' }}
              />
            </div>
          </div>

          <div className="attendance-form-row">
            <div className="attendance-form-group">
              <label htmlFor="start_time">Start Time</label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="attendance-form-input"
              />
            </div>

            <div className="attendance-form-group">
              <label htmlFor="end_time">End Time</label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="attendance-form-input"
              />
            </div>

            <div className="attendance-form-group">
              <label htmlFor="enrollment_id">Enrollment ID *</label>
              {enrollments.length > 0 ? (
                <select
                  id="enrollment_id"
                  name="enrollment_id"
                  value={String(formData.enrollment_id)}
                  onChange={handleChange}
                  className={errors.enrollment_id ? 'attendance-form-input error' : 'attendance-form-input'}
                  disabled={enrollmentsLoading}
                >
                  <option value="">{enrollmentsLoading ? 'Loading enrollments...' : 'Select an enrollment'}</option>
                  {enrollments.map(enrollment => (
                    <option key={enrollment.id} value={String(enrollment.id)}>
                      {enrollment.id}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  id="enrollment_id"
                  name="enrollment_id"
                  value={formData.enrollment_id}
                  onChange={handleChange}
                  className={errors.enrollment_id ? 'attendance-form-input error' : 'attendance-form-input'}
                  placeholder="Enter enrollment ID"
                  min="1"
                />
              )}
              {errors.enrollment_id && <span className="attendance-form-error-msg">{errors.enrollment_id}</span>}
            </div>
          </div>

          <div className="attendance-form-row">
            <div className="attendance-form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={errors.status ? 'attendance-form-input error' : 'attendance-form-input'}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
              {errors.status && <span className="attendance-form-error-msg">{errors.status}</span>}
            </div>

            <div className="attendance-form-group">
              <label htmlFor="marked_at">Marked At *</label>
              <input
                type="datetime-local"
                id="marked_at"
                name="marked_at"
                value={formData.marked_at}
                onChange={handleChange}
                className={errors.marked_at ? 'attendance-form-input error' : 'attendance-form-input'}
              />
              {errors.marked_at && <span className="attendance-form-error-msg">{errors.marked_at}</span>}
            </div>
          </div>

          <div className="attendance-form-group">
            <label htmlFor="marked_by">Marked By</label>
            <input
              type="text"
              id="marked_by"
              name="marked_by"
              value={formData.marked_by}
              onChange={handleChange}
              className={errors.marked_by ? 'attendance-form-input error' : 'attendance-form-input'}
              placeholder="Enter user ID who marked attendance (optional)"
            />
            {errors.marked_by && <span className="attendance-form-error-msg">{errors.marked_by}</span>}
          </div>

          <div className="attendance-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update Record' : 'Record Attendance')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/attendance')}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;

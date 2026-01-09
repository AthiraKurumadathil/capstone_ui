import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStudents, deleteStudent } from '../../services/studentService';
import './StudentList.css';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await getAllStudents();
      setStudents(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load students';
      setError(errorMsg);
      console.error('Fetch error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    try {
      await deleteStudent(studentId);
      setStudents(students.filter(student => student.id !== studentId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete student');
    }
  };

  const handleEdit = (studentId) => {
    navigate(`/students/edit/${studentId}`);
  };

  const handleView = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  if (isLoading) {
    return <div className="student-loading">Loading students...</div>;
  }

  return (
    <div className="student-list-container">
      <button 
        className="btn btn-secondary student-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="student-list-header">
        <h2>Students</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/students/create')}
        >
          + Create Student
        </button>
      </div>

      {error && <div className="student-error">{error}</div>}

      {students.length === 0 ? (
        <div className="student-empty">
          <p>No students found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/students/create')}
          >
            Create your first student
          </button>
        </div>
      ) : (
        <div className="student-table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organization</th>
                <th>DOB</th>
                <th>Guardian Name</th>
                <th>Guardian Phone</th>
                <th>Guardian Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td className="student-name">{student.first_name} {student.last_name}</td>
                  <td>{student.org_id}</td>
                  <td>{student.dob ? new Date(student.dob).toLocaleDateString() : '-'}</td>
                  <td>{student.guardian_name || '-'}</td>
                  <td>{student.guardian_phone || '-'}</td>
                  <td>{student.guardian_email || '-'}</td>
                  <td>
                    <span className={`student-status ${student.active ? 'active' : 'inactive'}`}>
                      {student.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="student-actions">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleView(student.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(student.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(student.id)}
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
        <div className="student-modal-overlay">
          <div className="student-modal">
            <h3>Delete Student</h3>
            <p>Are you sure you want to delete this student?</p>
            <div className="student-modal-actions">
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

export default StudentList;

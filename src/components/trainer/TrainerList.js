import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTrainers, deleteTrainer } from '../../services/trainerService';
import './TrainerList.css';

const TrainerList = () => {
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllTrainers();
      setTrainers(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load trainers';
      setError(errorMsg);
      console.error('Fetch error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (trainerId) => {
    try {
      await deleteTrainer(trainerId);
      setTrainers(trainers.filter(trainer => trainer.id !== trainerId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete trainer');
    }
  };

  const handleEdit = (trainerId) => {
    navigate(`/trainers/edit/${trainerId}`);
  };

  const handleView = (trainerId) => {
    navigate(`/trainers/${trainerId}`);
  };

  if (isLoading) {
    return <div className="trainer-loading">Loading trainers...</div>;
  }

  return (
    <div className="trainer-list-container">
      <button 
        className="btn btn-secondary trainer-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="trainer-list-header">
        <h2>Trainers</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/trainers/create')}
        >
          + Create Trainer
        </button>
      </div>

      {error && <div className="trainer-error">{error}</div>}

      {trainers.length === 0 ? (
        <div className="trainer-empty">
          <p>No trainers found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/trainers/create')}
          >
            Create your first trainer
          </button>
        </div>
      ) : (
        <div className="trainer-table-wrapper">
          <table className="trainer-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Organization ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map(trainer => (
                <tr key={trainer.id}>
                  <td className="trainer-name">{trainer.first_name || '-'}</td>
                  <td>{trainer.last_name || '-'}</td>
                  <td>{trainer.email || '-'}</td>
                  <td>{trainer.phone || '-'}</td>
                  <td>{trainer.org_id || '-'}</td>
                  <td>
                    <span className={`trainer-status ${trainer.active ? 'active' : 'inactive'}`}>
                      {trainer.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="trainer-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleView(trainer.id)}
                      title="View trainer details"
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(trainer.id)}
                      title="Edit trainer"
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(trainer.id)}
                      title="Delete trainer"
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
        <div className="trainer-delete-modal">
          <div className="trainer-delete-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this trainer? This action cannot be undone.</p>
            <div className="trainer-delete-actions">
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerList;

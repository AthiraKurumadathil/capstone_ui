import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategory, deleteCategory } from '../../services/categoryService';
import './CategoryDetail.css';

const CategoryDetail = () => {
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const { categoryId } = useParams();

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setIsLoading(true);
      const categoryIdInt = parseInt(categoryId, 10);
      if (isNaN(categoryIdInt)) {
        setError('Invalid category ID');
        return;
      }
      const data = await getCategory(categoryIdInt);
      setCategory(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load category');
      console.error('Error loading category:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id);
      alert('Category deleted successfully');
      navigate('/categories');
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const handleEdit = () => {
    navigate(`/categories/edit/${category.id}`);
  };

  if (isLoading) {
    return <div className="category-detail-loading">Loading category details...</div>;
  }

  if (error) {
    return <div className="category-detail-error">{error}</div>;
  }

  if (!category) {
    return <div className="category-detail-error">Category not found</div>;
  }

  return (
    <div className="category-detail-container">
      <button 
        className="btn btn-secondary category-detail-back-btn"
        onClick={() => navigate('/categories')}
      >
        ← Back to Categories
      </button>

      <div className="category-detail-card">
        <h2>Category Details</h2>

        <div className="category-detail-grid">
          <div className="category-detail-item">
            <label>Name</label>
            <p>{category.name}</p>
          </div>

          <div className="category-detail-item">
            <label>Status</label>
            <span className={`category-status ${category.active ? 'active' : 'inactive'}`}>
              {category.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="category-detail-actions">
          <button 
            className="btn btn-primary"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => setDeleteConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Category</h3>
            <p>Are you sure you want to delete this category?</p>
            <div className="modal-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
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

export default CategoryDetail;

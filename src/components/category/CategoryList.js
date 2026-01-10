import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories, deleteCategory } from '../../services/categoryService';
import './CategoryList.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      const errorMsg = err.message || 'Failed to load categories';
      setError(errorMsg);
      console.error('Fetch error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter(cat => cat.id !== categoryId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const handleEdit = (categoryId) => {
    navigate(`/categories/edit/${categoryId}`);
  };

  const handleView = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  if (isLoading) {
    return <div className="category-loading">Loading categories...</div>;
  }

  return (
    <div className="category-list-container">
      <button 
        className="btn btn-secondary category-back-btn"
        onClick={() => navigate('/home')}
      >
        ← Back to Menu
      </button>
      <div className="category-list-header">
        <h2>Categories</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/categories/create')}
        >
          + Create Category
        </button>
      </div>

      {error && <div className="category-error">{error}</div>}

      {categories.length === 0 ? (
        <div className="category-empty-state">
          <p>No categories found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/categories/create')}
          >
            Create your first category
          </button>
        </div>
      ) : (
        <div className="category-table-wrapper">
          <table className="category-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td className="category-name">{category.name}</td>
                  <td>
                    <span className={`category-status ${category.active ? 'active' : 'inactive'}`}>
                      {category.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="category-actions">
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => handleView(category.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(category.id)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteConfirm(category.id)}
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Category</h3>
            <p>Are you sure you want to delete this category?</p>
            <div className="modal-buttons">
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

export default CategoryList;

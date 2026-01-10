import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCategory, updateCategory, getCategory } from '../../services/categoryService';
import './CategoryForm.css';

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const navigate = useNavigate();
  const { categoryId } = useParams();

  useEffect(() => {
    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setPageLoading(true);
      setIsEditMode(true);
      const categoryIdInt = parseInt(categoryId, 10);
      if (isNaN(categoryIdInt)) {
        setServerError('Invalid category ID');
        return;
      }
      const data = await getCategory(categoryIdInt);
      setFormData({
        name: data.name || '',
        active: data.active !== undefined ? data.active : true,
      });
    } catch (err) {
      setServerError(err.message || 'Failed to load category');
    } finally {
      setPageLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      setServerError('Please fix the errors below before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        active: formData.active,
      };

      if (isEditMode) {
        const categoryIdInt = parseInt(categoryId, 10);
        await updateCategory(categoryIdInt, submitData);
        alert('Category updated successfully');
      } else {
        await createCategory(submitData);
        alert('Category created successfully');
      }
      navigate('/categories');
    } catch (error) {
      let message = 'Failed to save category';
      
      if (error.errors && Array.isArray(error.errors)) {
        message = error.errors.map(err => `${err.loc?.[1] || 'Field'}: ${err.msg}`).join(', ');
      } else if (error.detail) {
        message = error.detail;
      } else if (error.message) {
        message = error.message;
      }
      
      setServerError(message);
      console.error('Error saving category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="category-form-loading">Loading category data...</div>;
  }

  return (
    <div className="category-form-container">
      <div className="category-form-card">
        <h2>{isEditMode ? 'Edit Category' : 'Create New Category'}</h2>

        {serverError && <div className="category-form-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="category-form-group">
            <label htmlFor="name">Category Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'category-form-input input-error' : 'category-form-input'}
              placeholder="Enter category name"
            />
            {errors.name && <span className="category-form-error-msg">{errors.name}</span>}
          </div>

          <div className="category-form-group">
            <label htmlFor="active">
              <input
                id="active"
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          <div className="category-form-actions">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/categories')}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;

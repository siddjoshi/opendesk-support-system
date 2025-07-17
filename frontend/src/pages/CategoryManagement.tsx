import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FolderIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  articleCount: number;
  subcategories: Category[];
}

interface CategoryForm {
  name: string;
  description: string;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
}

const CategoryManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<CategoryForm>({
    name: '',
    description: '',
    parentId: null,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/knowledge-base');
      return;
    }
    
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories/tree?includeInactive=true');
      if (!response.ok) throw new Error('Failed to load categories');
      
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'parentId' ? (value ? parseInt(value) : null) : 
               name === 'sortOrder' ? parseInt(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories',
        {
          method: editingCategory ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      await loadCategories();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }

      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentId: null,
      isActive: true,
      sortOrder: 0,
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const toggleExpanded = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getAllCategories = (categories: Category[], level = 0): Array<Category & { level: number }> => {
    let result: Array<Category & { level: number }> = [];
    
    for (const category of categories) {
      result.push({ ...category, level });
      if (category.subcategories.length > 0) {
        result = result.concat(getAllCategories(category.subcategories, level + 1));
      }
    }
    
    return result;
  };

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg mb-2">
          <div className="flex items-center space-x-3">
            {category.subcategories.length > 0 && (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedCategories.has(category.id) ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            )}
            <FolderIcon className="h-5 w-5 text-gray-400" />
            <div>
              <h3 className={`font-medium ${category.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {category.name}
                {!category.isActive && (
                  <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Inactive
                  </span>
                )}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {category.articleCount} articles
            </span>
            <button
              onClick={() => handleEdit(category)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(category)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {category.subcategories.length > 0 && expandedCategories.has(category.id) && (
          <div className="ml-4">
            {renderCategoryTree(category.subcategories, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading && !showForm) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-600 mt-2">Manage knowledge base categories</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Category
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category
                  </label>
                  <select
                    id="parentId"
                    name="parentId"
                    value={formData.parentId || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No parent (root category)</option>
                    {getAllCategories(categories)
                      .filter(cat => cat.id !== editingCategory?.id)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {'—'.repeat(category.level)} {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      id="sortOrder"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {categories.length > 0 ? (
            renderCategoryTree(categories)
          ) : (
            <div className="text-center py-8 text-gray-500">
              No categories found. Create your first category to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
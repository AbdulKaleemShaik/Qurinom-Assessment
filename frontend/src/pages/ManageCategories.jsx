import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiGrid } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { categoryAPI } from '../api/axios';
import CategoryForm from '../components/CategoryForm';
import ConfirmModal from '../components/ConfirmModal';
import './ManageCategories.css';

function ManageCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await categoryAPI.getAllCategories();
            if (res.success) {
                setCategories(res.data);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data) => {
        try {
            await categoryAPI.createCategory(data);
            toast.success('Category saved successfully');
            setShowForm(false);
            loadCategories();
        } catch (error) {
            toast.error(error.message || 'Failed to create category');
        }
    };

    const handleUpdate = async (data) => {
        try {
            await categoryAPI.updateCategory(editingCategory._id, data);
            toast.success('Category updated successfully');
            setEditingCategory(null);
            setShowForm(false);
            loadCategories();
        } catch (error) {
            toast.error(error.message || 'Failed to update category');
        }
    };

    const executeDelete = async () => {
        try {
            await categoryAPI.deleteCategory(deletingId);
            toast.success('Category deleted successfully');
            loadCategories();
        } catch (error) {
            toast.error(error.message || 'Failed to delete category');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteClick = (id) => {
        setDeletingId(id);
        setIsConfirmOpen(true);
    };

    const startEdit = (category) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingCategory(null);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
                <span>Loading categories...</span>
            </div>
        );
    }


    if (showForm) {
        return (
            <div>
                <h1 className="page-title">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h1>
                <p className="page-subtitle">
                    {editingCategory
                        ? 'Update the category name, description, and attributes'
                        : 'Define a new product category with custom attributes. Products created under this category will use these attributes.'}
                </p>

                <div className="card">
                    <CategoryForm
                        category={editingCategory}
                        onSubmit={editingCategory ? handleUpdate : handleCreate}
                        onCancel={cancelForm}
                    />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header-row">
                <div>
                    <h1 className="page-title">Manage Categories</h1>
                    <p className="page-subtitle">
                        Define product categories and their dynamic attributes. Each category determines what fields appear on the product form.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <FiPlus /> New Category
                </button>
            </div>

            {categories.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><FiGrid /></div>
                        <h3>No categories yet</h3>
                        <p>Create your first product category to start adding products with dynamic attributes.</p>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            <FiPlus /> Create Category
                        </button>
                    </div>
                </div>
            ) : (
                <div className="categories-grid">
                    {categories.map((cat) => (
                        <div key={cat._id} className="category-card">
                            <div className="category-card-header">
                                <h3>{cat.name}</h3>
                                <div className="category-card-actions">
                                    <button
                                        className="icon-btn"
                                        onClick={() => startEdit(cat)}
                                        title="Edit"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        className="icon-btn danger"
                                        onClick={() => handleDeleteClick(cat._id)}
                                        title="Delete"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>

                            {cat.description && (
                                <p className="category-card-desc">{cat.description}</p>
                            )}

                            <div className="category-card-meta">
                                <span className="badge badge-primary">
                                    {cat.attributes.length} attribute{cat.attributes.length !== 1 ? 's' : ''}
                                </span>
                                <span className="badge badge-success">
                                    {cat.attributes.filter(a => a.filterable).length} filterable
                                </span>
                            </div>

                            <div className="category-attributes-list">
                                {cat.attributes.map((attr) => (
                                    <div key={attr.key} className="attr-item">
                                        <span className="attr-item-name">{attr.name}</span>
                                        <div className="attr-item-meta">
                                            <span className={`attr-type type-${attr.type}`}>{attr.type}</span>
                                            {attr.required && <span className="attr-flag required">Required</span>}
                                            {attr.filterable && <span className="attr-flag filterable">Filter</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => {
                    setIsConfirmOpen(false);
                    setDeletingId(null);
                }}
                onConfirm={executeDelete}
                title="Delete Category"
                message="Are you sure you want to delete this category? All products using it might completely lose their structural specifications! This action cannot be undone."
            />
        </div>
    );
}

export default ManageCategories;

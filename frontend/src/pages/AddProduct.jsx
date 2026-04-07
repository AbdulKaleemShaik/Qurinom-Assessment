import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { categoryAPI, productAPI } from '../api/axios';
import DynamicForm from '../components/DynamicForm';
import './AddProduct.css';

function AddProduct() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categoryData, setCategoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        brand: '',
        description: '',
        highlights: [''],
        specifications: {}
    });
    const [errors, setErrors] = useState({});

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
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = async (categoryId) => {
        setSelectedCategory(categoryId);
        setFormData(prev => ({ ...prev, specifications: {} }));

        if (!categoryId) {
            setCategoryData(null);
            return;
        }

        try {
            const res = await categoryAPI.getCategoryById(categoryId);
            if (res.success) {
                setCategoryData(res.data);
            }
        } catch (error) {
            toast.error('Failed to load category details');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSpecChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            specifications: { ...prev.specifications, [key]: value }
        }));
    };

    const addHighlight = () => {
        setFormData(prev => ({
            ...prev,
            highlights: [...prev.highlights, '']
        }));
    };

    const updateHighlight = (index, value) => {
        const updated = [...formData.highlights];
        updated[index] = value;
        setFormData(prev => ({ ...prev, highlights: updated }));
    };

    const removeHighlight = (index) => {
        setFormData(prev => ({
            ...prev,
            highlights: prev.highlights.filter((_, i) => i !== index)
        }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Product name is required';
        if (!selectedCategory) errs.category = 'Please select a category';
        if (!formData.price || formData.price <= 0) errs.price = 'Valid price is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                category: selectedCategory,
                price: Number(formData.price),
                brand: formData.brand.trim(),
                description: formData.description.trim(),
                highlights: formData.highlights.filter(h => h.trim()),
                specifications: formData.specifications
            };

            const res = await productAPI.createProduct(payload);
            if (res.success) {
                toast.success('Product created successfully!');
                navigate(`/products/${res.data._id}`);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to create product');
            if (error.errors) {
                toast.error(error.errors.join(', '));
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
                <span>Loading...</span>
            </div>
        );
    }

    return (
        <div className="add-product-page">
            <div className="page-header-row">
                <div>
                    <h1 className="page-title">Add New Product</h1>
                    <p className="page-subtitle">
                        Select a category to see dynamic product fields. Form fields adapt based on category selection.
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/products')}>
                    <FiArrowLeft /> Back to Products
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="add-product-layout">
                    <div className="product-form-main">
                        <div className="card">
                            <h3 className="card-title">Basic Information</h3>

                            <div className="form-group">
                                <label className="form-label">
                                    Product Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-input ${errors.name ? 'input-error' : ''}`}
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter product name"
                                    id="product-name"
                                />
                                {errors.name && <span className="form-error">{errors.name}</span>}
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">
                                        Category <span className="required">*</span>
                                    </label>
                                    <select
                                        className={`form-select ${errors.category ? 'input-error' : ''}`}
                                        value={selectedCategory}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        id="product-category"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name} ({cat.attributes.length} attributes)
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <span className="form-error">{errors.category}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Price (₹) <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-input ${errors.price ? 'input-error' : ''}`}
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        placeholder="Enter price"
                                        min="0"
                                        step="0.01"
                                        id="product-price"
                                    />
                                    {errors.price && <span className="form-error">{errors.price}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Brand</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.brand}
                                    onChange={(e) => handleInputChange('brand', e.target.value)}
                                    placeholder="Enter brand name"
                                    id="product-brand"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Enter detailed product description"
                                    rows={4}
                                    id="product-description"
                                />
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: 20 }}>
                            <DynamicForm
                                attributes={categoryData?.attributes || []}
                                values={formData.specifications}
                                onChange={handleSpecChange}
                                errors={{}}
                            />
                        </div>
                    </div>

                    <div className="product-form-sidebar">
                        <div className="card">
                            <h3 className="card-title">Product Highlights</h3>
                            <p className="form-hint" style={{ marginBottom: 12 }}>
                                Add key selling points of the product
                            </p>

                            <div className="highlights-list">
                                {formData.highlights.map((highlight, index) => (
                                    <div key={index} className="highlight-item">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={highlight}
                                            onChange={(e) => updateHighlight(index, e.target.value)}
                                            placeholder={`Highlight ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            className="highlight-remove"
                                            onClick={() => removeHighlight(index)}
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={addHighlight}
                                style={{ marginTop: 8 }}
                            >
                                <FiPlus /> Add Highlight
                            </button>
                        </div>

                        {categoryData && (
                            <div className="card" style={{ marginTop: 20 }}>
                                <h3 className="card-title">Category Info</h3>
                                <div className="cat-info">
                                    <div className="cat-info-item">
                                        <span className="cat-info-label">Category</span>
                                        <span className="cat-info-value">{categoryData.name}</span>
                                    </div>
                                    <div className="cat-info-item">
                                        <span className="cat-info-label">Attributes</span>
                                        <span className="cat-info-value">{categoryData.attributes.length}</span>
                                    </div>
                                    <div className="cat-info-item">
                                        <span className="cat-info-label">Required</span>
                                        <span className="cat-info-value">
                                            {categoryData.attributes.filter(a => a.required).length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg submit-btn"
                            disabled={submitting}
                            style={{ marginTop: 20, width: '100%' }}
                        >
                            {submitting ? (
                                <>
                                    <div className="spinner"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FiSave /> Create Product
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default AddProduct;

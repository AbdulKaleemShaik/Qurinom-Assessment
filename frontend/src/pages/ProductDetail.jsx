import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiTag, FiStar, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productAPI } from '../api/axios';
import './ProductDetail.css';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            const res = await productAPI.getById(id);
            setProduct(res.data);
        } catch (error) {
            toast.error('Failed to load product');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await productAPI.delete(id);
            toast.success('Product deleted');
            navigate('/products');
        } catch (error) {
            toast.error(error.message || 'Failed to delete product');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
                <span>Loading product details...</span>
            </div>
        );
    }

    if (!product) return null;

    const category = product.category;
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(product.price);

    // Get specifications with attribute metadata
    const getSpecsWithMeta = () => {
        const specs = product.specifications instanceof Map
            ? Object.fromEntries(product.specifications)
            : (product.specifications || {});

        if (!category?.attributes) return Object.entries(specs).map(([k, v]) => ({
            key: k, name: k, value: v, unit: ''
        }));

        return category.attributes.map(attr => ({
            key: attr.key,
            name: attr.name,
            value: specs[attr.key] || '-',
            unit: attr.unit || ''
        })).filter(s => s.value !== '-' && s.value !== '' && s.value !== null);
    };

    const specs = getSpecsWithMeta();

    return (
        <div className="product-detail">
            <div className="detail-breadcrumb">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/products')}>
                    <FiArrowLeft /> Back to Products
                </button>
                <div className="detail-actions">
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                        <FiTrash2 /> Delete
                    </button>
                </div>
            </div>

            <div className="detail-layout">
                <div className="detail-image-section">
                    <div className="detail-image-placeholder">
                        <span>{product.name.charAt(0).toUpperCase()}</span>
                    </div>
                </div>

                <div className="detail-info-section">
                    <div className="detail-category-badge">
                        <FiTag /> {category?.name || 'Uncategorized'}
                    </div>

                    <h1 className="detail-product-name">{product.name}</h1>

                    {product.brand && (
                        <span className="detail-brand">by {product.brand}</span>
                    )}

                    <div className="detail-price">{formattedPrice}</div>

                    {product.highlights && product.highlights.length > 0 && (
                        <div className="detail-highlights">
                            <h3><FiStar /> Key Highlights</h3>
                            <ul>
                                {product.highlights.map((h, i) => (
                                    <li key={i}>
                                        <FiCheck className="highlight-check" />
                                        {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {product.description && (
                <div className="detail-section">
                    <h2 className="detail-section-title">Description</h2>
                    <p className="detail-description">{product.description}</p>
                </div>
            )}

            {specs.length > 0 && (
                <div className="detail-section">
                    <h2 className="detail-section-title">
                        Specifications
                        <span className="spec-category-label">({category?.name})</span>
                    </h2>
                    <div className="specs-table">
                        {specs.map((spec, index) => (
                            <div key={spec.key} className={`spec-row ${index % 2 === 0 ? 'even' : ''}`}>
                                <span className="spec-name">{spec.name}</span>
                                <span className="spec-value">
                                    {Array.isArray(spec.value) ? spec.value.join(', ') : String(spec.value)}
                                    {spec.unit && spec.unit !== '' && (
                                        <span className="spec-unit"> {spec.unit}</span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="detail-meta">
                <span>Created: {new Date(product.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                })}</span>
                <span>ID: {product._id}</span>
            </div>
        </div>
    );
}

export default ProductDetail;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { productAPI, categoryAPI } from '../api/axios';
import ProductCard from '../components/ProductCard';
import './ProductList.css';

function ProductList() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [selectedCategory, pagination.page]);

    const loadCategories = async () => {
        try {
            const res = await categoryAPI.getAll();
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = { page: pagination.page, limit: 12 };
            if (selectedCategory) params.category = selectedCategory;

            const res = await productAPI.getAll(params);
            setProducts(res.data);
            setPagination(prev => ({
                ...prev,
                pages: res.pagination.pages,
                total: res.pagination.total
            }));
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await productAPI.delete(id);
            toast.success('Product deleted');
            loadProducts();
        } catch (error) {
            toast.error(error.message || 'Failed to delete product');
        }
    };

    const handleCategoryFilter = (categoryId) => {
        setSelectedCategory(categoryId);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div>
            <div className="page-header-row">
                <div>
                    <h1 className="page-title">All Products</h1>
                    <p className="page-subtitle">
                        {pagination.total} product{pagination.total !== 1 ? 's' : ''} total
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/products/add')}>
                    <FiPlus /> Add Product
                </button>
            </div>

            <div className="filter-tabs">
                <button
                    className={`filter-tab ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => handleCategoryFilter('')}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        className={`filter-tab ${selectedCategory === cat._id ? 'active' : ''}`}
                        onClick={() => handleCategoryFilter(cat._id)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner spinner-lg"></div>
                    <span>Loading products...</span>
                </div>
            ) : products.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><FiPackage /></div>
                        <h3>No products found</h3>
                        <p>
                            {selectedCategory
                                ? 'No products in this category yet.'
                                : 'Start by adding your first product.'
                            }
                        </p>
                        <button className="btn btn-primary" onClick={() => navigate('/products/add')}>
                            <FiPlus /> Add Product
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.page <= 1}
                                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                            >
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.page >= pagination.pages}
                                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ProductList;

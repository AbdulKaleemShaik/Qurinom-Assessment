import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiSearch, FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { searchAPI, categoryAPI } from '../api/axios';
import DynamicFilters from '../components/DynamicFilters';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../api/axios';
import './SearchProducts.css';

function SearchProducts() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [filters, setFilters] = useState([]);
    const [activeFilters, setActiveFilters] = useState({});
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(false);
    const [filtersLoading, setFiltersLoading] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');

    useEffect(() => {
        loadCategories();
    }, []);

    // Load filters when category changes
    useEffect(() => {
        if (selectedCategory) {
            loadFilters(selectedCategory);
        } else {
            setFilters([]);
            setActiveFilters({});
        }
    }, [selectedCategory]);

    // Search when filters, query, or sort changes
    useEffect(() => {
        performSearch();
    }, [activeFilters, selectedCategory, sortBy, pagination.page]);

    // Search on initial load if query param present
    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setSearchQuery(q);
            performSearch();
        }
    }, [searchParams]);

    const loadCategories = async () => {
        try {
            const res = await categoryAPI.getAll();
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadFilters = async (categorySlug) => {
        setFiltersLoading(true);
        try {
            const res = await searchAPI.getFilters(categorySlug);
            setFilters(res.filters);
        } catch (error) {
            console.error('Failed to load filters:', error);
            setFilters([]);
        } finally {
            setFiltersLoading(false);
        }
    };

    const performSearch = async () => {
        setLoading(true);
        try {
            const payload = {
                query: searchQuery,
                category: selectedCategory,
                filters: activeFilters,
                page: pagination.page,
                limit: 12,
                sortBy,
                sortOrder: sortBy === 'price_asc' ? 'asc' : 'desc'
            };

            // Normalize sort
            if (sortBy === 'price_asc' || sortBy === 'price_desc') {
                payload.sortBy = 'price';
                payload.sortOrder = sortBy === 'price_asc' ? 'asc' : 'desc';
            }

            const res = await searchAPI.searchProducts(payload);
            setProducts(res.data);
            setPagination(prev => ({
                ...prev,
                pages: res.pagination.pages,
                total: res.pagination.total
            }));
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        performSearch();
    };

    const handleCategoryChange = (slug) => {
        setSelectedCategory(slug);
        setActiveFilters({});
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => {
            const updated = { ...prev };
            if (value === undefined || (Array.isArray(value) && value.length === 0)) {
                delete updated[key];
            } else {
                updated[key] = value;
            }
            return updated;
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearAllFilters = () => {
        setActiveFilters({});
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await productAPI.delete(id);
            toast.success('Product deleted');
            performSearch();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="search-page">
            <h1 className="page-title">Search Products</h1>
            <p className="page-subtitle">
                Backend-driven search with dynamic, category-aware filters
            </p>

            <form className="search-bar" onSubmit={handleSearch}>
                <div className="search-bar-inner">
                    <FiSearch className="search-bar-icon" />
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Search products by name, brand, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        id="main-search-input"
                    />
                    <button type="submit" className="btn btn-primary">
                        Search
                    </button>
                </div>
            </form>

            <div className="search-controls">
                <div className="search-categories">
                    <button
                        className={`filter-tab ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => handleCategoryChange('')}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            className={`filter-tab ${selectedCategory === cat._id ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(cat._id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="search-sort">
                    <select
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ width: 'auto', minWidth: 160 }}
                    >
                        <option value="relevance">Most Relevant</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name">Name: A to Z</option>
                    </select>
                </div>
            </div>

            <div className="search-layout">
                {selectedCategory && (
                    <aside className="search-filters-sidebar">
                        {filtersLoading ? (
                            <div className="loading-container" style={{ padding: 32 }}>
                                <div className="spinner"></div>
                                <span>Loading filters...</span>
                            </div>
                        ) : (
                            <DynamicFilters
                                filters={filters}
                                activeFilters={activeFilters}
                                onFilterChange={handleFilterChange}
                                onClearAll={clearAllFilters}
                            />
                        )}
                    </aside>
                )}

                <div className="search-results">
                    <div className="search-results-header">
                        <span>{pagination.total} result{pagination.total !== 1 ? 's' : ''} found</span>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner spinner-lg"></div>
                            <span>Searching...</span>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon"><FiPackage /></div>
                                <h3>No products found</h3>
                                <p>Try adjusting your search or filters</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="search-results-grid">
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
            </div>
        </div>
    );
}

export default SearchProducts;

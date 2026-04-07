import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiPackage, FiPlusCircle, FiSearch, FiTrendingUp, FiLayers } from 'react-icons/fi';
import { categoryAPI, productAPI } from '../api/axios';
import './Dashboard.css';

function Dashboard() {
    const [stats, setStats] = useState({
        categories: 0,
        products: 0,
        categoryList: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                categoryAPI.getAll(),
                productAPI.getAll({ limit: 1 })
            ]);

            setStats({
                categories: catRes.data.length,
                products: prodRes.pagination.total,
                categoryList: catRes.data
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
                <span>Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Welcome to ProductHub</h1>
                    <p className="page-subtitle">Dynamic product management system with category-driven attributes</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card stat-purple">
                    <div className="stat-icon">
                        <FiGrid />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.categories}</span>
                        <span className="stat-label">Categories</span>
                    </div>
                </div>

                <div className="stat-card stat-blue">
                    <div className="stat-icon">
                        <FiPackage />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.products}</span>
                        <span className="stat-label">Products</span>
                    </div>
                </div>

                <div className="stat-card stat-green">
                    <div className="stat-icon">
                        <FiLayers />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">
                            {stats.categoryList.reduce((sum, cat) => sum + cat.attributes.length, 0)}
                        </span>
                        <span className="stat-label">Total Attributes</span>
                    </div>
                </div>

                <div className="stat-card stat-orange">
                    <div className="stat-icon">
                        <FiTrendingUp />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">Dynamic</span>
                        <span className="stat-label">Schema Type</span>
                    </div>
                </div>
            </div>

            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions">
                <Link to="/categories" className="action-card">
                    <div className="action-icon purple"><FiGrid /></div>
                    <div className="action-info">
                        <h3>Manage Categories</h3>
                        <p>Create and edit product categories with dynamic attributes</p>
                    </div>
                </Link>

                <Link to="/products/add" className="action-card">
                    <div className="action-icon blue"><FiPlusCircle /></div>
                    <div className="action-info">
                        <h3>Add Product</h3>
                        <p>Add a new product with dynamic, category-specific fields</p>
                    </div>
                </Link>

                <Link to="/products" className="action-card">
                    <div className="action-icon green"><FiPackage /></div>
                    <div className="action-info">
                        <h3>View Products</h3>
                        <p>Browse all products with category-adaptive detail pages</p>
                    </div>
                </Link>

                <Link to="/search" className="action-card">
                    <div className="action-icon orange"><FiSearch /></div>
                    <div className="action-info">
                        <h3>Search & Filter</h3>
                        <p>Backend-driven search with dynamic, category-aware filters</p>
                    </div>
                </Link>
            </div>

            {stats.categoryList.length > 0 && (
                <>
                    <h2 className="section-title">Categories Overview</h2>
                    <div className="category-overview-grid">
                        {stats.categoryList.map((cat) => (
                            <div key={cat._id} className="category-overview-card">
                                <div className="category-overview-header">
                                    <h3>{cat.name}</h3>
                                    <span className="badge badge-primary">{cat.attributes.length} attributes</span>
                                </div>
                                {cat.description && (
                                    <p className="category-desc">{cat.description}</p>
                                )}
                                <div className="category-attrs">
                                    {cat.attributes.map((attr) => (
                                        <span key={attr.key} className="attr-tag">
                                            {attr.name}
                                            {attr.required && <span className="attr-required">*</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <h2 className="section-title">How Dynamic Schema Works</h2>
            <div className="how-it-works">
                <div className="step-card">
                    <div className="step-number">1</div>
                    <h4>Define Category</h4>
                    <p>Create a category with custom attributes (RAM, Color, etc.)</p>
                </div>
                <div className="step-connector">→</div>
                <div className="step-card">
                    <div className="step-number">2</div>
                    <h4>Dynamic Form</h4>
                    <p>Product form auto-generates fields based on category selection</p>
                </div>
                <div className="step-connector">→</div>
                <div className="step-card">
                    <div className="step-number">3</div>
                    <h4>Smart Search</h4>
                    <p>Filters are generated dynamically from backend APIs</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

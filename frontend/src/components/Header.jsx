import { useLocation } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const pageTitles = {
    '/': 'Dashboard',
    '/categories': 'Manage Categories',
    '/products/add': 'Add New Product',
    '/products': 'All Products',
    '/search': 'Search Products'
};

function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Determine the page title
    let pageTitle = pageTitles[location.pathname] || 'Product Details';
    if (location.pathname.startsWith('/products/') && location.pathname !== '/products/add') {
        pageTitle = 'Product Details';
    }

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <h2 className="header-title">{pageTitle}</h2>
            </div>

            <div className="header-right">
                <form className="header-search" onSubmit={handleSearch}>
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Quick search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </form>
            </div>
        </header>
    );
}

export default Header;

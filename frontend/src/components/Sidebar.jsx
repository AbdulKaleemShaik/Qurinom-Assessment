import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiPlusCircle, FiPackage, FiSearch, FiBox } from 'react-icons/fi';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/categories', icon: FiGrid, label: 'Categories' },
    { path: '/products/add', icon: FiPlusCircle, label: 'Add Product' },
    { path: '/products', icon: FiPackage, label: 'Products' },
    { path: '/search', icon: FiSearch, label: 'Search' }
];

function Sidebar() {
    const location = useLocation();

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <FiBox />
                </div>
                <div className="sidebar-brand-text">
                    <h1>ProductHub</h1>
                    <span>Admin Panel</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">Menu</div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon className="nav-icon" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-footer-text">
                    <span>Dynamic Product System</span>
                    <span className="version">v1.0.0</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;

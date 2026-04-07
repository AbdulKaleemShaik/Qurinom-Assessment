import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ManageCategories from './pages/ManageCategories';
import AddProduct from './pages/AddProduct';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import SearchProducts from './pages/SearchProducts';
import './App.css';

function App() {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="page-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/categories" element={<ManageCategories />} />
                        <Route path="/products/add" element={<AddProduct />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/search" element={<SearchProducts />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default App;

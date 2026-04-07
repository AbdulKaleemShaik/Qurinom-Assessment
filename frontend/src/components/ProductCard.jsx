import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import './ProductCard.css';

function ProductCard({ product, onDelete }) {
    const navigate = useNavigate();

    const categoryName = product.category?.name || 'Uncategorized';
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(product.price);


    const specPreview = [];
    if (product.specifications) {
        const specs = product.specifications instanceof Map
            ? Object.fromEntries(product.specifications)
            : product.specifications;

        const entries = Object.entries(specs);
        for (let i = 0; i < Math.min(3, entries.length); i++) {
            specPreview.push({ key: entries[i][0], value: entries[i][1] });
        }
    }

    return (
        <div className="product-card">
            <div className="product-card-image">
                <div className="product-card-placeholder">
                    {product.name.charAt(0).toUpperCase()}
                </div>
                <span className="product-category-badge">{categoryName}</span>
            </div>

            <div className="product-card-body">
                <h3 className="product-card-name">{product.name}</h3>
                {product.brand && (
                    <span className="product-card-brand">{product.brand}</span>
                )}
                <div className="product-card-price">{formattedPrice}</div>

                {specPreview.length > 0 && (
                    <div className="product-card-specs">
                        {specPreview.map((spec) => (
                            <span key={spec.key} className="spec-chip">
                                {String(spec.value)}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="product-card-actions">
                <button
                    className="card-action-btn view"
                    onClick={() => navigate(`/products/${product._id}`)}
                    title="View Details"
                >
                    <FiEye />
                </button>
                <button
                    className="card-action-btn edit"
                    onClick={() => navigate(`/products/${product._id}`)}
                    title="Edit Product"
                >
                    <FiEdit2 />
                </button>
                <button
                    className="card-action-btn delete"
                    onClick={() => onDelete && onDelete(product._id)}
                    title="Delete Product"
                >
                    <FiTrash2 />
                </button>
            </div>
        </div>
    );
}

export default ProductCard;

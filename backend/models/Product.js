const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Product category is required']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    brand: {
        type: String,
        trim: true,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    highlights: {
        type: [String],
        default: []
    },
    // Dynamic specifications stored as key-value pairs
    // Keys correspond to category attribute keys
    specifications: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: new Map()
    },
    images: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Auto-generate slug from name
productSchema.pre('validate', function(next) {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Index for text-based search (MongoDB fallback)
productSchema.index({ name: 'text', brand: 'text', description: 'text' });

// Compound index for category-based queries
productSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);

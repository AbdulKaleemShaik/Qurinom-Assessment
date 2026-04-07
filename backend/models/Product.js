const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    brand: String,
    description: String,
    highlights: [String],
    specifications: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: new Map()
    },
    images: [String]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

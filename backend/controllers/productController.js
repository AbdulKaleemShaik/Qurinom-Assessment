const Product = require('../models/Product');
const Category = require('../models/Category');
const { indexProduct, removeProduct } = require('../services/searchService');

const createProduct = async (req, res, next) => {
    try {
        const { name, category, price, brand, description, highlights, specifications, images } = req.body;

        // Validate that category exists
        const categoryDoc = await Category.findById(category);
        if (!categoryDoc) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        // Dynamic validation: check specifications against category attributes
        const validationErrors = validateSpecifications(specifications, categoryDoc.attributes);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Specification validation failed',
                errors: validationErrors
            });
        }

        const product = await Product.create({
            name,
            category,
            price,
            brand,
            description,
            highlights: highlights || [],
            specifications: specifications || {},
            images: images || []
        });

        // Index in Elasticsearch (non-blocking)
        indexProduct(product, categoryDoc).catch(err => {
            console.warn('ES indexing failed:', err.message);
        });

        // Populate category for response
        await product.populate('category', 'name slug attributes');

        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });
    } catch (error) {
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build filter query
        const filter = {};
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('category', 'name slug attributes')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Product.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug attributes');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const { name, category, price, brand, description, highlights, specifications, images } = req.body;

        // If category is being changed, validate specifications against new category
        const targetCategoryId = category || product.category;
        const categoryDoc = await Category.findById(targetCategoryId);
        if (!categoryDoc) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        if (specifications) {
            const validationErrors = validateSpecifications(specifications, categoryDoc.attributes);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Specification validation failed',
                    errors: validationErrors
                });
            }
        }

        // Update fields
        if (name) product.name = name;
        if (category) product.category = category;
        if (price !== undefined) product.price = price;
        if (brand !== undefined) product.brand = brand;
        if (description !== undefined) product.description = description;
        if (highlights) product.highlights = highlights;
        if (specifications) product.specifications = specifications;
        if (images) product.images = images;

        // Reset slug if name changed
        if (name) product.slug = undefined;

        await product.save();

        // Re-index in Elasticsearch
        indexProduct(product, categoryDoc).catch(err => {
            console.warn('ES re-indexing failed:', err.message);
        });

        await product.populate('category', 'name slug attributes');

        res.json({
            success: true,
            data: product,
            message: 'Product updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        // Remove from Elasticsearch
        removeProduct(req.params.id).catch(err => {
            console.warn('ES removal failed:', err.message);
        });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Helper: Validate product specifications against category attribute definitions
function validateSpecifications(specifications, attributes) {
    const errors = [];

    if (!specifications || typeof specifications !== 'object') {
        errors.push('Specifications must be an object');
        return errors;
    }

    for (const attr of attributes) {
        const value = specifications[attr.key];

        // Check required fields
        if (attr.required && (value === undefined || value === null || value === '')) {
            errors.push(`"${attr.name}" is required`);
            continue;
        }

        if (value === undefined || value === null || value === '') continue;

        // Type validation
        switch (attr.type) {
            case 'number':
                if (isNaN(Number(value))) {
                    errors.push(`"${attr.name}" must be a number`);
                }
                break;
            case 'select':
                if (attr.options.length > 0 && !attr.options.includes(value)) {
                    errors.push(`"${attr.name}" must be one of: ${attr.options.join(', ')}`);
                }
                break;
            case 'multiselect':
                if (Array.isArray(value)) {
                    const invalid = value.filter(v => !attr.options.includes(v));
                    if (invalid.length > 0) {
                        errors.push(`"${attr.name}" contains invalid values: ${invalid.join(', ')}`);
                    }
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
                    errors.push(`"${attr.name}" must be true or false`);
                }
                break;
        }
    }

    return errors;
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};

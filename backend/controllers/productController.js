const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

const { indexProduct, removeProduct } = require('../services/searchService');

const createProduct = async (req, res, next) => {
    try {
        const { name, category, price, brand, description, highlights, specifications, images } = req.body;


        const categoryDoc = await Category.findById(category);
        if (!categoryDoc || categoryDoc.deleteStatus) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }


        const validationErrors = validateSpecifications(specifications, categoryDoc.attributes);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Specification validation failed',
                errors: validationErrors
            });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const product = await Product.create({
            name,
            slug,
            category,
            price,
            brand,
            description,
            highlights: highlights || [],
            specifications: specifications || {},
            images: images || []
        });


        indexProduct(product, categoryDoc).catch(err => {
            console.warn('ES indexing failed:', err.message);
        });


        const productResponse = product.toJSON();
        productResponse.category = {
            _id: categoryDoc._id,
            name: categoryDoc.name,
            slug: categoryDoc.slug,
            attributes: categoryDoc.attributes
        };

        res.status(201).json({
            success: true,
            data: productResponse,
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



        const filter = { deleteStatus: { $ne: true } };
        if (req.query.category) {
            filter.category = new mongoose.Types.ObjectId(req.query.category);
        }


        const aggregationResult = await Product.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'categories',        // MongoDB collection name for Category
                                localField: 'category',
                                foreignField: '_id',
                                as: 'category'
                            }
                        },
                        { $unwind: '$category' }
                    ]
                }
            }
        ]);

        const total = aggregationResult[0].metadata.length > 0 ? aggregationResult[0].metadata[0].total : 0;
        const products = aggregationResult[0].data;

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

        if (!product || product.deleteStatus) {
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
        if (!product || product.deleteStatus) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const { name, category, price, brand, description, highlights, specifications, images } = req.body;

        const targetCategoryId = category || product.category;
        const categoryDoc = await Category.findById(targetCategoryId);
        if (!categoryDoc || categoryDoc.deleteStatus) {
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

        if (name) {
            product.name = name;
            product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (category) product.category = category;
        if (price !== undefined) product.price = price;
        if (brand !== undefined) product.brand = brand;
        if (description !== undefined) product.description = description;
        if (highlights) product.highlights = highlights;
        if (specifications) product.specifications = specifications;
        if (images) product.images = images;

        await product.save();


        indexProduct(product, categoryDoc).catch(err => {
            console.warn('ES re-indexing failed:', err.message);
        });


        const productResponse = product.toJSON();
        productResponse.category = {
            _id: categoryDoc._id,
            name: categoryDoc.name,
            slug: categoryDoc.slug,
            attributes: categoryDoc.attributes
        };

        res.json({
            success: true,
            data: productResponse,
            message: 'Product updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product || product.deleteStatus) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.deleteStatus = true;
        await product.save();


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


function validateSpecifications(specifications, attributes) {
    const errors = [];

    if (!specifications || typeof specifications !== 'object') {
        errors.push('Specifications must be an object');
        return errors;
    }

    for (const attr of attributes) {
        const value = specifications[attr.key];


        if (attr.required && (value === undefined || value === null || value === '')) {
            errors.push(`"${attr.name}" is required`);
            continue;
        }

        if (value === undefined || value === null || value === '') continue;


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

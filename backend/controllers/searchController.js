const Product = require('../models/Product');
const Category = require('../models/Category');
const { searchProducts: esSearch, isESAvailable } = require('../services/searchService');

const getFilters = async (req, res, next) => {
    try {
        const { category } = req.query;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category parameter is required'
            });
        }

        // Find category by slug or ID
        let categoryDoc;
        if (category.match(/^[0-9a-fA-F]{24}$/)) {
            categoryDoc = await Category.findById(category);
        } else {
            categoryDoc = await Category.findOne({ slug: category });
        }

        if (!categoryDoc) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Get filterable attributes
        const filterableAttrs = categoryDoc.attributes.filter(attr => attr.filterable);

        // Aggregate actual values from products for each filterable attribute
        const filters = [];

        for (const attr of filterableAttrs) {
            const specKey = `specifications.${attr.key}`;

            // Get distinct values for this attribute from actual products
            const distinctValues = await Product.distinct(specKey, {
                category: categoryDoc._id
            });

            // Filter out null/empty values
            const validValues = distinctValues.filter(v => v !== null && v !== undefined && v !== '');

            filters.push({
                key: attr.key,
                name: attr.name,
                type: attr.type,
                unit: attr.unit || '',
                values: validValues.sort()
            });
        }

        // Add price range filter
        const priceAgg = await Product.aggregate([
            { $match: { category: categoryDoc._id } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        if (priceAgg.length > 0) {
            filters.unshift({
                key: 'price',
                name: 'Price',
                type: 'range',
                unit: '₹',
                min: priceAgg[0].minPrice,
                max: priceAgg[0].maxPrice
            });
        }

        // Add brand filter
        const brands = await Product.distinct('brand', {
            category: categoryDoc._id,
            brand: { $ne: '' }
        });

        if (brands.length > 0) {
            filters.splice(1, 0, {
                key: 'brand',
                name: 'Brand',
                type: 'select',
                unit: '',
                values: brands.sort()
            });
        }

        res.json({
            success: true,
            category: {
                id: categoryDoc._id,
                name: categoryDoc.name,
                slug: categoryDoc.slug
            },
            filters
        });
    } catch (error) {
        next(error);
    }
};

const searchProducts = async (req, res, next) => {
    try {
        const {
            query = '',
            category,
            filters = {},
            page = 1,
            limit = 12,
            sortBy = 'relevance',
            sortOrder = 'desc'
        } = req.body;

        const skip = (page - 1) * limit;

        // Build MongoDB query
        const mongoQuery = {};

        // Category filter
        if (category) {
            let categoryDoc;
            if (category.match(/^[0-9a-fA-F]{24}$/)) {
                categoryDoc = await Category.findById(category);
            } else {
                categoryDoc = await Category.findOne({ slug: category });
            }
            if (categoryDoc) {
                mongoQuery.category = categoryDoc._id;
            }
        }

        // Text search
        if (query && query.trim()) {
            mongoQuery.$text = { $search: query };
        }

        // Apply dynamic specification filters
        for (const [key, value] of Object.entries(filters)) {
            if (value === null || value === undefined || value === '') continue;

            if (key === 'price' && typeof value === 'object') {
                // Price range filter
                if (value.min !== undefined) mongoQuery.price = { ...mongoQuery.price, $gte: value.min };
                if (value.max !== undefined) mongoQuery.price = { ...mongoQuery.price, $lte: value.max };
            } else if (key === 'brand') {
                // Brand filter
                if (Array.isArray(value)) {
                    mongoQuery.brand = { $in: value };
                } else {
                    mongoQuery.brand = value;
                }
            } else {
                // Dynamic specification filter
                const specKey = `specifications.${key}`;
                if (Array.isArray(value)) {
                    mongoQuery[specKey] = { $in: value };
                } else {
                    mongoQuery[specKey] = value;
                }
            }
        }

        // Build sort
        let sort = { createdAt: -1 };
        if (sortBy === 'price') {
            sort = { price: sortOrder === 'asc' ? 1 : -1 };
        } else if (sortBy === 'name') {
            sort = { name: sortOrder === 'asc' ? 1 : -1 };
        } else if (query && query.trim()) {
            sort = { score: { $meta: 'textScore' }, ...sort };
        }

        // Execute query
        let productsQuery = Product.find(mongoQuery)
            .populate('category', 'name slug attributes')
            .skip(skip)
            .limit(limit);

        // Add text score projection if searching
        if (query && query.trim()) {
            productsQuery = productsQuery.select({ score: { $meta: 'textScore' } });
        }

        productsQuery = productsQuery.sort(sort);

        const [products, total] = await Promise.all([
            productsQuery,
            Product.countDocuments(mongoQuery)
        ]);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            query,
            appliedFilters: filters
        });
    } catch (error) {
        next(error);
    }
};

const quickSearch = async (req, res, next) => {
    try {
        const { q = '', limit = 10 } = req.query;

        if (!q.trim()) {
            return res.json({ success: true, data: [] });
        }

        // Use regex for quick search (prefix matching)
        const products = await Product.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } }
            ]
        })
            .populate('category', 'name slug')
            .select('name brand price category slug')
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFilters,
    searchProducts,
    quickSearch
};

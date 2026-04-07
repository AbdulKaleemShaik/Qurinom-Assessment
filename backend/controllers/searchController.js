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

        const filterableAttrs = categoryDoc.attributes.filter(attr => attr.filterable);

        const facetStage = {
            priceRange: [
                {
                    $group: {
                        _id: null,
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' }
                    }
                }
            ],
            brands: [
                { $match: { brand: { $nin: [null, ''] } } },
                { $group: { _id: '$brand' } }
            ]
        };

        for (const attr of filterableAttrs) {
            facetStage[attr.key] = [
                { $match: { [`specifications.${attr.key}`]: { $nin: [null, ''] } } },
                { $group: { _id: `$specifications.${attr.key}` } }
            ];
        }

        const [aggResult] = await Product.aggregate([
            { $match: { category: categoryDoc._id } },
            { $facet: facetStage }
        ]);

        const filters = [];

        if (aggResult.priceRange && aggResult.priceRange.length > 0) {
            filters.push({
                key: 'price',
                name: 'Price',
                type: 'range',
                unit: '₹',
                min: aggResult.priceRange[0].minPrice,
                max: aggResult.priceRange[0].maxPrice
            });
        }

        if (aggResult.brands && aggResult.brands.length > 0) {
            filters.push({
                key: 'brand',
                name: 'Brand',
                type: 'select',
                unit: '',
                values: aggResult.brands.map(b => b._id).sort()
            });
        }

        for (const attr of filterableAttrs) {
            if (aggResult[attr.key] && aggResult[attr.key].length > 0) {
                filters.push({
                    key: attr.key,
                    name: attr.name,
                    type: attr.type,
                    unit: attr.unit || '',
                    values: aggResult[attr.key].map(doc => doc._id).sort()
                });
            }
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

        if (isESAvailable()) {
            const esResults = await esSearch({ query, category, filters, page, limit });
            
            if (esResults) {
                const productIds = esResults.hits.map(hit => hit.id);
                
                const products = await Product.find({ _id: { $in: productIds } })
                    .populate('category', 'name slug attributes');
                
                const orderedProducts = productIds.map(id => 
                    products.find(p => p._id.toString() === id.toString())
                ).filter(Boolean);

                return res.json({
                    success: true,
                    data: orderedProducts,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: esResults.total,
                        pages: Math.ceil(esResults.total / limit)
                    },
                    query,
                    appliedFilters: filters,
                    source: 'elasticsearch' 
                });
            }
        }

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFilters,
    searchProducts
};

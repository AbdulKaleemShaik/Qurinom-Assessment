const { getESClient, isESAvailable } = require('../config/elasticsearch');

// Index a product in Elasticsearch
const indexProduct = async (product, category) => {
    if (!isESAvailable()) return;

    const client = getESClient();
    if (!client) return;

    try {
        // Flatten specifications for ES indexing
        const specs = {};
        if (product.specifications) {
            for (const [key, value] of product.specifications) {
                specs[key] = value;
            }
        }

        await client.index({
            index: 'products',
            id: product._id.toString(),
            body: {
                name: product.name,
                brand: product.brand,
                description: product.description,
                category: category._id.toString(),
                categorySlug: category.slug,
                price: product.price,
                highlights: product.highlights,
                specifications: specs
            }
        });

        // Refresh index to make the document searchable immediately
        await client.indices.refresh({ index: 'products' });
    } catch (error) {
        console.warn('Elasticsearch indexing error:', error.message);
    }
};

// Remove a product from Elasticsearch
const removeProduct = async (productId) => {
    if (!isESAvailable()) return;

    const client = getESClient();
    if (!client) return;

    try {
        await client.delete({
            index: 'products',
            id: productId.toString()
        });
    } catch (error) {
        if (error.statusCode !== 404) {
            console.warn('Elasticsearch removal error:', error.message);
        }
    }
};

// Search products using Elasticsearch
const searchProducts = async ({ query, category, filters, page, limit }) => {
    if (!isESAvailable()) return null;

    const client = getESClient();
    if (!client) return null;

    try {
        const must = [];
        const filterClauses = [];

        // Text search
        if (query && query.trim()) {
            must.push({
                multi_match: {
                    query: query,
                    fields: ['name^3', 'brand^2', 'description', 'highlights'],
                    fuzziness: 'AUTO',
                    type: 'best_fields'
                }
            });
        }

        // Category filter
        if (category) {
            filterClauses.push({
                term: { categorySlug: category }
            });
        }

        // Dynamic specification filters
        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                if (value === null || value === undefined || value === '') continue;

                if (key === 'price' && typeof value === 'object') {
                    const range = {};
                    if (value.min !== undefined) range.gte = value.min;
                    if (value.max !== undefined) range.lte = value.max;
                    filterClauses.push({ range: { price: range } });
                } else if (key === 'brand') {
                    if (Array.isArray(value)) {
                        filterClauses.push({ terms: { 'brand.keyword': value } });
                    } else {
                        filterClauses.push({ term: { 'brand.keyword': value } });
                    }
                } else {
                    const specField = `specifications.${key}`;
                    if (Array.isArray(value)) {
                        filterClauses.push({ terms: { [`${specField}.keyword`]: value } });
                    } else {
                        filterClauses.push({ term: { [`${specField}.keyword`]: value } });
                    }
                }
            }
        }

        const body = {
            from: (page - 1) * limit,
            size: limit,
            query: {
                bool: {
                    must: must.length > 0 ? must : [{ match_all: {} }],
                    filter: filterClauses
                }
            },
            sort: query && query.trim() ? ['_score', { _id: 'desc' }] : [{ _id: 'desc' }]
        };

        const result = await client.search({
            index: 'products',
            body
        });

        return {
            hits: result.hits.hits.map(hit => ({
                id: hit._id,
                score: hit._score,
                ...hit._source
            })),
            total: result.hits.total.value
        };
    } catch (error) {
        console.warn('Elasticsearch search error:', error.message);
        return null;
    }
};

module.exports = {
    indexProduct,
    removeProduct,
    searchProducts,
    isESAvailable
};

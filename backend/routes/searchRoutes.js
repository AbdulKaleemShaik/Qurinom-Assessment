const express = require('express');
const router = express.Router();
const {
    getFilters,
    searchProducts,
    quickSearch
} = require('../controllers/searchController');

// Quick search / autocomplete
router.get('/', quickSearch);

// Get dynamic filters for a category
router.get('/filters', getFilters);

// Full search with filters
router.post('/products', searchProducts);

module.exports = router;

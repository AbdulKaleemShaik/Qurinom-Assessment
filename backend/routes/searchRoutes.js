const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/filters', searchController.getFilters);
router.post('/products', searchController.searchProducts);

module.exports = router;

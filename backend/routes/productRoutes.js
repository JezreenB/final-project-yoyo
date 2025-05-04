const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticateToken = require('../middleware/authenticateToken');
const authenticateAdmin = require('../middleware/authenticateAdmin');

// Get products
router.get('/', productController.getProducts);

// Search products by query
router.get('/search', productController.searchProducts);

// Add product (admin only)
router.post('/', authenticateToken, authenticateAdmin, productController.addProduct);

// Delete product by id (admin only)
router.delete('/:id', authenticateToken, authenticateAdmin, productController.deleteProduct);

module.exports = router;

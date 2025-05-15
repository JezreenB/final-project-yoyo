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

// Update product by id (admin only)
router.put('/:id', authenticateToken, authenticateAdmin, productController.updateProduct);

// Bulk delete products (admin only)
router.post('/bulk-delete', authenticateToken, authenticateAdmin, productController.bulkDeleteProducts);

// Bulk update stock (admin only)
router.post('/bulk-update-stock', authenticateToken, authenticateAdmin, productController.bulkUpdateStock);

// Bulk change category (admin only)
router.post('/bulk-change-category', authenticateToken, authenticateAdmin, productController.bulkChangeCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

// Get all cart items for user
router.get('/', auth, cartController.getCartItems);

// Bulk add cart items for syncing local cart after login
router.post('/sync', auth, cartController.bulkAddToCart);

// Get cart item count for user
router.get('/count', auth, cartController.getCartCount);

// Add product to cart
router.post('/', auth, cartController.addToCart);

// Update cart item quantity by id
router.put('/:id', auth, cartController.updateCartItemQuantity);

// Remove cart item by id
router.delete('/:id', auth, cartController.removeFromCart);

module.exports = router;

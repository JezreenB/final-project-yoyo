const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, orderController.placeOrder);

router.get('/', authenticateToken, orderController.getOrders);

router.get('/:orderNumber', authenticateToken, orderController.getOrderDetails);

router.post('/:orderNumber/cancel', authenticateToken, orderController.cancelOrder);

module.exports = router;

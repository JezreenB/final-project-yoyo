const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', authenticateToken, orderController.placeOrder);

router.get('/', authenticateToken, orderController.getOrders);

router.get('/:orderNumber', authenticateToken, orderController.getOrderDetails);

router.post('/:orderNumber/cancel', authenticateToken, orderController.cancelOrder);

module.exports = router;

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middleware/authenticateToken');
const authenticateAdmin = require('../middleware/authenticateAdmin');

// Admin routes with unique prefix to avoid route conflicts
router.get('/admin-orders', authenticateToken, authenticateAdmin, orderController.getAllOrders);
router.get('/admin-orders/:orderNumber', authenticateToken, authenticateAdmin, orderController.getAdminOrderDetails);
router.patch('/admin-orders/:orderNumber/status', authenticateToken, authenticateAdmin, orderController.updateOrderStatus);

// User routes
router.post('/', authenticateToken, orderController.placeOrder);
router.get('/', authenticateToken, orderController.getOrders);
router.get('/:orderNumber', authenticateToken, orderController.getOrderDetails);
router.post('/:orderNumber/cancel', authenticateToken, orderController.cancelOrder);

module.exports = router;



const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

// User registration
router.post('/register', userController.register);

// User login
router.post('/login', userController.login);

// Get current logged-in user profile
router.get('/me', authenticateToken, userController.getCurrentUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');
const authenticateAdmin = require('../middleware/authenticateAdmin');

// User registration
router.post('/register', userController.register);

// User login
router.post('/login', userController.login);

// Get current logged-in user profile
router.get('/me', authenticateToken, userController.getCurrentUser);

// Change password
router.post('/change-password', authenticateToken, userController.changePassword);

// Customers management routes (admin only)
router.get('/customers', authenticateToken, authenticateAdmin, userController.listCustomers);
router.get('/customers/:id', authenticateToken, authenticateAdmin, userController.getCustomerById);
router.post('/customers', authenticateToken, authenticateAdmin, userController.addCustomer);
router.put('/customers/:id', authenticateToken, authenticateAdmin, userController.updateCustomer);
router.delete('/customers/:id', authenticateToken, authenticateAdmin, userController.deleteCustomer);

// User logout
router.post('/logout', authenticateToken, userController.logout);

module.exports = router;

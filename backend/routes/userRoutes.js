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

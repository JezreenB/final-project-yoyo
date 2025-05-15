const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const authenticateToken = require('../middleware/authenticateToken');

// Protect the dashboard route with token authentication and admin authorization
router.get('/dashboard', authenticateToken, authenticateAdmin, getDashboardData);

module.exports = router;

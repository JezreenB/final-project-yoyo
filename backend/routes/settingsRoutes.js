const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authenticateToken = require('../middleware/authenticateToken');

// Get current settings
router.get('/', authenticateToken, settingsController.getSettings);

// Update settings
router.put('/', authenticateToken, settingsController.updateSettings);

module.exports = router;

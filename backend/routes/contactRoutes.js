const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/contact', contactController.submitMessage);
router.get('/contact', contactController.getAllMessages);

module.exports = router;

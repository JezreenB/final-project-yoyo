const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authenticateToken = require('../middleware/auth');

// Route to get all reviews
router.get('/all', reviewController.getAllReviews);

// Route to get reviews for a specific product
router.get('/:productId', reviewController.getReviewsForProduct);

// Route to submit a new review (requires authentication)
router.post('/', authenticateToken, reviewController.submitReview);

module.exports = router;

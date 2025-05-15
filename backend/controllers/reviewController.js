
const Review = require('../models/Review');
const Product = require('../models/Product');

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;


exports.submitReview = async (req, res) => {
  let { productId, rating, text } = req.body;
  console.log('submitReview - initial productId:', productId);
  if (!productId || !rating) return res.status(400).json({ message: 'Product ID and rating required' });

  if (!req.user || !req.user._id) {
    console.error('User ID missing in request');
    return res.status(401).json({ message: 'Unauthorized: User ID missing' });
  }

  if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
    console.error('Invalid User ID:', req.user._id);
    return res.status(400).json({ message: 'Invalid User ID' });
  }

  // Check if productId is a valid ObjectId, if not treat as product name
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    try {
      const product = await Product.findOne({ name: productId });
      console.log('submitReview - product found by name:', product);
      if (!product) {
        return res.status(400).json({ message: 'Product not found' });
      }
      productId = product._id;
      console.log('submitReview - converted productId to ObjectId:', productId);
    } catch (err) {
      console.error('Error finding product by name:', err);
      return res.status(500).json({ message: 'Server error finding product' });
    }
  } else {
    console.log('submitReview - productId is valid ObjectId:', productId);
  }

  const review = new Review({
    productId,
    userId: req.user._id,
    rating,
    text,
    date: new Date(),
  });

  try {
    await review.save();
    res.status(201).json({ message: 'Review submitted' });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ message: 'Failed to submit review', error: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('userId', 'fullName');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get all reviews', error: error.message });
  }
};

// Get reviews for product
exports.getReviewsForProduct = async (req, res) => {
  const productId = req.params.productId;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid productId' });
  }

  try {
    console.log('getReviewsForProduct - productId:', productId);
    console.log('ObjectId constructor:', ObjectId);
    const reviews = await Review.find({ productId: new ObjectId(productId) }).populate('userId', 'fullName');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get reviews', error: error.message });
  }
};



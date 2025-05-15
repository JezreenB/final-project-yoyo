const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  description: { type: String, required: true, default: '' },
  images: { type: [String], default: [] }, // Array of image URLs
});

module.exports = mongoose.model('Product', productSchema);

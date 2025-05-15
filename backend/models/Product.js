const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: { type: Number, required: true },
<<<<<<< HEAD
  stock: { type: Number, required: true, default: 0 },
  description: { type: String, required: true, default: '' },
  images: { type: [String], default: [] }, // Array of image URLs
=======
  image: String,
>>>>>>> cb24943cc1ae5541c634ca51e3a502a4657ce3ae
});

module.exports = mongoose.model('Product', productSchema);

const Product = require('../models/Product');
const path = require('path');

const mongoose = require('mongoose');
const Review = require('../models/Review');

// Get products with review counts
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'productId',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          reviewCount: { $size: '$reviews' }
        }
      },
      {
        $project: {
          reviews: 0 // exclude reviews array to reduce payload
        }
      }
    ]);
    console.log(`getProducts: Retrieved ${products.length} products`);
    products.forEach(p => {
      console.log(`Product ${p._id} has reviewCount: ${p.reviewCount}`);
    });
    res.json(products);
  } catch (error) {
    console.error('Failed to get products with review counts:', error);
    res.status(500).json({ message: 'Failed to get products' });
  }
};

// Add product (admin only - for simplicity no role check here)
exports.addProduct = async (req, res) => {
  console.log('addProduct req.body:', req.body);
  console.log('addProduct req.files:', req.files);
  let { productName, category, price, stock } = req.body;

  // Trim inputs and validate
  productName = productName ? productName.trim() : '';
  category = category ? category.trim() : '';
  price = price ? price.toString().trim() : '';
  stock = stock ? stock.toString().trim() : '';

  const priceNum = parseFloat(price);
  const stockNum = parseInt(stock, 10);

  if (!productName || !category || !price || !stock) {
    return res.status(400).json({ message: 'Product name, category, price, and stock are required' });
  }
  if (isNaN(priceNum) || isNaN(stockNum)) {
    return res.status(400).json({ message: 'Price and stock must be valid numbers' });
  }

  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        // Store relative path for frontend usage
        return '/uploads/products/' + path.basename(file.path);
      });
    }

    const product = new Product({ name: productName, category, price: priceNum, stock: stockNum, images });
    await product.save();
    console.log('Product saved with images:', product.images);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error in addProduct:', error);
    res.status(500).json({ message: 'Failed to add product' });
  }
};

// Delete product by id
exports.deleteProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Search products by query (name or category)
exports.searchProducts = async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }
  try {
    const regex = new RegExp(query, 'i'); // case-insensitive
    const products = await Product.find({
      $or: [{ name: regex }, { category: regex }]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to search products' });
  }
};

// Update product by id (admin only)
exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const { productName, category, price, stock, existingImages } = req.body;
  if (!productName || !category || !price || stock === undefined) {
    return res.status(400).json({ message: 'Product name, category, price, and stock are required' });
  }
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let existingImagesArray = [];
    if (existingImages) {
      try {
        existingImagesArray = JSON.parse(existingImages);
      } catch (err) {
        existingImagesArray = [];
      }
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map(file => {
        return '/uploads/products/' + path.basename(file.path);
      });
    }

    // Use existingImagesArray as the source of truth for images to keep
    // Append new uploaded images if any
    const images = [...existingImagesArray, ...newImages];

    product.name = productName;
    product.category = category;
    product.price = price;
    product.stock = stock;
    product.images = images;
    await product.save();
    res.json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Bulk update stock for multiple products (admin only)
exports.bulkUpdateStock = async (req, res) => {
  const { ids, stock } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || stock === undefined) {
    return res.status(400).json({ message: 'Array of product IDs and stock are required' });
  }
  try {
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { stock } }
    );
    res.json({ message: `${result.modifiedCount} products updated` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update stock' });
  }
};

// Bulk delete products by ids (admin only)
exports.bulkDeleteProducts = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Array of product IDs is required' });
  }
  try {
    const result = await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${result.deletedCount} products deleted` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete products' });
  }
};

// Bulk change category for products (admin only)
exports.bulkChangeCategory = async (req, res) => {
  const { ids, category } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !category) {
    return res.status(400).json({ message: 'Array of product IDs and category are required' });
  }
  try {
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { category } }
    );
    res.json({ message: `${result.modifiedCount} products updated` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change category' });
  }
};

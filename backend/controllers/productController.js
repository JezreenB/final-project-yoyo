const Product = require('../models/Product');

// Get products
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// Add product (admin only - for simplicity no role check here)
exports.addProduct = async (req, res) => {
  const { name, category, price, image } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Name and price required' });

  const product = new Product({ name, category, price, image });
  await product.save();
  res.status(201).json({ message: 'Product added' });
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

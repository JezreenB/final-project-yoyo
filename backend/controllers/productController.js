const Product = require('../models/Product');

// Get products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get products' });
  }
};

// Add product (admin only - for simplicity no role check here)
exports.addProduct = async (req, res) => {
  const { name, category, price, stock, images } = req.body;
  if (!name || !price || stock === undefined) {
    return res.status(400).json({ message: 'Name, price, and stock are required' });
  }

  try {
    const product = new Product({ name, category, price, stock, images });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product' });
  }
};
exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const { name, category, price, stock, images } = req.body;
  if (!name || !price || stock === undefined) {
    return res.status(400).json({ message: 'Name, price, and stock are required' });
  }
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.name = name;
    product.category = category;
    product.price = price;
    product.stock = stock;
    product.images = images;
    await product.save();
    res.json({ message: 'Product updated' });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ message: 'Failed to update product' });
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
  const { name, category, price, stock, images } = req.body;
  if (!name || !price || stock === undefined) {
    return res.status(400).json({ message: 'Name, price, and stock are required' });
  }
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.name = name;
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

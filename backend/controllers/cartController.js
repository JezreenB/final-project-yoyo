
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// Get all cart items for the authenticated user
exports.getCartItems = async (req, res) => {
  try {
    const userId = req.user._id;
    const cartItems = await CartItem.find({ userId }).populate('productId');
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Failed to fetch cart items' });
  }
};

// Get cart item count for the authenticated user
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await CartItem.countDocuments({ userId });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    res.status(500).json({ message: 'Failed to fetch cart count' });
  }
};

// Add product to cart or update quantity if already exists
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Product ID and valid quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cartItem = await CartItem.findOne({ userId, productId });
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = new CartItem({ userId, productId, quantity });
      await cartItem.save();
    }

    res.status(201).json({ message: 'Product added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
};

// Update quantity of a cart item by id
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const cartItemId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const cartItem = await CartItem.findOne({ _id: cartItemId, userId });
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({ message: 'Cart item quantity updated' });
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({ message: 'Failed to update cart item quantity' });
  }
};

// Remove a cart item by id
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cartItemId = req.params.id;

    const cartItem = await CartItem.findOneAndDelete({ _id: cartItemId, userId });
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item removed' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Failed to remove cart item' });
  }
};

// New function to bulk add cart items for a user
exports.bulkAddToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = req.body.items; // Expecting array of { productId, quantity }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    for (const item of items) {
      const { productId, quantity } = item;
      if (!productId || !quantity || quantity < 1) {
        continue; // skip invalid items
      }

      const product = await Product.findById(productId);
      if (!product) {
        continue; // skip non-existing products
      }

      let cartItem = await CartItem.findOne({ userId, productId });
      if (cartItem) {
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        cartItem = new CartItem({ userId, productId, quantity });
        await cartItem.save();
      }
    }

    res.status(200).json({ message: 'Cart items synced successfully' });
  } catch (error) {
    console.error('Error syncing cart items:', error);
    res.status(500).json({ message: 'Failed to sync cart items' });
  }
};

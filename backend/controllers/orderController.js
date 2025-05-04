
const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const mongoose = require('mongoose');

// Helper function to generate random order number
function generateOrderNumber() {
  return 'NG-' + Math.floor(100000 + Math.random() * 900000);
}

// Place order
exports.placeOrder = async (req, res) => {
  const { deliveryAddress, paymentMethod, shippingMethod, items, clearCart } = req.body;
  console.log('placeOrder called with clearCart:', clearCart);  // Added log for debugging
  if (!deliveryAddress || !paymentMethod || !shippingMethod || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  // Validate that each item has a valid productId
  for (const item of items) {
    if (!item.productId) {
      return res.status(400).json({ message: 'Each order item must have a valid productId' });
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderDate = new Date();
  const status = 'Processing';

  let orderNumber;
  let order;
  let saved = false;
  let attempts = 0;
  const maxAttempts = 5;

  while (!saved && attempts < maxAttempts) {
    try {
      console.log('placeOrder called with clearCart:', clearCart);
      console.log('Order items:', items);
      orderNumber = generateOrderNumber();
      order = new Order({
        userId: req.user.id,
        orderNumber,
        status,
        total,
        deliveryAddress,
        paymentMethod,
        shippingMethod,
        orderDate,
        items,
      });
      await order.save();
      saved = true;
    } catch (err) {
      if (err.code === 11000 && err.keyPattern && err.keyPattern.orderNumber) {
        // Duplicate orderNumber, retry
        attempts++;
      } else {
        console.error('Error placing order:', err);
        return res.status(500).json({ message: 'Failed to place order' });
      }
    }
  }

  if (!saved) {
    return res.status(500).json({ message: 'Failed to generate unique order number' });
  }

  // Clear user's cart after order if clearCart flag is true
  if (clearCart) {
    const productIds = items.map(item => new mongoose.Types.ObjectId(item.productId));
    await CartItem.deleteMany({ userId: req.user.id, productId: { $in: productIds } });
  }

  res.status(201).json({ message: 'Order placed', orderNumber });
};

// Get orders for user
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error getting orders' });
  }
};

// Get order details by order number
exports.getOrderDetails = async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    const order = await Order.findOne({ orderNumber, userId: req.user.id }).populate('items.productId');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    console.log('Fetched order details:', JSON.stringify(order, null, 2)); // Debug log

    res.json(order);
  } catch (error) {
    console.error('Error in getOrderDetails:', error);
    res.status(500).json({ message: 'Error getting order details' });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    const order = await Order.findOne({ orderNumber, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order already cancelled' });
    }

    order.status = 'Cancelled';
    await order.save();
    res.json({ message: 'Order cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order' });
  }
};

// Test endpoint to get some orders with user emails for testing
exports.getTestOrders = async (req, res) => {
  try {
    const orders = await Order.find().limit(5).populate('userId', 'email');
    const testOrders = orders.map(order => ({
      orderNumber: order.orderNumber,
      email: order.userId.email,
      status: order.status
    }));
    res.json(testOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error getting test orders' });
  }
};

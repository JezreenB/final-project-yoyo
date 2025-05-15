const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

require('dotenv').config();
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test'; // Use env variable or fallback

async function seedTestOrders() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Clear existing test orders (optional)
    // await Order.deleteMany({ testOrder: true });

    // Find or create test users
    let user1 = await User.findOne({ email: 'testuser1@example.com' });
    if (!user1) {
      user1 = new User({ fullName: 'Test User 1', email: 'testuser1@example.com', password: 'password123', address: '123 Test St' });
      await user1.save();
    }

    let user2 = await User.findOne({ email: 'testuser2@example.com' });
    if (!user2) {
      user2 = new User({ fullName: 'Test User 2', email: 'testuser2@example.com', password: 'password123', address: '456 Test Ave' });
      await user2.save();
    }

    // Find some products to add to orders
    const products = await Product.find().limit(2);
    if (products.length < 2) {
      console.log('Not enough products found to create test orders.');
      process.exit(1);
    }

    // Create orders in previous month
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    previousMonthDate.setDate(15);

    const orderPrev = new Order({
      orderNumber: 1001,
      userId: user1._id,
      items: [
        { productId: products[0]._id, quantity: 1, price: products[0].price },
        { productId: products[1]._id, quantity: 2, price: products[1].price }
      ],
      total: products[0].price * 1 + products[1].price * 2,
      status: 'Delivered',
      shippingMethod: 'Standard',
      paymentMethod: 'Credit Card',
      deliveryAddress: user1.address,
      createdAt: previousMonthDate,
      updatedAt: previousMonthDate,
      testOrder: true
    });
    await orderPrev.save();

    // Create orders in current month
    const currentMonthDate = new Date();
    currentMonthDate.setDate(10);

    const orderCurrent = new Order({
      orderNumber: 1002,
      userId: user2._id,
      items: [
        { productId: products[0]._id, quantity: 3, price: products[0].price }
      ],
      total: products[0].price * 3,
      status: 'Processing',
      shippingMethod: 'Express',
      paymentMethod: 'PayPal',
      deliveryAddress: user2.address,
      createdAt: currentMonthDate,
      updatedAt: currentMonthDate,
      testOrder: true
    });
    await orderCurrent.save();

    console.log('Test orders seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test orders:', error);
    process.exit(1);
  }
}

seedTestOrders();

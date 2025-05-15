const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const connectDB = require('../config/db');

const products = [
  { name: 'Intel Core i9-13900K', category: 'Processors', price: 1299.99, image: 'images/processor1.jpg' },
  { name: 'AMD Ryzen 9 7950X', category: 'Processors', price: 1699.99, image: 'images/processor2.jpg' },
  { name: 'Intel Core i7-13700K', category: 'Processors', price: 1899.99, image: 'images/processor3.jpg' },
  { name: 'NVIDIA GeForce RTX 4090', category: 'Graphics Cards', price: 199.99, image: 'images/gc1.jpg' },
  { name: 'AMD Radeon RX 7900 XTX', category: 'Graphics Cards', price: 159.99, image: 'images/gc2.jpg' },
  { name: 'NVIDIA GeForce RTX 3080 Ti', category: 'Graphics Cards', price: 249.99, image: 'images/gc3.jpg' },
  { name: 'NZXT H510 Elite', category: 'PC Case', price: 89.99, image: 'images/case1.jpg' },
  { name: 'Corsair iCUE 4000X RGB', category: 'PC Case', price: 129.99, image: 'images/case2.jpg' },
  { name: 'Lian Li PC-011 Dynamic', category: 'PC Case', price: 199.99, image: 'images/case3.jpg' },
  { name: 'Keyboard with Mouse', category: 'Other Devices', price: 299.99, image: 'images/keyboard.jpg' },
  { name: 'Motherboard', category: 'Other Devices', price: 199.99, image: 'images/motherboard.jpg' },
  { name: 'Webcam', category: 'Other Devices', price: 79.99, image: 'images/webcam.jpg' },
  { name: 'Headphone', category: 'Other Devices', price: 399.00, image: 'images/microphone.jpg' },
  { name: 'Joystick', category: 'Other Devices', price: 45.99, image: 'images/joystick.jpg' },
  { name: 'Monitor', category: 'Other Devices', price: 1799.99, image: 'images/monitor.jpg' },
];

const seedProducts = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Products seeded successfully');
    process.exit();
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
};

seedProducts();

const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const connectDB = require('../config/db');

const products = [
  { name: 'Intel Core i9-13900K', category: 'Processors', price: 150, images: ['images/processor1.jpg'] },
  { name: 'AMD Ryzen 9 7950X', category: 'Processors', price: 145, images: ['images/processor2.jpg'] },
  { name: 'Intel Core i7-13700K', category: 'Processors', price: 500, images: ['images/processor3.jpg'] },
  { name: 'NVIDIA GeForce RTX 4090', category: 'Graphics Cards', price: 200, images: ['images/gc1.jpg'] },
  { name: 'AMD Radeon RX 7900 XTX', category: 'Graphics Cards', price: 240, images: ['images/gc2.jpg'] },
  { name: 'NVIDIA GeForce RTX 3080 Ti', category: 'Graphics Cards', price: 250, images: ['images/gc3.jpg'] },
  { name: 'NZXT H510 Elite', category: 'PC Case', price: 89, images: ['images/case1.jpg'] },
  { name: 'Corsair iCUE 4000X RGB', category: 'PC Case', price: 180, images: ['images/case2.jpg'] },
  { name: 'Lian Li PC-011 Dynamic', category: 'PC Case', price: 255, images: ['images/case3.jpg'] },
  { name: 'Keyboard with Mouse', category: 'Other Devices', price: 78, images: ['images/keyboard.jpg'] },
  { name: 'Motherboard', category: 'Other Devices', price: 87, images: ['images/motherboard.jpg'] },
  { name: 'Webcam', category: 'Other Devices', price: 62, images: ['images/webcam.jpg'] },
  { name: 'Headphone', category: 'Other Devices', price: 399, images: ['images/microphone.jpg'] },
  { name: 'Joystick', category: 'Other Devices', price: 45, images: ['images/joystick.jpg'] },
  { name: 'Monitor', category: 'Other Devices', price: 127, images: ['images/monitor.jpg'] },
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

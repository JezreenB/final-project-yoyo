const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

const adminUser = {
  fullName: "Yasmien Mae Llona",
  email: "yishaganda@gmail.com",
  password: "yishaganda", // plain password to be hashed
  role: "admin",
  address: "Admin Address" // Added required address field to fix validation error
};

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    const newAdmin = new User({
      fullName: adminUser.fullName,
      email: adminUser.email,
      password: hashedPassword,
      role: adminUser.role,
      address: adminUser.address
    });

    await newAdmin.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MongoDB URI is not defined in .env file');
    }
    console.log('Connecting to MongoDB with URI:', MONGO_URI);
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      name: err.name
    });
    process.exit(1);
  }
};

module.exports = connectDB;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
<<<<<<< HEAD
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' }
}, { collection: 'users', timestamps: true });
=======
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { collection: 'users' });
>>>>>>> cb24943cc1ae5541c634ca51e3a502a4657ce3ae

module.exports = mongoose.model('User', userSchema);

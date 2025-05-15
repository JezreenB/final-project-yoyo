const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const SECRET_KEY = process.env.JWT_SECRET;

// User registration
exports.register = async (req, res) => {
  const { fullName, address, email, password, role } = req.body;
  if (!fullName || !address || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role && ['user', 'admin'].includes(role) ? role : 'user';
    const user = new User({ fullName, address, email, password: hashedPassword, role: userRole });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email }); // Log the email being used
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { userId: user._id, email: user.email });
    
    const match = await bcrypt.compare(password, user.password);
    console.log('Password match result:', match);
    
    if (!match) {
      console.log('Password mismatch for user:', user.email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    console.log('Login successful for user:', user.email);
    res.json({ token, fullName: user.fullName, email: user.email, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current logged-in user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};
<<<<<<< HEAD

  
// Get user details by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old and new passwords are required' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
};

// List customers (admin only)
exports.listCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' }).select('-password -__v');
    res.json({ data: customers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

// Get customer by ID (admin only)
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'user' }).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer details' });
  }
};

// Add customer (admin only)
exports.addCustomer = async (req, res) => {
  const { fullName, address, email, password } = req.body;
  if (!fullName || !address || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = new User({ fullName, address, email, password: hashedPassword, role: 'user' });
    await customer.save();
    res.status(201).json({ message: 'Customer added successfully' });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Error adding customer' });
    }
  }
};

// Update customer (admin only)
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'user' });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const { fullName, address, email } = req.body;
    if (fullName) customer.fullName = fullName;
    if (address) customer.address = address;
    if (email) customer.email = email;
    await customer.save();
    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer' });
  }
};

// Delete customer (admin only)
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await User.findOneAndDelete({ _id: req.params.id, role: 'user' });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer' });
  }
};

// User logout
exports.logout = (req, res) => {
  // Since JWT is stateless, logout can be handled on client side by deleting token
  res.json({ message: 'Logout successful' });
};
=======
>>>>>>> cb24943cc1ae5541c634ca51e3a502a4657ce3ae

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

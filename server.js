const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./backend/config/db');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve auth.html at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/auth.html'));
});

// Check if environment variables are loaded
if (!process.env.MONGO_URI) {
  console.error('MongoDB URI is not defined in .env file');
  process.exit(1);
}

console.log('Connecting to MongoDB with URI:', process.env.MONGO_URI);
connectDB();

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve product images from frontend/images
app.use('/images', express.static(path.join(__dirname, 'frontend/images')));

// --- API ROUTES ---
app.use('/api/users', require('./backend/routes/userRoutes'));
app.use('/api/settings', require('./backend/routes/settingsRoutes'));
app.use('/api/products', require('./backend/routes/productRoutes'));
app.use('/api/cart', require('./backend/routes/cartRoutes'));
app.use('/api/orders', require('./backend/routes/orderRoutes'));
app.use('/api/reviews', require('./backend/routes/reviewRoutes'));
app.use('/api', require('./backend/routes/contactRoutes'));
app.use('/api', require('./backend/routes/dashboardRoutes'));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'frontend')));

// Explicit route for products-admin.html
app.get('/products-admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/products-admin.html'));
});

// Catch-all for client-side routes (excluding /api)
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

// Create server with increased header size
const server = http.createServer({ maxHeaderSize: 32768 }, app);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

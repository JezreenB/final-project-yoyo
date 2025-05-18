const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3001;

// Check if environment variables are loaded
if (!process.env.MONGO_URI) {
    console.error('MongoDB URI is not defined in .env file');
    process.exit(1);
}

console.log('Connecting to MongoDB with URI:', process.env.MONGO_URI);
connectDB();

const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Enable CORS for all origins temporarily for testing
app.use(cors());

app.use(bodyParser.json({ limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve product images statically
app.use('/images', express.static(path.join(__dirname, '../images')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api', contactRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
/* const reportsRoutes = require('./routes/reportsRoutes'); */
app.use('/api', dashboardRoutes);
// Removed reportsRoutes to disable reports backend without affecting other routes
// app.use('/api', reportsRoutes);

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

const productsAdminPath = path.join(__dirname, '../frontend/products-admin.html');

// Serve products-admin.html explicitly before catch-all route
app.get('/products-admin.html', (req, res) => {
    res.sendFile(productsAdminPath);
});

// Handle frontend routes except API routes
app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Create HTTP server with increased maxHeaderSize (32kb)
const server = http.createServer({ maxHeaderSize: 32768 }, app);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticateToken = require('../middleware/authenticateToken');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Get products
router.get('/', productController.getProducts);

// Search products by query
router.get('/search', productController.searchProducts);

// Add product (admin only) with image upload
router.post('/', authenticateToken, authenticateAdmin, upload.array('images', 3), productController.addProduct);

// Delete product by id (admin only)
router.delete('/:id', authenticateToken, authenticateAdmin, productController.deleteProduct);

// Update product by id (admin only) with image upload
router.put('/:id', authenticateToken, authenticateAdmin, upload.array('images', 3), productController.updateProduct);

// Bulk delete products (admin only)
router.post('/bulk-delete', authenticateToken, authenticateAdmin, productController.bulkDeleteProducts);

// Bulk update stock (admin only)
router.post('/bulk-update-stock', authenticateToken, authenticateAdmin, productController.bulkUpdateStock);

// Bulk change category (admin only)
router.post('/bulk-change-category', authenticateToken, authenticateAdmin, productController.bulkChangeCategory);

module.exports = router;

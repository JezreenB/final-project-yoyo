const express = require('express');
const router = express.Router();
const authenticateAdmin = require('../middleware/authenticateAdmin');
const {
  getKpiSummary,
  getMonthlyRevenue,
  getCustomerGrowth,
  getSalesByCategory,
  getBestSellingProducts
} = require('../controllers/reportsController');

router.get('/kpi-summary', authenticateAdmin, getKpiSummary);
router.get('/monthly-revenue', authenticateAdmin, getMonthlyRevenue);
router.get('/customer-growth', authenticateAdmin, getCustomerGrowth);
router.get('/sales-by-category', authenticateAdmin, getSalesByCategory);
router.get('/best-selling-products', authenticateAdmin, getBestSellingProducts);

module.exports = router;

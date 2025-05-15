const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Helper function to get start and end of year for current year
function getYearDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  return { start, end };
}

// KPI summary data
const getKpiSummary = async (req, res) => {
  try {
    const { start, end } = getYearDateRange();

    // Total sales year to date
    const totalSalesResult = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, orderDate: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

    // New customers last 12 months
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const newCustomersCount = await User.countDocuments({ role: 'user', createdAt: { $gte: lastYear } });

    // Profit margin placeholder (could be calculated from orders and costs if available)
    const profitMargin = 28; // static for now, can be improved

    // Inventory status: count of products with stock less than threshold (e.g., 10)
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 10 } });

    res.json({
      totalSales,
      newCustomers: newCustomersCount,
      profitMargin,
      lowStockCount
    });
  } catch (error) {
    console.error('Error fetching KPI summary:', error);
    res.status(500).json({ message: 'Server error fetching KPI summary' });
  }
};

// Monthly revenue data for sales over time chart
const getMonthlyRevenue = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();

    const monthlyRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, orderDate: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) } } },
      {
        $group: {
          _id: { $month: '$orderDate' },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Format data for frontend chart
    const revenueByMonth = Array(12).fill(0);
    monthlyRevenue.forEach(item => {
      revenueByMonth[item._id - 1] = item.totalRevenue;
    });

    res.json(revenueByMonth);
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ message: 'Server error fetching monthly revenue' });
  }
};

// New customer acquisition data for customer growth chart
const getCustomerGrowth = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();

    const monthlyNewCustomers = await User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const newCustomersByMonth = Array(12).fill(0);
    monthlyNewCustomers.forEach(item => {
      newCustomersByMonth[item._id - 1] = item.count;
    });

    res.json(newCustomersByMonth);
  } catch (error) {
    console.error('Error fetching customer growth:', error);
    res.status(500).json({ message: 'Server error fetching customer growth' });
  }
};

// Sales distribution by product category for doughnut chart
const getSalesByCategory = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();

    const salesByCategory = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, orderDate: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) } } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSales: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
        }
      }
    ]);

    res.json(salesByCategory);
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ message: 'Server error fetching sales by category' });
  }
};

// Best selling products data for table
const getBestSellingProducts = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();

    const bestSelling = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, orderDate: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.productId',
          unitsSold: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $sort: { unitsSold: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          productName: '$product.name',
          unitsSold: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json(bestSelling);
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    res.status(500).json({ message: 'Server error fetching best selling products' });
  }
};

module.exports = {
  getKpiSummary,
  getMonthlyRevenue,
  getCustomerGrowth,
  getSalesByCategory,
  getBestSellingProducts
};

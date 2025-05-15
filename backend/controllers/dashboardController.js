const Order = require('../models/Order');
const User = require('../models/User');

const getDashboardData = async (req, res) => {
  try {
    // Fetch all orders regardless of status
    const allOrders = await Order.find({})
      .populate('userId', 'fullName')
      .populate('items.productId', 'name')
      .lean();

    // Fetch delivered orders (case-insensitive)
    const deliveredOrders = allOrders.filter(order => order.status && order.status.toLowerCase() === 'delivered');

    // Calculate metrics for delivered orders
    const totalSalesDelivered = deliveredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const ordersCountDelivered = deliveredOrders.length;
    const uniqueCustomerIdsDelivered = new Set(deliveredOrders.map(order => order.userId ? order.userId._id.toString() : null).filter(id => id));
    const customersCountDelivered = uniqueCustomerIdsDelivered.size;
    const averageOrderValueDelivered = ordersCountDelivered > 0 ? totalSalesDelivered / ordersCountDelivered : 0;

    // Calculate metrics for all orders
    const totalSalesAll = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const ordersCountAll = allOrders.length;
    const uniqueCustomerIdsAll = new Set(allOrders.map(order => order.userId ? order.userId._id.toString() : null).filter(id => id));
    const customersCountAll = uniqueCustomerIdsAll.size;
    const averageOrderValueAll = ordersCountAll > 0 ? totalSalesAll / ordersCountAll : 0;

    // Calculate change as ratio of delivered to all orders (percentage)
    function calculateRatio(current, total) {
      if (total === 0) {
        return 0;
      }
      return (current / total) * 100;
    }

    const totalSalesChange = calculateRatio(totalSalesDelivered, totalSalesAll);
    const ordersCountChange = calculateRatio(ordersCountDelivered, ordersCountAll);
    const customersCountChange = calculateRatio(customersCountDelivered, customersCountAll);
    const averageOrderValueChange = calculateRatio(averageOrderValueDelivered, averageOrderValueAll);

    // Fetch recent orders (latest 5) regardless of status
    const recentOrdersRaw = allOrders
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 5);

    const recentOrders = recentOrdersRaw.map(order => {
      const productNames = order.items.map(item => item.productId.name).join(', ');
      return {
        orderNumber: order.orderNumber,
        customer: order.userId ? order.userId.fullName : 'Unknown',
        products: productNames,
        amount: order.total,
        status: order.status
      };
    });

    res.json({
      totalSales: totalSalesDelivered,
      ordersCount: ordersCountDelivered,
      customersCount: customersCountDelivered,
      averageOrderValue: averageOrderValueDelivered,
      recentOrders,
      totalSalesChange,
      ordersCountChange,
      customersCountChange,
      averageOrderValueChange
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
};

module.exports = {
  getDashboardData
};

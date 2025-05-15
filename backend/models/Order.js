const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  total: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  shippingMethod: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  items: [orderItemSchema],
<<<<<<< HEAD
  statusNotes: [
    {
      note: { type: String },
      date: { type: Date, default: Date.now }
    }
  ]
=======
>>>>>>> cb24943cc1ae5541c634ca51e3a502a4657ce3ae
});

module.exports = mongoose.model('Order', orderSchema);

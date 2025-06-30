const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  products: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true }
    }
  ]
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  name: { type: String, default: null },
  phone: { type: String, default: null },
  email: { type: String, default: null },
  products: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  address: { type: String, required: true },

  status: {
    type: String,
    enum: ['beklemede', 'tamamlandı', 'iptal','hazırlanıyor'],
    default: 'beklemede'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Cart = mongoose.model('Cart', cartSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = {
  Cart,
  Order
};

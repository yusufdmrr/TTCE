const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  address: { type: String },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  orders: { type: [String], default: [] }, // 🔸 Sipariş ID’lerini string olarak tutar
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
module.exports = User;

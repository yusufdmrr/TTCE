const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  description: { type: String },
  categoryId: { type: String, required: true },
  price: { type: String, required: true },
  stock: { type: String, default: 0 },
  image: { type: String, required: true},
  isActive: { 
    type: Boolean, 
    default: true 
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

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

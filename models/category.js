const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  productList: {
    type: [String], // Dizinin içi string olacak
    default: []     // İlk başta boş dizi olarak eklenecek
  },
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

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;

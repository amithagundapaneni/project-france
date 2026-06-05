const mongoose = require('mongoose');

const shoppingItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['clothing', 'accessories', 'electronics', 'toiletries', 'travel-gear', 'gifts', 'other'],
    default: 'other'
  },
  name: { type: String, required: true },
  estimatedPrice: { type: Number, default: 0 },
  actualPrice: { type: Number },
  purchased: { type: Boolean, default: false },
  priority: { type: String, enum: ['want', 'need', 'luxury'], default: 'want' },
  store: { type: String },
  url: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ShoppingItem', shoppingItemSchema);

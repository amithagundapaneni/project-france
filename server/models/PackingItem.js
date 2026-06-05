const mongoose = require('mongoose');

const packingItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['clothing', 'toiletries', 'electronics', 'documents', 'medications', 'accessories', 'shoes', 'other'],
    required: true
  },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  packed: { type: Boolean, default: false },
  essential: { type: Boolean, default: false },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PackingItem', packingItemSchema);

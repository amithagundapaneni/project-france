const mongoose = require('mongoose');

const bucketListItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: ['food', 'sightseeing', 'culture', 'adventure', 'shopping', 'nightlife', 'daytrip', 'other'],
    default: 'other'
  },
  location: { type: String },
  city: { type: String, default: 'Paris' },
  completed: { type: Boolean, default: false },
  completedDate: { type: Date },
  image: { type: String },
  priority: { type: String, enum: ['must-do', 'want-to', 'if-time'], default: 'want-to' },
  estimatedCost: { type: Number },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BucketListItem', bucketListItemSchema);

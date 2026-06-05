const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['travel-tips', 'contacts', 'emergency', 'university', 'housing', 'transport', 'general'],
    default: 'general'
  },
  isPinned: { type: Boolean, default: false },
  color: { type: String, default: '#fdf6ec' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);

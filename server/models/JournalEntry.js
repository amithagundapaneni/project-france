const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, enum: ['excited', 'happy', 'neutral', 'anxious', 'sad', 'nostalgic'], default: 'happy' },
  images: [{ type: String }],
  tags: [{ type: String }],
  location: { type: String },
  date: { type: Date, default: Date.now },
  isPrivate: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);

const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  date: { type: Date }
});

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true }, // fitness, career, personal, french, custom
  title: { type: String, required: true },
  description: { type: String },
  targetDate: { type: Date },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  milestones: [milestoneSchema],
  completed: { type: Boolean, default: false },
  emoji: { type: String, default: '🎯' },
  color: { type: String, default: '#c8956c' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);

const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  french: { type: String, required: true },
  english: { type: String, required: true },
  pronunciation: { type: String },
  category: {
    type: String,
    enum: ['greetings', 'food', 'travel', 'shopping', 'emergency', 'social', 'academic', 'numbers', 'other'],
    default: 'other'
  },
  mastered: { type: Boolean, default: false },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const phraseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  french: { type: String, required: true },
  english: { type: String, required: true },
  context: { type: String },
  category: { type: String, default: 'general' },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const frenchNoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'grammar' },
  createdAt: { type: Date, default: Date.now }
});

const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);
const Phrase = mongoose.model('Phrase', phraseSchema);
const FrenchNote = mongoose.model('FrenchNote', frenchNoteSchema);

module.exports = { Vocabulary, Phrase, FrenchNote };

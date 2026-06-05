const express = require('express');
const { Vocabulary, Phrase, FrenchNote } = require('../models/French');
const auth = require('../middleware/auth');
const router = express.Router();

// Vocabulary
router.get('/vocabulary', auth, async (req, res) => {
  try {
    const vocab = await Vocabulary.find({ user: req.user.id }).sort({ category: 1 });
    res.json(vocab);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/vocabulary', auth, async (req, res) => {
  try {
    const word = new Vocabulary({ ...req.body, user: req.user.id });
    await word.save();
    res.status(201).json(word);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/vocabulary/:id', auth, async (req, res) => {
  try {
    const word = await Vocabulary.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(word);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/vocabulary/:id', auth, async (req, res) => {
  try {
    await Vocabulary.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Phrases
router.get('/phrases', auth, async (req, res) => {
  try {
    const phrases = await Phrase.find({ user: req.user.id });
    res.json(phrases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/phrases', auth, async (req, res) => {
  try {
    const phrase = new Phrase({ ...req.body, user: req.user.id });
    await phrase.save();
    res.status(201).json(phrase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/phrases/:id', auth, async (req, res) => {
  try {
    const phrase = await Phrase.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(phrase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/phrases/:id', auth, async (req, res) => {
  try {
    await Phrase.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Notes
router.get('/notes', auth, async (req, res) => {
  try {
    const notes = await FrenchNote.find({ user: req.user.id });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/notes', auth, async (req, res) => {
  try {
    const note = new FrenchNote({ ...req.body, user: req.user.id });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/notes/:id', auth, async (req, res) => {
  try {
    await FrenchNote.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed starter phrases
router.post('/seed', auth, async (req, res) => {
  try {
    const phrases = [
      { french: 'Bonjour', english: 'Hello / Good morning', category: 'greetings' },
      { french: 'Bonsoir', english: 'Good evening', category: 'greetings' },
      { french: 'Au revoir', english: 'Goodbye', category: 'greetings' },
      { french: 'Merci beaucoup', english: 'Thank you very much', category: 'greetings' },
      { french: 'S\'il vous plaît', english: 'Please (formal)', category: 'greetings' },
      { french: 'Excusez-moi', english: 'Excuse me', category: 'greetings' },
      { french: 'Parlez-vous anglais?', english: 'Do you speak English?', category: 'social' },
      { french: 'Je ne comprends pas', english: 'I don\'t understand', category: 'social' },
      { french: 'Où est...?', english: 'Where is...?', category: 'travel' },
      { french: 'Un café, s\'il vous plaît', english: 'A coffee, please', category: 'food' },
      { french: 'L\'addition, s\'il vous plaît', english: 'The bill, please', category: 'food' },
      { french: 'Je voudrais...', english: 'I would like...', category: 'food' },
      { french: 'C\'est combien?', english: 'How much is it?', category: 'shopping' },
      { french: 'Au secours!', english: 'Help!', category: 'emergency' },
      { french: 'J\'ai besoin d\'un médecin', english: 'I need a doctor', category: 'emergency' },
    ];
    const items = phrases.map(p => ({ ...p, user: req.user.id }));
    await Phrase.insertMany(items);
    res.json({ message: 'Seeded starter phrases' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

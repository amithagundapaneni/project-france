const express = require('express');
const BucketListItem = require('../models/BucketListItem');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await BucketListItem.find({ user: req.user.id }).sort({ priority: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = new BucketListItem({ ...req.body, user: req.user.id });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await BucketListItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await BucketListItem.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/seed', auth, async (req, res) => {
  try {
    const defaults = [
      { category: 'sightseeing', title: 'See the Eiffel Tower at night', city: 'Paris', priority: 'must-do' },
      { category: 'culture', title: 'Visit the Louvre', city: 'Paris', priority: 'must-do' },
      { category: 'food', title: 'Eat a croissant from a real boulangerie', city: 'Paris', priority: 'must-do' },
      { category: 'food', title: 'Have café au lait at a Parisian café', city: 'Paris', priority: 'must-do' },
      { category: 'sightseeing', title: 'Walk along the Seine at sunset', city: 'Paris', priority: 'must-do' },
      { category: 'culture', title: 'Visit Musée d\'Orsay', city: 'Paris', priority: 'want-to' },
      { category: 'sightseeing', title: 'See Sacré-Cœur in Montmartre', city: 'Paris', priority: 'want-to' },
      { category: 'food', title: 'Try escargot', city: 'Paris', priority: 'want-to' },
      { category: 'daytrip', title: 'Day trip to Versailles', city: 'Versailles', priority: 'want-to' },
      { category: 'daytrip', title: 'Visit the Loire Valley châteaux', city: 'Loire Valley', priority: 'if-time' },
      { category: 'shopping', title: 'Shop at a Parisian marché (market)', city: 'Paris', priority: 'want-to' },
      { category: 'culture', title: 'Attend a classical music concert', city: 'Paris', priority: 'if-time' },
    ];
    const items = defaults.map(d => ({ ...d, user: req.user.id }));
    await BucketListItem.insertMany(items);
    res.json({ message: 'Seeded bucket list' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

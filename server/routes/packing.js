const express = require('express');
const PackingItem = require('../models/PackingItem');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await PackingItem.find({ user: req.user.id }).sort({ category: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = new PackingItem({ ...req.body, user: req.user.id });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await PackingItem.findOneAndUpdate(
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
    await PackingItem.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed default packing list
router.post('/seed', auth, async (req, res) => {
  try {
    const defaults = [
      { category: 'documents', name: 'Passport', essential: true },
      { category: 'documents', name: 'Visa / residence permit', essential: true },
      { category: 'documents', name: 'University acceptance letter', essential: true },
      { category: 'documents', name: 'Insurance documents', essential: true },
      { category: 'documents', name: 'Housing contract', essential: true },
      { category: 'clothing', name: 'Winter coat', essential: true },
      { category: 'clothing', name: 'Jeans (x3)', quantity: 3 },
      { category: 'clothing', name: 'Casual tops (x7)', quantity: 7 },
      { category: 'clothing', name: 'Dresses/skirts (x3)', quantity: 3 },
      { category: 'clothing', name: 'Workout clothes', quantity: 3 },
      { category: 'clothing', name: 'Sleepwear (x3)', quantity: 3 },
      { category: 'clothing', name: 'Underwear (x10)', quantity: 10 },
      { category: 'shoes', name: 'Walking shoes / sneakers' },
      { category: 'shoes', name: 'Ballet flats / loafers' },
      { category: 'shoes', name: 'Ankle boots' },
      { category: 'toiletries', name: 'Shampoo & conditioner', essential: true },
      { category: 'toiletries', name: 'Skincare routine', essential: true },
      { category: 'toiletries', name: 'Feminine hygiene products', essential: true },
      { category: 'electronics', name: 'Laptop + charger', essential: true },
      { category: 'electronics', name: 'Phone + charger', essential: true },
      { category: 'electronics', name: 'EU power adapter', essential: true },
      { category: 'electronics', name: 'Portable charger / power bank' },
      { category: 'medications', name: 'Prescription medications (3 months)', essential: true },
      { category: 'medications', name: 'Pain relievers (paracetamol)', essential: true },
      { category: 'accessories', name: 'Scarf / beret' },
      { category: 'accessories', name: 'Umbrella' },
      { category: 'accessories', name: 'Reusable tote bag' },
    ];
    const items = defaults.map(d => ({ ...d, user: req.user.id }));
    await PackingItem.insertMany(items);
    res.json({ message: 'Seeded default packing list' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

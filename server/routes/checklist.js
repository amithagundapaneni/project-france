const express = require('express');
const ChecklistItem = require('../models/ChecklistItem');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await ChecklistItem.find({ user: req.user.id }).sort({ category: 1, createdAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = new ChecklistItem({ ...req.body, user: req.user.id });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await ChecklistItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await ChecklistItem.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed default checklist items
router.post('/seed', auth, async (req, res) => {
  try {
    const defaults = [
      { category: 'visa', title: 'Apply for student visa (VLS-TS)', priority: 'high' },
      { category: 'visa', title: 'Book visa appointment at French consulate', priority: 'high' },
      { category: 'visa', title: 'Prepare visa documents package', priority: 'high' },
      { category: 'documents', title: 'Renew/check passport validity (6+ months)', priority: 'high' },
      { category: 'documents', title: 'Get passport photos (biometric)', priority: 'medium' },
      { category: 'documents', title: 'Notarized birth certificate', priority: 'medium' },
      { category: 'documents', title: 'Official transcripts from home university', priority: 'medium' },
      { category: 'documents', title: 'Acceptance letter from French institution', priority: 'high' },
      { category: 'accommodation', title: 'Confirm housing / dormitory booking', priority: 'high' },
      { category: 'accommodation', title: 'Sign lease or housing contract', priority: 'high' },
      { category: 'accommodation', title: 'Research neighborhood & nearby amenities', priority: 'low' },
      { category: 'flights', title: 'Book one-way or round-trip flight', priority: 'high' },
      { category: 'flights', title: 'Add extra baggage if needed', priority: 'medium' },
      { category: 'flights', title: 'Check in online 24 hours before', priority: 'medium' },
      { category: 'health', title: 'Get required vaccinations', priority: 'high' },
      { category: 'health', title: 'Visit GP for general checkup', priority: 'medium' },
      { category: 'health', title: 'Pack 3-month supply of prescription medications', priority: 'high' },
      { category: 'health', title: 'Get prescription letter in French & English', priority: 'medium' },
      { category: 'insurance', title: 'Arrange health insurance (CPAM or private)', priority: 'high' },
      { category: 'insurance', title: 'Get travel insurance', priority: 'high' },
      { category: 'finances', title: 'Notify bank of travel plans', priority: 'medium' },
      { category: 'finances', title: 'Open Wise/Revolut account for transfers', priority: 'medium' },
      { category: 'finances', title: 'Arrange proof of financial means for visa', priority: 'high' },
    ];
    const items = defaults.map(d => ({ ...d, user: req.user.id }));
    await ChecklistItem.insertMany(items);
    res.json({ message: 'Seeded default checklist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

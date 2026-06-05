const express = require('express');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const goal = new Goal({ ...req.body, user: req.user.id });
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed default goals
router.post('/seed', auth, async (req, res) => {
  try {
    const defaults = [
      { category: 'fitness', title: 'Run 5K without stopping', emoji: '🏃‍♀️', color: '#e8b4b8', milestones: [{ title: 'Run 1K' }, { title: 'Run 2K' }, { title: 'Run 3K' }, { title: 'Run 5K' }] },
      { category: 'fitness', title: 'Go to gym 3x per week', emoji: '💪', color: '#c8956c' },
      { category: 'career', title: 'Complete summer internship/project', emoji: '💼', color: '#8b7355' },
      { category: 'career', title: 'Update LinkedIn & resume', emoji: '📄', color: '#6b8e7e' },
      { category: 'french', title: 'Learn 500 French vocabulary words', emoji: '📚', color: '#b5838d', milestones: [{ title: '100 words' }, { title: '250 words' }, { title: '400 words' }, { title: '500 words' }] },
      { category: 'french', title: 'Complete Duolingo streak (60 days)', emoji: '🦜', color: '#c8956c' },
      { category: 'personal', title: 'Read 5 books before departure', emoji: '📖', color: '#9b7fa6' },
      { category: 'personal', title: 'Learn to cook 3 French recipes', emoji: '🥐', color: '#d4a574' },
    ];
    const items = defaults.map(d => ({ ...d, user: req.user.id }));
    await Goal.insertMany(items);
    res.json({ message: 'Seeded default goals' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

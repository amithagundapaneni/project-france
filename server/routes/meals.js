const express = require('express');
const { Recipe, MealPlan } = require('../models/Meal');
const auth = require('../middleware/auth');
const router = express.Router();

// Recipes
router.get('/recipes', auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/recipes', auth, async (req, res) => {
  try {
    const recipe = new Recipe({ ...req.body, user: req.user.id });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/recipes/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/recipes/:id', auth, async (req, res) => {
  try {
    await Recipe.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Meal Plans
router.get('/plans', auth, async (req, res) => {
  try {
    const plans = await MealPlan.find({ user: req.user.id }).populate('entries.recipeId').sort({ weekStart: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/plans', auth, async (req, res) => {
  try {
    const plan = new MealPlan({ ...req.body, user: req.user.id });
    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/plans/:id', auth, async (req, res) => {
  try {
    const plan = await MealPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const mealPlanEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  customMeal: { type: String },
  notes: { type: String }
});

const recipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: ['french', 'healthy', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'other'],
    default: 'other'
  },
  ingredients: [{ type: String }],
  instructions: [{ type: String }],
  prepTime: { type: Number }, // minutes
  cookTime: { type: Number }, // minutes
  servings: { type: Number },
  calories: { type: Number },
  image: { type: String },
  tags: [{ type: String }],
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const mealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStart: { type: Date, required: true },
  entries: [mealPlanEntrySchema],
  createdAt: { type: Date, default: Date.now }
});

const Recipe = mongoose.model('Recipe', recipeSchema);
const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

module.exports = { Recipe, MealPlan };

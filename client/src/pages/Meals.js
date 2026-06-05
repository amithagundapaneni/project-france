import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';

const CAT_EMOJIS = { french: '🥐', healthy: '🥗', breakfast: '🍳', lunch: '🥪', dinner: '🍽', snack: '🫐', dessert: '🍮', other: '🍴' };
const CATS = ['french', 'healthy', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'other'];

const EMPTY_FORM = {
  title: '', description: '', category: 'healthy',
  ingredients: '', instructions: '',
  prepTime: '', cookTime: '', servings: '', calories: '', tags: ''
};

const STARTER_RECIPES = [
  {
    title: 'Croque Monsieur',
    description: 'Classic French toasted ham and cheese sandwich with béchamel',
    category: 'french',
    ingredients: 'Bread slices\nDijon mustard\nHam slices\nGruyère cheese, grated\nButter\nMilk\nFlour\nNutmeg',
    instructions: 'Make béchamel sauce with butter, flour, and milk. Season with nutmeg and salt.\nSpread mustard on bread slices. Layer ham and cheese.\nTop with béchamel and more cheese.\nBake at 200°C for 10-12 minutes until golden and bubbly.',
    prepTime: 10, cookTime: 15, servings: 2, calories: 480, tags: 'french,quick,comfort'
  },
  {
    title: 'Salade Niçoise',
    description: 'Fresh Mediterranean salad from Nice with tuna, eggs, and olives',
    category: 'healthy',
    ingredients: 'Mixed greens\nTuna in olive oil\nHard-boiled eggs\nCherry tomatoes\nFrench green beans\nNiçoise olives\nAnchovies (optional)\nDijon vinaigrette',
    instructions: 'Cook green beans in salted water until tender-crisp. Cool immediately.\nArrange greens on a large plate.\nTop with tuna, halved eggs, tomatoes, beans, and olives.\nDrizzle with Dijon vinaigrette and serve.',
    prepTime: 15, cookTime: 10, servings: 2, calories: 320, tags: 'healthy,french,no-cook'
  },
  {
    title: 'Overnight Oats with Berries',
    description: 'Prep-ahead healthy breakfast — perfect for busy mornings',
    category: 'breakfast',
    ingredients: '½ cup rolled oats\n1 cup milk or plant milk\n2 tbsp chia seeds\n1 tbsp honey or maple syrup\nVanilla extract\nFresh berries to top\nNuts or granola',
    instructions: 'Combine oats, milk, chia seeds, honey, and vanilla in a jar.\nStir well, cover and refrigerate overnight.\nIn the morning, top with fresh berries and granola.\nEnjoy cold or microwave for 1-2 minutes.',
    prepTime: 5, cookTime: 0, servings: 1, calories: 380, tags: 'healthy,breakfast,meal-prep'
  }
];

function RecipeCard({ recipe, onEdit, onDelete, onFavorite }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card animate-in" style={{ cursor: 'pointer' }}>
      <div className="card-body" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.4rem' }}>{CAT_EMOJIS[recipe.category]}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.95rem' }}>{recipe.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--ink-faint)', letterSpacing: '0.08em' }}>{recipe.category}</div>
            </div>
          </div>
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button className="btn btn-ghost btn-icon" onClick={() => onFavorite(recipe)} title="Favourite" style={{ color: recipe.isFavorite ? '#e8a020' : 'var(--ink-faint)' }}>
              {recipe.isFavorite ? '★' : '☆'}
            </button>
            <button className="btn btn-ghost btn-icon" onClick={() => onEdit(recipe)}>✏</button>
            <button className="btn btn-ghost btn-icon" onClick={() => onDelete(recipe._id)} style={{ color: 'var(--rouge)' }}>✕</button>
          </div>
        </div>

        {recipe.description && <p className="text-sm text-muted mb-2" style={{ fontStyle: 'italic' }}>{recipe.description}</p>}

        <div className="flex gap-3">
          {recipe.prepTime > 0 && <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>⏱ {recipe.prepTime}m prep</span>}
          {recipe.cookTime > 0 && <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>🔥 {recipe.cookTime}m cook</span>}
          {recipe.servings && <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>🍽 {recipe.servings} servings</span>}
          {recipe.calories && <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>⚡ {recipe.calories} cal</span>}
        </div>

        {expanded && (
          <div onClick={e => e.stopPropagation()}>
            <div className="divider-ornament" style={{ margin: '1rem 0 0.75rem' }}>Recipe</div>
            {recipe.ingredients?.length > 0 && (
              <div className="mb-3">
                <div className="form-label mb-1">Ingredients</div>
                <ul style={{ paddingLeft: '1.25rem' }}>
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="text-sm" style={{ marginBottom: '0.2rem' }}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}
            {recipe.instructions?.length > 0 && (
              <div>
                <div className="form-label mb-1">Instructions</div>
                <ol style={{ paddingLeft: '1.25rem' }}>
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="text-sm" style={{ marginBottom: '0.35rem' }}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 mt-2" style={{ color: 'var(--ink-faint)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
          {expanded ? '▲ collapse' : '▼ view recipe'}
        </div>
      </div>
    </div>
  );
}

export default function Meals() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { fetchRecipes(); }, []);
  const fetchRecipes = async () => {
    try { const { data } = await axios.get('/api/meals/recipes'); setRecipes(data); }
    catch { addToast('Failed to load recipes', 'error'); }
    finally { setLoading(false); }
  };

  const seedStarters = async () => {
    try {
      for (const r of STARTER_RECIPES) {
        const payload = {
          ...r,
          ingredients: r.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
          instructions: r.instructions.split('\n').map(s => s.trim()).filter(Boolean),
          tags: r.tags.split(',').map(t => t.trim())
        };
        await axios.post('/api/meals/recipes', payload);
      }
      fetchRecipes();
      addToast('Starter recipes added! 🥐');
    } catch { addToast('Failed to seed', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      ingredients: form.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
      instructions: form.instructions.split('\n').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      prepTime: parseInt(form.prepTime) || 0,
      cookTime: parseInt(form.cookTime) || 0,
      servings: parseInt(form.servings) || 1,
      calories: parseInt(form.calories) || 0,
    };
    try {
      if (editId) {
        const { data } = await axios.put(`/api/meals/recipes/${editId}`, payload);
        setRecipes(prev => prev.map(r => r._id === editId ? data : r));
        addToast('Recipe updated!');
      } else {
        const { data } = await axios.post('/api/meals/recipes', payload);
        setRecipes(prev => [data, ...prev]);
        addToast('Recipe saved!');
      }
      setShowModal(false); setForm(EMPTY_FORM); setEditId(null);
    } catch { addToast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recipe?')) return;
    await axios.delete(`/api/meals/recipes/${id}`);
    setRecipes(prev => prev.filter(r => r._id !== id));
    addToast('Recipe deleted');
  };

  const handleFavorite = async (recipe) => {
    const { data } = await axios.put(`/api/meals/recipes/${recipe._id}`, { isFavorite: !recipe.isFavorite });
    setRecipes(prev => prev.map(r => r._id === recipe._id ? data : r));
  };

  const openEdit = (recipe) => {
    setForm({
      title: recipe.title, description: recipe.description || '', category: recipe.category,
      ingredients: recipe.ingredients.join('\n'), instructions: recipe.instructions.join('\n'),
      prepTime: recipe.prepTime || '', cookTime: recipe.cookTime || '', servings: recipe.servings || '', calories: recipe.calories || '',
      tags: recipe.tags?.join(', ') || ''
    });
    setEditId(recipe._id); setShowModal(true);
  };

  let filtered = recipes;
  if (activeCategory !== 'all') filtered = filtered.filter(r => r.category === activeCategory);
  if (showFavOnly) filtered = filtered.filter(r => r.isFavorite);

  return (
    <div>
      <PageHeader
        scriptAccent="Ma cuisine"
        title="Meals & Recipes"
        subtitle="Healthy recipes and meal inspiration for your journey"
        actions={
          <div className="flex gap-2">
            {recipes.length === 0 && <button className="btn btn-secondary" onClick={seedStarters}>+ Load Starters</button>}
            <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }}>+ Add Recipe</button>
          </div>
        }
      />

      {/* Stats */}
      <div className="flex gap-4 mb-5" style={{ flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--terracotta)' }}>{recipes.length}</span>
          <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>recipes saved</span>
        </div>
        <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: '#e8a020' }}>{recipes.filter(r => r.isFavorite).length}</span>
          <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>favourites</span>
        </div>
        <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--rouge)' }}>{recipes.filter(r => r.category === 'french').length}</span>
          <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>French recipes</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory('all')}>All</button>
        {CATS.map(cat => {
          const count = recipes.filter(r => r.category === cat).length;
          if (!count) return null;
          return (
            <button key={cat} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(cat)}>
              {CAT_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          );
        })}
        <button className={`btn btn-sm ${showFavOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowFavOnly(!showFavOnly)} style={{ marginLeft: 'auto' }}>
          ★ Favourites only
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">🥐</div><div className="empty-state-text">Loading recipes...</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🥗</div>
          <div className="empty-state-text">No recipes yet. Start your recipe book!</div>
          <button className="btn btn-secondary mt-4" onClick={seedStarters}>Load starter recipes</button>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map((recipe, i) => (
            <div key={recipe._id} style={{ animationDelay: `${i * 0.04}s` }}>
              <RecipeCard recipe={recipe} onEdit={openEdit} onDelete={handleDelete} onFavorite={handleFavorite} />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3 className="section-title">{editId ? 'Edit Recipe' : 'Add Recipe'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Recipe Name</label>
                    <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Croque Monsieur" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATS.map(c => <option key={c} value={c}>{CAT_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="A short description..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Ingredients (one per line)</label>
                  <textarea className="form-textarea" rows={5} value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))} placeholder="250g flour&#10;2 eggs&#10;1 cup milk..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Instructions (one step per line)</label>
                  <textarea className="form-textarea" rows={5} value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Preheat oven to 180°C&#10;Mix dry ingredients..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {[['prepTime', 'Prep (min)'], ['cookTime', 'Cook (min)'], ['servings', 'Servings'], ['calories', 'Calories']].map(([field, label]) => (
                    <div className="form-group" key={field}>
                      <label className="form-label">{label}</label>
                      <input type="number" className="form-input" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder="0" min={0} />
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="healthy, quick, vegetarian" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Save Recipe'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

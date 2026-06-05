import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';

const DEFAULT_CATS = ['fitness', 'career', 'french', 'personal'];
const CAT_EMOJIS = { fitness: '🏃‍♀️', career: '💼', french: '🗣', personal: '🌸' };
const CAT_COLORS = { fitness: '#c8956c', career: '#6b8fa8', french: '#b5838d', personal: '#9b7fa6' };

const EMPTY_FORM = { category: 'personal', title: '', description: '', targetDate: '', progress: 0, emoji: '🎯', color: '#c8956c', milestones: [] };

function GoalCard({ goal, onEdit, onDelete, onProgressUpdate }) {
  const [localProgress, setLocalProgress] = useState(goal.progress);

  const handleProgressChange = async (val) => {
    setLocalProgress(val);
    onProgressUpdate(goal._id, val);
  };

  const toggleMilestone = async (idx) => {
    const updated = goal.milestones.map((m, i) => i === idx ? { ...m, completed: !m.completed } : m);
    const completedCount = updated.filter(m => m.completed).length;
    const newProgress = updated.length ? Math.round((completedCount / updated.length) * 100) : localProgress;
    setLocalProgress(newProgress);
    onProgressUpdate(goal._id, newProgress, updated);
  };

  return (
    <div className="card animate-in" style={{ borderLeft: `4px solid ${goal.color || 'var(--terracotta)'}` }}>
      <div className="card-body">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.5rem' }}>{goal.emoji}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.95rem' }}>{goal.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-faint)' }}>
                {goal.category}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button className="btn btn-ghost btn-icon" onClick={() => onEdit(goal)}>✏</button>
            <button className="btn btn-ghost btn-icon" onClick={() => onDelete(goal._id)} style={{ color: 'var(--rouge)' }}>✕</button>
          </div>
        </div>

        {goal.description && (
          <p className="text-sm text-muted mb-3" style={{ fontStyle: 'italic' }}>{goal.description}</p>
        )}

        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>Progress</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: goal.color || 'var(--terracotta)' }}>{localProgress}%</span>
        </div>
        <div className="progress-bar-track mb-2">
          <div className="progress-bar-fill" style={{ width: `${localProgress}%`, background: goal.color }} />
        </div>
        <input
          type="range" min={0} max={100} value={localProgress}
          onChange={e => setLocalProgress(parseInt(e.target.value))}
          onMouseUp={e => handleProgressChange(parseInt(e.target.value))}
          onTouchEnd={e => handleProgressChange(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: goal.color, cursor: 'pointer' }}
        />

        {goal.milestones?.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-muted mb-2" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Milestones</div>
            {goal.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2 mb-1">
                <input type="checkbox" className="custom-checkbox" checked={m.completed} onChange={() => toggleMilestone(i)} />
                <span className={`text-sm ${m.completed ? 'line-through' : ''}`}>{m.title}</span>
              </div>
            ))}
          </div>
        )}

        {goal.targetDate && (
          <div className="mt-2 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--terracotta)' }}>
            🗓 Target: {new Date(goal.targetDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [newMilestone, setNewMilestone] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const { addToast } = useToast();

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try { const { data } = await axios.get('/api/goals'); setGoals(data); }
    catch { addToast('Failed to load goals', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, category: customCategory || form.category };
    try {
      if (editId) {
        const { data } = await axios.put(`/api/goals/${editId}`, payload);
        setGoals(prev => prev.map(g => g._id === editId ? data : g));
        addToast('Goal updated!');
      } else {
        const { data } = await axios.post('/api/goals', payload);
        setGoals(prev => [data, ...prev]);
        addToast('Goal added!');
      }
      setShowModal(false); setForm(EMPTY_FORM); setEditId(null); setCustomCategory('');
    } catch { addToast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    await axios.delete(`/api/goals/${id}`);
    setGoals(prev => prev.filter(g => g._id !== id));
    addToast('Goal deleted');
  };

  const openEdit = (goal) => {
    setForm({ category: goal.category, title: goal.title, description: goal.description || '', targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '', progress: goal.progress, emoji: goal.emoji || '🎯', color: goal.color || '#c8956c', milestones: goal.milestones || [] });
    if (!DEFAULT_CATS.includes(goal.category)) setCustomCategory(goal.category);
    setEditId(goal._id); setShowModal(true);
  };

  const handleProgressUpdate = async (id, progress, milestones) => {
    const payload = { progress };
    if (milestones) payload.milestones = milestones;
    const { data } = await axios.put(`/api/goals/${id}`, payload);
    setGoals(prev => prev.map(g => g._id === id ? data : g));
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setForm(f => ({ ...f, milestones: [...f.milestones, { title: newMilestone.trim(), completed: false }] }));
    setNewMilestone('');
  };

  const removeMilestone = (idx) => setForm(f => ({ ...f, milestones: f.milestones.filter((_, i) => i !== idx) }));

  // Collect all unique categories
  const allCategories = [...new Set(goals.map(g => g.category))];
  const filtered = activeCategory === 'all' ? goals : goals.filter(g => g.category === activeCategory);
  const completedGoals = goals.filter(g => g.completed || g.progress === 100).length;
  const avgProgress = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;

  const EMOJI_OPTIONS = ['🎯', '🏃‍♀️', '💪', '📚', '🌸', '💼', '🎨', '🧘‍♀️', '✍️', '🌍', '🗣', '🥐', '💃', '🌺', '⭐'];
  const COLOR_OPTIONS = ['#c8956c', '#b5838d', '#9b7fa6', '#6b8fa8', '#7a9e7e', '#8b1a1a', '#d4a574', '#6b6b8a'];

  return (
    <div>
      <PageHeader
        scriptAccent="Mes objectifs"
        title="Summer Goals"
        subtitle="Track your fitness, career, French learning & personal goals"
        actions={
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setCustomCategory(''); setShowModal(true); }}>
            + Add Goal
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid-3 mb-6">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div className="text-xs text-muted mb-1" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Goals</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)' }}>{goals.length}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div className="text-xs text-muted mb-1" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Completed</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--sage)' }}>{completedGoals}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div className="text-xs text-muted mb-1" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avg Progress</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--terracotta)' }}>{avgProgress}%</div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5" style={{ flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory('all')}>All</button>
        {allCategories.map(cat => (
          <button key={cat} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(cat)}>
            {CAT_EMOJIS[cat] || '🎯'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">🎯</div><div className="empty-state-text">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌸</div>
          <div className="empty-state-text">No goals yet. Dream big, then plan!</div>
          <button className="btn btn-primary mt-4" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>Add your first goal</button>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map((goal, i) => (
            <div key={goal._id} style={{ animationDelay: `${i * 0.05}s` }}>
              <GoalCard goal={goal} onEdit={openEdit} onDelete={handleDelete} onProgressUpdate={handleProgressUpdate} />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 className="section-title">{editId ? 'Edit Goal' : 'Add New Goal'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Emoji & colour */}
                <div className="form-group">
                  <label className="form-label">Choose Emoji</label>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {EMOJI_OPTIONS.map(em => (
                      <button type="button" key={em} onClick={() => setForm(f => ({ ...f, emoji: em }))}
                        style={{ fontSize: '1.4rem', padding: '0.35rem', borderRadius: '6px', border: form.emoji === em ? '2px solid var(--rouge)' : '2px solid transparent', background: form.emoji === em ? 'var(--surface-2)' : 'transparent', cursor: 'pointer' }}>
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Colour</label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map(col => (
                      <button type="button" key={col} onClick={() => setForm(f => ({ ...f, color: col }))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: col, border: form.color === col ? '3px solid var(--ink)' : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => { setForm(f => ({ ...f, category: e.target.value })); setCustomCategory(''); }}>
                      {DEFAULT_CATS.map(c => <option key={c} value={c}>{CAT_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      <option value="custom">+ Custom...</option>
                    </select>
                  </div>
                  {(form.category === 'custom' || customCategory) && (
                    <div className="form-group">
                      <label className="form-label">Custom Category Name</label>
                      <input className="form-input" value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="e.g. hobbies" required />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Goal Title</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Run 5K without stopping" />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (optional)</label>
                  <textarea className="form-textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Why this goal matters to you..." />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Target Date</label>
                    <input type="date" className="form-input" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Progress: {form.progress}%</label>
                    <input type="range" min={0} max={100} value={form.progress}
                      onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) }))}
                      style={{ width: '100%', accentColor: form.color, marginTop: '0.5rem' }} />
                  </div>
                </div>

                {/* Milestones */}
                <div className="form-group">
                  <label className="form-label">Milestones</label>
                  {form.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: '0.875rem', flex: 1 }}>· {m.title}</span>
                      <button type="button" className="btn btn-ghost btn-icon" onClick={() => removeMilestone(i)} style={{ color: 'var(--rouge)', fontSize: '0.75rem' }}>✕</button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input className="form-input" value={newMilestone} onChange={e => setNewMilestone(e.target.value)}
                      placeholder="Add a milestone..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMilestone())} />
                    <button type="button" className="btn btn-secondary" onClick={addMilestone}>Add</button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Add Goal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

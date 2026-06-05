import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';

const CATS = ['food', 'sightseeing', 'culture', 'adventure', 'shopping', 'nightlife', 'daytrip', 'other'];
const CAT_EMOJIS = { food: '🥐', sightseeing: '🗼', culture: '🎨', adventure: '🧗', shopping: '🛍', nightlife: '🌙', daytrip: '🚆', other: '✨' };
const PRIORITIES = ['must-do', 'want-to', 'if-time'];
const PRI_COLORS = { 'must-do': 'var(--rouge)', 'want-to': 'var(--terracotta)', 'if-time': 'var(--ink-faint)' };
const PRI_BADGE = { 'must-do': 'badge-rouge', 'want-to': 'badge-peach', 'if-time': 'badge-neutral' };

const EMPTY_FORM = { title: '', description: '', category: 'sightseeing', city: 'Paris', priority: 'want-to', estimatedCost: '', notes: '' };

export default function BucketList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePriority, setActivePriority] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const { addToast } = useToast();

  useEffect(() => { fetchItems(); }, []);
  const fetchItems = async () => {
    try { const { data } = await axios.get('/api/bucketlist'); setItems(data); }
    catch { addToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  const handleToggle = async (item) => {
    const { data } = await axios.put(`/api/bucketlist/${item._id}`, {
      completed: !item.completed,
      completedDate: !item.completed ? new Date() : null
    });
    setItems(prev => prev.map(i => i._id === item._id ? data : i));
    if (!item.completed) addToast('✨ Adventure completed!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, estimatedCost: parseFloat(form.estimatedCost) || 0 };
    try {
      if (editId) {
        const { data } = await axios.put(`/api/bucketlist/${editId}`, payload);
        setItems(prev => prev.map(i => i._id === editId ? data : i));
        addToast('Updated!');
      } else {
        const { data } = await axios.post('/api/bucketlist', payload);
        setItems(prev => [data, ...prev]);
        addToast('Added to bucket list!');
      }
      setShowModal(false); setForm(EMPTY_FORM); setEditId(null);
    } catch { addToast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove from bucket list?')) return;
    await axios.delete(`/api/bucketlist/${id}`);
    setItems(prev => prev.filter(i => i._id !== id));
  };

  const openEdit = (item) => {
    setForm({ title: item.title, description: item.description || '', category: item.category, city: item.city || 'Paris', priority: item.priority, estimatedCost: item.estimatedCost || '', notes: item.notes || '' });
    setEditId(item._id); setShowModal(true);
  };

  let filtered = items;
  if (activeCategory !== 'all') filtered = filtered.filter(i => i.category === activeCategory);
  if (activePriority !== 'all') filtered = filtered.filter(i => i.priority === activePriority);

  const completed = items.filter(i => i.completed).length;
  const mustDo = items.filter(i => i.priority === 'must-do').length;
  const mustDoDone = items.filter(i => i.priority === 'must-do' && i.completed).length;

  return (
    <div>
      <PageHeader
        scriptAccent="Ma liste de rêves"
        title="France Bucket List"
        subtitle="All the places, foods, and experiences waiting for you in France"
        actions={
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }}>
            + Add Experience
          </button>
        }
      />

      {/* Stats */}
      <div className="grid-3 mb-5">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--terracotta)' }}>{completed}/{items.length}</div>
            <div className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Experiences</div>
            <div className="progress-bar-track mt-2">
              <div className="progress-bar-fill" style={{ width: `${items.length ? (completed / items.length) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--rouge)' }}>{mustDoDone}/{mustDo}</div>
            <div className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Must-Dos Done</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--sage)' }}>{items.filter(i => i.category === 'food').length}</div>
            <div className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Food Adventures</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory('all')}>All Categories</button>
        {CATS.map(cat => {
          const count = items.filter(i => i.category === cat).length;
          if (!count) return null;
          return (
            <button key={cat} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(cat)}>
              {CAT_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 mb-5" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', ...PRIORITIES].map(p => (
          <button key={p} className={`btn btn-sm ${activePriority === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActivePriority(p)}>
            {p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        <div className="flex gap-1" style={{ marginLeft: 'auto' }}>
          <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('grid')}>⊞ Grid</button>
          <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('list')}>☰ List</button>
        </div>
      </div>

      {/* Priority sections */}
      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">🗼</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗼</div>
          <div className="empty-state-text">Your bucket list is empty. Start dreaming!</div>
          <button className="btn btn-primary mt-4" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>Add first experience</button>
        </div>
      ) : viewMode === 'grid' ? (
        PRIORITIES.map(priority => {
          const priorityItems = filtered.filter(i => i.priority === priority);
          if (!priorityItems.length) return null;
          return (
            <div key={priority} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="section-title" style={{ fontSize: '1rem', color: PRI_COLORS[priority] }}>
                  {priority === 'must-do' ? '⭐ Must Do' : priority === 'want-to' ? '🌟 Want To' : '💫 If Time Permits'}
                </h3>
                <span className="badge badge-neutral">{priorityItems.filter(i => i.completed).length}/{priorityItems.length}</span>
              </div>
              <div className="grid-3">
                {priorityItems.map(item => (
                  <div key={item._id} className="card animate-in" style={{ opacity: item.completed ? 0.7 : 1, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="card-body">
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: '1.5rem' }}>{CAT_EMOJIS[item.category]}</span>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-icon" onClick={() => handleToggle(item)} style={{ color: item.completed ? 'var(--sage)' : 'var(--ink-faint)', fontSize: '1rem' }}>
                            {item.completed ? '✓' : '○'}
                          </button>
                          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(item)}>✏</button>
                          <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(item._id)} style={{ color: 'var(--rouge)' }}>✕</button>
                        </div>
                      </div>
                      <div className={`section-title ${item.completed ? 'line-through' : ''}`} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.title}</div>
                      {item.city && <div className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>📍 {item.city}</div>}
                      {item.description && <p className="text-xs text-muted mt-1" style={{ fontStyle: 'italic' }}>{item.description}</p>}
                      {item.estimatedCost > 0 && <div className="text-xs mt-1" style={{ color: 'var(--sage)', fontFamily: 'var(--font-mono)' }}>€{item.estimatedCost}</div>}
                      {item.completed && item.completedDate && (
                        <div className="badge badge-sage mt-2">✓ Done {new Date(item.completedDate).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="card">
          {filtered.map(item => (
            <div key={item._id} className="flex items-center gap-3" style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <button onClick={() => handleToggle(item)} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: item.completed ? 'var(--sage)' : 'var(--ink-faint)' }}>
                {item.completed ? '✓' : '○'}
              </button>
              <span style={{ fontSize: '1.1rem' }}>{CAT_EMOJIS[item.category]}</span>
              <div style={{ flex: 1 }}>
                <span className={`text-sm ${item.completed ? 'line-through' : ''}`}>{item.title}</span>
                {item.city && <span className="text-xs text-muted ml-2" style={{ fontFamily: 'var(--font-mono)' }}>· {item.city}</span>}
              </div>
              <span className={`badge ${PRI_BADGE[item.priority]}`}>{item.priority}</span>
              <div className="flex gap-1">
                <button className="btn btn-ghost btn-icon" onClick={() => openEdit(item)}>✏</button>
                <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(item._id)} style={{ color: 'var(--rouge)' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="section-title">{editId ? 'Edit Experience' : 'Add to Bucket List'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Experience Title</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Watch sunset from Sacré-Cœur" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATS.map(c => <option key={c} value={c}>{CAT_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">City / Location</label>
                    <input className="form-input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Paris" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Est. Cost (€)</label>
                    <input type="number" className="form-input" value={form.estimatedCost} onChange={e => setForm(f => ({ ...f, estimatedCost: e.target.value }))} placeholder="0" min={0} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What makes this special..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Tips, best time to visit, etc." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save' : 'Add to List'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

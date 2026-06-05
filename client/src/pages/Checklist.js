import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['visa', 'documents', 'accommodation', 'flights', 'health', 'insurance', 'finances', 'other'];
const PRIORITIES = ['high', 'medium', 'low'];
const CAT_EMOJIS = { visa: '🛂', documents: '📄', accommodation: '🏠', flights: '✈️', health: '💊', insurance: '🛡', finances: '💰', other: '📌' };
const CAT_COLORS = { visa: 'var(--rouge)', documents: 'var(--dusty-blue)', accommodation: 'var(--sage)', flights: 'var(--terracotta)', health: 'var(--rose)', insurance: 'var(--ink-mid)', finances: 'var(--peach)', other: 'var(--ink-faint)' };
const PRI_COLORS = { high: 'badge-rouge', medium: 'badge-peach', low: 'badge-neutral' };

const EMPTY_FORM = { category: 'visa', title: '', description: '', priority: 'medium', dueDate: '', notes: '' };

export default function Checklist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const { data } = await axios.get('/api/checklist');
      setItems(data);
    } catch { addToast('Failed to load checklist', 'error'); }
    finally { setLoading(false); }
  };

  const handleToggle = async (item) => {
    try {
      const { data } = await axios.put(`/api/checklist/${item._id}`, { completed: !item.completed });
      setItems(prev => prev.map(i => i._id === item._id ? data : i));
    } catch { addToast('Failed to update', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { data } = await axios.put(`/api/checklist/${editId}`, form);
        setItems(prev => prev.map(i => i._id === editId ? data : i));
        addToast('Item updated');
      } else {
        const { data } = await axios.post('/api/checklist', form);
        setItems(prev => [...prev, data]);
        addToast('Item added');
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditId(null);
    } catch { addToast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`/api/checklist/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      addToast('Item deleted');
    } catch { addToast('Failed to delete', 'error'); }
  };

  const openEdit = (item) => {
    setForm({ category: item.category, title: item.title, description: item.description || '', priority: item.priority, dueDate: item.dueDate ? item.dueDate.slice(0, 10) : '', notes: item.notes || '' });
    setEditId(item._id);
    setShowModal(true);
  };

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = filtered.filter(i => i.category === cat);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {});

  const totalDone = items.filter(i => i.completed).length;
  const totalPct = items.length ? Math.round((totalDone / items.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        scriptAccent="Avant le départ"
        title="Pre-Departure Checklist"
        subtitle="Everything you need to tick off before flying to France"
        actions={
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }}>
            + Add Item
          </button>
        }
      />

      {/* Progress */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between mb-2">
            <span className="section-title" style={{ fontSize: '1rem' }}>Overall Progress</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--rouge)' }}>{totalPct}%</span>
          </div>
          <div className="progress-bar-track" style={{ height: 12 }}>
            <div className="progress-bar-fill" style={{ width: `${totalPct}%` }} />
          </div>
          <div className="text-xs text-muted mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
            {totalDone} of {items.length} tasks complete
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory('all')}>
          All ({items.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = items.filter(i => i.category === cat).length;
          if (!count) return null;
          return (
            <button key={cat} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(cat)}>
              {CAT_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">Loading...</div></div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="card mb-4">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '1.2rem' }}>{CAT_EMOJIS[cat]}</span>
                <h3 className="section-title" style={{ fontSize: '1rem', textTransform: 'capitalize' }}>{cat}</h3>
                <span className="badge badge-neutral">{catItems.filter(i => i.completed).length}/{catItems.length}</span>
              </div>
              <div className="progress-bar-track" style={{ width: 80 }}>
                <div className="progress-bar-fill" style={{ width: `${Math.round((catItems.filter(i => i.completed).length / catItems.length) * 100)}%`, background: CAT_COLORS[cat] }} />
              </div>
            </div>
            <div className="card-body" style={{ padding: '0.5rem 0' }}>
              {catItems.map(item => (
                <div key={item._id} className="flex items-center gap-3" style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <input type="checkbox" className="custom-checkbox" checked={item.completed} onChange={() => handleToggle(item)} />
                  <div style={{ flex: 1 }}>
                    <div className={`flex items-center gap-2 ${item.completed ? 'line-through' : ''}`}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--ink)' }}>{item.title}</span>
                      <span className={`badge ${PRI_COLORS[item.priority]}`}>{item.priority}</span>
                    </div>
                    {item.description && <div className="text-xs text-muted mt-1">{item.description}</div>}
                    {item.dueDate && <div className="text-xs" style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>Due: {new Date(item.dueDate).toLocaleDateString()}</div>}
                  </div>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-icon" onClick={() => openEdit(item)} title="Edit">✏</button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(item._id)} title="Delete" style={{ color: 'var(--rouge)' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="section-title">{editId ? 'Edit Item' : 'Add Checklist Item'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Book visa appointment" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (optional)</label>
                  <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Additional details..." />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Any extra notes..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

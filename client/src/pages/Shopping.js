import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';

const CATS = ['clothing', 'accessories', 'electronics', 'toiletries', 'travel-gear', 'gifts', 'other'];
const CAT_EMOJIS = { clothing: '👗', accessories: '👜', electronics: '💻', toiletries: '🧴', 'travel-gear': '🎒', gifts: '🎁', other: '🛍' };
const PRIORITIES = ['need', 'want', 'luxury'];
const PRI_COLORS = { need: 'badge-rouge', want: 'badge-peach', luxury: 'badge-blue' };
const EMPTY_FORM = { category: 'clothing', name: '', estimatedPrice: '', priority: 'want', store: '', url: '', notes: '' };

export default function Shopping() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [budget, setBudget] = useState('');
  const { addToast } = useToast();

  useEffect(() => { fetchItems(); }, []);
  const fetchItems = async () => {
    try { const { data } = await axios.get('/api/shopping'); setItems(data); }
    catch { addToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  const handleToggle = async (item) => {
    const { data } = await axios.put(`/api/shopping/${item._id}`, { purchased: !item.purchased });
    setItems(prev => prev.map(i => i._id === item._id ? data : i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, estimatedPrice: parseFloat(form.estimatedPrice) || 0 };
      if (editId) {
        const { data } = await axios.put(`/api/shopping/${editId}`, payload);
        setItems(prev => prev.map(i => i._id === editId ? data : i));
        addToast('Updated!');
      } else {
        const { data } = await axios.post('/api/shopping', payload);
        setItems(prev => [...prev, data]);
        addToast('Item added!');
      }
      setShowModal(false); setForm(EMPTY_FORM); setEditId(null);
    } catch { addToast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove?')) return;
    await axios.delete(`/api/shopping/${id}`);
    setItems(prev => prev.filter(i => i._id !== id));
  };

  const openEdit = (item) => {
    setForm({ category: item.category, name: item.name, estimatedPrice: item.estimatedPrice || '', priority: item.priority, store: item.store || '', url: item.url || '', notes: item.notes || '' });
    setEditId(item._id); setShowModal(true);
  };

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);
  const totalEst = items.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);
  const totalSpent = items.filter(i => i.purchased).reduce((sum, i) => sum + (i.actualPrice || i.estimatedPrice || 0), 0);
  const remaining = budget ? parseFloat(budget) - totalSpent : null;

  return (
    <div>
      <PageHeader
        scriptAccent="Mes achats"
        title="Shopping Tracker"
        subtitle="Keep track of everything on your shopping list"
        actions={
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }}>+ Add Item</button>
        }
      />

      {/* Budget overview */}
      <div className="grid-3 mb-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div className="text-xs text-muted mb-1" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Estimated Total</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--ink)' }}>₹{totalEst.toLocaleString()}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div className="text-xs text-muted mb-1" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Spent So Far</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--terracotta)' }}>₹{totalSpent.toLocaleString()}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div className="text-xs text-muted mb-1" style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Budget Remaining</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: remaining !== null ? (remaining >= 0 ? 'var(--sage)' : 'var(--rouge)') : 'var(--ink-faint)' }}>
              {remaining !== null ? `₹${remaining.toLocaleString()}` : '—'}
            </div>
            {remaining === null && (
              <input
                type="number"
                className="form-input mt-2"
                placeholder="Set budget..."
                value={budget}
                onChange={e => setBudget(e.target.value)}
                style={{ textAlign: 'center', fontSize: '0.8rem' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory('all')}>All</button>
        {CATS.map(cat => {
          const count = items.filter(i => i.category === cat).length;
          if (!count) return null;
          return (
            <button key={cat} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(cat)}>
              {CAT_EMOJIS[cat]} {cat.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          );
        })}
      </div>

      {/* Items list */}
      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="empty-state-icon">🛍</div><div className="empty-state-text">Loading...</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🛍</div><div className="empty-state-text">No items yet. Start your shopping list!</div></div>
        ) : (
          <div>
            {filtered.map(item => (
              <div key={item._id} className="flex items-center gap-3" style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                <input type="checkbox" className="custom-checkbox" checked={item.purchased} onChange={() => handleToggle(item)} />
                <div style={{ flex: 1 }}>
                  <div className={`flex items-center gap-2 ${item.purchased ? 'line-through' : ''}`}>
                    <span style={{ fontSize: '1rem' }}>{CAT_EMOJIS[item.category]}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>{item.name}</span>
                    <span className={`badge ${PRI_COLORS[item.priority]}`}>{item.priority}</span>
                  </div>
                  <div className="flex gap-3 mt-1">
                    {item.estimatedPrice > 0 && <span className="text-xs text-muted">Est. ₹{item.estimatedPrice.toLocaleString()}</span>}
                    {item.store && <span className="text-xs text-muted">@ {item.store}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-icon" onClick={() => openEdit(item)}>✏</button>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(item._id)} style={{ color: 'var(--rouge)' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="section-title">{editId ? 'Edit Item' : 'Add Shopping Item'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATS.map(c => <option key={c} value={c}>{CAT_EMOJIS[c]} {c.replace('-', ' ').replace(/\b\w/g, x => x.toUpperCase())}</option>)}
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
                  <label className="form-label">Item Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Trench coat" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Est. Price (₹)</label>
                    <input type="number" className="form-input" value={form.estimatedPrice} onChange={e => setForm({ ...form, estimatedPrice: e.target.value })} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Store / Brand</label>
                    <input className="form-input" value={form.store} onChange={e => setForm({ ...form, store: e.target.value })} placeholder="e.g. Zara" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">URL (optional)</label>
                  <input className="form-input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Size, colour, etc." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

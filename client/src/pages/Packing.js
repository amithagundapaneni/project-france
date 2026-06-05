import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';

const CATS = ['clothing', 'shoes', 'toiletries', 'electronics', 'documents', 'medications', 'accessories', 'other'];
const CAT_EMOJIS = { clothing: '👚', shoes: '👟', toiletries: '🧴', electronics: '💻', documents: '📄', medications: '💊', accessories: '👜', other: '📦' };
const CAT_COLORS = { clothing: '#c8956c', shoes: '#8b7355', toiletries: '#b5838d', electronics: '#6b8fa8', documents: '#7a9e7e', medications: '#b56e6e', accessories: '#9b7fa6', other: '#c4a882' };
const EMPTY_FORM = { category: 'clothing', name: '', quantity: 1, essential: false, notes: '' };

export default function Packing() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => { fetchItems(); }, []);
  const fetchItems = async () => {
    try { const { data } = await axios.get('/api/packing'); setItems(data); }
    catch { addToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  const handleToggle = async (item) => {
    const { data } = await axios.put(`/api/packing/${item._id}`, { packed: !item.packed });
    setItems(prev => prev.map(i => i._id === item._id ? data : i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { data } = await axios.put(`/api/packing/${editId}`, form);
        setItems(prev => prev.map(i => i._id === editId ? data : i));
        addToast('Updated!');
      } else {
        const { data } = await axios.post('/api/packing', form);
        setItems(prev => [...prev, data]);
        addToast('Item added!');
      }
      setShowModal(false); setForm(EMPTY_FORM); setEditId(null);
    } catch { addToast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item?')) return;
    await axios.delete(`/api/packing/${id}`);
    setItems(prev => prev.filter(i => i._id !== id));
    addToast('Removed');
  };

  const openEdit = (item) => {
    setForm({ category: item.category, name: item.name, quantity: item.quantity, essential: item.essential, notes: item.notes || '' });
    setEditId(item._id); setShowModal(true);
  };

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);
  const packed = items.filter(i => i.packed).length;
  const pct = items.length ? Math.round((packed / items.length) * 100) : 0;

  const grouped = CATS.reduce((acc, cat) => {
    const c = filtered.filter(i => i.category === cat);
    if (c.length) acc[cat] = c;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        scriptAccent="Mes bagages"
        title="Packing Tracker"
        subtitle="Track everything going in your suitcase"
        actions={
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }}>+ Add Item</button>
        }
      />

      {/* Progress overview */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <span className="section-title" style={{ fontSize: '1rem' }}>Suitcase Progress</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--terracotta)' }}>{pct}% packed</span>
          </div>
          <div className="progress-bar-track" style={{ height: 14 }}>
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-4 mt-3">
            <div className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>{packed} packed · {items.length - packed} remaining</div>
            <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--rouge)' }}>{items.filter(i => i.essential && !i.packed).length} essentials still needed</div>
          </div>
        </div>
      </div>

      {/* Category progress bars */}
      <div className="card mb-5">
        <div className="card-header"><h3 className="section-title" style={{ fontSize: '1rem' }}>By Category</h3></div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {CATS.map(cat => {
            const catItems = items.filter(i => i.category === cat);
            if (!catItems.length) return null;
            const catPacked = catItems.filter(i => i.packed).length;
            const catPct = Math.round((catPacked / catItems.length) * 100);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>{CAT_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: CAT_COLORS[cat] }}>{catPacked}/{catItems.length}</span>
                </div>
                <div className="progress-bar-track" style={{ height: 6 }}>
                  <div className="progress-bar-fill" style={{ width: `${catPct}%`, background: CAT_COLORS[cat] }} />
                </div>
              </div>
            );
          })}
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
              {CAT_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">🧳</div><div className="empty-state-text">Loading...</div></div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="card mb-4">
            <div className="card-header">
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>{CAT_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              <span className="badge badge-neutral">{catItems.filter(i => i.packed).length}/{catItems.length}</span>
            </div>
            <div style={{ padding: '0.25rem 0' }}>
              {catItems.map(item => (
                <div key={item._id} className="flex items-center gap-3" style={{ padding: '0.65rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                  <input type="checkbox" className="custom-checkbox" checked={item.packed} onChange={() => handleToggle(item)} />
                  <div style={{ flex: 1 }}>
                    <div className={`flex items-center gap-2 ${item.packed ? 'line-through' : ''}`}>
                      <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
                      {item.quantity > 1 && <span className="badge badge-neutral">×{item.quantity}</span>}
                      {item.essential && <span className="badge badge-rouge">essential</span>}
                    </div>
                    {item.notes && <div className="text-xs text-muted">{item.notes}</div>}
                  </div>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-icon" onClick={() => openEdit(item)}>✏</button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(item._id)} style={{ color: 'var(--rouge)' }}>✕</button>
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
              <h3 className="section-title">{editId ? 'Edit Item' : 'Add Packing Item'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATS.map(c => <option key={c} value={c}>{CAT_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Winter coat" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input type="number" className="form-input" value={form.quantity} min={1} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
                    <input type="checkbox" className="custom-checkbox" id="essential" checked={form.essential} onChange={e => setForm({ ...form, essential: e.target.checked })} />
                    <label htmlFor="essential" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Mark as essential</label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <input className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." />
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

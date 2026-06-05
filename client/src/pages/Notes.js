import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';

const CATS = ['travel-tips', 'contacts', 'emergency', 'university', 'housing', 'transport', 'general'];
const CAT_EMOJIS = { 'travel-tips': '✈️', contacts: '📞', emergency: '🚨', university: '🎓', housing: '🏠', transport: '🚇', general: '📌' };
const NOTE_COLORS = ['#fdf6ec', '#fff0f3', '#f0f5ff', '#f0faf5', '#faf5ff', '#fffbf0', '#f5f5f5'];
const COLOR_LABELS = ['Parchment', 'Rose', 'Sky', 'Sage', 'Lavender', 'Butter', 'Cloud'];

const EMPTY_FORM = { title: '', content: '', category: 'general', isPinned: false, color: '#fdf6ec', tags: '' };

const STARTER_NOTES = [
  { title: 'Emergency Numbers France', category: 'emergency', color: '#fff0f3', content: '🚨 Emergency: 112\n🚒 Fire: 18\n👮 Police: 17\n🏥 Medical: 15 (SAMU)\n🏥 Hospital: SOS Médecins - 3600\n\n📍 Nearest hospital to your address: [fill in]\n📍 Nearest pharmacy: [fill in]', tags: 'emergency,important' },
  { title: 'Useful Paris Transport Info', category: 'transport', color: '#f0f5ff', content: '🚇 Metro: Lines 1-14, runs 5:30am–1:15am (2:15am Fri/Sat)\n🚌 Bus: Many night buses (Noctilien)\n🚲 Vélib\': Bike share, app-based\n🛴 Lime/Bird: E-scooter rentals\n\n💳 Navigo Découverte card: ~€30 for unlimited weekly travel\n🎫 Carnet: 10 single tickets (cheaper than single)\n📱 Apps: RATP, Citymapper, Google Maps', tags: 'transport,paris' },
  { title: 'Important Addresses', category: 'university', color: '#f0faf5', content: '🎓 University address: [fill in]\n🏠 Housing address: [fill in]\n🏥 GP / Doctor: [fill in]\n🏦 Nearest bank: [fill in]\n🛒 Nearest supermarket: [fill in]\n\n📧 University admin email: [fill in]\n📞 Housing office: [fill in]', tags: 'university,contacts' },
  { title: 'French Banking & Money Tips', category: 'travel-tips', color: '#fffbf0', content: '💳 Open a French bank account: BNP Paribas, Société Générale, or online Boursorama\n💸 Wise (formerly TransferWise): Best rates for transfers\n💶 ATMs: Widely available, use your card directly\n🏪 Carte Vitale: French health insurance card - apply at CPAM\n\n⚠️ Notify your home bank before traveling\n💡 Keep some cash - many small shops are cash-only', tags: 'money,banking' },
];

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  useEffect(() => { fetchNotes(); }, []);
  const fetchNotes = async () => {
    try { const { data } = await axios.get('/api/notes'); setNotes(data); }
    catch { addToast('Failed to load notes', 'error'); }
    finally { setLoading(false); }
  };

  const seedStarters = async () => {
    try {
      for (const n of STARTER_NOTES) {
        const payload = { ...n, tags: n.tags.split(',').map(t => t.trim()) };
        await axios.post('/api/notes', payload);
      }
      fetchNotes();
      addToast('Starter notes added! 📌');
    } catch { addToast('Failed to seed', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editId) {
        const { data } = await axios.put(`/api/notes/${editId}`, payload);
        setNotes(prev => prev.map(n => n._id === editId ? data : n));
        addToast('Note updated!');
      } else {
        const { data } = await axios.post('/api/notes', payload);
        setNotes(prev => [data, ...prev]);
        addToast('Note saved!');
      }
      setShowModal(false); setForm(EMPTY_FORM); setEditId(null);
    } catch { addToast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    await axios.delete(`/api/notes/${id}`);
    setNotes(prev => prev.filter(n => n._id !== id));
  };

  const handlePin = async (note) => {
    const { data } = await axios.put(`/api/notes/${note._id}`, { isPinned: !note.isPinned });
    setNotes(prev => prev.map(n => n._id === note._id ? data : n));
  };

  const openEdit = (note) => {
    setForm({ title: note.title, content: note.content, category: note.category, isPinned: note.isPinned, color: note.color || '#fdf6ec', tags: note.tags?.join(', ') || '' });
    setEditId(note._id); setShowModal(true);
  };

  let filtered = notes;
  if (activeCategory !== 'all') filtered = filtered.filter(n => n.category === activeCategory);
  if (searchQuery) filtered = filtered.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinned = filtered.filter(n => n.isPinned);
  const unpinned = filtered.filter(n => !n.isPinned);

  return (
    <div>
      <PageHeader
        scriptAccent="Mes notes"
        title="Notes & Tips"
        subtitle="Important information, travel tips, and anything worth remembering"
        actions={
          <div className="flex gap-2">
            {notes.length === 0 && <button className="btn btn-secondary" onClick={seedStarters}>+ Load Starter Notes</button>}
            <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }}>+ New Note</button>
          </div>
        }
      />

      {/* Search + filter */}
      <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search notes..." style={{ maxWidth: 280 }} />
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory('all')}>All</button>
          {CATS.map(cat => {
            const count = notes.filter(n => n.category === cat).length;
            if (!count) return null;
            return (
              <button key={cat} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(cat)}>
                {CAT_EMOJIS[cat]} {cat.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">📌</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📌</div>
          <div className="empty-state-text">No notes yet. Start capturing important info!</div>
          <button className="btn btn-secondary mt-4" onClick={seedStarters}>Load starter notes</button>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: '1rem' }}>📌</span>
                <h3 className="section-title" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>Pinned</h3>
              </div>
              <div className="grid-3">
                {pinned.map(note => <NoteCard key={note._id} note={note} onEdit={openEdit} onDelete={handleDelete} onPin={handlePin} />)}
              </div>
            </div>
          )}
          {unpinned.length > 0 && (
            <div className="grid-3">
              {unpinned.map(note => <NoteCard key={note._id} note={note} onEdit={openEdit} onDelete={handleDelete} onPin={handlePin} />)}
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 className="section-title">{editId ? 'Edit Note' : 'New Note'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Note title..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATS.map(c => <option key={c} value={c}>{CAT_EMOJIS[c]} {c.replace('-', ' ').replace(/\b\w/g, x => x.toUpperCase())}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Note Colour</label>
                  <div className="flex gap-2">
                    {NOTE_COLORS.map((col, i) => (
                      <button type="button" key={col} onClick={() => setForm(f => ({ ...f, color: col }))} title={COLOR_LABELS[i]}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: col, border: form.color === col ? '3px solid var(--ink)' : '2px solid var(--border)', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea className="form-textarea" rows={7} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required placeholder="Write your note here..." style={{ lineHeight: 1.7 }} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tags</label>
                    <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="important, visa, contacts" />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
                    <input type="checkbox" className="custom-checkbox" id="pin" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} />
                    <label htmlFor="pin" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>📌 Pin this note</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Save Note'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete, onPin }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card animate-in" style={{ background: note.color || 'var(--surface-card)', cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div className="card-body" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.1rem' }}>{CAT_EMOJIS[note.category]}</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 500 }}>{note.title}</h3>
          </div>
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button className="btn btn-ghost btn-icon" onClick={() => onPin(note)} style={{ color: note.isPinned ? 'var(--terracotta)' : 'var(--ink-faint)', fontSize: '0.9rem' }}>📌</button>
            <button className="btn btn-ghost btn-icon" onClick={() => onEdit(note)}>✏</button>
            <button className="btn btn-ghost btn-icon" onClick={() => onDelete(note._id)} style={{ color: 'var(--rouge)' }}>✕</button>
          </div>
        </div>

        <p className="text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, overflow: expanded ? 'visible' : 'hidden', display: expanded ? 'block' : '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', color: 'var(--ink-mid)' }}>
          {note.content}
        </p>

        {note.tags?.length > 0 && (
          <div className="flex gap-1 mt-2" style={{ flexWrap: 'wrap' }}>
            {note.tags.map(tag => <span key={tag} className="badge badge-neutral">#{tag}</span>)}
          </div>
        )}

        <div className="text-xs mt-2" style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
          {expanded ? '▲ collapse' : '▼ expand'}
        </div>
      </div>
    </div>
  );
}

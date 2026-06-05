import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import PageHeader from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';

const MOODS = [
  { value: 'excited',   label: 'Excited',   emoji: '🤩' },
  { value: 'happy',     label: 'Happy',     emoji: '😊' },
  { value: 'neutral',   label: 'Neutral',   emoji: '😐' },
  { value: 'anxious',   label: 'Anxious',   emoji: '😰' },
  { value: 'sad',       label: 'Sad',       emoji: '😢' },
  { value: 'nostalgic', label: 'Nostalgic', emoji: '🥹' },
];

const MOOD_COLORS = { excited: '#f0c040', happy: '#7ec8a0', neutral: '#a0b0c0', anxious: '#e8906e', sad: '#8090b8', nostalgic: '#c090b0' };

const EMPTY_FORM = { title: '', content: '', mood: 'happy', tags: '', location: '', date: new Date().toISOString().slice(0, 10) };

function JournalCard({ entry, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const mood = MOODS.find(m => m.value === entry.mood) || MOODS[1];

  return (
    <div className="card animate-in" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ height: 4, background: MOOD_COLORS[entry.mood] || 'var(--rose)', borderRadius: '12px 12px 0 0' }} />
      <div className="card-body" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.4rem' }}>{mood.emoji}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 500 }}>{entry.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-faint)', letterSpacing: '0.08em' }}>
                {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                {entry.location && ` · 📍 ${entry.location}`}
              </div>
            </div>
          </div>
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button className="btn btn-ghost btn-icon" onClick={() => onEdit(entry)}>✏</button>
            <button className="btn btn-ghost btn-icon" onClick={() => onDelete(entry._id)} style={{ color: 'var(--rouge)' }}>✕</button>
          </div>
        </div>

        <p className="text-sm" style={{ color: 'var(--ink-mid)', overflow: expanded ? 'visible' : 'hidden', display: expanded ? 'block' : '-webkit-box', WebkitLineClamp: expanded ? 'none' : 3, WebkitBoxOrient: 'vertical', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {entry.content}
        </p>

        {entry.tags?.length > 0 && (
          <div className="flex gap-1 mt-2" style={{ flexWrap: 'wrap' }}>
            {entry.tags.map(tag => (
              <span key={tag} className="badge badge-neutral">#{tag}</span>
            ))}
          </div>
        )}

        {entry.images?.length > 0 && (
          <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
            {entry.images.map((img, i) => (
              <img key={i} src={img} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
            ))}
          </div>
        )}

        <div className="text-xs mt-2" style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
          {expanded ? '▲ collapse' : '▼ read more'}
        </div>
      </div>
    </div>
  );
}

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [filterMood, setFilterMood] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  useEffect(() => { fetchEntries(); }, []);
  const fetchEntries = async () => {
    try { const { data } = await axios.get('/api/journal'); setEntries(data); }
    catch { addToast('Failed to load journal', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editId) {
        const { data } = await axios.put(`/api/journal/${editId}`, payload);
        setEntries(prev => prev.map(e => e._id === editId ? data : e));
        addToast('Entry updated!');
      } else {
        const { data } = await axios.post('/api/journal', payload);
        setEntries(prev => [data, ...prev]);
        addToast('Journal entry saved! ✨');
      }
      setShowModal(false); setForm(EMPTY_FORM); setEditId(null);
    } catch { addToast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await axios.delete(`/api/journal/${id}`);
    setEntries(prev => prev.filter(e => e._id !== id));
    addToast('Entry deleted');
  };

  const openEdit = (entry) => {
    setForm({ title: entry.title, content: entry.content, mood: entry.mood, tags: entry.tags?.join(', ') || '', location: entry.location || '', date: entry.date ? entry.date.slice(0, 10) : new Date().toISOString().slice(0, 10) });
    setEditId(entry._id); setShowModal(true);
  };

  let filtered = entries;
  if (filterMood !== 'all') filtered = filtered.filter(e => e.mood === filterMood);
  if (searchQuery) filtered = filtered.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.content.toLowerCase().includes(searchQuery.toLowerCase()));

  const moodCounts = MOODS.reduce((acc, m) => { acc[m.value] = entries.filter(e => e.mood === m.value).length; return acc; }, {});

  return (
    <div>
      <PageHeader
        scriptAccent="Mon journal intime"
        title="Personal Journal"
        subtitle="Your private space to write, reflect, and remember"
        actions={
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }}>
            + New Entry
          </button>
        }
      />

      {/* Mood summary */}
      <div className="card mb-5">
        <div className="card-body">
          <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
            <span className="form-label" style={{ marginBottom: 0, marginRight: '0.5rem' }}>Mood Board:</span>
            {MOODS.map(m => (
              <div key={m.value} className="flex items-center gap-1" style={{ padding: '0.25rem 0.75rem', background: 'var(--surface-2)', borderRadius: '999px', fontSize: '0.8rem' }}>
                <span>{m.emoji}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{moodCounts[m.value] || 0}</span>
              </div>
            ))}
            <span className="text-xs text-muted ml-2" style={{ fontFamily: 'var(--font-mono)' }}>{entries.length} total entries</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={`btn btn-sm ${filterMood === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterMood('all')}>All Moods</button>
        {MOODS.map(m => {
          if (!moodCounts[m.value]) return null;
          return (
            <button key={m.value} className={`btn btn-sm ${filterMood === m.value ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterMood(m.value)}>
              {m.emoji} {m.label}
            </button>
          );
        })}
      </div>
      <input className="form-input mb-5" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search entries..." style={{ maxWidth: 340 }} />

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">📓</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📓</div>
          <div className="empty-state-text" style={{ fontFamily: 'var(--font-script)', fontSize: '1.25rem' }}>Your story begins here...</div>
          <button className="btn btn-primary mt-4" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>Write first entry</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((entry, i) => (
            <div key={entry._id} style={{ animationDelay: `${i * 0.04}s` }}>
              <JournalCard entry={entry} onEdit={openEdit} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h3 className="section-title" style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem' }}>
                {editId ? 'Edit Entry' : 'New Journal Entry'}
              </h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Today I..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">How are you feeling?</label>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {MOODS.map(m => (
                      <button type="button" key={m.value} onClick={() => setForm(f => ({ ...f, mood: m.value }))}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '999px', border: form.mood === m.value ? '2px solid var(--rouge)' : '2px solid var(--border)', background: form.mood === m.value ? 'var(--surface-2)' : 'transparent', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {m.emoji} {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Write your thoughts...</label>
                  <textarea className="form-textarea" rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required
                    placeholder="Dear journal,&#10;&#10;Today was..." style={{ fontFamily: 'var(--font-body)', lineHeight: 1.8 }} />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Paris, Café de Flore" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input className="form-input" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="paris, food, memories" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Save Entry ✨'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

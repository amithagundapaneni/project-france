import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';

const VOCAB_CATS = ['greetings', 'food', 'travel', 'shopping', 'emergency', 'social', 'academic', 'numbers', 'other'];
const CAT_EMOJIS = { greetings: '👋', food: '🥐', travel: '✈️', shopping: '🛍', emergency: '🚨', social: '💬', academic: '📚', numbers: '🔢', other: '📖' };

const TABS = ['vocabulary', 'phrases', 'notes'];

const EMPTY_VOCAB = { french: '', english: '', pronunciation: '', category: 'greetings', notes: '' };
const EMPTY_PHRASE = { french: '', english: '', context: '', category: 'general', isFavorite: false };
const EMPTY_NOTE = { title: '', content: '', category: 'grammar' };

function FlashCard({ word, onMastered }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      onClick={() => setFlipped(!flipped)}
      style={{
        background: flipped ? 'var(--ink)' : 'var(--surface-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        cursor: 'pointer',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        boxShadow: 'var(--shadow-paper)',
        position: 'relative',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: flipped ? 'var(--rose-light)' : 'var(--ink-faint)', marginBottom: '0.5rem' }}>
        {flipped ? 'English' : 'Français'}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: flipped ? 'var(--cream)' : 'var(--ink)', fontStyle: flipped ? 'normal' : 'italic' }}>
        {flipped ? word.english : word.french}
      </div>
      {flipped && word.pronunciation && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--sidebar-muted)', marginTop: '0.5rem' }}>/{word.pronunciation}/</div>
      )}
      {flipped && (
        <button
          onClick={e => { e.stopPropagation(); onMastered(word); }}
          className="btn btn-sm"
          style={{ marginTop: '0.75rem', background: word.mastered ? 'var(--sage)' : 'var(--rouge)', color: 'white', border: 'none' }}
        >
          {word.mastered ? '✓ Mastered' : 'Mark as Mastered'}
        </button>
      )}
      <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.75rem', fontSize: '0.6rem', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
        tap to flip
      </div>
    </div>
  );
}

export default function French() {
  const [activeTab, setActiveTab] = useState('vocabulary');
  const [vocab, setVocab] = useState([]);
  const [phrases, setPhrases] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_VOCAB);
  const [editId, setEditId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list | flashcard
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [v, p, n] = await Promise.all([
        axios.get('/api/french/vocabulary'),
        axios.get('/api/french/phrases'),
        axios.get('/api/french/notes'),
      ]);
      setVocab(v.data); setPhrases(p.data); setNotes(n.data);
    } catch { addToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  const getEmptyForm = () => activeTab === 'vocabulary' ? EMPTY_VOCAB : activeTab === 'phrases' ? EMPTY_PHRASE : EMPTY_NOTE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = `/api/french/${activeTab === 'vocabulary' ? 'vocabulary' : activeTab === 'phrases' ? 'phrases' : 'notes'}`;
    try {
      if (editId) {
        const { data } = await axios.put(`${endpoint}/${editId}`, form);
        if (activeTab === 'vocabulary') setVocab(prev => prev.map(i => i._id === editId ? data : i));
        else if (activeTab === 'phrases') setPhrases(prev => prev.map(i => i._id === editId ? data : i));
        else setNotes(prev => prev.map(i => i._id === editId ? data : i));
        addToast('Updated!');
      } else {
        const { data } = await axios.post(endpoint, form);
        if (activeTab === 'vocabulary') setVocab(prev => [data, ...prev]);
        else if (activeTab === 'phrases') setPhrases(prev => [data, ...prev]);
        else setNotes(prev => [data, ...prev]);
        addToast('Added!');
      }
      setShowModal(false); setForm(getEmptyForm()); setEditId(null);
    } catch { addToast('Failed to save', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    const endpoint = `/api/french/${activeTab === 'vocabulary' ? 'vocabulary' : activeTab === 'phrases' ? 'phrases' : 'notes'}`;
    await axios.delete(`${endpoint}/${id}`);
    if (activeTab === 'vocabulary') setVocab(prev => prev.filter(i => i._id !== id));
    else if (activeTab === 'phrases') setPhrases(prev => prev.filter(i => i._id !== id));
    else setNotes(prev => prev.filter(i => i._id !== id));
    addToast('Deleted');
  };

  const handleMastered = async (word) => {
    const { data } = await axios.put(`/api/french/vocabulary/${word._id}`, { mastered: !word.mastered });
    setVocab(prev => prev.map(v => v._id === word._id ? data : v));
    if (!word.mastered) addToast('Marked as mastered! 🎉');
  };

  const openEdit = (item) => {
    setForm(item); setEditId(item._id); setShowModal(true);
  };

  const openAdd = () => {
    setForm(getEmptyForm()); setEditId(null); setShowModal(true);
  };

  const mastered = vocab.filter(v => v.mastered).length;
  const masteredPct = vocab.length ? Math.round((mastered / vocab.length) * 100) : 0;

  let filteredVocab = vocab;
  if (activeCategory !== 'all') filteredVocab = filteredVocab.filter(v => v.category === activeCategory);
  if (searchQuery) filteredVocab = filteredVocab.filter(v =>
    v.french.toLowerCase().includes(searchQuery.toLowerCase()) || v.english.toLowerCase().includes(searchQuery.toLowerCase())
  );

  let filteredPhrases = phrases;
  if (searchQuery) filteredPhrases = filteredPhrases.filter(p =>
    p.french.toLowerCase().includes(searchQuery.toLowerCase()) || p.english.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        scriptAccent="J'apprends le français"
        title="French Learning"
        subtitle="Build your vocabulary, master phrases, and take grammar notes"
        actions={<button className="btn btn-primary" onClick={openAdd}>+ Add {activeTab === 'vocabulary' ? 'Word' : activeTab === 'phrases' ? 'Phrase' : 'Note'}</button>}
      />

      {/* Progress bar */}
      <div className="card mb-5">
        <div className="card-body">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>Vocabulary Mastered</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--dusty-blue)' }}>{mastered} / {vocab.length}</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${masteredPct}%`, background: 'var(--dusty-blue)' }} />
          </div>
          <div className="flex gap-4 mt-2">
            <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>{phrases.length} phrases saved</span>
            <span className="text-xs text-muted" style={{ fontFamily: 'var(--font-mono)' }}>{notes.length} grammar notes</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5" style={{ borderBottom: '2px solid var(--border-light)' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '0.6rem 1.25rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid var(--rouge)' : '2px solid transparent', color: activeTab === tab ? 'var(--rouge)' : 'var(--ink-light)', marginBottom: -2, transition: 'all 0.15s' }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'vocabulary' ? vocab.length : tab === 'phrases' ? phrases.length : notes.length})
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab !== 'notes' && (
        <input className="form-input mb-4" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab}...`} style={{ maxWidth: 340 }} />
      )}

      {/* Vocabulary Tab */}
      {activeTab === 'vocabulary' && (
        <>
          <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <button className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory('all')}>All</button>
            {VOCAB_CATS.map(cat => {
              const count = vocab.filter(v => v.category === cat).length;
              if (!count) return null;
              return (
                <button key={cat} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveCategory(cat)}>
                  {CAT_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              );
            })}
            <div className="flex gap-1" style={{ marginLeft: 'auto' }}>
              <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('list')}>☰ List</button>
              <button className={`btn btn-sm ${viewMode === 'flashcard' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('flashcard')}>⧉ Flash Cards</button>
            </div>
          </div>

          {loading ? <div className="empty-state"><div className="empty-state-icon">📖</div></div> : (
            viewMode === 'flashcard' ? (
              <div className="grid-3">
                {filteredVocab.map(word => (
                  <FlashCard key={word._id} word={word} onMastered={handleMastered} />
                ))}
              </div>
            ) : (
              <div className="card">
                {filteredVocab.length === 0 ? (
                  <div className="empty-state"><div className="empty-state-icon">📖</div><div className="empty-state-text">No vocabulary yet</div></div>
                ) : filteredVocab.map(word => (
                  <div key={word._id} className="flex items-center gap-3" style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--ink)' }}>{word.french}</span>
                        {word.pronunciation && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-faint)', marginLeft: '0.5rem' }}>/{word.pronunciation}/</span>}
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--ink-mid)' }}>{word.english}</span>
                      <div className="flex gap-2 items-center">
                        <span className="badge badge-neutral">{word.category}</span>
                        {word.mastered && <span className="badge badge-sage">✓ mastered</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-icon" onClick={() => handleMastered(word)} style={{ color: word.mastered ? 'var(--sage)' : 'var(--ink-faint)' }}>{word.mastered ? '★' : '☆'}</button>
                      <button className="btn btn-ghost btn-icon" onClick={() => openEdit(word)}>✏</button>
                      <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(word._id)} style={{ color: 'var(--rouge)' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Phrases Tab */}
      {activeTab === 'phrases' && (
        <div className="card">
          {filteredPhrases.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">💬</div><div className="empty-state-text">No phrases yet</div></div>
          ) : filteredPhrases.map(phrase => (
            <div key={phrase._id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--ink)', marginBottom: '0.2rem' }}>{phrase.french}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--ink-mid)' }}>{phrase.english}</div>
                  {phrase.context && <div className="text-xs text-muted mt-1" style={{ fontStyle: 'italic' }}>{phrase.context}</div>}
                  <span className="badge badge-neutral mt-1">{phrase.category}</span>
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-icon" onClick={() => openEdit(phrase)} style={{ color: phrase.isFavorite ? '#e8a020' : 'var(--ink-faint)' }}>{phrase.isFavorite ? '★' : '☆'}</button>
                  <button className="btn btn-ghost btn-icon" onClick={() => openEdit(phrase)}>✏</button>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(phrase._id)} style={{ color: 'var(--rouge)' }}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="grid-2">
          {notes.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state-icon">📝</div>
              <div className="empty-state-text">No grammar notes yet</div>
            </div>
          ) : notes.map(note => (
            <div key={note._id} className="card animate-in">
              <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>{note.title}</h3>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-icon" onClick={() => openEdit(note)}>✏</button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(note._id)} style={{ color: 'var(--rouge)' }}>✕</button>
                  </div>
                </div>
                <span className="badge badge-neutral mb-2">{note.category}</span>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{note.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="section-title">{editId ? 'Edit' : 'Add'} {activeTab === 'vocabulary' ? 'Word' : activeTab === 'phrases' ? 'Phrase' : 'Note'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {activeTab === 'vocabulary' && (
                  <>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">French Word</label>
                        <input className="form-input" value={form.french || ''} onChange={e => setForm(f => ({ ...f, french: e.target.value }))} required placeholder="bonjour" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">English Translation</label>
                        <input className="form-input" value={form.english || ''} onChange={e => setForm(f => ({ ...f, english: e.target.value }))} required placeholder="hello" />
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Pronunciation</label>
                        <input className="form-input" value={form.pronunciation || ''} onChange={e => setForm(f => ({ ...f, pronunciation: e.target.value }))} placeholder="bon-ZHOOR" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={form.category || 'other'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                          {VOCAB_CATS.map(c => <option key={c} value={c}>{CAT_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notes</label>
                      <input className="form-input" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Usage notes..." />
                    </div>
                  </>
                )}
                {activeTab === 'phrases' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">French Phrase</label>
                      <input className="form-input" value={form.french || ''} onChange={e => setForm(f => ({ ...f, french: e.target.value }))} required placeholder="Excusez-moi, où est...?" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">English Translation</label>
                      <input className="form-input" value={form.english || ''} onChange={e => setForm(f => ({ ...f, english: e.target.value }))} required placeholder="Excuse me, where is...?" />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Context / Usage</label>
                        <input className="form-input" value={form.context || ''} onChange={e => setForm(f => ({ ...f, context: e.target.value }))} placeholder="Used in restaurants" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <input className="form-input" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="travel, food, social..." />
                      </div>
                    </div>
                  </>
                )}
                {activeTab === 'notes' && (
                  <>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Title</label>
                        <input className="form-input" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Gender of nouns" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <input className="form-input" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="grammar, vocab, culture..." />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Content</label>
                      <textarea className="form-textarea" rows={6} value={form.content || ''} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required placeholder="Your notes here..." />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/layout/PageHeader';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    university: user?.university || '',
    destination: user?.destination || 'Paris, France',
    departureDate: user?.departureDate ? user.departureDate.slice(0, 10) : '',
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put('/api/auth/profile', form);
      updateUser(data);
      addToast('Profile saved! ✨');
    } catch { addToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        scriptAccent="Paramètres"
        title="Settings"
        subtitle="Manage your profile and preferences"
      />

      <div className="flex gap-1 mb-6" style={{ borderBottom: '2px solid var(--border-light)' }}>
        {['profile', 'about'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '0.6rem 1.25rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid var(--rouge)' : '2px solid transparent', color: activeTab === tab ? 'var(--rouge)' : 'var(--ink-light)', marginBottom: -2, transition: 'all 0.15s', textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div style={{ maxWidth: 560 }}>
          <form onSubmit={handleSave}>
            <div className="card">
              <div className="card-header">
                <h3 className="section-title" style={{ fontSize: '1rem' }}>Your Profile</h3>
              </div>
              <div className="card-body">
                {/* Avatar placeholder */}
                <div className="flex items-center gap-4 mb-5">
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--rouge)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: 'white', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                    {form.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>{form.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Project France Member</div>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">University / Institution</label>
                  <input className="form-input" value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} placeholder="Sciences Po Paris, Sorbonne..." />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Destination City</label>
                    <input className="form-input" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Departure Date</label>
                    <input type="date" className="form-input" value={form.departureDate} onChange={e => setForm(f => ({ ...f, departureDate: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'about' && (
        <div style={{ maxWidth: 560 }}>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: '3rem', color: 'var(--rouge)', marginBottom: '0.5rem' }}>Project France</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--ink-faint)', marginBottom: '2rem' }}>✦ Ma Belle Aventure ✦</div>
              <p className="text-sm text-muted" style={{ fontStyle: 'italic', maxWidth: 380, margin: '0 auto', lineHeight: 1.8 }}>
                Your personal study-abroad planning hub. Built to help you prepare for the journey of a lifetime — every checklist, every croissant, every French phrase, every memory.
              </p>
              <div className="divider-ornament" style={{ margin: '2rem 0' }}>Bon voyage</div>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: '1.25rem', color: 'var(--terracotta)' }}>
                "La vie est faite de petits bonheurs."
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ink-faint)', marginTop: '0.5rem' }}>
                Life is made of small moments of happiness.
              </div>
              <div style={{ marginTop: '2rem' }}>
                <div className="stamp stamp-rouge">PARIS · FRANCE</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

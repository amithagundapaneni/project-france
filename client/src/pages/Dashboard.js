import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { differenceInDays, format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';

function ProgressCard({ title, emoji, done, total, color, path }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="card animate-in" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      onClick={() => window.location.href = path}>
      <div className="card-body">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
            <div className="section-title" style={{ fontSize: '0.95rem', marginTop: '0.25rem' }}>{title}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, color }}>
            {pct}%
          </div>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="text-xs text-muted mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
          {done} / {total} complete
        </div>
      </div>
    </div>
  );
}

function CountdownRing({ days }) {
  const maxDays = 365;
  const angle = Math.min((days / maxDays) * 360, 360);
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const progress = circumference - (angle / 360) * circumference;

  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--parchment-dark)" strokeWidth="8" />
        <circle cx="70" cy="70" r={r} fill="none"
          stroke="var(--terracotta)" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{days}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>jours</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ checklist: [], packing: [], shopping: [], goals: [], vocab: [], bucket: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const safe = (res) => (Array.isArray(res?.value?.data) ? res.value.data : []);
  Promise.allSettled([
    axios.get('/api/checklist'),
    axios.get('/api/packing'),
    axios.get('/api/shopping'),
    axios.get('/api/goals'),
    axios.get('/api/french/vocabulary'),
    axios.get('/api/bucketlist'),
  ]).then(([c, p, s, g, v, b]) => {
    setData({
      checklist: safe(c),
      packing:   safe(p),
      shopping:  safe(s),
      goals:     safe(g),
      vocab:     safe(v),
      bucket:    safe(b),
    });
  }).finally(() => setLoading(false));
}, []);

  const daysLeft = useMemo(() => {
    if (!user?.departureDate) return null;
    return Math.max(0, differenceInDays(new Date(user.departureDate), new Date()));
  }, [user]);

  const stats = useMemo(() => ({
    checklist: { done: data.checklist.filter(i => i.completed).length, total: data.checklist.length },
    packing:   { done: data.packing.filter(i => i.packed).length,     total: data.packing.length },
    shopping:  { done: data.shopping.filter(i => i.purchased).length,  total: data.shopping.length },
    goals:     { done: data.goals.filter(i => i.completed).length,     total: data.goals.length },
    french:    { done: data.vocab.filter(i => i.mastered).length,       total: data.vocab.length },
    bucket:    { done: data.bucket.filter(i => i.completed).length,     total: data.bucket.length },
  }), [data]);

  const progressCards = [
    { title: 'Pre-Departure',  emoji: '📋', ...stats.checklist, color: 'var(--rouge)',      path: '/checklist' },
    { title: 'Packing',        emoji: '🧳', ...stats.packing,   color: 'var(--terracotta)',  path: '/packing' },
    { title: 'Shopping',       emoji: '🛍', ...stats.shopping,  color: 'var(--rose)',        path: '/shopping' },
    { title: 'Summer Goals',   emoji: '🎯', ...stats.goals,     color: 'var(--sage)',        path: '/goals' },
    { title: 'French Learning',emoji: '🗣', ...stats.french,    color: 'var(--dusty-blue)',  path: '/french' },
    { title: 'Bucket List',    emoji: '🗼', ...stats.bucket,    color: 'var(--ink-mid)',     path: '/bucketlist' },
  ];

  const PHRASES = [
    "La vie est belle — life is beautiful.",
    "Chaque jour est une nouvelle page.",
    "Paris is always a good idea.",
    "Je t'aime, Paris.",
    "La vie est faite de petits bonheurs.",
  ];
  const quoteOfDay = PHRASES[new Date().getDate() % PHRASES.length];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', fontFamily: 'var(--font-script)', fontSize: '1.25rem', color: 'var(--rouge)' }}>
      Loading your dashboard...
    </div>
  );

  return (
    <div>
      <PageHeader
        scriptAccent="Bonjour!"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Chérie'}`}
        subtitle={user?.departureDate ? `Departing for ${user.destination} on ${format(new Date(user.departureDate), 'MMMM d, yyyy')}` : 'Set your departure date in Settings'}
      />

      {/* Hero countdown + quote */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--ink) 0%, #3d2d1e 100%)', border: 'none' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {daysLeft !== null ? (
            <CountdownRing days={daysLeft} />
          ) : (
            <div style={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }}>
              <span style={{ fontSize: '3rem' }}>🗼</span>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--rose-light)', marginBottom: '0.5rem' }}>
              ✦ Your adventure awaits ✦
            </div>
            {daysLeft !== null ? (
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 400, color: 'var(--cream)', lineHeight: 1.2 }}>
                  {daysLeft === 0 ? "C'est le jour J! Bon voyage!" :
                   daysLeft === 1 ? "Tomorrow you fly to France!" :
                   `${daysLeft} days until France!`}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--parchment)', opacity: 0.7, marginTop: '0.5rem' }}>
                  {user?.destination} · {user?.university || 'Study Abroad'}
                </div>
              </>
            ) : (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)' }}>
                Set your departure date to begin the countdown
              </div>
            )}
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: '1.15rem', color: 'var(--rose-light)', fontStyle: 'italic' }}>
                "{quoteOfDay}"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress grid */}
      <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h2 className="section-title">Progress Overview</h2>
        <div className="stamp stamp-rouge">À faire</div>
      </div>
      <div className="grid-3 mb-6">
        {progressCards.map((card, i) => (
          <div key={card.title} style={{ animationDelay: `${i * 0.05}s` }}>
            <ProgressCard {...card} />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="section-title" style={{ fontSize: '1rem' }}>Quick Actions</h2>
          <span style={{ fontFamily: 'var(--font-script)', color: 'var(--rouge)', fontSize: '1rem' }}>Tout faire!</span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {[
            { label: 'Add checklist item',  path: '/checklist', emoji: '✓' },
            { label: 'Pack an item',        path: '/packing',   emoji: '🧳' },
            { label: 'Log a goal',          path: '/goals',     emoji: '🎯' },
            { label: 'Learn French',        path: '/french',    emoji: '🗣' },
            { label: 'Write in journal',    path: '/journal',   emoji: '📓' },
            { label: 'Add to bucket list',  path: '/bucketlist',emoji: '🗼' },
          ].map(action => (
            <a key={action.label} href={action.path} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
              <span>{action.emoji}</span>
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

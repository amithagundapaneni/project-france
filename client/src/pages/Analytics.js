import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import PageHeader from '../components/layout/PageHeader';

const COLORS = ['#8b1a1a', '#c8956c', '#b5838d', '#6b8fa8', '#7a9e7e', '#9b7fa6', '#d4a574', '#6b6b8a'];

function StatCard({ title, value, subtitle, color, emoji }) {
  return (
    <div className="card animate-in">
      <div className="card-body" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{emoji}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 500, color: color || 'var(--ink)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-faint)', marginTop: '0.25rem' }}>{title}</div>
        {subtitle && <div className="text-xs text-muted mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

function SectionProgress({ title, emoji, done, total, color }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}>{emoji} {title}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color }}>{pct}%</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="text-xs text-muted mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{done}/{total}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}>
        <p style={{ fontWeight: 500 }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/checklist'),
      axios.get('/api/packing'),
      axios.get('/api/shopping'),
      axios.get('/api/goals'),
      axios.get('/api/french/vocabulary'),
      axios.get('/api/bucketlist'),
      axios.get('/api/journal'),
      axios.get('/api/meals/recipes'),
      axios.get('/api/notes'),
    ]).then(([c, p, s, g, v, b, j, m, n]) => {
      setData({
        checklist: Array.isArray(c.data) ? c.data : [],
        packing:   Array.isArray(p.data) ? p.data : [],
        shopping:  Array.isArray(s.data) ? s.data : [],
        goals:     Array.isArray(g.data) ? g.data : [],
        vocab:     Array.isArray(v.data) ? v.data : [],
        bucket:    Array.isArray(b.data) ? b.data : [],
        journal:   Array.isArray(j.data) ? j.data : [],
        meals:     Array.isArray(m.data) ? m.data : [],
        notes:     Array.isArray(n.data) ? n.data : [],
      });
    }).catch(() => {
      setData({ checklist: [], packing: [], shopping: [], goals: [], vocab: [], bucket: [], journal: [], meals: [], notes: [] });
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return (
    <div className="empty-state" style={{ paddingTop: '4rem' }}>
      <div className="empty-state-icon">📊</div>
      <div className="empty-state-text">Gathering your stats...</div>
    </div>
  );

  const { checklist, packing, shopping, goals, vocab, bucket, journal, meals, notes } = data;

  // Overall readiness score
  const sections = [
    { done: checklist.filter(i => i.completed).length, total: checklist.length, weight: 3 },
    { done: packing.filter(i => i.packed).length,      total: packing.length,   weight: 2 },
    { done: shopping.filter(i => i.purchased).length,  total: shopping.length,  weight: 1 },
    { done: goals.filter(i => i.progress >= 80).length, total: goals.length,    weight: 1 },
    { done: vocab.filter(i => i.mastered).length,       total: vocab.length,    weight: 1 },
  ];
  const overallScore = sections.reduce((acc, s) => {
    if (!s.total) return acc;
    return acc + (s.done / s.total) * s.weight;
  }, 0) / sections.reduce((acc, s) => s.total ? acc + s.weight : acc, 0) * 100;
  const readinessScore = Math.round(overallScore) || 0;

  // Radial chart data
  const radialData = [
    { name: 'Checklist',   value: checklist.length ? Math.round((checklist.filter(i => i.completed).length / checklist.length) * 100) : 0, fill: '#8b1a1a' },
    { name: 'Packing',     value: packing.length   ? Math.round((packing.filter(i => i.packed).length / packing.length) * 100) : 0,       fill: '#c8956c' },
    { name: 'Shopping',    value: shopping.length  ? Math.round((shopping.filter(i => i.purchased).length / shopping.length) * 100) : 0,  fill: '#b5838d' },
    { name: 'Vocab',       value: vocab.length     ? Math.round((vocab.filter(i => i.mastered).length / vocab.length) * 100) : 0,         fill: '#6b8fa8' },
    { name: 'Bucket List', value: bucket.length    ? Math.round((bucket.filter(i => i.completed).length / bucket.length) * 100) : 0,      fill: '#7a9e7e' },
  ];

  // Goals by category
  const goalCategories = [...new Set(goals.map(g => g.category))];
  const goalsByCat = goalCategories.map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    total: goals.filter(g => g.category === cat).length,
    completed: goals.filter(g => g.category === cat && (g.completed || g.progress >= 100)).length,
    avgProgress: goals.filter(g => g.category === cat).length
      ? Math.round(goals.filter(g => g.category === cat).reduce((s, g) => s + g.progress, 0) / goals.filter(g => g.category === cat).length)
      : 0,
  }));

  // Packing by category
  const packCats = [...new Set(packing.map(i => i.category))];
  const packingByCat = packCats.map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    packed: packing.filter(i => i.category === cat && i.packed).length,
    total: packing.filter(i => i.category === cat).length,
  }));

  // Vocab by category
  const vocabCats = [...new Set(vocab.map(v => v.category))];
  const vocabPieData = vocabCats.map((cat, i) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: vocab.filter(v => v.category === cat).length,
    fill: COLORS[i % COLORS.length],
  }));

  // Journal mood breakdown
  const moodMap = { excited: 0, happy: 0, neutral: 0, anxious: 0, sad: 0, nostalgic: 0 };
  journal.forEach(e => { if (moodMap[e.mood] !== undefined) moodMap[e.mood]++; });
  const moodData = Object.entries(moodMap).filter(([, v]) => v > 0).map(([mood, count], i) => ({
    name: mood.charAt(0).toUpperCase() + mood.slice(1),
    value: count,
    fill: COLORS[i % COLORS.length],
  }));

  // Shopping budget
  const totalEstimated = shopping.reduce((s, i) => s + (i.estimatedPrice || 0), 0);
  const totalSpent = shopping.filter(i => i.purchased).reduce((s, i) => s + (i.actualPrice || i.estimatedPrice || 0), 0);

  const readinessLabel = readinessScore >= 80 ? 'Almost Ready! 🎉' : readinessScore >= 50 ? 'Good Progress 🌸' : 'Getting Started 🌱';

  return (
    <div>
      <PageHeader
        scriptAccent="Mes statistiques"
        title="Analytics & Progress"
        subtitle="A bird's eye view of your journey preparation"
      />

      {/* Readiness Score Hero */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--ink), #3d2d1e)' }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 300, color: 'var(--rose-light)', lineHeight: 1 }}>{readinessScore}%</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--sidebar-muted)', marginTop: '0.25rem' }}>Overall Readiness</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: '1.75rem', color: 'var(--cream)', marginBottom: '0.5rem' }}>{readinessLabel}</div>
            <div className="progress-bar-track" style={{ height: 12, background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${readinessScore}%`, background: 'linear-gradient(90deg, var(--terracotta), var(--rose-light))', transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--parchment)', opacity: 0.7, marginTop: '0.75rem' }}>
              Based on pre-departure checklist, packing, shopping, vocabulary mastery, and bucket list.
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="Tasks Done"   emoji="✓" value={`${checklist.filter(i => i.completed).length}/${checklist.length}`} color="var(--rouge)"      />
        <StatCard title="Items Packed" emoji="🧳" value={`${packing.filter(i => i.packed).length}/${packing.length}`}       color="var(--terracotta)" />
        <StatCard title="Words Known"  emoji="🗣" value={`${vocab.filter(i => i.mastered).length}/${vocab.length}`}         color="var(--dusty-blue)" />
        <StatCard title="Bucket Items" emoji="🗼" value={`${bucket.filter(i => i.completed).length}/${bucket.length}`}      color="var(--sage)"       />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard title="Goals Active"    emoji="🎯" value={goals.length}   color="var(--rose)"       />
        <StatCard title="Recipes"         emoji="🥐" value={meals.length}   color="var(--terracotta)" />
        <StatCard title="Journal Entries" emoji="📓" value={journal.length} color="var(--ink-mid)"    />
        <StatCard title="Notes Saved"     emoji="📌" value={notes.length}   color="var(--dusty-blue)" />
      </div>

      {/* All progress bars */}
      <div className="grid-2 mb-6">
        <div className="card">
          <div className="card-header"><h3 className="section-title" style={{ fontSize: '1rem' }}>Section Progress</h3></div>
          <div className="card-body">
            <SectionProgress title="Pre-Departure" emoji="📋" done={checklist.filter(i => i.completed).length} total={checklist.length} color="var(--rouge)"      />
            <SectionProgress title="Packing"       emoji="🧳" done={packing.filter(i => i.packed).length}     total={packing.length}   color="var(--terracotta)" />
            <SectionProgress title="Shopping"      emoji="🛍" done={shopping.filter(i => i.purchased).length} total={shopping.length}  color="var(--rose)"       />
            <SectionProgress title="Summer Goals"  emoji="🎯" done={goals.filter(g => g.progress >= 80).length} total={goals.length}   color="var(--sage)"       />
            <SectionProgress title="French Vocab"  emoji="🗣" done={vocab.filter(v => v.mastered).length}     total={vocab.length}     color="var(--dusty-blue)" />
            <SectionProgress title="Bucket List"   emoji="🗼" done={bucket.filter(b => b.completed).length}   total={bucket.length}    color="var(--ink-mid)"    />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="section-title" style={{ fontSize: '1rem' }}>Progress Radials</h3></div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="20%" outerRadius="90%" data={radialData} startAngle={180} endAngle={-180}>
                <RadialBar dataKey="value" cornerRadius={4} label={{ position: 'insideStart', fill: 'var(--ink-faint)', fontSize: 10 }} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right"
                  formatter={(value, entry) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-mid)' }}>{value}: {entry.payload.value}%</span>} />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {goalsByCat.length > 0 && (
        <div className="card mb-5">
          <div className="card-header"><h3 className="section-title" style={{ fontSize: '1rem' }}>Goals by Category — Avg Progress</h3></div>
          <div className="card-body" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalsByCat} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-light)' }} />
                <YAxis domain={[0, 100]} tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--ink-faint)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgProgress" name="Avg Progress %" radius={[4, 4, 0, 0]}>
                  {goalsByCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid-2 mb-5">
        {packingByCat.length > 0 && (
          <div className="card">
            <div className="card-header"><h3 className="section-title" style={{ fontSize: '1rem' }}>Packing by Category</h3></div>
            <div className="card-body" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={packingByCat} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--ink-faint)' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--ink-light)' }} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="packed" name="Packed" radius={[0, 4, 4, 0]} fill="var(--terracotta)" />
                  <Bar dataKey="total"  name="Total"  radius={[0, 4, 4, 0]} fill="var(--parchment-dark)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {vocabPieData.length > 0 && (
          <div className="card">
            <div className="card-header"><h3 className="section-title" style={{ fontSize: '1rem' }}>Vocabulary by Category</h3></div>
            <div className="card-body" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vocabPieData} cx="40%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {vocabPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Legend iconSize={8} formatter={v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-mid)' }}>{v}</span>} />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="grid-2 mb-5">
        <div className="card">
          <div className="card-header"><h3 className="section-title" style={{ fontSize: '1rem' }}>Shopping Budget</h3></div>
          <div className="card-body">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted">Estimated total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>₹{totalEstimated.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted">Spent so far</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--terracotta)' }}>₹{totalSpent.toLocaleString()}</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: totalEstimated ? `${Math.min((totalSpent / totalEstimated) * 100, 100)}%` : '0%' }} />
            </div>
            <div className="text-xs text-muted mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
              {shopping.filter(i => i.purchased).length} of {shopping.length} items purchased
            </div>
          </div>
        </div>

        {moodData.length > 0 && (
          <div className="card">
            <div className="card-header"><h3 className="section-title" style={{ fontSize: '1rem' }}>Journal Mood Distribution</h3></div>
            <div className="card-body" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={moodData} cx="40%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3}>
                    {moodData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Legend iconSize={8} formatter={v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-mid)' }}>{v}</span>} />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ background: 'var(--surface-1)', textAlign: 'center' }}>
        <div className="card-body">
          <div style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem', color: 'var(--rouge)', marginBottom: '0.5rem' }}>
            {readinessScore >= 80 ? 'La France vous attend! 🗼' : readinessScore >= 50 ? 'Continuez! Vous êtes sur la bonne voie 🌸' : 'Chaque petit pas compte ✨'}
          </div>
          <div className="text-sm text-muted" style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
            {readinessScore >= 80
              ? "You're almost fully prepared for your French adventure. Félicitations!"
              : readinessScore >= 50
              ? "You've made great progress. Keep ticking off those tasks!"
              : "Don't worry — every journey starts with a single step. You've got this!"}
          </div>
        </div>
      </div>
    </div>
  );
}
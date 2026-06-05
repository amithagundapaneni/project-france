import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { differenceInDays } from 'date-fns';

const NAV = [
  {
    section: 'Mon Voyage',
    items: [
      { path: '/',          label: 'Dashboard',       icon: '⊞' },
      { path: '/checklist', label: 'Pre-Departure',   icon: '✓' },
      { path: '/packing',   label: 'Packing',         icon: '🧳' },
      { path: '/shopping',  label: 'Shopping',        icon: '🛍' },
    ]
  },
  {
    section: 'Ma Vie',
    items: [
      { path: '/goals',     label: 'Summer Goals',    icon: '🎯' },
      { path: '/meals',     label: 'Meals & Recipes', icon: '🥐' },
      { path: '/french',    label: 'French Learning', icon: '🗣' },
    ]
  },
  {
    section: 'Paris',
    items: [
      { path: '/bucketlist', label: 'Bucket List',    icon: '🗼' },
      { path: '/journal',    label: 'Journal',        icon: '📓' },
      { path: '/notes',      label: 'Notes',          icon: '📌' },
      { path: '/analytics',  label: 'Analytics',      icon: '📊' },
    ]
  }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const daysLeft = useMemo(() => {
    if (!user?.departureDate) return null;
    const days = differenceInDays(new Date(user.departureDate), new Date());
    return days > 0 ? days : 0;
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">Project France</div>
        <div className="sidebar-tagline">✦ Ma Belle Aventure ✦</div>

        {daysLeft !== null && (
          <div className="sidebar-departure">
            <div className="departure-days">{daysLeft}</div>
            <div className="departure-label">days until departure</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV.map(group => (
          <div key={group.section}>
            <div className="nav-section-label">{group.section}</div>
            {group.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span style={{ fontSize: '1rem', width: 18, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} style={{ marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1rem', width: 18, textAlign: 'center' }}>⚙</span>
          Settings
        </NavLink>
        <button className="nav-item w-full" onClick={handleLogout} style={{ border: 'none', background: 'none', color: 'var(--sidebar-muted)', fontSize: '0.82rem', cursor: 'pointer', justifyContent: 'flex-start' }}>
          <span style={{ fontSize: '1rem', width: 18, textAlign: 'center' }}>→</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

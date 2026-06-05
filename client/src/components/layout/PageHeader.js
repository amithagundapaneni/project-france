import React from 'react';

export default function PageHeader({ title, subtitle, scriptAccent, actions }) {
  return (
    <div className="flex items-center justify-between mb-6" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem' }}>
      <div>
        {scriptAccent && (
          <div className="font-script" style={{ color: 'var(--rouge)', fontSize: '1.1rem', marginBottom: '0.1rem' }}>
            {scriptAccent}
          </div>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 items-center">{actions}</div>}
    </div>
  );
}

import React from 'react';

const navItems = [
  { key: 'ingredients', label: 'Ingredients', emoji: '🥕' },
  { key: 'recipes', label: 'Recipes', emoji: '🥗' },
  { key: 'suggestions', label: 'AI Suggestions', emoji: '🤖' },
];

const Sidebar = ({ user }) => {
  // Use context or window.location.hash for nav, for demo, store in window
  const [active, setActive] = React.useState(window.localStorage.getItem('activePanel') ?? 'ingredients');

  // PUBLIC_INTERFACE
  React.useEffect(() => {
    window.activePanel = active;
    window.localStorage.setItem('activePanel', active);
    window.dispatchEvent(new Event('panelchange'));
  }, [active]);

  return (
    <aside className="sidebar-nav" style={{
      width: 220,
      background: 'var(--primary-color)',
      color: '#233',
      minHeight: '100vh',
      padding: '32px 0',
      boxShadow: '2px 0 10px rgba(176,247,178,0.09)',
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{
        fontWeight: 800,
        marginBottom: 48,
        fontSize: 20,
        color: '#233'
      }}>
        ING<span style={{ color: 'var(--accent-color)' }}>REC</span>IPE
      </div>
      {navItems.map(item => (
        <button
          key={item.key}
          aria-label={item.label}
          className="sidebar-btn"
          onClick={() => setActive(item.key)}
          style={{
            width: '90%',
            margin: '8px 0',
            padding: '14px 12px',
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: 8,
            background: active === item.key ? 'var(--secondary-color)' : 'transparent',
            color: active === item.key ? '#fff' : '#222',
            cursor: 'pointer',
            fontWeight: 600,
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'background 0.18s'
          }}
        >
          <span style={{ fontSize: 21 }}>{item.emoji}</span> {item.label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ margin: '16px 0', fontSize: 12, color: '#233', opacity: 0.6 }}>powered by Supabase</div>
    </aside>
  );
};
export default Sidebar;

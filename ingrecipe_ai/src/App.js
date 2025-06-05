import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import AuthPanel from './components/AuthPanel';
import MainDashboard from './components/MainDashboard';
import { supabase } from './supabaseClient';

function App() {
  const [user, setUser] = useState(null);

  // PUBLIC_INTERFACE
  // Handles user state on authentication events
  React.useEffect(() => {
    const session = supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription?.unsubscribe();
    };
  }, []);

  return (
    <div className="dashboard-app" style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex' }}>
      <Sidebar user={user} />
      <div className="main-content-area" style={{ flex: 1, background: 'white', minHeight: '100vh' }}>
        <header className="main-header" style={{
          background: 'var(--primary-color)', color: 'black', padding: '1rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
            <span style={{ color: 'var(--accent-color)' }}>🧑‍🍳</span> Ingrecipe AI
          </div>
          {user && <div className="user-email" style={{ color: '#333', fontSize: '1rem' }}>{user.email}</div>}
        </header>
        <div style={{ padding: '2rem', minHeight: 'calc(100vh - 60px)' }}>
          {!user ? (
            <AuthPanel setUser={setUser} />
          ) : (
            <MainDashboard user={user} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

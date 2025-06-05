import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

// PUBLIC_INTERFACE
function AuthPanel({ setUser }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      setUser((await supabase.auth.getUser()).data.user);
    } catch (e) {
      setErr(e.message.replace('Error: ', ''));
    }
    setLoading(false);
  }

  return (
    <div style={{
      maxWidth: 370, margin: 'auto', padding: 32, borderRadius: 12,
      background: '#f7f7f7',
      boxShadow: '0 2px 16px rgba(176,247,178,0.13)', color: '#232'
    }}>
      <h2 style={{
        marginBottom: 20,
        color: 'var(--primary-color)'
      }}>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={submit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          autoComplete="username"
          onChange={e => setEmail(e.target.value)}
          style={{
            padding: 12, fontSize: 15, borderRadius: 5, border: '1px solid #bbb'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          style={{
            padding: 12, fontSize: 15, borderRadius: 5, border: '1px solid #bbb'
          }}
        />
        {err && <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>{err}</div>}
        <button
          className="btn btn-large"
          style={{
            background: 'var(--primary-color)', color: '#222', marginTop: 10,
            fontWeight: 700, fontSize: 17
          }}
          type="submit"
          disabled={loading}
        >
          {loading ? '...' : (mode === 'login' ? 'Login' : 'Create Account')}
        </button>
      </form>
      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 15 }}>
        {mode === 'login' ? (
          <span>
            Don't have an account?{' '}
            <button
              style={{
                color: 'var(--secondary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline'
              }}
              onClick={() => {
                setEmail('');
                setPassword('');
                setErr('');
                setMode('signup');
              }}
            >Sign Up</button>
          </span>
        ) : (
          <span>
            Already have an account?{' '}
            <button
              style={{
                color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline'
              }}
              onClick={() => {
                setEmail('');
                setPassword('');
                setErr('');
                setMode('login');
              }}
            >Log In</button>
          </span>
        )}
      </div>
    </div>
  );
}

export default AuthPanel;

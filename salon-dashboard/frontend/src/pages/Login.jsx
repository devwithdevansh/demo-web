import React, { useState } from 'react';
import { Scissors } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = ({ setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin', JSON.stringify(data));
        setAuth(true);
        toast.success('Welcome back, Admin!');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Network error during login');
    }
  };

  const handleSetup = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/setup', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Network error during setup');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="content-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(192, 132, 252, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scissors size={32} color="var(--accent-primary)" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>GlowUp Salon</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to manage your business</p>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Username</label>
            <input 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
            <input 
              required 
              type="password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem', padding: '0.875rem' }}>
            Login
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <p>First time here? <button onClick={handleSetup} style={{ background: 'transparent', color: 'var(--accent-primary)', textDecoration: 'underline' }}>Run setup script</button></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

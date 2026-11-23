import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, Scissors, Settings as SettingsIcon, Bell, Search, LogOut, Star } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Pages
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Services from './pages/Services';
import Customers from './pages/Customers';
import Staff from './pages/Staff';
import Login from './pages/Login';
import PublicBooking from './pages/PublicBooking';
import Settings from './pages/Settings';

// Components
const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Appointments', icon: <CalendarDays size={20} />, path: '/appointments' },
    { name: 'Customers', icon: <Users size={20} />, path: '/customers' },
    { name: 'Services', icon: <Scissors size={20} />, path: '/services' },
    { name: 'Staff', icon: <Star size={20} />, path: '/staff' },
    { name: 'Settings', icon: <SettingsIcon size={20} />, path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Scissors className="logo-icon" style={{ color: 'var(--accent-primary)' }} />
        <span>GlowUp Salon</span>
      </div>
      <nav className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

const Header = ({ setAuth }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAuth(false);
  };

  return (
    <header className="top-header">
      <div className="header-title">
        <h2>Overview</h2>
      </div>
      <div className="header-actions">
        <button className="icon-btn">
          <Search size={20} />
        </button>
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        <div className="user-profile">
          <div className="avatar">A</div>
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Admin</span>
        </div>
        <button className="icon-btn" onClick={handleLogout} title="Logout" style={{ marginLeft: '10px' }}>
          <LogOut size={20} color="var(--danger)" />
        </button>
      </div>
    </header>
  );
};

const ComingSoon = ({ title }) => (
  <div className="content-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>{title}</h2>
      <p style={{ color: 'var(--text-secondary)' }}>This module is currently under construction.</p>
    </div>
  </div>
);

const ProtectedLayout = ({ children, setAuth }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header setAuth={setAuth} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

// Main App Layout
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-color)' } }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/book-online" element={<PublicBooking />} />
        
        {/* Protected Routes */}
        <Route path="/*" element={
          !isAuthenticated ? (
            <Login setAuth={setIsAuthenticated} />
          ) : (
            <ProtectedLayout setAuth={setIsAuthenticated}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/services" element={<Services />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </ProtectedLayout>
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;

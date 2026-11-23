import React, { useState, useEffect } from 'react';
import { CalendarDays, Users, Scissors, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    revenueToday: 0,
    servicesRendered: 0,
    newCustomers: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, apptsRes, chartRes] = await Promise.all([
        fetch(`${API_URL}/appointments/stats/dashboard`, { headers: getHeaders() }),
        fetch(`${API_URL}/appointments`, { headers: getHeaders() }),
        fetch(`${API_URL}/appointments/stats/revenue-chart`, { headers: getHeaders() })
      ]);
      
      if (!statsRes.ok || !apptsRes.ok || !chartRes.ok) throw new Error('Unauthorized');

      const statsData = await statsRes.json();
      const apptsData = await apptsRes.json();
      const chartDataRes = await chartRes.json();
      
      setStats(statsData);
      setChartData(chartDataRes);
      
      const now = new Date();
      const upcoming = apptsData.filter(appt => {
        const apptDate = new Date(appt.date);
        return apptDate >= now && appt.status !== 'Completed' && appt.status !== 'Cancelled';
      }).slice(0, 5);
      
      setUpcomingAppointments(upcoming);
      setLoading(false);
    } catch (error) {
      toast.error('Session expired. Please login again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><CalendarDays size={24} /></div>
          <div className="stat-details">
            <h3>Today's Appointments</h3>
            <div className="value">{loading ? '...' : stats.todaysAppointments}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={24} /></div>
          <div className="stat-details">
            <h3>New Customers (Month)</h3>
            <div className="value">{loading ? '...' : stats.newCustomers}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Scissors size={24} /></div>
          <div className="stat-details">
            <h3>Services Completed</h3>
            <div className="value">{loading ? '...' : stats.servicesRendered}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><span style={{fontSize: '1.5rem', fontWeight: 'bold'}}>$</span></div>
          <div className="stat-details">
            <h3>Revenue (Today)</h3>
            <div className="value">${loading ? '...' : stats.revenueToday}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="content-card">
          <h3 className="section-title">Revenue (Last 7 Days)</h3>
          {loading ? (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading chart...</div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: 'var(--accent-secondary)' }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="section-title" style={{marginBottom: 0}}>Upcoming</h3>
            <Link to="/appointments" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>View All</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p>Loading...</p>
            ) : upcomingAppointments.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No upcoming appointments.</p>
            ) : (
              upcomingAppointments.map(appt => {
                const dateObj = new Date(appt.date);
                return (
                  <div key={appt._id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(192, 132, 252, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{dateObj.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', lineHeight: 1 }}>{dateObj.getDate()}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{appt.customer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{appt.service?.name || 'Service'} &bull; {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

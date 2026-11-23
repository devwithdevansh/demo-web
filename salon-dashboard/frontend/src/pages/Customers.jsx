import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash2, Plus, Mail, Phone, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/customers';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(API_URL, { headers: getHeaders() });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch customers');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving client...');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Client added successfully!', { id: loadingToast });
        fetchCustomers();
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', notes: '' });
      } else {
        toast.error('Failed to save client', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Network error', { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { 
          method: 'DELETE',
          headers: getHeaders()
        });
        if (res.ok) {
          toast.success('Client deleted');
          fetchCustomers();
        } else {
          toast.error('Failed to delete client');
        }
      } catch (error) {
        toast.error('Network error');
      }
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) {
      toast.error('No clients to export');
      return;
    }

    const headers = ['Name', 'Phone', 'Email', 'Joined Date'];
    const rows = customers.map(c => [
      `"${c.name}"`, 
      `"${c.phone}"`, 
      `"${c.email || ''}"`, 
      `"${new Date(c.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "glowup_clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported to CSV!');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Client Directory</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your client database and history.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white', cursor: 'pointer' }}>
            <Download size={18} /> Export
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Client
          </button>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <p>Loading customers...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact Info</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: '500' }}>{customer.name}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <Phone size={14} /> {customer.phone}
                        </span>
                        {customer.email && (
                          <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                            <Mail size={14} /> {customer.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="icon-btn" style={{ display: 'inline-flex' }}>
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn" style={{ display: 'inline-flex', color: 'var(--danger)' }} onClick={() => handleDelete(customer._id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No clients found. Add one to get started!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="content-card" style={{ width: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Add New Client</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone Number</label>
                <input required name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Address (Optional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

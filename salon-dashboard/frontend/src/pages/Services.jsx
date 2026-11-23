import React, { useState, useEffect } from 'react';
import { Scissors, Edit, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/services';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: 'Hair'
  });

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(API_URL, { headers: getHeaders() });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setServices(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch services');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'price' || name === 'duration' ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving service...');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Service added successfully!', { id: loadingToast });
        fetchServices();
        setShowModal(false);
        setFormData({ name: '', description: '', duration: 30, price: 0, category: 'Hair' });
      } else {
        toast.error('Failed to save service', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Network error', { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { 
          method: 'DELETE',
          headers: getHeaders()
        });
        if (res.ok) {
          toast.success('Service deleted');
          fetchServices();
        } else {
          toast.error('Failed to delete service');
        }
      } catch (error) {
        toast.error('Network error');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Service Menu</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your salon offerings and pricing.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Service
        </button>
      </div>

      <div className="content-card">
        {loading ? (
          <p>Loading services...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Duration (mins)</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service._id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{service.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{service.description}</div>
                    </td>
                    <td><span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{service.category}</span></td>
                    <td>{service.duration}</td>
                    <td style={{ fontWeight: '600', color: 'var(--accent-secondary)' }}>${service.price}</td>
                    <td>
                      <button className="icon-btn" style={{ display: 'inline-flex' }}>
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn" style={{ display: 'inline-flex', color: 'var(--danger)' }} onClick={() => handleDelete(service._id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No services found. Add one to get started!</td>
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
            <h3 style={{ marginBottom: '1.5rem' }}>Add New Service</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}>
                  <option value="Hair">Hair</option>
                  <option value="Nails">Nails</option>
                  <option value="Spa">Spa</option>
                  <option value="Makeup">Makeup</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Price ($)</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Duration (min)</label>
                  <input required type="number" name="duration" value={formData.duration} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;

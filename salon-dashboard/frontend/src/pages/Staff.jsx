import React, { useState, useEffect } from 'react';
import { UserCheck, Edit, Trash2, Plus, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/staff';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Stylist',
    phone: '',
    specialization: ''
  });

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch(API_URL, { headers: getHeaders() });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setStaffList(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch staff');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving staff member...');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Staff added successfully!', { id: loadingToast });
        fetchStaff();
        setShowModal(false);
        setFormData({ name: '', role: 'Stylist', phone: '', specialization: '' });
      } else {
        toast.error('Failed to save staff', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Network error', { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { 
          method: 'DELETE',
          headers: getHeaders()
        });
        if (res.ok) {
          toast.success('Staff member deleted');
          fetchStaff();
        } else {
          toast.error('Failed to delete staff');
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Staff Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your team and their roles.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <div className="content-card">
        {loading ? (
          <p>Loading staff...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Specialization</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(staff => (
                  <tr key={staff._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--accent-secondary), #3b82f6)' }}>
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: '500' }}>{staff.name}</div>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{staff.role}</span></td>
                    <td>{staff.specialization || '-'}</td>
                    <td>
                      <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <Phone size={14} /> {staff.phone || '-'}
                      </span>
                    </td>
                    <td>
                      <button className="icon-btn" style={{ display: 'inline-flex' }}>
                        <Edit size={16} />
                      </button>
                      <button className="icon-btn" style={{ display: 'inline-flex', color: 'var(--danger)' }} onClick={() => handleDelete(staff._id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {staffList.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No staff found. Add one to get started!</td>
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
            <h3 style={{ marginBottom: '1.5rem' }}>Add New Staff Member</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}>
                  <option value="Stylist">Stylist</option>
                  <option value="Colorist">Colorist</option>
                  <option value="Esthetician">Esthetician</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Specialization (Optional)</label>
                <input name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="e.g. Balayage, Fades" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;

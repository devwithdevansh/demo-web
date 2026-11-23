import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Clock, User, Scissors, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/appointments';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    service: '',
    staff: '',
    date: '',
    time: '',
    notes: ''
  });

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = getHeaders();
      const [apptsRes, custsRes, servsRes, staffRes] = await Promise.all([
        fetch(API_URL, { headers }),
        fetch('http://localhost:5000/api/customers', { headers }),
        fetch('http://localhost:5000/api/services', { headers }),
        fetch('http://localhost:5000/api/staff', { headers })
      ]);
      
      if (!apptsRes.ok || !custsRes.ok || !servsRes.ok || !staffRes.ok) throw new Error('Unauthorized');

      const apptsData = await apptsRes.json();
      const custsData = await custsRes.json();
      const servsData = await servsRes.json();
      const staffData = await staffRes.json();

      setAppointments(apptsData);
      setCustomers(custsData);
      setServices(servsData);
      setStaffList(staffData);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };

    // Auto-fill name if phone matches an existing customer
    if (name === 'customerPhone') {
      const existing = customers.find(c => c.phone === value);
      if (existing) {
        newFormData.customerName = existing.name;
      }
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Booking appointment...');
    try {
      let customerId = '';
      const existingCustomer = customers.find(c => c.phone === formData.customerPhone);
      
      if (existingCustomer) {
        customerId = existingCustomer._id;
      } else {
        // Create new customer on the fly
        const custRes = await fetch('http://localhost:5000/api/customers', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ name: formData.customerName, phone: formData.customerPhone })
        });
        
        if (custRes.ok) {
          const newCust = await custRes.json();
          customerId = newCust._id;
        } else {
          toast.error('Failed to create new client automatically.', { id: loadingToast });
          return;
        }
      }

      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          customer: customerId,
          service: formData.service,
          staff: formData.staff || undefined,
          date: dateTime.toISOString(),
          notes: formData.notes
        })
      });
      if (res.ok) {
        toast.success('Appointment booked!', { id: loadingToast });
        fetchData(); // This will refresh appointments and customers list
        setShowModal(false);
        setFormData({ customerName: '', customerPhone: '', service: '', staff: '', date: '', time: '', notes: '' });
      } else {
        toast.error('Failed to book appointment', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Network error', { id: loadingToast });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`);
        fetchData();
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Confirmed': return <span className="badge confirmed">Confirmed</span>;
      case 'Completed': return <span className="badge completed">Completed</span>;
      case 'Cancelled': return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>Cancelled</span>;
      default: return <span className="badge pending">Pending</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Appointments</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your daily bookings and schedule.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      <div className="content-card">
        {loading ? (
          <p>Loading appointments...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => {
                  const dateObj = new Date(appt.date);
                  return (
                    <tr key={appt._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={16} color="var(--text-secondary)" />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '500' }}>{appt.customer?.name || 'Unknown'}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Stylist: {appt.staff?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Scissors size={16} color="var(--accent-secondary)" />
                          <span>{appt.service?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '500' }}>{dateObj.toLocaleDateString()}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td>{getStatusBadge(appt.status)}</td>
                      <td>
                        {appt.status === 'Pending' && (
                          <button onClick={() => handleStatusChange(appt._id, 'Confirmed')} className="icon-btn" style={{ color: 'var(--success)' }} title="Confirm">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {(appt.status === 'Confirmed' || appt.status === 'Pending') && (
                          <button onClick={() => handleStatusChange(appt._id, 'Cancelled')} className="icon-btn" style={{ color: 'var(--danger)' }} title="Cancel">
                            <XCircle size={18} />
                          </button>
                        )}
                        {appt.status === 'Confirmed' && (
                          <button onClick={() => handleStatusChange(appt._id, 'Completed')} className="icon-btn" style={{ color: 'var(--accent-primary)' }} title="Mark Completed">
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No appointments scheduled.</td>
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
          <div className="content-card" style={{ width: '450px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Book Appointment</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Client Name</label>
                  <input required name="customerName" placeholder="John Doe" value={formData.customerName} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone Number</label>
                  <input required name="customerPhone" placeholder="(555) 123-4567" list="existing-customers" value={formData.customerPhone} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
                  <datalist id="existing-customers">
                    {customers.map(c => <option key={c._id} value={c.phone}>{c.name}</option>)}
                  </datalist>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>* If phone number is new, a new client will be created automatically.</p>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Service</label>
                <select required name="service" value={formData.service} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}>
                  <option value="">Select a service...</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.name} - ${s.price}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Stylist (Optional)</label>
                <select name="staff" value={formData.staff} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}>
                  <option value="">Any available stylist...</option>
                  {staffList.map(s => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date</label>
                  <input required type="date" name="date" value={formData.date} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Time</label>
                  <input required type="time" name="time" value={formData.time} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Book Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;

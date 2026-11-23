import React, { useState, useEffect } from 'react';
import { Scissors, Calendar, Clock, User, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import '../index.css'; // Make sure styles are applied

const API_URL = 'http://localhost:5000/api/public';

const PublicBooking = () => {
  const [services, setServices] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/services`);
      const data = await res.json();
      setServices(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load services');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Submitting your request...');
    
    try {
      const res = await fetch(`${API_URL}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success('Appointment requested!', { id: loadingToast });
        setSubmitted(true);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to submit', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Network error', { id: loadingToast });
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'white' }}>Loading...</div>;
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="content-card" style={{ width: '100%', maxWidth: '500px', padding: '3rem', textAlign: 'center' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Booking Requested!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Thank you, {formData.name}! Your appointment request has been sent to our team. We will review it and confirm with you shortly via phone or email.
          </p>
          <button className="btn-primary" onClick={() => window.location.reload()} style={{ display: 'inline-flex', padding: '0.75rem 2rem' }}>
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem 1rem' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-color)' } }} />
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scissors size={28} color="#fff" />
            </div>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>GlowUp Salon</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Book your appointment online</p>
        </div>

        <div className="content-card" style={{ padding: '2.5rem' }}>
          {/* Progress Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--bg-tertiary)', zIndex: 1 }}></div>
            <div style={{ position: 'absolute', top: '50%', left: 0, width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', height: '2px', background: 'var(--accent-primary)', zIndex: 2, transition: 'var(--transition)' }}></div>
            
            {[1, 2, 3].map(num => (
              <div key={num} style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= num ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, fontWeight: 'bold', border: `4px solid var(--bg-secondary)`, transition: 'var(--transition)' }}>
                {num}
              </div>
            ))}
          </div>

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            {/* Step 1: Service */}
            {step === 1 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Scissors size={20} color="var(--accent-primary)" /> Choose a Service
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {services.map(service => (
                    <label key={service._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: `2px solid ${formData.serviceId === service._id ? 'var(--accent-primary)' : 'var(--border-color)'}`, borderRadius: '12px', cursor: 'pointer', transition: 'var(--transition)', background: formData.serviceId === service._id ? 'rgba(192, 132, 252, 0.05)' : 'transparent' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{service.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{service.duration} mins &bull; {service.category}</div>
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-secondary)' }}>${service.price}</div>
                      <input type="radio" name="serviceId" value={service._id} onChange={handleInputChange} required style={{ display: 'none' }} />
                    </label>
                  ))}
                  {services.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No services available right now.</p>}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="var(--accent-primary)" /> Select Date & Time
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500' }}>Preferred Date</label>
                    <input type="date" name="date" required min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleInputChange} style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500' }}>Preferred Time</label>
                    <input type="time" name="time" required value={formData.time} onChange={handleInputChange} style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Your Details */}
            {step === 3 && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={20} color="var(--accent-primary)" /> Your Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name *</label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="Jane Doe" style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone Number *</label>
                    <input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(555) 123-4567" style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="jane@example.com" style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Special Requests (Optional)</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', resize: 'vertical' }}></textarea>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
              {step > 1 ? (
                <button type="button" onClick={prevStep} style={{ padding: '0.875rem 1.5rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', fontWeight: '500' }}>Back</button>
              ) : <div></div>}
              
              <button type="submit" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                {step === 3 ? 'Confirm Request' : 'Next Step'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;

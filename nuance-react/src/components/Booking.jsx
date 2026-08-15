import { useState, useRef } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Booking() {
  const [gender, setGender] = useState(null);
  const [service, setService] = useState(null);
  const [stylist, setStylist] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState(null);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmRef = useRef(null);

  useScrollReveal();

  const servicesByGender = {
    men: ["Haircut", "Fade", "Beard Styling", "Hair Styling", "Hair Colour", "Grooming Package"],
    women: ["Haircut", "Blow Dry", "Hair Colour", "Balayage", "Highlights", "Hair Spa", "Bridal Styling", "Occasion Styling"]
  };

  const currentStep = !gender ? 1 : !service ? 2 : !stylist ? 3 : 4;

  const updateCursor = (text, big) => {
    window.dispatchEvent(new CustomEvent('updateCursor', { detail: { text, big } }));
  };

  const handleGender = (g) => {
    setGender(g);
    setService(null);
  };

  const handleConfirm = () => {
    if (!gender || !service || !stylist || !date || !time) {
      setConfirmMsg("Please complete every step above before confirming.");
      setShowConfirm(true);
      return;
    }
    const dLabel = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    setConfirmMsg(`${service} with ${stylist} — ${dLabel} at ${time}.`);
    setShowConfirm(true);
    
    setTimeout(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      confirmRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    }, 100);
  };

  const dateTimeSummary = () => {
    const parts = [];
    if (date) {
      parts.push(new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }));
    }
    if (time) parts.push(time);
    return parts.length ? parts.join(" · ") : "—";
  };

  return (
    <section className="section" id="booking">
      <div className="container-custom">
        <div className="section-head rv">
          <h2 className="display-lg">Find your<br/><span className="italic brass-text">next look.</span></h2>
        </div>

        <div className="book-wrap">
          <div className="book-steps" id="bookSteps">
            {[
              { label: "Studio", value: gender ? `${gender === 'men' ? 'Men' : 'Women'}'s Studio` : "—" },
              { label: "Service", value: service || "—" },
              { label: "Stylist", value: stylist || "—" },
              { label: "Date & Time", value: dateTimeSummary() }
            ].map((step, idx) => (
              <div key={idx} className={`book-step ${currentStep === idx + 1 ? 'is-current' : ''}`} data-step={idx + 1}>
                <span className="book-step-num">0{idx + 1}</span>
                <div>
                  <div className="book-step-label">{step.label}</div>
                  <div className="book-step-value">{step.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="book-panel">
            <div className="book-field">
              <span className="book-field-label">01 · Choose Studio</span>
              <div className="choice-grid">
                <button className={`choice ${gender === 'men' ? 'is-selected' : ''}`} onClick={() => handleGender('men')}>Men</button>
                <button className={`choice ${gender === 'women' ? 'is-selected' : ''}`} onClick={() => handleGender('women')}>Women</button>
              </div>
            </div>
            <div className="book-field">
              <span className="book-field-label">02 · Choose Service</span>
              <div className="choice-grid">
                {!gender ? (
                  <span className="body-md">Select a studio to see services.</span>
                ) : (
                  servicesByGender[gender].map(s => (
                    <button key={s} className={`choice ${service === s ? 'is-selected' : ''}`} onClick={() => setService(s)}>{s}</button>
                  ))
                )}
              </div>
            </div>
            <div className="book-field">
              <span className="book-field-label">03 · Choose Stylist</span>
              <div className="choice-grid">
                {["Rahul", "Priya", "Neha", "No preference"].map(s => (
                  <button key={s} className={`choice ${stylist === s ? 'is-selected' : ''}`} onClick={() => setStylist(s)}>{s}</button>
                ))}
              </div>
            </div>
            <div className="book-field">
              <span className="book-field-label">04 · Date &amp; Time</span>
              <input 
                type="date" 
                className="date-input" 
                style={{ marginBottom: '16px' }}
                value={date}
                onChange={e => setDate(e.target.value)}
              />
              <div className="choice-grid">
                {["10:00 AM", "12:30 PM", "2:00 PM", "4:30 PM", "6:00 PM"].map(t => (
                  <button key={t} className={`choice ${time === t ? 'is-selected' : ''}`} onClick={() => setTime(t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className="book-actions">
              <button 
                className="btn btn-solid" 
                onClick={handleConfirm}
                onMouseEnter={() => updateCursor('Confirm', true)}
                onMouseLeave={() => updateCursor('', false)}
              >
                Confirm Appointment
              </button>
            </div>
            <div className={`book-confirm ${showConfirm ? 'is-visible' : ''}`} ref={confirmRef}>
              <p className="eyebrow">Request Received</p>
              <p className="body-lg" style={{ marginTop: '14px' }}>{confirmMsg}</p>
              <p className="body-md" style={{ marginTop: '10px' }}>This is a front-end demo — connect it to your booking system or WhatsApp Business API to take live appointments.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

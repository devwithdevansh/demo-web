import { useEffect, useState } from 'react';
import { rooms, WHATSAPP_NUMBER, EMAIL } from '../content';

const today = () => new Date().toISOString().slice(0, 10);
const empty = { name: '', checkin: '', checkout: '', guests: '2', room: rooms[0].name, note: '' };

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Add your name so we know who to reply to.';
  if (!f.checkin) e.checkin = 'Choose a check-in date.';
  else if (f.checkin < today()) e.checkin = 'Check-in can’t be in the past.';
  if (!f.checkout) e.checkout = 'Choose a check-out date.';
  else if (f.checkin && f.checkout <= f.checkin) e.checkout = 'Check-out must be after check-in.';
  return e;
}

export default function Booking() {
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onPick = (e) => setF((s) => ({ ...s, room: e.detail }));
    window.addEventListener('pick-room', onPick);
    return () => window.removeEventListener('pick-room', onPick);
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const msg = `Hi Saltlight, I'd like to book.\nName: ${f.name}\nDates: ${f.checkin} to ${f.checkout}\nGuests: ${f.guests}\nRoom: ${f.room}${f.note ? `\nNote: ${f.note}` : ''}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    setSent(true);
  };

  return (
    <section id="book" className="wrap py-[clamp(96px,16vh,180px)] grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-[6vw]">
      <div>
        <h2 className="serif d2 m-0 max-w-[10ch]">Book a few nights</h2>
        <p className="mt-6 max-w-[36ch] muted">Send us your dates on WhatsApp and we’ll confirm within a few hours. Full-moon weekends fill first, so book those early.</p>
        <p className="mt-6 muted text-[15px]">Prefer email? <a className="link" href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
      </div>

      {sent ? (
        <div role="status" className="self-center">
          <p className="serif d3 m-0">Request opened in WhatsApp.</p>
          <p className="muted mt-4 max-w-[40ch]">Press send in WhatsApp to reach us. If it didn’t open, email {EMAIL} with the same details.</p>
          <button className="link mt-6 cursor-pointer" onClick={() => { setSent(false); setF(empty); }}>Start a new request</button>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          <div className="field sm:col-span-2">
            <label htmlFor="name">Your name</label>
            <input id="name" autoComplete="name" value={f.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby="e-name" />
            <p id="e-name" className="err">{errors.name}</p>
          </div>
          <div className="field">
            <label htmlFor="checkin">Check-in</label>
            <input id="checkin" type="date" min={today()} value={f.checkin} onChange={set('checkin')} aria-invalid={!!errors.checkin} aria-describedby="e-in" />
            <p id="e-in" className="err">{errors.checkin}</p>
          </div>
          <div className="field">
            <label htmlFor="checkout">Check-out</label>
            <input id="checkout" type="date" min={f.checkin || today()} value={f.checkout} onChange={set('checkout')} aria-invalid={!!errors.checkout} aria-describedby="e-out" />
            <p id="e-out" className="err">{errors.checkout}</p>
          </div>
          <div className="field">
            <label htmlFor="guests">Guests</label>
            <select id="guests" value={f.guests} onChange={set('guests')}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="room">Room</label>
            <select id="room" value={f.room} onChange={set('room')}>
              {rooms.map((r) => <option key={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div className="field sm:col-span-2 mt-4">
            <label htmlFor="note">Anything we should know (optional)</label>
            <input id="note" value={f.note} onChange={set('note')} placeholder="Anniversary, dietary needs, arrival time…" />
          </div>
          <div className="sm:col-span-2 mt-6">
            <button type="submit" className="btn">Send request on WhatsApp</button>
          </div>
        </form>
      )}
    </section>
  );
}

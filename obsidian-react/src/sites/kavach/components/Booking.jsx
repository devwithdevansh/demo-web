import { useEffect, useState } from 'react';
import { services, sizes, studios, WHATSAPP_NUMBER, PHONE_DISPLAY, BRAND } from '../content';

const today = () => new Date().toISOString().slice(0, 10);
const empty = { name: '', phone: '', car: '', service: services[3].name, size: sizes[1], studio: studios[0].id, date: '' };

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Add your name.';
  if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, '').slice(-10))) e.phone = 'Enter a 10-digit mobile number.';
  if (!f.car.trim()) e.car = 'Tell us the car, for example “Creta 2022, white”.';
  if (!f.date) e.date = 'Choose a date.';
  else if (f.date < today()) e.date = 'Pick today or a later date.';
  return e;
}

export default function Booking() {
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onPick = (e) => setF((s) => ({ ...s, service: e.detail }));
    window.addEventListener('pick-service', onPick);
    return () => window.removeEventListener('pick-service', onPick);
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    const studio = studios.find((s) => s.id === f.studio) || studios[0];
    const msg = `Hi ${BRAND}, I'd like to book a slot at ${studio.name}.\nName: ${f.name}\nPhone: ${f.phone}\nCar: ${f.car} (${f.size})\nService: ${f.service}\nPreferred date: ${f.date}`;
    window.open(`https://wa.me/${studio.whatsapp || WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    setSent(true);
  };

  const field = (id, label, input) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {input}
      <p id={`e-${id}`} className="err">{errors[id]}</p>
    </div>
  );

  return (
    <section id="book" className="bg-[var(--panel)] wrap py-[clamp(96px,16vh,180px)] grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-[6vw] border-y border-[var(--line)]">
      <div>
        <span className="eyebrow mb-4">Book a slot</span>
        <h2 className="display d2 m-0 max-w-[10ch]">Send it on WhatsApp</h2>
        <p className="lede mt-6 mb-0">Pick your nearest studio and we'll reply within the hour, during studio hours, with a confirmed time.</p>
        <p className="mt-6 text-[var(--paper-dim)]">Rather call? <a className="link" href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`}>{PHONE_DISPLAY}</a></p>
      </div>

      {sent ? (
        <div role="status" className="self-center">
          <p className="display d3 m-0">Request opened in WhatsApp.</p>
          <p className="mt-4 text-[var(--paper-dim)] max-w-[42ch]">Press send in WhatsApp to reach the studio. If it didn't open, call {PHONE_DISPLAY}.</p>
          <button className="link mt-6 cursor-pointer" onClick={() => { setSent(false); setF(empty); }}>Start a new booking</button>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="grid sm:grid-cols-2 gap-x-5 gap-y-2">
          {field('name', 'Your name', <input id="name" autoComplete="name" value={f.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby="e-name" />)}
          {field('phone', 'Mobile number', <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} aria-invalid={!!errors.phone} aria-describedby="e-phone" />)}
          <div className="sm:col-span-2">
            {field('car', 'Car model and colour', <input id="car" value={f.car} onChange={set('car')} placeholder="Creta 2022, white" aria-invalid={!!errors.car} aria-describedby="e-car" />)}
          </div>
          {field('studio', 'Studio', <select id="studio" value={f.studio} onChange={set('studio')}>{studios.map((s) => <option key={s.id} value={s.id}>{s.city} — {s.area}</option>)}</select>)}
          {field('service', 'Service', <select id="service" value={f.service} onChange={set('service')}>{services.map((s) => <option key={s.name}>{s.name}</option>)}</select>)}
          {field('size', 'Car size', <select id="size" value={f.size} onChange={set('size')}>{sizes.map((s) => <option key={s}>{s}</option>)}</select>)}
          {field('date', 'Preferred date', <input id="date" type="date" min={today()} value={f.date} onChange={set('date')} aria-invalid={!!errors.date} aria-describedby="e-date" />)}
          <div className="sm:col-span-2 mt-4">
            <button type="submit" className="btn solid">Send on WhatsApp</button>
          </div>
        </form>
      )}
    </section>
  );
}

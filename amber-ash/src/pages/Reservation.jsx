import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import FadeIn from '../components/ui/FadeIn'
import FormField from '../components/ui/FormField'
import { hours, siteInfo } from '../data/siteData'
import './pages.css'
import './reservation.css'

const partySizes = [1, 2, 3, 4, 5, 6, 7, 8]
const timeSlots = [
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM',
  '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
]
const occasions = ['None', 'Birthday', 'Anniversary', 'Date Night', 'Business Dinner', 'Other']

const initialForm = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  guests: '2',
  occasion: 'None',
  notes: '',
}

function todayISO() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().split('T')[0]
}

export default function Reservation() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [confirmation, setConfirmation] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter your full name.'
    if (!form.email.trim()) {
      e.email = 'Please enter an email address.'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = "That email doesn't look right."
    }
    if (!form.phone.trim()) e.phone = 'Please enter a phone number.'
    if (!form.date) e.date = 'Please choose a date.'
    if (!form.time) e.time = 'Please choose a time.'
    return e
  }

  function handleSubmit(evt) {
    evt.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return

    const code = `AA-${Math.floor(1000 + Math.random() * 9000)}`
    setConfirmation({ ...form, code })
  }

  function startOver() {
    setForm(initialForm)
    setErrors({})
    setConfirmation(null)
  }

  return (
    <>
      <section className="page-hero">
        <FadeIn className="wrap" y={20}>
          <span className="eyebrow eyebrow--gold">Reservations</span>
          <h1>Book your table</h1>
          <p>
            Tell us when you'd like to come in. This is a demo booking form — no reservation is
            actually submitted, but the flow works exactly like the real thing.
          </p>
        </FadeIn>
      </section>

      <section className="section reservation-section">
        <FadeIn className="wrap reservation-grid" delay={0.1}>
          <div className="reservation-info">
            <h2>Good to know</h2>
            <ul className="info-list">
              <li>
                <strong>Party size</strong>
                <span>For groups over 8, please call us directly to arrange a private table.</span>
              </li>
              <li>
                <strong>Hold time</strong>
                <span>Tables are held for 15 minutes past your reservation time.</span>
              </li>
              <li>
                <strong>Cancellations</strong>
                <span>Please give us at least 2 hours' notice if your plans change.</span>
              </li>
            </ul>

            <h3 className="hours-heading">Hours</h3>
            <ul className="hours-list">
              {hours.map((h) => (
                <li key={h.day}>
                  <span>{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>

            <p className="phone-alt">
              Prefer to call? <a href={`tel:${siteInfo.phone.replace(/[^0-9+]/g, '')}`}>{siteInfo.phone}</a>
            </p>
          </div>

          <div className="reservation-form-wrap">
            {confirmation ? (
              <div className="confirmation-card">
                <span className="eyebrow eyebrow--gold">Reservation Held</span>
                <h2>You're booked, {confirmation.name.split(' ')[0]}.</h2>
                <p>
                  A confirmation for party of {confirmation.guests} on{' '}
                  <strong>{confirmation.date}</strong> at <strong>{confirmation.time}</strong> has
                  been recorded under code <strong>{confirmation.code}</strong>.
                </p>
                <div className="confirmation-details">
                  <div><span>Name</span><span>{confirmation.name}</span></div>
                  <div><span>Email</span><span>{confirmation.email}</span></div>
                  <div><span>Phone</span><span>{confirmation.phone}</span></div>
                  <div><span>Occasion</span><span>{confirmation.occasion}</span></div>
                  {confirmation.notes && <div><span>Notes</span><span>{confirmation.notes}</span></div>}
                </div>
                <div className="confirmation-actions">
                  <Button variant="outline-light" onClick={startOver}>Book Another Table</Button>
                  <Button to="/menu">Browse the Menu</Button>
                </div>
              </div>
            ) : (
              <form className="reservation-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row two">
                  <FormField
                    id="name"
                    label="Full name"
                    error={errors.name}
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Jordan Rivera"
                  />
                  <FormField
                    id="phone"
                    label="Phone"
                    error={errors.phone}
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <FormField
                  id="email"
                  label="Email"
                  error={errors.email}
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="jordan@email.com"
                />

                <div className="form-row three">
                  <FormField
                    id="date"
                    label="Date"
                    error={errors.date}
                    type="date"
                    min={todayISO()}
                    value={form.date}
                    onChange={(e) => update('date', e.target.value)}
                  />
                  <FormField
                    id="time"
                    label="Time"
                    error={errors.time}
                    as="select"
                    value={form.time}
                    onChange={(e) => update('time', e.target.value)}
                  >
                    <option value="">Select</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </FormField>
                  <FormField
                    id="guests"
                    label="Guests"
                    as="select"
                    value={form.guests}
                    onChange={(e) => update('guests', e.target.value)}
                  >
                    {partySizes.map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                    ))}
                  </FormField>
                </div>

                <FormField
                  id="occasion"
                  label="Occasion (optional)"
                  as="select"
                  value={form.occasion}
                  onChange={(e) => update('occasion', e.target.value)}
                >
                  {occasions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </FormField>

                <FormField
                  id="notes"
                  label="Notes (optional)"
                  as="textarea"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="Allergies, seating preference, anything we should know..."
                />

                <Button type="submit" className="reservation-submit">
                  Confirm Reservation
                </Button>
              </form>
            )}
          </div>
        </FadeIn>
      </section>
    </>
  )
}

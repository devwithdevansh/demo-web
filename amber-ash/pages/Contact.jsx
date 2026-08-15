import { useState } from 'react'
import Button from '../components/ui/Button'
import FadeIn from '../components/ui/FadeIn'
import FormField from '../components/ui/FormField'
import { hours, siteInfo } from '../data/siteData'
import './pages.css'
import './contact.css'

const initialForm = { name: '', email: '', subject: 'General Question', message: '' }
const subjects = ['General Question', 'Private Event', 'Feedback', 'Press', 'Careers']

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter your name.'
    if (!form.email.trim()) {
      e.email = 'Please enter an email address.'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = "That email doesn't look right."
    }
    if (!form.message.trim()) e.message = 'Please add a short message.'
    return e
  }

  function handleSubmit(evt) {
    evt.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setSent(true)
  }

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteInfo.address)}`

  return (
    <>
      <section className="page-hero">
        <FadeIn className="wrap" y={20}>
          <span className="eyebrow eyebrow--gold">Contact</span>
          <h1>Get in touch</h1>
          <p>Questions, private events, or press inquiries — send us a note and we'll follow up.</p>
        </FadeIn>
      </section>

      <section className="section contact-section">
        <FadeIn className="wrap contact-grid" delay={0.1}>
          <div className="contact-form-wrap">
            {sent ? (
              <div className="sent-card">
                <span className="eyebrow eyebrow--gold">Message Sent</span>
                <h2>Thanks, {form.name.split(' ')[0]}.</h2>
                <p>
                  This is a demo form, so nothing was actually sent — but in a live site your
                  message would now be on its way to our team, and we'd typically reply within one
                  business day.
                </p>
                <Button variant="outline-light" onClick={() => { setForm(initialForm); setSent(false) }}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row two">
                  <FormField
                    id="c-name"
                    label="Name"
                    error={errors.name}
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Your name"
                  />
                  <FormField
                    id="c-email"
                    label="Email"
                    error={errors.email}
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="you@email.com"
                  />
                </div>

                <FormField
                  id="c-subject"
                  label="Subject"
                  as="select"
                  value={form.subject}
                  onChange={(e) => update('subject', e.target.value)}
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </FormField>

                <FormField
                  id="c-message"
                  label="Message"
                  error={errors.message}
                  as="textarea"
                  rows={5}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  placeholder="How can we help?"
                />

                <Button type="submit" className="contact-submit">Send Message</Button>
              </form>
            )}
          </div>

          <div className="contact-side">
            <div className="contact-map" role="img" aria-label={`Map placeholder showing ${siteInfo.address}`}>
              <div className="contact-map-grid" />
              <span className="contact-map-pin">📍</span>
            </div>
            <Button href={mapsHref} target="_blank" rel="noreferrer" variant="ghost" className="contact-directions">
              Get Directions →
            </Button>

            <div className="contact-details">
              <div>
                <span className="eyebrow eyebrow--inkSoft">Address</span>
                <p>{siteInfo.address}</p>
              </div>
              <div>
                <span className="eyebrow eyebrow--inkSoft">Phone</span>
                <p><a href={`tel:${siteInfo.phone.replace(/[^0-9+]/g, '')}`}>{siteInfo.phone}</a></p>
              </div>
              <div>
                <span className="eyebrow eyebrow--inkSoft">Email</span>
                <p><a href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a></p>
              </div>
              <div>
                <span className="eyebrow eyebrow--inkSoft">Hours</span>
                <ul className="contact-hours">
                  {hours.map((h) => (
                    <li key={h.day}><span>{h.day}</span><span>{h.time}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  )
}

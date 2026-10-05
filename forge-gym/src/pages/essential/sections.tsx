import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Clock, Mail, MapPin, MessageCircle, Phone, X } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { ClipPlayer } from '@/components/ui/ClipPlayer';
import { ApiError, sendEnquiry } from '@/lib/api';
import { framePath, sampleGym } from '@/config/sampleGym';

const WRAP = 'mx-auto max-w-[1440px] px-6 lg:px-12';

// ---- About and facilities -------------------------------------------------

export function About() {
  return (
    <section id="about" data-phase="BUILD" className="relative scroll-mt-24 bg-ink py-24 lg:py-32">
      <div className={WRAP}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <Reveal className="lg:sticky lg:top-40 lg:self-start">
            <p className="eyebrow mb-4">About The Gym</p>
            <h2 className="font-display text-5xl leading-[0.9] text-bone lg:text-7xl">
              BUILT FOR <span className="text-red">REAL TRAINING.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-bone-dim">{sampleGym.about}</p>
          </Reveal>

          <div>
            <p className="eyebrow mb-5">Facilities</p>
            <div className="grid border-l border-t border-line sm:grid-cols-2">
              {sampleGym.facilities.map((f, i) => (
                <Reveal key={f.name} delay={i * 0.04}>
                  <div data-cursor="VIEW" className="h-full border-b border-r border-line p-6 transition-colors hover:bg-ink-2 lg:p-7">
                    <p className="font-mono text-xs text-mute">0{i + 1}</p>
                    <h3 className="mt-3 font-display text-3xl leading-none text-bone">{f.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-mute">{f.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Photos and video -----------------------------------------------------

export function Gallery() {
  const [first, ...rest] = sampleGym.gallery;
  const photo = (g: (typeof sampleGym.gallery)[number], className: string) => (
    <figure key={g.frame} className={`group relative overflow-hidden bg-ink-2 ${className}`}>
      <img
        src={framePath(g.frame)}
        alt={g.caption}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        style={{ objectPosition: g.position }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" aria-hidden />
      <figcaption className="absolute bottom-4 left-4 font-mono text-[11px] uppercase tracking-[0.2em] text-bone">{g.caption}</figcaption>
    </figure>
  );

  return (
    <section id="gallery" data-phase="PUSH" className="relative scroll-mt-24 bg-ink py-24 lg:py-32">
      <div className={WRAP}>
        <Reveal className="mb-12">
          <div>
            <p className="eyebrow mb-4">Photos &amp; Video</p>
            <h2 className="font-display text-5xl leading-[0.9] text-bone lg:text-7xl">
              INSIDE <span className="text-red">THE GYM.</span>
            </h2>
          </div>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Sample media · your photos and videos go here</p>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <ClipPlayer label="Sample clip" />
          </Reveal>
          <Reveal delay={0.06}>{photo(first, 'aspect-video')}</Reveal>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {rest.map((g, i) => (
            <Reveal key={g.frame} delay={i * 0.05}>
              {photo(g, 'aspect-[4/5]')}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Contact actions (demo) -----------------------------------------------

type DemoAction = 'whatsapp' | 'call' | 'directions';

const ACTIONS: Record<DemoAction, { title: string; live: string; here: string; preview?: string }> = {
  whatsapp: {
    title: 'Chat on WhatsApp',
    live: 'On a live site, this button opens WhatsApp on the visitor’s phone with the gym’s number and this message ready to send:',
    preview: `Hi ${sampleGym.name}, I would like to know more about your membership plans.`,
    here: 'The sample gym has no real phone number, so nothing opens in the demo.',
  },
  call: {
    title: 'Call the gym',
    live: 'On a live site, this button starts a phone call to the gym’s number from the visitor’s phone.',
    here: `The sample gym’s number (${sampleGym.phone}) is not real, so no call is placed in the demo.`,
  },
  directions: {
    title: 'Get directions',
    live: 'On a live site, this button opens the gym’s location in the visitor’s maps app.',
    here: 'The sample gym’s address is made up, so there is nowhere to navigate to in the demo.',
  },
};

function ActionDialog({ action, onClose }: { action: DemoAction; onClose: () => void }) {
  const copy = ACTIONS[action];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-6" data-lenis-prevent>
      <div className="absolute inset-0 bg-ink/85" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-labelledby="demo-action-title" className="relative w-full border border-line bg-ink-2 p-6 sm:max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Demo action</p>
            <h2 id="demo-action-title" className="mt-2 font-display text-3xl leading-none text-bone">
              {copy.title}
            </h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 p-2 text-mute transition-colors hover:text-bone">
            <X size={20} />
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-bone-dim">{copy.live}</p>
        {copy.preview && <p className="mt-3 border-l-2 border-ok/60 bg-ink px-4 py-3 text-sm leading-relaxed text-bone">{copy.preview}</p>}
        <p className="mt-3 text-sm leading-relaxed text-mute">{copy.here}</p>
        <button type="button" onClick={onClose} className="mt-6 bg-bone px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:bg-red hover:text-bone">
          Got it
        </button>
      </div>
    </div>
  );
}

/** Returns a function that opens a demo explanation for a contact action, plus the dialog to render. */
export function useDemoActions(): [(action: DemoAction) => void, ReactNode] {
  const [action, setAction] = useState<DemoAction | null>(null);
  const dialog = action ? <ActionDialog action={action} onClose={() => setAction(null)} /> : null;
  return [setAction, dialog];
}

// ---- Location, timings and contact ----------------------------------------

/** A stylised map tile. No map service is loaded; a real site would link to the gym's actual location. */
function MapTile() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-ink-2" role="img" aria-label="Illustrated map showing the sample gym's location">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g stroke="var(--color-line)" strokeWidth="1" fill="none">
          {[40, 100, 160, 220, 280, 340].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x - 30} y2="300" />
          ))}
          {[50, 110, 170, 230].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y + 20} />
          ))}
        </g>
        <path d="M0 196 L400 150" stroke="var(--color-graphite)" strokeWidth="18" />
        <path d="M214 0 L182 300" stroke="var(--color-graphite)" strokeWidth="14" />
        <circle cx="200" cy="172" r="26" fill="var(--color-red)" opacity="0.18" />
        <circle cx="200" cy="172" r="7" fill="var(--color-red)" />
      </svg>
      <p className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Map preview · sample location</p>
      <p className="absolute bottom-4 left-4 font-display text-2xl tracking-wide text-bone">{sampleGym.wordmark}</p>
    </div>
  );
}

export function Visit({ onAction }: { onAction: (action: DemoAction) => void }) {
  const line = 'flex items-start gap-4 border-b border-line py-5';
  return (
    <section id="visit" data-phase="COOL DOWN" className="relative scroll-mt-24 bg-ink py-24 lg:py-32">
      <div className={WRAP}>
        <Reveal className="mb-12">
          <p className="eyebrow mb-4">Location &amp; Timings</p>
          <h2 className="font-display text-5xl leading-[0.9] text-bone lg:text-7xl">
            COME <span className="text-red">TRAIN.</span>
          </h2>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <MapTile />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="border-t border-line">
              <div className={line}>
                <MapPin size={18} className="mt-1 shrink-0 text-red" aria-hidden />
                <div>
                  <p className="eyebrow mb-2">Address</p>
                  <p className="text-base leading-relaxed text-bone">
                    {sampleGym.address[0]}
                    <br />
                    {sampleGym.address[1]}
                  </p>
                </div>
              </div>
              <div className={line}>
                <Clock size={18} className="mt-1 shrink-0 text-red" aria-hidden />
                <div className="flex-1">
                  <p className="eyebrow mb-2">Timings</p>
                  <dl className="space-y-1.5">
                    {sampleGym.timings.map((t) => (
                      <div key={t.days} className="flex flex-wrap justify-between gap-x-6 text-base">
                        <dt className="text-bone-dim">{t.days}</dt>
                        <dd className="text-bone">{t.hours}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              <div className={line}>
                <Phone size={18} className="mt-1 shrink-0 text-red" aria-hidden />
                <div>
                  <p className="eyebrow mb-2">Phone</p>
                  <p className="text-base text-bone">{sampleGym.phone}</p>
                </div>
              </div>
              <div className={line}>
                <Mail size={18} className="mt-1 shrink-0 text-red" aria-hidden />
                <div>
                  <p className="eyebrow mb-2">Email</p>
                  <p className="break-all text-base text-bone">{sampleGym.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => onAction('whatsapp')} data-cursor="CHAT" className="inline-flex items-center gap-2 bg-bone px-6 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:bg-red hover:text-bone">
                <MessageCircle size={15} aria-hidden /> WhatsApp Us
              </button>
              <button type="button" onClick={() => onAction('call')} data-cursor="CALL" className="inline-flex items-center gap-2 border border-bone/40 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone">
                <Phone size={15} aria-hidden /> Call
              </button>
              <button type="button" onClick={() => onAction('directions')} data-cursor="GO" className="inline-flex items-center gap-2 border border-bone/40 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone">
                <MapPin size={15} aria-hidden /> Directions
              </button>
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Sample contact details for the demo gym.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ---- Enquiry form ---------------------------------------------------------

const INTERESTS = ['Membership plans', 'Personal training', 'Group classes', 'A trial visit'];
const INPUT = 'w-full border-b bg-transparent py-3 font-body text-base text-bone outline-none transition-colors placeholder:text-mute/50 focus:border-red';

export function Enquiry({ onAction }: { onAction: (action: DemoAction) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', interest: INTERESTS[0], message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'sent-offline'>('idle');
  const [failure, setFailure] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (form.name.trim().length < 2) found.name = 'Please enter your name.';
    if (!/^\+?[\d\s-]{8,16}$/.test(form.phone.trim())) found.phone = 'Please enter a phone number we can reach you on.';
    setErrors(found);
    setFailure(null);
    if (Object.keys(found).length) return;

    setStatus('sending');
    try {
      await sendEnquiry(form);
      setStatus('sent');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'offline') {
        // The site can be previewed without its server; say plainly that nothing was stored.
        setStatus('sent-offline');
      } else if (err instanceof ApiError) {
        setErrors(err.fields);
        setFailure(err.message);
        setStatus('idle');
      } else {
        setFailure('Something went wrong. Please try again.');
        setStatus('idle');
      }
    }
  };

  const done = status === 'sent' || status === 'sent-offline';

  return (
    <section id="enquire" data-phase="CLOSE" className="relative scroll-mt-24 bg-ink-2 py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-12">
        <Reveal className="mb-10 text-center">
          <p className="eyebrow mb-4">Start Today</p>
          <h2 className="font-display text-5xl leading-[0.9] text-bone lg:text-7xl">
            ASK US <span className="text-red">ANYTHING.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-bone-dim">Leave your details and the team will get back to you about plans, classes or a trial visit.</p>
        </Reveal>

        {done ? (
          <div className="border border-line bg-ink px-6 py-14 text-center" role="status">
            <p className="font-display text-4xl text-bone">Thanks, {form.name.trim().split(' ')[0]}.</p>
            <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-bone-dim">Your enquiry has been received. The team will call you on {form.phone.trim()}.</p>
            <p className="mx-auto mt-5 max-w-md font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-mute">
              {status === 'sent'
                ? 'Demo confirmation. This is a sample gym, so nobody will actually call.'
                : 'Demo confirmation. The demo server is offline, so this enquiry was not saved.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setForm({ name: '', phone: '', interest: INTERESTS[0], message: '' });
                setStatus('idle');
              }}
              className="mt-8 border border-bone/40 px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone"
            >
              Send another enquiry
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-7" noValidate>
            <div className="grid gap-7 sm:grid-cols-2">
              <label className="block">
                <span className="eyebrow mb-2 block">Name</span>
                <input name="name" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} className={`${INPUT} ${errors.name ? 'border-red' : 'border-line'}`} />
                {errors.name && <span className="mt-2 block text-sm text-red" role="alert">{errors.name}</span>}
              </label>
              <label className="block">
                <span className="eyebrow mb-2 block">Phone</span>
                <input name="phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} aria-invalid={!!errors.phone} className={`${INPUT} ${errors.phone ? 'border-red' : 'border-line'}`} />
                {errors.phone && <span className="mt-2 block text-sm text-red" role="alert">{errors.phone}</span>}
              </label>
            </div>

            <fieldset>
              <legend className="eyebrow mb-3">I am interested in</legend>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={form.interest === option}
                    onClick={() => setForm((f) => ({ ...f, interest: option }))}
                    className={`border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                      form.interest === option ? 'border-red bg-red text-bone' : 'border-line text-mute hover:text-bone'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="eyebrow mb-2 block">Message (optional)</span>
              <textarea name="message" rows={3} maxLength={400} value={form.message} onChange={set('message')} className={`${INPUT} resize-y border-line`} />
            </label>

            {failure && <p className="border border-red/60 px-4 py-3 text-sm text-bone" role="alert">{failure}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={status === 'sending'}
                data-cursor="SEND"
                className="bg-bone px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-red hover:text-bone disabled:cursor-wait disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending…' : 'Send Enquiry →'}
              </button>
              <button type="button" onClick={() => onAction('whatsapp')} className="inline-flex items-center gap-2 border border-bone/40 px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone">
                <MessageCircle size={15} aria-hidden /> Or WhatsApp us
              </button>
            </div>
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-mute">Demo form for a sample gym. Use made-up details rather than your own.</p>
          </form>
        )}
      </div>
    </section>
  );
}

// ---- Sticky contact bar on phones -----------------------------------------

export function MobileActions({ onAction }: { onAction: (action: DemoAction) => void }) {
  const item = 'flex flex-1 items-center justify-center gap-2 py-4 font-mono text-[11px] uppercase tracking-[0.16em]';
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-ink/95 backdrop-blur-md lg:hidden">
      <button type="button" onClick={() => onAction('call')} className={`${item} text-bone`}>
        <Phone size={15} aria-hidden /> Call
      </button>
      <button type="button" onClick={() => onAction('whatsapp')} className={`${item} border-x border-line text-bone`}>
        <MessageCircle size={15} aria-hidden /> WhatsApp
      </button>
      <button type="button" onClick={() => document.querySelector('#enquire')?.scrollIntoView({ behavior: 'smooth' })} className={`${item} bg-bone text-ink`}>
        Enquire
      </button>
    </div>
  );
}

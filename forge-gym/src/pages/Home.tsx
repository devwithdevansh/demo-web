import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Menu, Minus, Monitor, Smartphone, Tablet, X } from 'lucide-react';
import { ForgeMark } from '@/components/forge/DemoBar';
import { Reveal } from '@/components/ui/Reveal';
import { ADDONS, FEES_NOTE, PACKAGES, PRICING_NOTE, contactHref, inr, packageByKey } from '@/config/forge';
import type { PackageKey, Readiness } from '@/config/forge';
import { framePath } from '@/config/sampleGym';

const NAV = [
  { label: 'Packages', href: '#packages' },
  { label: 'Compare', href: '#compare' },
  { label: 'Any device', href: '#browser' },
  { label: 'Add-ons', href: '#addons' },
];

const WRAP = 'mx-auto max-w-[1280px] px-5 lg:px-10';
const CTA = 'inline-flex items-center justify-center gap-2 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors';
const CTA_SOLID = `${CTA} bg-bone text-ink hover:bg-red hover:text-bone`;
const CTA_LINE = `${CTA} border border-bone/40 text-bone hover:border-bone`;

// What each package covers, row by row. `true` means included.
const COMPARE: { label: string; has: Record<PackageKey, boolean> }[] = [
  { label: 'Gym website with plans, trainers, photos and timings', has: { essential: true, growth: true, performance: true } },
  { label: 'Enquiry form and WhatsApp button', has: { essential: true, growth: true, performance: true } },
  { label: 'Member records, plans and expiry dates', has: { essential: false, growth: true, performance: true } },
  { label: 'Front-desk and QR check-in', has: { essential: false, growth: true, performance: true } },
  { label: 'Payments, dues and renewal list', has: { essential: false, growth: true, performance: true } },
  { label: 'Enquiries with follow-up dates', has: { essential: false, growth: true, performance: true } },
  { label: 'Owner’s daily view and basic reports', has: { essential: false, growth: true, performance: true } },
  { label: 'Trainer login with assigned members and tasks', has: { essential: false, growth: false, performance: true } },
  { label: 'Member login with plan, timetable and progress', has: { essential: false, growth: false, performance: true } },
  { label: 'Workout plans, PT sessions and staff diet guidance', has: { essential: false, growth: false, performance: true } },
];

const READINESS_STYLE: Record<Readiness, string> = {
  'Available in demo': 'border-ok/50 text-ok',
  Preview: 'border-warn/50 text-warn',
  'Coming soon': 'border-line text-mute',
};

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open ? 'border-b border-line bg-ink/95 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className={`${WRAP} flex items-center justify-between py-4`}>
        <a href="#top" aria-label="FORGE home">
          <ForgeMark className="text-2xl" />
        </a>
        <nav aria-label="Page sections" className="hidden items-center gap-8 md:flex">
          {NAV.map((l) => (
            <a key={l.href} href={l.href} className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim transition-colors hover:text-bone">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={contactHref} className="hidden bg-bone px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-red hover:text-bone sm:block">
            Book a walkthrough
          </a>
          <button type="button" className="p-1 text-bone md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Page sections" className="border-t border-line bg-ink px-5 py-3 md:hidden">
          {NAV.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 font-display text-2xl tracking-wide text-bone">
              {l.label}
            </a>
          ))}
          <a href={contactHref} className="mt-2 block bg-bone px-5 py-3 text-center font-mono text-xs uppercase tracking-[0.16em] text-ink">
            Book a walkthrough
          </a>
        </nav>
      )}
    </header>
  );
}

/** A plain outline of a screen, used to show the same product on three devices. */
function Device({ icon: Icon, name, use, wide = false }: { icon: typeof Monitor; name: string; use: string; wide?: boolean }) {
  return (
    <div className="border border-line bg-ink-2 p-5">
      <div className={`mx-auto border border-line bg-ink p-2 ${wide ? 'aspect-[16/10] w-full' : 'aspect-[10/16] w-1/2'}`} aria-hidden>
        <div className="flex h-full flex-col gap-1.5">
          <div className="h-2 w-1/3 bg-red" />
          <div className="h-1.5 w-2/3 bg-line" />
          <div className="grid flex-1 grid-cols-2 gap-1.5 pt-1">
            <div className="bg-graphite" />
            <div className="bg-graphite" />
            <div className="col-span-2 bg-graphite" />
          </div>
        </div>
      </div>
      <p className="mt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-bone">
        <Icon size={14} aria-hidden /> {name}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-mute">{use}</p>
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    document.title = 'FORGE — Website, operations and coaching software for gyms';
  }, []);

  return (
    <div className="bg-ink text-bone">
      <Header />

      <main id="top">
        {/* ---- Hero ---- */}
        <section className="relative flex min-h-[92svh] items-end overflow-hidden">
          <img src={framePath(379)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/50" aria-hidden />
          <div className={`${WRAP} relative z-10 w-full pb-16 pt-36 lg:pb-24`}>
            <p className="eyebrow mb-6">Software for gym owners</p>
            <h1 className="font-display text-[17vw] leading-[0.86] text-bone sm:text-[12vw] lg:text-[8.2vw]">
              YOUR GYM, ONLINE
              <br />
              <span className="text-red">AND ORGANISED.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-bone-dim sm:text-lg">
              FORGE gives your gym a website people can find, one place for members, fees and attendance, and a simple way to connect trainers with members. Start
              with the part you need.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#packages" className={CTA_SOLID}>
                Explore the demos <ArrowRight size={15} aria-hidden />
              </a>
              <a href={contactHref} className={CTA_LINE}>
                Book a walkthrough
              </a>
            </div>
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Three live demos · a fictional sample gym · nothing to install</p>
          </div>
        </section>

        {/* ---- Packages ---- */}
        <section id="packages" className="scroll-mt-20 border-t border-line py-20 lg:py-28">
          <div className={WRAP}>
            <Reveal className="mb-12 max-w-2xl">
              <p className="eyebrow mb-4">Three packages</p>
              <h2 className="font-display text-5xl leading-[0.95] text-bone lg:text-6xl">Pick where to start.</h2>
              <p className="mt-4 text-base leading-relaxed text-mute">Each package builds on the one before it. Open a demo to try it with a sample gym and sample data.</p>
            </Reveal>

            <div className="grid gap-5 lg:grid-cols-3">
              {PACKAGES.map((p, i) => (
                <Reveal key={p.key} delay={i * 0.08} className="h-full">
                  <article className={`flex h-full flex-col border bg-ink-2 p-6 lg:p-8 ${p.key === 'growth' ? 'border-bone/50' : 'border-line'}`}>
                    <p className="font-mono text-xs text-mute">0{i + 1}</p>
                    <h3 className="mt-3 font-display text-6xl leading-none text-bone">{p.name}</h3>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-red">{p.line}</p>
                    <p className="mt-5 text-sm leading-relaxed text-bone-dim">
                      <span className="text-bone">{p.promise}.</span> {p.summary}
                    </p>
                    <ul className="mt-6 flex-1 space-y-2.5 border-t border-line pt-6">
                      {p.includes.map((item) => (
                        <li key={item} className="flex gap-2.5 text-sm leading-snug text-bone-dim">
                          <Check size={15} className="mt-0.5 shrink-0 text-bone" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7 border-t border-line pt-6">
                      <p className="font-display text-4xl leading-none text-bone">
                        {inr(p.pricePerMonth)}
                        <span className="font-mono text-xs text-mute"> / month</span>
                      </p>
                      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Proposed price</p>
                      <Link to={p.route} className={`${CTA_SOLID} mt-6 w-full`} aria-label={`Explore the ${p.name} demo`}>
                        Explore Demo <ArrowRight size={15} aria-hidden />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-xs leading-relaxed text-mute">{PRICING_NOTE}</p>
          </div>
        </section>

        {/* ---- Compare ---- */}
        <section id="compare" className="scroll-mt-20 border-t border-line bg-ink-2 py-20 lg:py-28">
          <div className={WRAP}>
            <Reveal className="mb-12 max-w-2xl">
              <p className="eyebrow mb-4">Which one suits your gym</p>
              <h2 className="font-display text-5xl leading-[0.95] text-bone lg:text-6xl">A simple comparison.</h2>
            </Reveal>

            <div className="mb-10 grid gap-4 md:grid-cols-3">
              {PACKAGES.map((p) => (
                <div key={p.key} className="border border-line bg-ink p-5">
                  <p className="font-display text-3xl leading-none text-bone">{p.name}</p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Suits</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-bone-dim">{p.suits}</p>
                </div>
              ))}
            </div>

            <div className="scroll-x border border-line bg-ink">
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">What each FORGE package includes</caption>
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="px-4 py-4 font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-mute sm:px-6">
                      What you get
                    </th>
                    {PACKAGES.map((p) => (
                      <th key={p.key} scope="col" className="w-28 px-3 py-4 text-center font-display text-xl font-normal tracking-wide text-bone sm:w-36">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr key={row.label} className="border-b border-line last:border-b-0">
                      <th scope="row" className="px-4 py-3.5 font-normal leading-snug text-bone-dim sm:px-6">
                        {row.label}
                      </th>
                      {PACKAGES.map((p) => (
                        <td key={p.key} className="px-3 py-3.5 text-center">
                          {row.has[p.key] ? (
                            <>
                              <Check size={17} className="mx-auto text-bone" aria-hidden />
                              <span className="sr-only">Included</span>
                            </>
                          ) : (
                            <>
                              <Minus size={17} className="mx-auto text-line" aria-hidden />
                              <span className="sr-only">Not included</span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---- Browser first ---- */}
        <section id="browser" className="scroll-mt-20 border-t border-line py-20 lg:py-28">
          <div className={`${WRAP} grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:items-center`}>
            <Reveal>
              <p className="eyebrow mb-4">Works in the browser</p>
              <h2 className="font-display text-5xl leading-[0.95] text-bone lg:text-6xl">
                No app to <span className="text-red">download.</span>
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-bone-dim">
                FORGE opens like any website. You, your staff and your members use it from a phone, tablet or computer, with nothing to install and no app store.
              </p>
              <ul className="mt-7 space-y-3 text-sm leading-relaxed text-bone-dim">
                {['Open a link and sign in. That is the whole setup.', 'The same screens adjust to a phone at the door or a computer at the desk.', 'Members get their plan and check-in pass from a link, not an install.'].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <Check size={15} className="mt-1 shrink-0 text-bone" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="grid gap-4 sm:grid-cols-3">
              <Device icon={Smartphone} name="Phone" use="The owner checks today's numbers. A member opens their plan and pass." />
              <Device icon={Tablet} name="Tablet" use="A trainer updates a workout and records a check-in on the gym floor." />
              <Device icon={Monitor} name="Computer" use="The front desk checks members in and records payments." wide />
            </Reveal>
          </div>
        </section>

        {/* ---- Add-ons ---- */}
        <section id="addons" className="scroll-mt-20 border-t border-line bg-ink-2 py-20 lg:py-28">
          <div className={WRAP}>
            <Reveal className="mb-12 max-w-2xl">
              <p className="eyebrow mb-4">Add-ons</p>
              <h2 className="font-display text-5xl leading-[0.95] text-bone lg:text-6xl">Add what you need, when you need it.</h2>
              <p className="mt-4 text-base leading-relaxed text-mute">Optional extras for WhatsApp, payments and trainers. Each one is labelled with how far along it is.</p>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ADDONS.map((a) => (
                <article key={a.key} className="flex flex-col border border-line bg-ink p-5">
                  <span className={`self-start border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${READINESS_STYLE[a.readiness]}`}>{a.readiness}</span>
                  <h3 className="mt-4 font-display text-3xl leading-none text-bone">{a.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-bone-dim">{a.does}</p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Extends {a.extends.map((k) => packageByKey(k).name).join(' and ')}</p>
                </article>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-xs leading-relaxed text-mute">
              In the demos, WhatsApp messages and UPI payments are simulated: nothing is sent and no money moves. {FEES_NOTE}
            </p>
          </div>
        </section>

        {/* ---- Contact ---- */}
        <section id="contact" className="scroll-mt-20 border-t border-line py-24 lg:py-32">
          <div className={`${WRAP} text-center`}>
            <Reveal>
              <p className="eyebrow mb-5">Next step</p>
              <h2 className="mx-auto max-w-4xl font-display text-6xl leading-[0.9] text-bone lg:text-8xl">
                See it with <span className="text-red">your gym's</span> details.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-bone-dim">
                Try the demos first, then book a short walkthrough. We will go through the package that fits and what it would look like with your plans, timings and
                branding.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <a href={contactHref} className={CTA_SOLID}>
                  Book a walkthrough <ArrowRight size={15} aria-hidden />
                </a>
                <a href="#packages" className={CTA_LINE}>
                  Explore the demos
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-10">
        <div className={`${WRAP} flex flex-col gap-6 md:flex-row md:items-end md:justify-between`}>
          <div>
            <ForgeMark className="text-3xl" />
            <p className="mt-3 max-w-md text-xs leading-relaxed text-mute">
              The demos use a fictional gym, Ironpeak Fitness. All members, payments and figures in them are sample data, and prices shown are proposals.
            </p>
          </div>
          <nav aria-label="Demos" className="flex flex-wrap gap-x-6 gap-y-2">
            {PACKAGES.map((p) => (
              <Link key={p.key} to={p.route} className="font-mono text-[11px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone">
                {p.name} demo
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}

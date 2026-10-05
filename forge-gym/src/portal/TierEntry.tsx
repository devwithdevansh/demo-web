import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DemoBar } from '@/components/forge/DemoBar';
import { packageByKey } from '@/config/forge';
import type { Role, Tier } from '@/lib/api';

interface RoleCard {
  role: Role;
  title: string;
  person: string;
  sees: string;
}

const ROLES: Record<Tier, RoleCard[]> = {
  growth: [
    { role: 'owner', title: 'Owner', person: 'Rhea Kapoor', sees: 'The full picture: today’s activity, members, fees, renewals, enquiries, team, plans and reports.' },
    { role: 'staff', title: 'Front desk', person: 'Imran Shaikh', sees: 'Day-to-day work: check-ins, members, payments, renewals and enquiries. No revenue reports or plan changes.' },
  ],
  performance: [
    { role: 'owner', title: 'Owner', person: 'Rhea Kapoor', sees: 'Everything in Growth, plus trainer assignments, member categories, PT packs, the timetable and notices.' },
    { role: 'trainer', title: 'Trainer', person: 'Alex Rey', sees: 'Only their own members: today’s tasks, workout plans, check-ins, measurements and PT sessions.' },
    { role: 'member', title: 'Member', person: 'Aarav Shah', sees: 'Only their own membership: plan status, workout, progress history, timetable, diet guide and check-in pass.' },
    { role: 'staff', title: 'Front desk', person: 'Imran Shaikh', sees: 'Check-ins, members, payments, renewals, enquiries and notices.' },
  ],
};

const TRY: Record<Tier, string[]> = {
  growth: [
    'Add a member and take part of their fee. The dues total on Today goes up.',
    'Check a member in by their QR pass, then undo it.',
    'Record a payment against someone with dues and watch the list shrink.',
    'Renew a lapsed membership from the Renewals list.',
    'Send an enquiry from the sample gym website, then find it under Leads.',
  ],
  performance: [
    'As the trainer, change Aarav’s workout plan. Switch to the member view and open Workout.',
    'As the trainer, record a check-in and a weight. They appear in the member’s Progress.',
    'Log a PT session and see the pack count go down for both trainer and member.',
    'As the owner, move a member to a different trainer under Coaching.',
    'As the member, approve Autopay, then pause or cancel it.',
  ],
};

/** /demo/growth and /demo/performance: pick a role to enter the portal as. */
export default function TierEntry({ tier }: { tier: Tier }) {
  const pkg = packageByKey(tier);
  return (
    <div className="min-h-svh bg-ink text-bone">
      <DemoBar current={tier} />
      <main className="mx-auto max-w-[1100px] px-4 py-10 sm:py-14 lg:px-8">
        <p className="eyebrow mb-4">
          {pkg.name} demo · {pkg.promise}
        </p>
        <h1 className="font-display text-6xl leading-[0.9] text-bone sm:text-7xl">
          {pkg.line.split(' ').slice(0, -1).join(' ')} <span className="text-red">{pkg.line.split(' ').slice(-1)}.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-bone-dim">
          {pkg.summary} Choose who to enter as. Each role sees a different part of the same sample gym, so a change made in one view shows up in the others.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {ROLES[tier].map((r) => (
            <Link
              key={r.role}
              to={`/demo/${tier}/${r.role}`}
              className="group flex flex-col border border-line bg-ink-2 p-5 transition-colors hover:border-bone sm:p-6"
              aria-label={`Enter the ${pkg.name} demo as ${r.title}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">Sample account · {r.person}</p>
              <h2 className="mt-3 font-display text-4xl leading-none text-bone">{r.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-bone-dim">{r.sees}</p>
              <span className="mt-5 inline-flex items-center gap-2 self-start bg-bone px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors group-hover:bg-red group-hover:text-bone">
                Enter as {r.title} <ArrowRight size={14} aria-hidden />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <section className="border border-line p-5 sm:p-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone">Things to try</h2>
            <ol className="mt-4 space-y-3">
              {TRY[tier].map((item, i) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-bone-dim">
                  <span className="font-mono text-xs text-mute">{String(i + 1).padStart(2, '0')}</span>
                  {item}
                </li>
              ))}
            </ol>
          </section>

          <section className="border border-line p-5 sm:p-6">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone">About this demo</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-bone-dim">
              <li>Ironpeak Fitness is a made-up gym. Every member, number and payment is sample data.</li>
              <li>You get your own private copy. What you change is saved for you and is not visible to anyone else.</li>
              <li>"Reset demo data" inside the demo puts everything back to the start.</li>
              <li>WhatsApp messages and UPI payments are simulated. Nothing is sent and no money moves.</li>
            </ul>
            {tier === 'growth' ? (
              <Link to="/demo/essential" className="mt-5 inline-flex font-mono text-[10px] uppercase tracking-[0.14em] text-bone underline decoration-line underline-offset-4 hover:decoration-bone">
                Open the sample gym website
              </Link>
            ) : (
              <Link to="/demo/growth" className="mt-5 inline-flex font-mono text-[10px] uppercase tracking-[0.14em] text-bone underline decoration-line underline-offset-4 hover:decoration-bone">
                See the Growth demo on its own
              </Link>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

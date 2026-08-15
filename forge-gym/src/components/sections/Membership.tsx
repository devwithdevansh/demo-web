import { Reveal } from '@/components/ui/Reveal';

const PLANS = [
  {
    name: 'Basic',
    monthly: '₹1,499',
    yearly: '₹14,990',
    features: ['Gym floor access', 'Standard equipment', 'Locker access'],
    highlight: false,
  },
  {
    name: 'Pro',
    monthly: '₹2,999',
    yearly: '₹29,990',
    features: ['Everything in Basic', 'All group classes', 'Recovery zone access'],
    highlight: false,
  },
  {
    name: 'Elite',
    monthly: '₹5,499',
    yearly: '₹54,990',
    features: ['Everything in Pro', 'Dedicated trainer access', 'Priority booking', 'Monthly progress review'],
    highlight: true,
  },
];

export function Membership() {
  return (
    <section id="membership" data-phase="PEAK" className="relative bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-16">
          <p className="eyebrow mb-4">Membership</p>
          <h2 className="font-display text-5xl text-bone lg:text-6xl">Choose Your Level.</h2>
        </Reveal>

        <div className="relative">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className="sticky border-t border-line bg-ink py-10 lg:py-14"
              style={{ top: `${72 + i * 28}px`, zIndex: i + 1 }}
            >
              <div
                className={`grid gap-8 border-b pb-10 lg:grid-cols-[1fr_1fr_1.2fr] lg:items-end lg:gap-12 ${
                  plan.highlight ? 'border-red' : 'border-line'
                }`}
              >
                <div>
                  <span className="font-mono text-xs text-mute">0{i + 1}</span>
                  <h3 className={`mt-2 font-display text-6xl lg:text-7xl ${plan.highlight ? 'text-red' : 'text-bone'}`}>
                    {plan.name}
                  </h3>
                </div>

                <div>
                  <p className="font-display text-4xl text-bone">{plan.monthly}<span className="font-mono text-sm text-mute"> / mo</span></p>
                  <p className="mt-1 font-mono text-xs text-mute">{plan.yearly} billed yearly</p>
                </div>

                <div className="flex flex-col gap-4">
                  <ul className="flex flex-col gap-2">
                    {plan.features.map((f) => (
                      <li key={f} className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone-dim">
                        — {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => document.querySelector('#tour')?.scrollIntoView({ behavior: 'smooth' })}
                    data-cursor="START"
                    className={`self-start px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] transition-colors ${
                      plan.highlight
                        ? 'bg-red text-bone hover:bg-bone hover:text-ink'
                        : 'bg-bone text-ink hover:bg-red hover:text-bone'
                    }`}
                  >
                    Join Now →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

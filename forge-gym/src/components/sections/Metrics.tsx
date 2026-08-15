import { useCountUp } from '@/hooks/useCountUp';
import { Reveal } from '@/components/ui/Reveal';

const STATS = [
  { target: 5000, suffix: '+', label: 'Workouts Logged' },
  { target: 120, suffix: '+', label: 'Active Members' },
  { target: 15, suffix: '+', label: 'Trainers' },
  { target: 7, suffix: ' DAYS', label: 'Open Weekly' },
];

function Stat({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { ref, value } = useCountUp(target);
  return (
    <div ref={ref} className="border-t border-line py-8 lg:border-t-0 lg:py-0">
      <p className="font-display text-6xl text-bone lg:text-7xl">
        {value.toLocaleString()}
        <span className="text-red">{suffix}</span>
      </p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mute">{label}</p>
    </div>
  );
}

export function Metrics() {
  return (
    <section data-phase="PEAK" className="relative bg-ink-2 py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-14">
          <p className="eyebrow mb-4">By The Numbers</p>
          <h2 className="font-display text-4xl text-bone lg:text-5xl">Consistency, Measured.</h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-line">
          {STATS.map((s, i) => (
            <div key={s.label} className={i > 0 ? 'lg:pl-8' : ''}>
              <Stat {...s} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const SCHEDULE: Record<string, { time: string; name: string; coach: string }[]> = {
  MON: [
    { time: '06:00', name: 'Strength', coach: 'Alex Rey' },
    { time: '07:30', name: 'HIIT', coach: 'Priya Nair' },
    { time: '18:00', name: 'Boxing', coach: 'Rahul Mehta' },
  ],
  TUE: [
    { time: '06:30', name: 'Mobility', coach: 'Sara Kade' },
    { time: '18:00', name: 'CrossFit', coach: 'Rahul Mehta' },
    { time: '19:30', name: 'Yoga', coach: 'Sara Kade' },
  ],
  WED: [
    { time: '06:00', name: 'Strength', coach: 'Alex Rey' },
    { time: '18:00', name: 'HIIT', coach: 'Priya Nair' },
  ],
  THU: [
    { time: '06:30', name: 'Boxing', coach: 'Rahul Mehta' },
    { time: '18:00', name: 'CrossFit', coach: 'Rahul Mehta' },
    { time: '19:30', name: 'Mobility', coach: 'Sara Kade' },
  ],
  FRI: [
    { time: '06:00', name: 'Strength', coach: 'Alex Rey' },
    { time: '07:30', name: 'HIIT', coach: 'Priya Nair' },
    { time: '18:00', name: 'Yoga', coach: 'Sara Kade' },
  ],
  SAT: [
    { time: '08:00', name: 'CrossFit', coach: 'Rahul Mehta' },
    { time: '09:30', name: 'Boxing', coach: 'Rahul Mehta' },
  ],
  SUN: [{ time: '09:00', name: 'Mobility', coach: 'Sara Kade' }],
};

export function Classes() {
  const [day, setDay] = useState('MON');

  return (
    <section id="classes" data-phase="PEAK" className="relative scroll-mt-24 bg-ink-2 py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-12">
          <p className="eyebrow mb-4">Weekly Schedule</p>
          <h2 className="font-display text-5xl text-bone lg:text-6xl">Classes</h2>
        </Reveal>

        <div className="scroll-x mb-10 flex gap-2" role="tablist" aria-label="Day of the week">
          {DAYS.map((d) => (
            <button
              key={d}
              role="tab"
              aria-selected={day === d}
              onClick={() => setDay(d)}
              className={`shrink-0 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors ${
                day === d ? 'bg-bone text-ink' : 'border border-line text-mute hover:text-bone'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex max-w-4xl flex-col divide-y divide-line border-y border-line">
          {SCHEDULE[day].map((c) => (
            <div key={c.time + c.name} className="grid grid-cols-[4.5rem_1fr] items-baseline gap-x-4 gap-y-1 py-6 sm:grid-cols-[6rem_1fr_auto]">
              <span className="font-mono text-sm text-mute">{c.time}</span>
              <span className="font-display text-3xl text-bone lg:text-4xl">{c.name}</span>
              <span className="col-start-2 font-mono text-[10px] uppercase tracking-[0.15em] text-mute sm:col-start-3">
                45 min · {c.coach}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

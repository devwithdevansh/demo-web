import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Img } from '@/components/ui/Img';
import { images } from '@/lib/images';
import { Reveal } from '@/components/ui/Reveal';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

type ClassKey = keyof typeof images.classes;

const SCHEDULE: Record<string, { time: string; name: string; key: ClassKey }[]> = {
  MON: [
    { time: '06:00', name: 'Strength', key: 'strength' },
    { time: '07:30', name: 'HIIT', key: 'hiit' },
    { time: '18:00', name: 'Boxing', key: 'boxing' },
  ],
  TUE: [
    { time: '06:30', name: 'Mobility', key: 'mobility' },
    { time: '18:00', name: 'CrossFit', key: 'crossfit' },
    { time: '19:30', name: 'Yoga', key: 'yoga' },
  ],
  WED: [
    { time: '06:00', name: 'Strength', key: 'strength' },
    { time: '18:00', name: 'HIIT', key: 'hiit' },
  ],
  THU: [
    { time: '06:30', name: 'Boxing', key: 'boxing' },
    { time: '18:00', name: 'CrossFit', key: 'crossfit' },
    { time: '19:30', name: 'Mobility', key: 'mobility' },
  ],
  FRI: [
    { time: '06:00', name: 'Strength', key: 'strength' },
    { time: '07:30', name: 'HIIT', key: 'hiit' },
    { time: '18:00', name: 'Yoga', key: 'yoga' },
  ],
  SAT: [
    { time: '08:00', name: 'CrossFit', key: 'crossfit' },
    { time: '09:30', name: 'Boxing', key: 'boxing' },
  ],
  SUN: [{ time: '09:00', name: 'Mobility', key: 'mobility' }],
};

export function Classes() {
  const [day, setDay] = useState('MON');
  const [hoverKey, setHoverKey] = useState<ClassKey | null>(null);

  return (
    <section id="classes" data-phase="PEAK" className="relative bg-ink-2 py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-12">
          <p className="eyebrow mb-4">Weekly Schedule</p>
          <h2 className="font-display text-5xl text-bone lg:text-6xl">Classes</h2>
        </Reveal>

        <div className="mb-10 flex gap-2 overflow-x-auto">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`shrink-0 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors ${
                day === d ? 'bg-bone text-ink' : 'border border-line text-mute hover:text-bone'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col divide-y divide-line border-t border-line">
            {SCHEDULE[day].map((c) => (
              <div
                key={c.time + c.name}
                onMouseEnter={() => setHoverKey(c.key)}
                onMouseLeave={() => setHoverKey(null)}
                className="flex items-center justify-between py-6 transition-colors hover:text-bone"
              >
                <span className="font-mono text-sm text-mute">{c.time}</span>
                <span className="font-display text-3xl text-bone lg:text-4xl">{c.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-mute">45 min</span>
              </div>
            ))}
          </div>

          <div className="relative hidden h-72 overflow-hidden lg:block">
            <AnimatePresence>
              {hoverKey && (
                <motion.div
                  key={hoverKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Img src={images.classes[hoverKey]} alt={hoverKey} className="h-full w-full object-cover" />
                </motion.div>
              )}
            </AnimatePresence>
            {!hoverKey && (
              <div className="flex h-full w-full items-center justify-center border border-line">
                <span className="eyebrow">Hover a class</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Img } from '@/components/ui/Img';
import { images } from '@/lib/images';
import { Reveal } from '@/components/ui/Reveal';

const PROGRAMS = [
  { n: '01', name: 'Strength', copy: 'Build power. Build control.', level: 'Beginner → Advanced', img: images.programs.strength },
  { n: '02', name: 'Hypertrophy', copy: 'Add size with structured volume.', level: 'Intermediate → Advanced', img: images.programs.hypertrophy },
  { n: '03', name: 'Fat Loss', copy: 'Conditioning that keeps the muscle.', level: 'All levels', img: images.programs.fatLoss },
  { n: '04', name: 'Functional Training', copy: 'Move better under real load.', level: 'All levels', img: images.programs.functional },
  { n: '05', name: 'CrossFit', copy: 'Varied, high-intensity, measured.', level: 'Intermediate → Advanced', img: images.programs.crossfit },
  { n: '06', name: 'Boxing', copy: 'Technique, footwork, output.', level: 'All levels', img: images.programs.boxing },
  { n: '07', name: 'Personal Training', copy: 'One coach. Your program.', level: 'All levels', img: images.programs.personal },
];

export function Programs() {
  const [active, setActive] = useState(0);

  return (
    <section id="programs" data-phase="BUILD" className="relative bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-14 flex items-end justify-between">
          <h2 className="font-display text-5xl text-bone lg:text-6xl">Training Programs</h2>
          <span className="eyebrow hidden lg:block">01 — 07</span>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="border-t border-line">
            {PROGRAMS.map((p, i) => (
              <button
                key={p.n}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                data-cursor="EXPLORE"
                className={`group flex w-full items-baseline gap-6 border-b border-line py-6 text-left transition-colors ${
                  active === i ? 'text-bone' : 'text-mute'
                }`}
              >
                <span className="font-mono text-sm">{p.n}</span>
                <span className="font-display text-3xl transition-all duration-300 lg:text-4xl group-hover:translate-x-2 group-hover:text-bone">
                  {p.name}
                </span>
                {active === i && (
                  <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.2em] text-red lg:block">
                    {p.level}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative hidden h-[560px] overflow-hidden lg:sticky lg:top-28 lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Img src={PROGRAMS[active].img} alt={PROGRAMS[active].name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-red">{PROGRAMS[active].n}</p>
                  <p className="mt-2 font-display text-3xl text-bone">{PROGRAMS[active].copy}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* mobile: static image under the active row */}
          <div className="relative h-72 overflow-hidden lg:hidden">
            <Img src={PROGRAMS[active].img} alt={PROGRAMS[active].name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="font-display text-2xl text-bone">{PROGRAMS[active].copy}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

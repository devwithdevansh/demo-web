import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const TESTIMONIALS = [
  { quote: 'The gym changed how I train. I stopped chasing soreness and started chasing progress.', name: 'Devansh P.', tag: 'Strength Program · 14 months' },
  { quote: 'I walked in for weight loss and walked out stronger than I ever expected to be.', name: 'Mitra J.', tag: 'Fat Loss Program · 8 months' },
  { quote: "My coach doesn't just count reps — he watches everything. That's the difference.", name: 'Kavya S.', tag: 'Personal Training · 6 months' },
];

export function Testimonial() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const id = setInterval(() => setI((v) => (v + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section data-phase="COOL DOWN" className="relative bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-display text-3xl leading-tight text-bone lg:text-5xl">
              &ldquo;{TESTIMONIALS[i].quote}&rdquo;
            </p>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-red">{TESTIMONIALS[i].name}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">{TESTIMONIALS[i].tag}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex justify-center gap-2">
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Show testimonial ${idx + 1}`}
              className={`h-1 w-8 transition-colors ${idx === i ? 'bg-red' : 'bg-line'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

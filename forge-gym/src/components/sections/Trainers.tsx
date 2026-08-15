import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Img } from '@/components/ui/Img';
import { images } from '@/lib/images';
import { Reveal } from '@/components/ui/Reveal';

export function Trainers() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <section id="trainers" data-phase="PUSH" className="relative bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-14">
          <p className="eyebrow mb-4">The Coaching Staff</p>
          <h2 className="font-display text-5xl text-bone lg:text-6xl">Trainers</h2>
        </Reveal>

        {/* desktop: cursor-follow preview */}
        <div
          ref={containerRef}
          onMouseMove={onMove}
          onMouseLeave={() => setHovered(null)}
          className="relative hidden border-t border-line lg:block"
        >
          {images.trainers.map((t, i) => (
            <div
              key={t.name}
              onMouseEnter={() => setHovered(i)}
              data-cursor="TRAIN"
              className={`group flex cursor-pointer items-center justify-between border-b border-line py-8 transition-colors ${
                hovered === i ? 'text-bone' : 'text-mute'
              }`}
            >
              <span className="font-display text-5xl transition-transform duration-300 group-hover:translate-x-3">
                {t.name}
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.2em]">{t.role}</span>
            </div>
          ))}

          <AnimatePresence>
            {hovered !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-none absolute z-10 h-64 w-48 overflow-hidden"
                style={{ left: pos.x + 24, top: pos.y - 128 }}
              >
                <Img src={images.trainers[hovered].img} alt={images.trainers[hovered].name} className="h-full w-full object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* mobile: card grid */}
        <div className="grid grid-cols-2 gap-4 lg:hidden">
          {images.trainers.map((t) => (
            <div key={t.name} className="relative aspect-[3/4] overflow-hidden">
              <Img src={t.img} alt={t.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="font-display text-xl text-bone">{t.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mute">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

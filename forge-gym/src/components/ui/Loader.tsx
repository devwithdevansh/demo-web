import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Loader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setVisible(false);
      onDone();
      return;
    }

    const start = performance.now();
    const durationMs = 1200;
    let raf: number;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      setProgress(Math.round(p * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setVisible(false), 220);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-ink"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <div className="font-display text-4xl tracking-wider text-bone">FORGE</div>
          <div className="mt-6 font-mono text-xs tracking-[0.3em] text-mute">PREPARE TO TRAIN</div>
          <div className="mt-4 font-mono text-2xl text-red">{String(progress).padStart(2, '0')}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

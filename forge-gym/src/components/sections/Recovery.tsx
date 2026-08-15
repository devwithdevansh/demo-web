import { motion } from 'framer-motion';
import { Img } from '@/components/ui/Img';
import { images } from '@/lib/images';

export function Recovery() {
  return (
    <section data-phase="COOL DOWN" className="relative h-[80vh] min-h-[520px] overflow-hidden bg-ink">
      <Img src={images.recovery} alt="Athlete stretching in the recovery area" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-ink/55" />

      <div className="relative z-10 flex h-full flex-col items-start justify-center px-6 lg:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="eyebrow mb-6"
        >
          Recovery
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.4, delay: 0.15, ease: 'easeOut' }}
          className="max-w-2xl font-display text-5xl leading-[0.95] text-bone lg:text-7xl"
        >
          TRAIN HARD.<br />RECOVER SMART.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.4, delay: 0.3 }}
          className="mt-6 max-w-md font-body text-sm leading-relaxed text-bone-dim"
        >
          Guided mobility, stretch sessions and a dedicated recovery area — because
          progress happens between workouts too.
        </motion.p>
      </div>
    </section>
  );
}

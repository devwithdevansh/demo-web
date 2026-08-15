import { motion } from 'framer-motion';

const PHRASES = [
  { text: 'SHOW UP.', align: 'text-left' },
  { text: 'DO THE WORK.', align: 'text-center' },
  { text: 'NO SHORTCUTS.', align: 'text-right' },
  { text: 'EARN IT.', align: 'text-center' },
];

export function Motivation() {
  return (
    <section data-phase="PEAK" className="relative bg-ink py-20 lg:py-28">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 lg:px-12">
        {PHRASES.map((p, i) => (
          <motion.p
            key={p.text}
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`font-display text-[13vw] leading-[0.92] text-bone lg:text-[6.5vw] ${p.align}`}
          >
            {p.text}
          </motion.p>
        ))}
      </div>
    </section>
  );
}

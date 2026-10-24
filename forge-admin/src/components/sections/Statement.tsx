import { motion } from 'framer-motion';

export function Statement() {
  return (
    <section data-phase="DRIVE" className="relative bg-ink py-32 lg:py-44">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9 }}
          className="font-display text-[10vw] leading-[0.95] text-mute lg:text-[5.5vw]"
        >
          YOU DON'T NEED MOTIVATION.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[10vw] leading-[0.95] text-bone lg:text-[5.5vw]"
        >
          YOU NEED <span className="text-red">DISCIPLINE.</span>
        </motion.p>
      </div>

      <div className="mt-20 overflow-hidden border-y border-line py-6">
        <div className="marquee flex whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, groupIdx) => (
            <div key={groupIdx} className="flex shrink-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className="stroke-text font-display mx-6 text-[9vw] leading-none lg:text-[6vw]"
                >
                  DISCIPLINE
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .marquee {
          width: max-content;
          animation: marquee-scroll 32s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee { animation: none; }
        }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

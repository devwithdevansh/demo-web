import { Reveal } from '@/components/ui/Reveal';
import { initials, sampleGym } from '@/config/sampleGym';

export function Trainers() {
  return (
    <section id="trainers" data-phase="PUSH" className="relative scroll-mt-24 bg-ink-2 py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-14">
          <p className="eyebrow mb-4">The Coaching Staff</p>
          <h2 className="font-display text-5xl text-bone lg:text-6xl">Trainers</h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {sampleGym.trainers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <article data-cursor="TRAIN" className="group flex h-full flex-col border border-line bg-ink transition-colors hover:border-bone/60">
                {/* Monogram tile: a real gym's trainer photo goes here. */}
                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-graphite via-ink-2 to-ink">
                  <span className="font-display text-[28vw] leading-none text-line transition-colors duration-300 group-hover:text-red lg:text-[9vw]" aria-hidden>
                    {initials(t.name)}
                  </span>
                  <span className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.18em] text-mute">Photo placeholder</span>
                </div>
                <div className="flex flex-1 flex-col p-4 lg:p-5">
                  <h3 className="font-display text-2xl leading-none text-bone lg:text-3xl">{t.name}</h3>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-red">{t.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-mute">{t.focus}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

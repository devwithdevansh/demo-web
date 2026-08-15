import { Img } from '@/components/ui/Img';
import { images } from '@/lib/images';
import { Reveal } from '@/components/ui/Reveal';

export function Journal() {
  return (
    <section id="journal" data-phase="COOL DOWN" className="relative bg-ink-2 py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-14 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-4">Journal</p>
            <h2 className="font-display text-5xl text-bone lg:text-6xl">Notes On Training.</h2>
          </div>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {images.journal.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.05}>
              <a href="#" data-cursor="VIEW" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Img
                    src={a.img}
                    alt={a.title}
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <p className="mt-4 font-display text-xl leading-tight text-bone">{a.title}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

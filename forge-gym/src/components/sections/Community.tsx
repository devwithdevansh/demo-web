import { Img } from '@/components/ui/Img';
import { images } from '@/lib/images';
import { Reveal } from '@/components/ui/Reveal';

export function Community() {
  return (
    <section data-phase="PEAK" className="relative bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow mb-4">Community</p>
            <h2 className="font-display text-5xl leading-[0.9] text-bone lg:text-6xl">
              TRAIN <span className="text-red">TOGETHER.</span>
            </h2>
            <p className="mt-6 max-w-xs font-body text-sm leading-relaxed text-mute">
              No one levels up alone. Group sessions, shared goals, coaches who know your name.
            </p>
          </Reveal>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {images.community.map((src, i) => (
              <div key={i} className="h-[420px] w-[300px] shrink-0 overflow-hidden lg:h-[520px] lg:w-[360px]">
                <Img src={src} alt="Members training together" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

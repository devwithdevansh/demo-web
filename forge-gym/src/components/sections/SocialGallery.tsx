import { Img } from '@/components/ui/Img';
import { images } from '@/lib/images';
import { Reveal } from '@/components/ui/Reveal';

const SPANS = [
  'lg:col-span-2 lg:row-span-2',
  'lg:col-span-1 lg:row-span-1',
  'lg:col-span-1 lg:row-span-1',
  'lg:col-span-1 lg:row-span-2',
  'lg:col-span-1 lg:row-span-1',
  'lg:col-span-1 lg:row-span-1',
];

export function SocialGallery() {
  return (
    <section data-phase="COOL DOWN" className="relative bg-ink-2 py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-12 flex items-end justify-between">
          <h2 className="font-display text-4xl text-bone lg:text-5xl">Gym Culture</h2>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-mute">@forge.club</span>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 lg:auto-rows-[180px] lg:grid-cols-4">
          {images.social.map((src, i) => (
            <div key={i} className={`relative overflow-hidden ${SPANS[i] ?? ''} aspect-square lg:aspect-auto`}>
              <Img src={src} alt="Community moment" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

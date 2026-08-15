import { Img } from '@/components/ui/Img';
import { images } from '@/lib/images';
import { Reveal } from '@/components/ui/Reveal';

const EQUIPMENT = [
  { n: '01', name: 'Power Racks', tag: 'Olympic Platform', detail: 'Commercial grade', img: images.equipment.powerRacks },
  { n: '02', name: 'Free Weights', tag: 'Dumbbells & Barbells', detail: 'Up to 60kg', img: images.equipment.freeWeights },
  { n: '03', name: 'Cable Machines', tag: 'Dual Adjustable Pulley', detail: 'Full range of motion', img: images.equipment.cable },
  { n: '04', name: 'Cardio', tag: 'Treadmills & Bikes', detail: 'Performance tracked', img: images.equipment.cardio },
  { n: '05', name: 'Functional Area', tag: 'Rigs, Ropes, Sleds', detail: 'Open floor space', img: images.equipment.functional },
  { n: '06', name: 'Recovery', tag: 'Mobility & Stretch', detail: 'Guided sessions', img: images.equipment.recovery },
];

export function Equipment() {
  return (
    <section data-phase="BUILD" className="relative bg-ink-2 py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <Reveal className="mb-16">
          <p className="eyebrow mb-4">Equipment</p>
          <h2 className="font-display text-5xl text-bone lg:text-6xl">Built For Serious Work.</h2>
        </Reveal>

        <div className="flex flex-col divide-y divide-line border-t border-line">
          {EQUIPMENT.map((e, i) => (
            <Reveal key={e.n} delay={i * 0.04}>
              <div className="grid items-center gap-6 py-8 lg:grid-cols-[100px_1fr_320px] lg:gap-10">
                <span className="font-mono text-2xl text-red">{e.n}</span>
                <div>
                  <h3 className="font-display text-3xl text-bone lg:text-4xl">{e.name}</h3>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
                    {e.tag} &middot; {e.detail}
                  </p>
                </div>
                <div className="relative h-40 w-full overflow-hidden lg:h-44">
                  <Img src={e.img} alt={e.name} className="h-full w-full object-cover grayscale transition-all duration-500 hover:grayscale-0" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

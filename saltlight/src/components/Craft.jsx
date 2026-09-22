import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { crafts, media } from '../content';
import { Img, Video } from './Media';

export default function Craft() {
  const root = useRef(null);
  const [active, setActive] = useState(0);

  useGSAP(() => {
    gsap.utils.toArray('.craft-row').forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el, start: 'top 55%', end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(i),
      });
    });
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.craft-band', { clipPath: 'inset(18% 12% 18% 12%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
        scrollTrigger: { trigger: '.craft-band', start: 'top 90%', end: 'top 20%', scrub: true },
      });
    });
  }, { scope: root });

  return (
    <section ref={root} className="pb-[clamp(96px,16vh,180px)]">
      <div className="craft-band relative h-[70svh] min-h-[420px] overflow-hidden">
        <Video file={media.craftVideo} poster={media.craftLantern} />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,20,48,.7),transparent_60%)]" />
        <h2 className="serif d2 absolute bottom-0 wrap pb-10 m-0 max-w-[16ch] text-[#e9ecea]">Made ten minutes down the road</h2>
      </div>

      <div className="wrap mt-16 md:mt-24 grid md:grid-cols-2 gap-10 md:gap-[6vw]">
        <div className="hidden md:block">
          <div className="sticky top-[14vh] h-[72vh] rounded-[3px] overflow-hidden">
            {crafts.map((c, i) => (
              <div key={c.village} className="absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
                style={{ opacity: active === i ? 1 : 0, transform: active === i ? 'scale(1)' : 'scale(1.06)' }}>
                <Img m={c.image} alt={`${c.craft} in ${c.village}`} className="absolute inset-0" />
              </div>
            ))}
          </div>
        </div>

        <div>
          {crafts.map((c, i) => (
            <div key={c.village} className="craft-row md:min-h-[72vh] flex flex-col justify-center py-8 md:py-0">
              <Img m={c.image} alt={`${c.craft} in ${c.village}`} className="md:hidden h-[64vw] rounded-[3px] mb-6" />
              <p className="m-0 muted">{c.village}</p>
              <h3 className="serif d3 mt-2 mb-5" style={{ opacity: active === i ? 1 : 0.9 }}>{c.craft}</h3>
              <p className="m-0 max-w-[40ch] muted">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

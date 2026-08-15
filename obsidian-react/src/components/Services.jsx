import { useState, useRef, useEffect } from 'react';

const servicesList = [
  { num: '01', title: 'Detailing', desc: 'Hand wash, decontamination and interior recondition to a showroom standard.', img: 'https://images.unsplash.com/photo-1762933855598-273a51b47649?w=900&q=80&auto=format&fit=crop' },
  { num: '02', title: 'Paint Correction', desc: 'Multi-stage machine polishing to remove swirls, oxidation and haze.', img: 'https://images.unsplash.com/photo-1621712151262-60bd142ba19f?w=900&q=80&auto=format&fit=crop' },
  { num: '03', title: 'Ceramic Coating', desc: 'Multi-year SiO2 protection with hydrophobic gloss that resists the elements.', img: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=900&q=80&auto=format&fit=crop' },
  { num: '04', title: 'PPF', desc: 'Self-healing film protects against stone chips, abrasion and UV fade.', img: 'https://images.unsplash.com/photo-1640342980686-b709f2f68d84?w=900&q=80&auto=format&fit=crop' },
  { num: '05', title: 'Vinyl Wrap', desc: 'Colour change and satin finishes, cut and wrapped panel by panel.', img: 'https://images.unsplash.com/photo-1722753960458-7a476665feb3?w=900&q=80&auto=format&fit=crop' },
  { num: '06', title: 'Window Tint', desc: 'Ceramic film tint for heat rejection, glare control and privacy.', img: 'https://images.unsplash.com/photo-1601278840447-9af5ac4ed157?w=900&q=80&auto=format&fit=crop' },
  { num: '07', title: 'Wheels', desc: 'Refinishing, ceramic coating and forged upgrades to spec.', img: 'https://images.unsplash.com/photo-1623564493214-6137dff043ad?w=900&q=80&auto=format&fit=crop' },
  { num: '08', title: 'Modification', desc: 'Suspension, aero and styling builds planned around your spec.', img: 'https://images.unsplash.com/photo-1570980404730-a0e14fef178f?w=900&q=80&auto=format&fit=crop' },
];

export default function Services() {
  const [hoverImage, setHoverImage] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const previewRef = useRef(null);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;

    const onMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <section id="services" className="bg-[var(--ink)] py-[min(18vh,180px)]">
      <div className="w-full max-w-[var(--container)] mx-auto px-[var(--edge)]">
        <div className="flex justify-between items-end gap-[40px] flex-wrap mb-[64px]">
          <h2 className="text-[clamp(32px,5vw,64px)] font-semibold uppercase leading-[1.02] tracking-[-0.01em]">
            What We Do.
          </h2>
          <p className="max-w-[46ch] text-[var(--paper-dim)] text-[17px] leading-[1.6]">
            Eight disciplines, one standard. Every service is performed to a written specification — not a guess.
          </p>
        </div>
      </div>
      
      <div className="w-full max-w-[var(--container)] mx-auto px-[var(--edge)]">
        <div className="border-t border-[var(--line)]">
          {servicesList.map((service, i) => (
            <div 
              key={i}
              className="relative border-b border-[var(--line)] py-[26px] grid grid-cols-[70px_1fr_auto] items-center gap-[24px] cursor-pointer transition-all duration-400 ease-[var(--ease-soft)] hover:py-[38px] group"
              onMouseEnter={() => setHoverImage(service.img)}
              onMouseLeave={() => setHoverImage(null)}
            >
              <span className="font-mono text-[13px] text-[var(--paper-faint)]">{service.num}</span>
              <span className="text-[clamp(24px,4vw,46px)] font-medium uppercase text-[var(--paper-dim)] transition-all duration-400 ease-[var(--ease-soft)] flex flex-col gap-[6px] group-hover:text-[var(--paper)] group-hover:translate-x-[6px]">
                {service.title}
                <span className="text-[13px] text-[var(--paper-faint)] font-normal normal-case tracking-normal max-h-0 opacity-0 overflow-hidden transition-all duration-400 ease-[var(--ease-soft)] group-hover:max-h-[60px] group-hover:opacity-100 group-hover:mt-[2px]">
                  {service.desc}
                </span>
              </span>
              <span className="w-[44px] h-[44px] border border-[var(--line)] rounded-full flex items-center justify-center transition-all duration-400 ease-[var(--ease-panel)] group-hover:translate-x-[6px] group-hover:-translate-y-[6px] group-hover:border-[var(--paper)] group-hover:bg-[var(--paper)]">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="transition-transform duration-400 ease-[var(--ease-panel)] group-hover:rotate-45">
                  <path d="M5 19L19 5M19 5H8M19 5V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="stroke-[var(--paper)] group-hover:stroke-[var(--ink)]"/>
                </svg>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Service Preview Image Hover */}
      <div 
        ref={previewRef}
        className={`fixed top-0 left-0 w-[340px] h-[220px] pointer-events-none z-[60] overflow-hidden transition-all duration-350 ease-[var(--ease-soft)] hidden md:block ${
          hoverImage ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.92]'
        }`}
        style={{
          transform: `translate(${mousePos.x + 20}px, ${mousePos.y + 20}px) ${hoverImage ? 'scale(1)' : 'scale(0.92)'}`,
        }}
      >
        <img 
          src={hoverImage || servicesList[0].img} 
          alt="Service Preview" 
          className="w-full h-full object-cover brightness-[.85]"
        />
      </div>
    </section>
  );
}

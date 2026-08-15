export default function Builds() {
  return (
    <section id="builds" className="bg-[var(--ink)] py-[min(18vh,180px)]">
      <div className="w-full max-w-[var(--container)] mx-auto px-[var(--edge)]">
        <div className="flex justify-between items-end gap-[40px] flex-wrap mb-[64px]">
          <h2 className="text-[clamp(32px,5vw,64px)] font-semibold uppercase leading-[1.02] tracking-[-0.01em]">
            Our Builds.
          </h2>
          <p className="max-w-[46ch] text-[var(--paper-dim)] text-[17px] leading-[1.6]">
            A selection of finished work — full detail, protection and modification, start to end.
          </p>
        </div>
        
        <div className="flex flex-col gap-[min(14vh,120px)]">
          {/* Build 1 */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-[36px] items-end">
            <div className="relative overflow-hidden aspect-[4/3] group" data-cursor="EXPLORE">
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80&auto=format&fit=crop" 
                alt="Porsche 911 project build" 
                className="w-full h-full object-cover scale-[1.08] transition-transform duration-[1.1s] ease-[var(--ease-panel)] group-hover:scale-100"
              />
            </div>
            <div className="pb-[8px]">
              <span className="font-mono text-[11px] text-[var(--paper-faint)]">Project 01</span>
              <h3 className="text-[clamp(24px,3.2vw,44px)] font-semibold uppercase mt-[10px]">Porsche 911</h3>
              <div className="mt-[12px] font-mono text-[11px] text-[var(--brass)] tracking-[.08em]">Ceramic + PPF</div>
            </div>
          </div>
          
          {/* Build 2 */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-[36px] items-end">
            <div className="pb-[8px] order-last md:order-first">
              <span className="font-mono text-[11px] text-[var(--paper-faint)]">Project 02</span>
              <h3 className="text-[clamp(24px,3.2vw,44px)] font-semibold uppercase mt-[10px]">BMW M4</h3>
              <div className="mt-[12px] font-mono text-[11px] text-[var(--brass)] tracking-[.08em]">Full Detail + Wheels</div>
            </div>
            <div className="relative overflow-hidden aspect-[4/3] group md:order-last" data-cursor="EXPLORE">
              <img 
                src="https://images.unsplash.com/photo-1623564493214-6137dff043ad?w=1400&q=80&auto=format&fit=crop" 
                alt="BMW M4 wheel detail" 
                className="w-full h-full object-cover scale-[1.08] transition-transform duration-[1.1s] ease-[var(--ease-panel)] group-hover:scale-100"
              />
            </div>
          </div>
          
          {/* Build 3 */}
          <div className="grid grid-cols-1 gap-[36px] items-end">
            <div className="relative overflow-hidden aspect-[4/3] md:aspect-[21/9] group" data-cursor="EXPLORE">
              <img 
                src="https://images.unsplash.com/photo-1584060622420-0673aad46076?w=2000&q=80&auto=format&fit=crop" 
                alt="Mercedes AMG full protection build" 
                className="w-full h-full object-cover scale-[1.08] transition-transform duration-[1.1s] ease-[var(--ease-panel)] group-hover:scale-100"
              />
            </div>
            <div className="pb-[8px]">
              <span className="font-mono text-[11px] text-[var(--paper-faint)]">Project 03</span>
              <h3 className="text-[clamp(24px,3.2vw,44px)] font-semibold uppercase mt-[10px]">Mercedes‑AMG</h3>
              <div className="mt-[12px] font-mono text-[11px] text-[var(--brass)] tracking-[.08em]">Full Protection</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

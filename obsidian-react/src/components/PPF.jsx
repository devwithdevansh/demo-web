export default function PPF() {
  const hotspots = [
    { top: '38%', left: '30%', label: 'Hood', tag: 'Hood — Full Front' },
    { top: '64%', left: '78%', label: 'Bumper', tag: 'Bumper — Impact Zone' },
    { top: '30%', left: '58%', label: 'Mirror', tag: 'Mirror — Chip Guard' },
    { top: '58%', left: '20%', label: 'Fender', tag: 'Fender — Rock Chip Zone' },
  ];

  return (
    <section id="ppf" className="bg-[var(--graphite)] py-[min(18vh,180px)]">
      <div className="w-full max-w-[var(--container)] mx-auto px-[var(--edge)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center">
          <div className="relative aspect-[4/3] overflow-hidden order-first md:order-last">
            <img 
              src="https://images.unsplash.com/photo-1640342980686-b709f2f68d84?w=1400&q=80&auto=format&fit=crop" 
              alt="Vehicle for PPF hotspots" 
              className="w-full h-full object-cover brightness-[.8]"
            />
            {hotspots.map((spot, i) => (
              <div 
                key={i} 
                className="hotspot absolute w-[16px] h-[16px] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ top: spot.top, left: spot.left }}
              >
                <div className="absolute inset-0 border border-[var(--paper)] rounded-full animate-[pulseRing_2.4s_ease-out_infinite]"></div>
                <div className="absolute inset-[5px] bg-[var(--paper)] rounded-full group-hover:bg-[var(--brass)] transition-colors"></div>
                <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 translate-y-[6px] bg-[var(--ink)] border border-[var(--line)] px-[12px] py-[8px] font-mono text-[10px] tracking-[.14em] uppercase whitespace-nowrap opacity-0 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  {spot.tag}
                </div>
              </div>
            ))}
          </div>
          
          <div className="ppf-text">
            <div className="eyebrow">Paint Protection Film</div>
            <h2 className="text-[clamp(32px,4.6vw,58px)] font-semibold uppercase leading-[1.05] mt-[16px]">
              <span className="text-[var(--paper-faint)]">Invisible</span> Protection.<br/>Visible Confidence.
            </h2>
            <p className="mt-[22px] text-[var(--paper-dim)] max-w-[40ch] text-[15px]">
              A self-healing urethane film absorbs stone chips, abrasion and UV before they reach your clear coat — applied invisibly across the panels that take the most impact.
            </p>
          </div>
        </div>
      </div>
      
      {/* Required style for pulseRing keyframes */}
      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: .9; }
          100% { transform: scale(2.6); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

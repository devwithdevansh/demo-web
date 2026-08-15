export default function Studio() {
  const images = [
    { src: 'https://images.unsplash.com/photo-1712319850454-f4ba54e9208d?w=1400&q=80&auto=format&fit=crop', cap: 'Bay 01', size: 'lg' },
    { src: 'https://images.unsplash.com/photo-1762933855598-273a51b47649?w=1000&q=80&auto=format&fit=crop', cap: 'Pre-Wash', size: 'md' },
    { src: 'https://images.unsplash.com/photo-1653749573430-3ed4b826222c?w=800&q=80&auto=format&fit=crop', cap: 'Inspection', size: 'sm' },
    { src: 'https://images.unsplash.com/photo-1668639235092-301730d1b72e?w=1000&q=80&auto=format&fit=crop', cap: 'Wheel Bay', size: 'md' },
    { src: 'https://images.unsplash.com/photo-1760130426888-7c15a56a7f2b?w=1400&q=80&auto=format&fit=crop', cap: 'Interior Suite', size: 'lg' }
  ];

  const sizeClasses = {
    lg: 'w-[80vw] md:w-[min(52vw,620px)] h-[60vh] self-start',
    md: 'w-[60vw] md:w-[min(34vw,420px)] h-[44vh] self-end',
    sm: 'w-[45vw] md:w-[min(24vw,300px)] h-[34vh] self-center'
  };

  return (
    <section id="studio" className="bg-[var(--graphite)] py-[min(18vh,180px)] overflow-hidden">
      <div className="px-[var(--edge)] mb-[50px]">
        <div className="flex justify-between items-end gap-[40px] flex-wrap m-0">
          <h2 className="text-[clamp(32px,5vw,64px)] font-semibold uppercase leading-[1.02] tracking-[-0.01em]">
            The Studio.
          </h2>
          <p className="max-w-[46ch] text-[var(--paper-dim)] text-[17px] leading-[1.6]">
            Climate-controlled bays, calibrated lighting and the tools to see what a wash bay never will.
          </p>
        </div>
      </div>
      
      <div className="flex gap-[18px] overflow-x-auto px-[var(--edge)] pb-[20px] snap-x snap-proximity items-start [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((img, i) => (
          <div 
            key={i} 
            className={`flex-none snap-start overflow-hidden relative ${sizeClasses[img.size]}`}
          >
            <img src={img.src} alt={img.cap} className="w-full h-full object-cover will-change-transform" />
            <div className="absolute left-[16px] bottom-[16px] font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-dim)]">
              {img.cap}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

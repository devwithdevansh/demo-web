import { useState, useMemo } from 'react';

const options = {
  vehicle: [
    { value: 'BMW', label: 'BMW M3', img: 'https://images.unsplash.com/photo-1601278840447-9af5ac4ed157?w=1600&q=80&auto=format&fit=crop' },
    { value: 'POR', label: 'Porsche 911', img: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=1600&q=80&auto=format&fit=crop' },
    { value: 'AMG', label: 'Mercedes‑AMG', img: 'https://images.unsplash.com/photo-1584060622420-0673aad46076?w=1600&q=80&auto=format&fit=crop' }
  ],
  finish: [
    { value: 'GLOSS', label: 'Gloss', filter: 'none' },
    { value: 'SATIN', label: 'Satin', filter: 'saturate(.75) contrast(.92) brightness(.97)' },
    { value: 'MATTE', label: 'Matte', filter: 'saturate(.4) contrast(.85) brightness(.9)' }
  ],
  protection: [
    { value: 'PPF', label: 'PPF' },
    { value: 'CER', label: 'Ceramic' },
    { value: 'BOTH', label: 'Both' }
  ],
  wheels: [
    { value: 'OEM', label: 'OEM+' },
    { value: 'FORGED', label: 'Forged' },
    { value: 'PERF', label: 'Performance' }
  ]
};

export default function Configurator() {
  const [selections, setSelections] = useState({
    vehicle: 'BMW',
    finish: 'GLOSS',
    protection: 'CER',
    wheels: 'OEM'
  });

  const handleSelect = (group, value) => {
    setSelections(prev => ({ ...prev, [group]: value }));
  };

  const currentVehicle = useMemo(() => options.vehicle.find(v => v.value === selections.vehicle), [selections.vehicle]);
  const currentFinish = useMemo(() => options.finish.find(f => f.value === selections.finish), [selections.finish]);
  const currentProtection = useMemo(() => options.protection.find(p => p.value === selections.protection), [selections.protection]);
  const currentWheels = useMemo(() => options.wheels.find(w => w.value === selections.wheels), [selections.wheels]);

  const specCode = `${selections.vehicle}-M-${selections.finish}-${selections.protection}-${selections.wheels}`;

  return (
    <section id="config" className="bg-[var(--graphite)] py-[min(18vh,180px)]">
      <div className="w-full max-w-[var(--container)] mx-auto px-[var(--edge)]">
        <div className="flex justify-between items-end gap-[40px] flex-wrap mb-[64px]">
          <h2 className="text-[clamp(32px,5vw,64px)] font-semibold uppercase leading-[1.02] tracking-[-0.01em]">
            Build Your Spec.
          </h2>
          <p className="max-w-[46ch] text-[var(--paper-dim)] text-[17px] leading-[1.6]">
            A working starting point for your quote — final spec is always confirmed in person.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-[60px] items-center">
          <div className="relative aspect-[16/11] overflow-hidden bg-[var(--ink)]">
            <img 
              src={currentVehicle.img} 
              alt="Configurator vehicle preview" 
              className="w-full h-full object-cover transition-all duration-500 ease-[var(--ease-soft)]"
              style={{ filter: currentFinish.filter }}
            />
            <div className="absolute bottom-[18px] left-[18px] font-mono text-[10px] tracking-[.12em] text-[var(--paper-dim)] bg-[rgba(10,11,13,.5)] px-[10px] py-[6px] backdrop-blur-[4px]">
              {specCode}
            </div>
          </div>
          
          <div className="config-panel">
            {Object.keys(options).map((group) => (
              <div key={group} className="mb-[30px]">
                <span className="font-mono text-[11px] tracking-[.14em] text-[var(--paper-faint)] uppercase mb-[12px] block">
                  {group}
                </span>
                <div className="flex flex-wrap gap-[10px]">
                  {options[group].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(group, opt.value)}
                      className={`px-[16px] py-[10px] border text-[13px] tracking-[.02em] transition-colors duration-300 ${
                        selections[group] === opt.value
                          ? 'bg-[var(--paper)] text-[var(--ink)] border-[var(--paper)]'
                          : 'border-[var(--line)] text-[var(--paper)] hover:border-[var(--paper-dim)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="mt-[34px] pt-[24px] border-t border-[var(--line)] font-mono text-[12px] text-[var(--paper-dim)] flex flex-col gap-[8px]">
              <div className="flex justify-between gap-[12px]">
                <span>Vehicle</span><b className="text-[var(--paper)] font-medium">{currentVehicle.label}</b>
              </div>
              <div className="flex justify-between gap-[12px]">
                <span>Finish</span><b className="text-[var(--paper)] font-medium">{currentFinish.label}</b>
              </div>
              <div className="flex justify-between gap-[12px]">
                <span>Protection</span><b className="text-[var(--paper)] font-medium">{currentProtection.label}</b>
              </div>
              <div className="flex justify-between gap-[12px]">
                <span>Wheels</span><b className="text-[var(--paper)] font-medium">{currentWheels.label}</b>
              </div>
            </div>
            
            <a href="#booking" className="btn solid mt-[28px]" data-cursor="BOOK">
              Request This Spec →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

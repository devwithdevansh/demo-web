import { useState } from 'react';

export default function Booking() {
  const [activeTab, setActiveTab] = useState('service');
  const [successService, setSuccessService] = useState(false);
  const [successQuote, setSuccessQuote] = useState(false);

  const handleSubmitService = (e) => {
    e.preventDefault();
    setSuccessService(true);
  };

  const handleSubmitQuote = (e) => {
    e.preventDefault();
    setSuccessQuote(true);
  };

  return (
    <section id="booking" className="bg-[var(--graphite)] py-[min(18vh,180px)]">
      <div className="w-full max-w-[var(--container)] mx-auto px-[var(--edge)]">
        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-[70px]">
          
          <div className="booking-intro">
            <div className="eyebrow">Enquire</div>
            <h2 className="text-[clamp(32px,5vw,58px)] font-semibold uppercase leading-[1.05] mt-[16px]">
              Ready For The<br/>Transformation?
            </h2>
            <p className="mt-[22px] text-[var(--paper-dim)] max-w-[40ch]">
              Book a fixed-scope service, or send us your vehicle and vision for a tailored quote.
            </p>
            <div className="flex flex-col gap-[14px] mt-[44px]">
              <a href="#" className="font-mono text-[13px] tracking-[.04em] flex items-center gap-[10px] text-[var(--paper-dim)] transition-colors duration-300 hover:text-[var(--paper)]" data-cursor="BOOK">
                WhatsApp — Message The Studio
              </a>
              <a href="#" className="font-mono text-[13px] tracking-[.04em] flex items-center gap-[10px] text-[var(--paper-dim)] transition-colors duration-300 hover:text-[var(--paper)]">
                studio@obsidian-detailing.com
              </a>
              <a href="#" className="font-mono text-[13px] tracking-[.04em] flex items-center gap-[10px] text-[var(--paper-dim)] transition-colors duration-300 hover:text-[var(--paper)]">
                Google Maps — Get Directions
              </a>
            </div>
          </div>
          
          <div>
            <div className="flex gap-0 mb-[34px] border-b border-[var(--line)]">
              <button 
                className={`py-[14px] pr-0 mr-[36px] font-mono text-[12px] tracking-[.12em] uppercase relative ${activeTab === 'service' ? 'text-[var(--paper)]' : 'text-[var(--paper-faint)]'} group`}
                onClick={() => setActiveTab('service')}
              >
                Book A Service
                <span className={`absolute left-0 right-full bottom-[-1px] h-[2px] bg-[var(--heat-gradient)] transition-all duration-350 ease-[var(--ease-panel)] ${activeTab === 'service' ? '!right-0' : 'group-hover:right-0'}`}></span>
              </button>
              <button 
                className={`py-[14px] pr-0 mr-[36px] font-mono text-[12px] tracking-[.12em] uppercase relative ${activeTab === 'quote' ? 'text-[var(--paper)]' : 'text-[var(--paper-faint)]'} group`}
                onClick={() => setActiveTab('quote')}
              >
                Request A Quote
                <span className={`absolute left-0 right-full bottom-[-1px] h-[2px] bg-[var(--heat-gradient)] transition-all duration-350 ease-[var(--ease-panel)] ${activeTab === 'quote' ? '!right-0' : 'group-hover:right-0'}`}></span>
              </button>
            </div>

            {/* Service Form */}
            {activeTab === 'service' && (
              <form className="animate-[formIn_0.5s_var(--ease-soft)]" onSubmit={handleSubmitService}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[22px]">
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-faint)]">Vehicle</label>
                    <input type="text" placeholder="e.g. BMW M4 Competition" className="bg-transparent border-0 border-b border-[var(--line)] py-[10px] text-[var(--paper)] text-[15px] focus:outline-none focus:border-[var(--paper)] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-faint)]">Service</label>
                    <select className="bg-transparent border-0 border-b border-[var(--line)] py-[10px] text-[var(--paper)] text-[15px] focus:outline-none focus:border-[var(--paper)] transition-colors appearance-none">
                      {['Detailing', 'Paint Correction', 'Ceramic Coating', 'PPF', 'Vinyl Wrap', 'Window Tint', 'Wheels', 'Modification'].map(s => <option key={s} className="bg-[var(--graphite)] text-[var(--paper)]">{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-faint)]">Package</label>
                    <select className="bg-transparent border-0 border-b border-[var(--line)] py-[10px] text-[var(--paper)] text-[15px] focus:outline-none focus:border-[var(--paper)] transition-colors appearance-none">
                      {['Essential', 'Signature', 'Full Transformation'].map(s => <option key={s} className="bg-[var(--graphite)] text-[var(--paper)]">{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-faint)]">Preferred Date</label>
                    <input type="date" className="bg-transparent border-0 border-b border-[var(--line)] py-[10px] text-[var(--paper)] text-[15px] focus:outline-none focus:border-[var(--paper)] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-faint)]">Preferred Time</label>
                    <input type="time" className="bg-transparent border-0 border-b border-[var(--line)] py-[10px] text-[var(--paper)] text-[15px] focus:outline-none focus:border-[var(--paper)] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-faint)]">Contact</label>
                    <input type="text" placeholder="Phone or email" className="bg-transparent border-0 border-b border-[var(--line)] py-[10px] text-[var(--paper)] text-[15px] focus:outline-none focus:border-[var(--paper)] transition-colors" />
                  </div>
                </div>
                
                {!successService ? (
                  <div className="flex items-center gap-[18px] mt-[32px] flex-wrap">
                    <button type="submit" className="btn solid" data-cursor="BOOK">Submit Booking Request</button>
                    <span className="text-[12px] text-[var(--paper-faint)]">We'll confirm availability within one business day.</span>
                  </div>
                ) : (
                  <div className="mt-[32px] p-[26px] border border-[var(--brass)] font-mono text-[13px] tracking-[.04em] text-[var(--paper)] animate-[formIn_0.5s_var(--ease-soft)]">
                    Request received — a member of the studio will confirm your slot shortly.
                  </div>
                )}
              </form>
            )}

            {/* Quote Form */}
            {activeTab === 'quote' && (
              <form className="animate-[formIn_0.5s_var(--ease-soft)]" onSubmit={handleSubmitQuote}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[22px]">
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-faint)]">Make</label>
                    <input type="text" placeholder="e.g. Porsche" className="bg-transparent border-0 border-b border-[var(--line)] py-[10px] text-[var(--paper)] text-[15px] focus:outline-none focus:border-[var(--paper)] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-faint)]">Model</label>
                    <input type="text" placeholder="e.g. 911 Carrera S" className="bg-transparent border-0 border-b border-[var(--line)] py-[10px] text-[var(--paper)] text-[15px] focus:outline-none focus:border-[var(--paper)] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-faint)]">Year</label>
                    <input type="text" placeholder="e.g. 2024" className="bg-transparent border-0 border-b border-[var(--line)] py-[10px] text-[var(--paper)] text-[15px] focus:outline-none focus:border-[var(--paper)] transition-colors" />
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-faint)]">Budget Range</label>
                    <select className="bg-transparent border-0 border-b border-[var(--line)] py-[10px] text-[var(--paper)] text-[15px] focus:outline-none focus:border-[var(--paper)] transition-colors appearance-none">
                      {['Under $1,000', '$1,000 – $3,000', '$3,000 – $8,000', '$8,000+'].map(s => <option key={s} className="bg-[var(--graphite)] text-[var(--paper)]">{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-[8px] sm:col-span-2">
                    <label className="font-mono text-[10px] tracking-[.12em] uppercase text-[var(--paper-faint)]">Services Of Interest</label>
                    <input type="text" placeholder="e.g. Full PPF, ceramic, forged wheels" className="bg-transparent border-0 border-b border-[var(--line)] py-[10px] text-[var(--paper)] text-[15px] focus:outline-none focus:border-[var(--paper)] transition-colors" />
                  </div>
                  <label className="flex flex-col gap-[6px] sm:col-span-2 border border-dashed border-[var(--line)] p-[22px] items-center text-center cursor-pointer transition-colors duration-300 hover:border-[var(--brass)]">
                    <span className="text-[13px] text-[var(--paper-dim)]">Upload Vehicle Photos</span>
                    <span className="font-mono text-[10px] text-[var(--paper-faint)]">EXTERIOR · PAINT DEFECTS · WHEELS · INTERIOR</span>
                    <input type="file" multiple className="hidden" />
                  </label>
                </div>
                
                {!successQuote ? (
                  <div className="flex items-center gap-[18px] mt-[32px] flex-wrap">
                    <button type="submit" className="btn solid" data-cursor="BOOK">Submit Quote Request</button>
                    <span className="text-[12px] text-[var(--paper-faint)]">Photos help us scope the build accurately before you arrive.</span>
                  </div>
                ) : (
                  <div className="mt-[32px] p-[26px] border border-[var(--brass)] font-mono text-[13px] tracking-[.04em] text-[var(--paper)] animate-[formIn_0.5s_var(--ease-soft)]">
                    Request received — expect a tailored quote within one business day.
                  </div>
                )}
              </form>
            )}
          </div>
          
        </div>
      </div>
      
      <style>{`
        @keyframes formIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

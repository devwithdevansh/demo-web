export default function Footer() {
  return (
    <>
      <footer className="bg-[var(--ink)] border-t border-[var(--line)] pt-[min(10vh,90px)] pb-[30px]">
        <div className="w-full max-w-[var(--container)] mx-auto px-[var(--edge)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-[40px] mb-[min(14vh,120px)]">
            <div className="footer-brand">
              <div className="text-[20px] font-semibold tracking-[0.04em] flex items-center gap-[8px] mb-[18px]">
                <span className="w-[6px] h-[6px] bg-[var(--brass)] rounded-full"></span>KOHINOOR
              </div>
              <p className="text-[var(--paper-dim)] text-[14px] max-w-[32ch]">
                A premium detailing, protection and modification studio — built around precision, not shortcuts.
              </p>
            </div>
            
            <div className="footer-col">
              <h4 className="font-mono text-[11px] tracking-[.14em] uppercase text-[var(--paper-faint)] mb-[18px]">Studio</h4>
              <a href="#services" className="block text-[14px] text-[var(--paper-dim)] mb-[10px] transition-colors duration-300 hover:text-[var(--paper)]">Detailing</a>
              <a href="#ppf" className="block text-[14px] text-[var(--paper-dim)] mb-[10px] transition-colors duration-300 hover:text-[var(--paper)]">Protection</a>
              <a href="#mod" className="block text-[14px] text-[var(--paper-dim)] mb-[10px] transition-colors duration-300 hover:text-[var(--paper)]">Modification</a>
              <a href="#builds" className="block text-[14px] text-[var(--paper-dim)] mb-[10px] transition-colors duration-300 hover:text-[var(--paper)]">Our Work</a>
              <a href="/" className="block text-[14px] text-[var(--paper-dim)] mb-[10px] transition-colors duration-300 hover:text-[var(--paper)]">Site Catalog</a>
            </div>
            
            <div className="footer-col">
              <h4 className="font-mono text-[11px] tracking-[.14em] uppercase text-[var(--paper-faint)] mb-[18px]">Visit</h4>
              <p className="block text-[14px] text-[var(--paper-dim)] mb-[10px]">Unit 4, Industrial Quarter</p>
              <p className="block text-[14px] text-[var(--paper-dim)] mb-[10px]">Open Tue – Sat, 9:00 – 18:00</p>
              <a href="#" className="block text-[14px] text-[var(--paper-dim)] mb-[10px] transition-colors duration-300 hover:text-[var(--paper)]">Get Directions</a>
            </div>
            
            <div className="footer-col">
              <h4 className="font-mono text-[11px] tracking-[.14em] uppercase text-[var(--paper-faint)] mb-[18px]">Connect</h4>
              <a href="#" className="block text-[14px] text-[var(--paper-dim)] mb-[10px] transition-colors duration-300 hover:text-[var(--paper)]">WhatsApp</a>
              <a href="#" className="block text-[14px] text-[var(--paper-dim)] mb-[10px] transition-colors duration-300 hover:text-[var(--paper)]">Instagram</a>
              <a href="#booking" className="block text-[14px] text-[var(--paper-dim)] mb-[10px] transition-colors duration-300 hover:text-[var(--paper)]">Book Now</a>
            </div>
          </div>
          
          <div className="flex justify-between items-end flex-wrap gap-[20px] border-t border-[var(--line)] pt-[34px]">
            <div className="text-[clamp(22px,3vw,36px)] font-semibold uppercase">Your Car. Our Craft.</div>
            <div className="font-mono text-[11px] text-[var(--paper-faint)]">© KOHINOOR STUDIO — ALL RIGHTS RESERVED</div>
          </div>
        </div>
      </footer>
    </>
  );
}

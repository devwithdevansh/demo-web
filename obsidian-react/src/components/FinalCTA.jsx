export default function FinalCTA() {
  return (
    <section id="finalcta" className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1599949117092-4323ac1789f9?w=2200&q=80&auto=format&fit=crop" 
          alt="Vehicle emerging from shadow" 
          className="w-full h-full object-cover brightness-[.4] scale-[1.08]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(10,11,13,.2),rgba(10,11,13,.92)_78%)]"></div>
      </div>
      <div className="relative z-[2] px-[var(--edge)] pb-[100px] w-full flex justify-between items-end flex-wrap gap-[34px]">
        <h2 className="text-[clamp(40px,8vw,120px)] font-semibold uppercase leading-[.94]">
          Built To Be Seen.<br/>Protected To Last.
        </h2>
        <div className="flex gap-[18px] flex-wrap">
          <a href="#booking" className="btn solid" data-cursor="BOOK">Book Now</a>
          <a href="#builds" className="btn ghost" data-cursor="VIEW">View Builds</a>
        </div>
      </div>
    </section>
  );
}

const words = ['Ceramic Coating', 'Paint Protection Film', 'Paint Correction', 'Graphene Coating', 'Interior Restoration', 'Snow Foam Wash'];

export default function Marquee() {
  return (
    <div className="marquee bg-[var(--panel)] border-y border-[var(--line)] py-4" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex items-center shrink-0">
            {words.map((w) => (
              <span key={w} className="flex items-center gap-6 pr-6">
                <span className="display text-[15px] uppercase tracking-[.04em] text-[var(--paper-dim)] whitespace-nowrap">{w}</span>
                <span className="text-[var(--lacquer)]">◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

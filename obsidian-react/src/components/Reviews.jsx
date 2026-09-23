export default function Reviews() {
  const reviews = [
    { text: "The car looked better than the day I bought it. The correction work alone was worth the trip.", who: "Arjun Mehta — BMW M4" },
    { text: "PPF and ceramic were applied with a precision I haven't seen anywhere else. Zero orange peel, zero fuss.", who: "Kabir Malhotra — Porsche 911" },
    { text: "They planned the whole build around how I actually drive the car, not just what looks good in photos.", who: "Rohan Sethi — Range Rover Sport" }
  ];

  return (
    <section id="reviews" className="bg-[var(--ink)] py-[min(18vh,180px)]">
      <div className="w-full max-w-[var(--container)] mx-auto px-[var(--edge)]">
        <div className="mb-[64px]">
          <h2 className="text-[clamp(32px,5vw,64px)] font-semibold uppercase leading-[1.02] tracking-[-0.01em]">
            Trusted By Owners.
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[var(--line)] border border-[var(--line)]">
          {reviews.map((rev, i) => (
            <div key={i} className="bg-[var(--ink)] p-[42px_34px] flex flex-col gap-[22px]">
              <div className="tracking-[2px] text-[var(--brass)] text-[14px]">★★★★★</div>
              <p className="text-[16px] leading-[1.55]">{rev.text}</p>
              <div className="font-mono text-[11px] tracking-[.08em] text-[var(--paper-faint)] uppercase mt-auto pt-[8px] border-t border-[var(--line)]">
                {rev.who}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

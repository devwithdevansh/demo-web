import { reviews } from '../content';

export default function Reviews() {
  return (
    <section className="wrap pb-[clamp(72px,12vh,140px)]" aria-label="Reviews">
      <h2 className="wide d3 m-0 mb-10">What owners say</h2>
      <div className="grid md:grid-cols-3 gap-10 md:gap-[4vw]">
        {reviews.map((r) => (
          <figure key={r.by} className="m-0 border-t border-[var(--line)] pt-6">
            <blockquote className="m-0 text-[clamp(20px,1.7vw,24px)] leading-[1.35] font-medium">“{r.quote}”</blockquote>
            <figcaption className="mt-4 muted text-[15px]">{r.by}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

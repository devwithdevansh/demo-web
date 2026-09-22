import { notes } from '../content';

export default function Notes() {
  return (
    <section className="wrap py-[clamp(72px,12vh,140px)]" aria-label="Guest notes">
      <h2 className="serif d3 m-0 mb-12">From the guestbook</h2>
      <div className="grid md:grid-cols-3 gap-12 md:gap-[4vw]">
        {notes.map((n) => (
          <figure key={n.by} className="m-0">
            <blockquote className="serif m-0 text-[clamp(22px,2vw,28px)] leading-[1.3]">“{n.quote}”</blockquote>
            <figcaption className="mt-5 muted text-[15px]">{n.by}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

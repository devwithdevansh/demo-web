import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Star } from 'lucide-react';
import { reviews, studios } from '../content';

const totalReviews = studios.reduce((n, s) => n + s.reviewCount, 0);
const avgRating = studios.reduce((n, s) => n + s.rating * s.reviewCount, 0) / totalReviews;
const distribution = [88, 8, 2, 1, 1]; // 5-star .. 1-star, illustrative

function BigStars({ value }) {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={22} className={i < Math.round(value) ? 'fill-[var(--lacquer-bright)] text-[var(--lacquer-bright)]' : 'text-[var(--line)]'} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const root = useRef(null);
  const ratingEl = useRef(null);

  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: avgRating, duration: 1.4, ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
        onUpdate: () => { if (ratingEl.current) ratingEl.current.textContent = obj.v.toFixed(1); },
      });
      gsap.from('.dist-bar', {
        scaleX: 0, transformOrigin: 'left', ease: 'power2.out', duration: 1, stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
      });
      gsap.from('.review-card', {
        y: 24, opacity: 0, ease: 'power3.out', duration: 0.7, stagger: 0.1,
        scrollTrigger: { trigger: '.review-grid', start: 'top 85%', once: true },
      });
    });
  }, { scope: root });

  return (
    <section id="reviews" ref={root} className="wrap py-[clamp(72px,12vh,140px)]">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 mb-14">
        <div>
          <span className="eyebrow mb-4">Google reviews, across all studios</span>
          <div className="flex items-end gap-4">
            <p className="display m-0 text-[clamp(56px,7vw,96px)] leading-none tnum"><span ref={ratingEl}>0.0</span></p>
            <div className="pb-2">
              <BigStars value={avgRating} />
              <p className="m-0 mt-1 text-[14px] text-[var(--paper-dim)]">{totalReviews.toLocaleString('en-IN')} reviews</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          {distribution.map((pct, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-10 text-[13px] font-mono text-[var(--paper-dim)] shrink-0">{5 - i}★</span>
              <div className="h-2 flex-1 rounded-full bg-[var(--line-soft)] overflow-hidden">
                <div className="dist-bar h-full rounded-full bg-[var(--lacquer)]" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-10 text-[13px] font-mono text-[var(--paper-faint)] text-right shrink-0">{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hairline mb-12" />

      <div className="review-grid grid md:grid-cols-3 gap-10 md:gap-[3vw]">
        {reviews.map((r) => (
          <figure key={r.by} className="review-card m-0">
            <div className="flex items-center gap-0.5 mb-4" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={14} className={i < r.rating ? 'fill-[var(--lacquer-bright)] text-[var(--lacquer-bright)]' : 'text-[var(--line)]'} />
              ))}
            </div>
            <blockquote className="m-0 text-[18px] leading-[1.4] font-medium">“{r.quote}”</blockquote>
            <figcaption className="mt-4 text-[14px] text-[var(--paper-dim)]">{r.by} · {r.studio}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

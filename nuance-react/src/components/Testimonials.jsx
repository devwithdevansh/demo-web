import { useState, useEffect } from 'react';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const quotes = [
    `"I stopped describing what I wanted. Rahul just knows before I say it."`,
    `"First salon where the colour actually matched the swatch. Every time."`,
    `"It doesn't feel like a salon. It feels like a studio that happens to do hair."`
  ];

  const igImages = [
    'https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?q=80&w=400',
    'https://images.unsplash.com/photo-1522337360788-8b13fee7a3af?q=80&w=400',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=400',
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=400',
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=400'
  ];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % quotes.length);
    }, 4800);

    return () => clearInterval(timer);
  }, [quotes.length]);

  return (
    <section className="section on-ink-2" id="social">
      <div className="container-custom">
        <div className="testi-wrap">
          {quotes.map((quote, idx) => (
            <p key={idx} className={`testi-quote ${activeIndex === idx ? 'is-active' : ''}`}>{quote}</p>
          ))}
        </div>
        <div className="testi-attr">
          {quotes.map((_, idx) => (
            <span 
              key={idx} 
              className={`testi-dot ${activeIndex === idx ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            ></span>
          ))}
        </div>

        <div className="ig-grid" aria-label="Instagram gallery">
          {igImages.map((src, idx) => (
            <div key={idx} className="ig-cell">
              <div className="ph ph-ig" data-ig={idx % 2 === 0 ? 'a' : 'e'}>
                <img className="ph-img" src={src} alt="Instagram post" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

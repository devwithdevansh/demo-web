import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Gallery() {
  const trackRef = useRef(null);
  
  useEffect(() => {
    const track = trackRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!track || reduced || window.innerWidth <= 760) return;

    let tween;
    const build = () => {
      const trackWidth = track.scrollWidth;
      const viewport = window.innerWidth;
      const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gutter") || 40);
      const distance = trackWidth - viewport + gutter;
      
      if (distance <= 0) return null;
      
      return gsap.to(track, {
        x: -distance, ease: "none",
        scrollTrigger: {
          trigger: ".gallery-pin", start: "top top", end: "+=" + (distance + window.innerHeight),
          scrub: true, pin: false
        }
      });
    };

    tween = build();
    
    const handleResize = () => {
      if (tween) tween.scrollTrigger?.kill();
      tween = build();
      ScrollTrigger.refresh();
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (tween) tween.scrollTrigger?.kill();
    };
  }, []);

  const galleryImages = [
    'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=800',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800',
    'https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?q=80&w=800',
    'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=800',
    'https://images.unsplash.com/photo-1555820598-c62f83120150?q=80&w=800',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800',
  ];

  return (
    <section className="gallery-pin" id="salon" aria-label="The salon space">
      <div className="gallery-sticky">
        <div className="gallery-overlay">
          <div className="eyebrow">The Space</div>
          <h2 className="display-lg" style={{ marginTop: '16px' }}>Where style<br/><span className="italic brass-text">takes shape.</span></h2>
        </div>
        <div className="gallery-track" id="galleryTrack" ref={trackRef}>
          <div className="gallery-item tall"><div className="ph ph-gallery" data-g="1"><img className="ph-img" src={galleryImages[0]} alt="Entrance" /></div><span className="gallery-cap">Entrance</span></div>
          <div className="gallery-item"><div className="ph ph-gallery" data-g="2"><img className="ph-img" src={galleryImages[1]} alt="Styling Stations" /></div><span className="gallery-cap">Styling Stations</span></div>
          <div className="gallery-item tall"><div className="ph ph-gallery" data-g="3"><img className="ph-img" src={galleryImages[2]} alt="Mirrors" /></div><span className="gallery-cap">Mirrors</span></div>
          <div className="gallery-item"><div className="ph ph-gallery" data-g="4"><img className="ph-img" src={galleryImages[3]} alt="Wash Area" /></div><span className="gallery-cap">Wash Area</span></div>
          <div className="gallery-item tall"><div className="ph ph-gallery" data-g="5"><img className="ph-img" src={galleryImages[4]} alt="Product Wall" /></div><span className="gallery-cap">Product Wall</span></div>
          <div className="gallery-item"><div className="ph ph-gallery" data-g="1"><img className="ph-img" src={galleryImages[5]} alt="Interior Detail" /></div><span className="gallery-cap">Interior Detail</span></div>
        </div>
      </div>
    </section>
  );
}

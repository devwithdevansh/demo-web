import { useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Products() {
  useScrollReveal();

  useEffect(() => {
    const isFinePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (isFinePointer && !reduced) {
      const frames = document.querySelectorAll(".product-frame");
      
      const handleMouseMove = (e) => {
        const frame = e.currentTarget;
        const ph = frame.querySelector(".ph");
        if (!ph) return;
        const r = frame.getBoundingClientRect();
        const x = ((e.clientX - r.left)/r.width - 0.5) * 14;
        const y = ((e.clientY - r.top)/r.height - 0.5) * 14;
        ph.style.transform = `translate(${x}px,${y}px) scale(1.06)`;
      };

      const handleMouseLeave = (e) => {
        const frame = e.currentTarget;
        const ph = frame.querySelector(".ph");
        if (ph) ph.style.transform = "";
      };

      frames.forEach((frame) => {
        frame.addEventListener("mousemove", handleMouseMove);
        frame.addEventListener("mouseleave", handleMouseLeave);
      });

      return () => {
        frames.forEach((frame) => {
          frame.removeEventListener("mousemove", handleMouseMove);
          frame.removeEventListener("mouseleave", handleMouseLeave);
        });
      };
    }
  }, []);

  const products = [
    { name: "Repair Serum", price: "₹1,450", img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600" },
    { name: "Matte Clay", price: "₹990", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600" },
    { name: "Colour Shield Mask", price: "₹1,690", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600" },
    { name: "Texture Spray", price: "₹1,120", img: "https://images.unsplash.com/photo-1556228578-8d89b6acd8f1?q=80&w=600" }
  ];

  return (
    <section className="section on-ink-2" id="products">
      <div className="container-custom">
        <div className="section-head rv">
          <h2 className="display-lg">Take It<br/><span className="italic brass-text">Home.</span></h2>
          <p className="body-md" style={{ maxWidth: '340px' }}>The exact products your stylist reaches for, in professional sizing.</p>
        </div>
        <div className="products-grid">
          {products.map((p, idx) => (
            <div key={idx} className={`product-card rv ${idx > 0 ? `rv-delay-${idx}` : ''}`}>
              <div className="product-frame">
                <div className="ph ph-product" data-pr={idx + 1}>
                  <img className="ph-img" src={p.img} alt={p.name} />
                </div>
              </div>
              <div className="product-info">
                <span className="product-name">{p.name}</span>
                <span className="product-price">{p.price}</span>
              </div>
              <span className="product-add">Add to Bag</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

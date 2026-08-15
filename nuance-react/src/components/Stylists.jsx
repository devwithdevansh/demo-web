import { useState, useRef } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Stylists() {
  const [activeStylist, setActiveStylist] = useState(null);
  const detailRef = useRef(null);

  useScrollReveal();

  const stylistData = {
    rahul: { 
      name: "Rahul", 
      role: "Master Stylist", 
      exp: "9 years experience", 
      bio: "Known for precision cutting and modern fades, with an eye for how a cut grows out over the following weeks — not just how it looks in the chair.", 
      tags: ["Signature Cut", "Fades", "Beard Styling"],
      img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800"
    },
    priya: { 
      name: "Priya", 
      role: "Colour Specialist", 
      exp: "7 years experience", 
      bio: "Colour formulated to your skin tone and lifestyle, not the trend of the month. Balayage and correction are her focus.", 
      tags: ["Balayage", "Colour Correction", "Highlights"],
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800"
    },
    neha:  { 
      name: "Neha", 
      role: "Hair Artist", 
      exp: "6 years experience", 
      bio: "Bridal and occasion styling with an editorial finish — structured, but never stiff.", 
      tags: ["Bridal Styling", "Occasion Styling", "Blow Dry"],
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800"
    }
  };

  const openDetail = (key) => {
    setActiveStylist(key);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && detailRef.current) {
      setTimeout(() => {
        detailRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  const handleKeyDown = (e, key) => {
    if(e.key === "Enter" || e.key === " "){ 
      e.preventDefault(); 
      openDetail(key); 
    }
  };

  return (
    <section className="section on-ink-2" id="stylists">
      <div className="container-custom">
        <div className="section-head rv">
          <h2 className="display-lg">The<br/><span className="italic brass-text">Stylists.</span></h2>
          <p className="body-md" style={{ maxWidth: '340px' }}>Three specialists. One studio. Every chair booked by name, not by chance.</p>
        </div>

        <div className="stylists-grid" id="stylistsGrid">
          {Object.entries(stylistData).map(([key, data], idx) => (
            <article 
              key={key}
              className={`stylist-card rv ${idx > 0 ? `rv-delay-${idx}` : ''}`}
              data-stylist={key} 
              tabIndex="0" 
              role="button" 
              aria-expanded={activeStylist === key ? "true" : "false"}
              onClick={() => openDetail(key)}
              onKeyDown={(e) => handleKeyDown(e, key)}
            >
              <div className="ph ph-stylist" data-p={idx + 1}>
                <img className="ph-img" src={data.img} alt={data.name} />
                {!data.img && <span className="initial">{data.name.charAt(0)}</span>}
              </div>
              <div className="stylist-scrim"></div>
              <div className="stylist-meta">
                <h3 className="stylist-name">{data.name}</h3>
                <p className="eyebrow stylist-role">{data.role}</p>
              </div>
            </article>
          ))}
        </div>

        <div 
          className={`stylist-detail ${activeStylist ? 'is-open' : ''}`} 
          id="stylistDetail"
          ref={detailRef}
        >
          {activeStylist && (
            <div className="stylist-detail-grid">
              <div>
                <div className="eyebrow">{stylistData[activeStylist].role}</div>
                <h3 className="display-md" style={{ marginTop: '14px' }}>{stylistData[activeStylist].name}</h3>
                <p className="body-md" style={{ marginTop: '14px' }}>{stylistData[activeStylist].exp}</p>
              </div>
              <div>
                <p className="body-md">{stylistData[activeStylist].bio}</p>
                <div className="stylist-detail-list">
                  {stylistData[activeStylist].tags.map(tag => (
                    <span key={tag} className="pill">{tag}</span>
                  ))}
                </div>
                <div style={{ marginTop: '26px' }}>
                  <a 
                    href="#booking" 
                    className="btn btn-solid" 
                    onMouseEnter={() => window.dispatchEvent(new CustomEvent('updateCursor', { detail: { text: 'Book', big: true } }))}
                    onMouseLeave={() => window.dispatchEvent(new CustomEvent('updateCursor', { detail: { text: '', big: false } }))}
                  >
                    Book With {stylistData[activeStylist].name}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

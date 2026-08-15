import useScrollReveal from '../hooks/useScrollReveal';

export default function Journal() {
  useScrollReveal();

  const updateCursor = (text, big) => {
    window.dispatchEvent(new CustomEvent('updateCursor', { detail: { text, big } }));
  };

  const journals = [
    { kicker: "Men's Edit", title: "The New Fade", img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800" },
    { kicker: "Colour", title: "How to Choose Your Hair Colour", img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800" },
    { kicker: "Trends", title: "Summer Hair Trends", img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800" },
    { kicker: "Bridal", title: "The Bridal Hair Edit", img: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=800" },
    { kicker: "Grooming", title: "The Men's Grooming Guide", img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800" },
  ];

  return (
    <section className="section" id="journal">
      <div className="container-custom">
        <div className="section-head rv">
          <h2 className="display-lg">The<br/><span className="italic brass-text">Journal.</span></h2>
          <a href="#" className="link-arrow" onClick={e => e.preventDefault()}>Read the Lookbook
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><path d="M1 5H15M15 5L11 1M15 5L11 9" stroke="currentColor" strokeWidth="1.4"/></svg>
          </a>
        </div>
        <div className="journal-grid">
          {journals.map((j, idx) => (
            <a 
              key={idx}
              className={`journal-card rv ${idx > 0 ? (idx % 2 === 1 ? 'rv-delay-1' : 'rv-delay-2') : ''}`} 
              href="#" 
              onClick={e => e.preventDefault()}
              onMouseEnter={() => updateCursor('Read', true)}
              onMouseLeave={() => updateCursor('', false)}
            >
              <div className="ph ph-journal" data-j={idx + 1}>
                <img className="ph-img" src={j.img} alt={j.title} />
              </div>
              <div className="stylist-scrim"></div>
              <div className="journal-meta">
                <span className="journal-kicker">{j.kicker}</span>
                <h3 className="journal-title">{j.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

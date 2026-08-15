import useScrollReveal from '../hooks/useScrollReveal';

export default function Experience() {
  useScrollReveal();

  const updateCursor = (text, big) => {
    window.dispatchEvent(new CustomEvent('updateCursor', { detail: { text, big } }));
  };

  return (
    <>
      {/* MEN'S EXPERIENCE */}
      <section className="exp on-ink-2" id="men" aria-label="Men's grooming">
        <div className="exp-visual">
          <div className="ph ph-men">
            <img className="ph-img" src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800" alt="Men's Haircut" />
          </div>
        </div>
        <div className="exp-copy">
          <div className="eyebrow rv">For Him</div>
          <h2 className="display-md rv rv-delay-1" style={{ marginTop: '18px' }}>Men's<br/><span className="italic">Grooming Studio.</span></h2>
          <p className="body-lg rv rv-delay-2" style={{ marginTop: '22px', maxWidth: '440px' }}>Sharp lines, honest conversation, and grooming that holds up outside the chair. No shortcuts.</p>
          <ul className="exp-services rv rv-delay-3">
            <li>Haircut</li><li>Fade</li><li>Beard Styling</li>
            <li>Hair Styling</li><li>Hair Colour</li><li>Grooming Packages</li>
          </ul>
          <div style={{ marginTop: '36px' }}>
            <a 
              href="#booking" 
              className="btn btn-ghost"
              onMouseEnter={() => updateCursor('Book', true)}
              onMouseLeave={() => updateCursor('', false)}
            >
              Book Men's Service
            </a>
          </div>
        </div>
      </section>

      {/* WOMEN'S EXPERIENCE */}
      <section className="exp exp-reverse" id="women" aria-label="Women's hair and styling">
        <div className="exp-visual">
          <div className="ph ph-women">
            <img className="ph-img" src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800" alt="Women's Hair Styling" />
          </div>
        </div>
        <div className="exp-copy">
          <div className="eyebrow rv">For Her</div>
          <h2 className="display-md rv rv-delay-1" style={{ marginTop: '18px' }}>Women's<br/><span className="italic brass-text">Styling Studio.</span></h2>
          <p className="body-lg rv rv-delay-2" style={{ marginTop: '22px', maxWidth: '440px' }}>Colour and cut treated as craft, not trend-chasing. Sophisticated, editorial, entirely yours.</p>
          <ul className="exp-services rv rv-delay-3">
            <li>Haircut</li><li>Blow Dry</li><li>Hair Colour</li><li>Balayage</li>
            <li>Highlights</li><li>Hair Spa</li><li>Bridal Styling</li><li>Occasion Styling</li>
          </ul>
          <div style={{ marginTop: '36px' }}>
            <a 
              href="#booking" 
              className="btn btn-ghost"
              onMouseEnter={() => updateCursor('Book', true)}
              onMouseLeave={() => updateCursor('', false)}
            >
              Book Women's Service
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

import useScrollReveal from '../hooks/useScrollReveal';

export default function Footer() {
  useScrollReveal();

  const updateCursor = (text, big) => {
    window.dispatchEvent(new CustomEvent('updateCursor', { detail: { text, big } }));
  };

  return (
    <>
      <section className="final-cta">
        <div className="container-custom">
          <h2 className="display-xl rv">Good hair.<br/><span className="italic brass-text">Good energy.</span><br/>Good day.</h2>
          <a 
            href="#booking" 
            className="btn btn-solid rv rv-delay-1" 
            style={{ marginTop: '48px' }}
            onMouseEnter={() => updateCursor('Book', true)}
            onMouseLeave={() => updateCursor('', false)}
          >
            Book Your Appointment →
          </a>
        </div>
      </section>

      <footer id="contact">
        <div className="container-custom">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">Nuánce</div>
              <p className="body-md" style={{ maxWidth: '260px' }}>A fashion-editorial hair and grooming studio for men and women. By appointment.</p>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Visit</div>
              <p>12 Ashworth Lane<br/>Design District</p>
              <a href="#" onClick={e => e.preventDefault()}>Get Directions</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Hours &amp; Contact</div>
              <p>Tue–Sun · 10am – 8pm</p>
              <a href="tel:+910000000000">+91 00000 00000</a>
              <a href="#" onClick={e => e.preventDefault()}>Instagram</a>
              <a href="#" onClick={e => e.preventDefault()}>WhatsApp</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Studio</div>
              <a href="#booking">Book Appointment</a>
              <a href="#" onClick={e => e.preventDefault()}>Privacy</a>
              <a href="#" onClick={e => e.preventDefault()}>Terms</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Nuánce Studio. All rights reserved.</span>
            <span>Design &amp; motion — original identity, built for Nuánce.</span>
          </div>
        </div>
      </footer>
    </>
  );
}

import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (!menuOpen) {
      document.documentElement.classList.add("no-scroll");
    } else {
      document.documentElement.classList.remove("no-scroll");
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.documentElement.classList.remove("no-scroll");
  };

  const updateCursor = (text, big) => {
    window.dispatchEvent(new CustomEvent('updateCursor', { detail: { text, big } }));
  };

  return (
    <>
      <header className={`nav ${isScrolled ? 'is-scrolled' : ''}`} id="nav">
        <a href="#top" className="nav-logo">Nuánce</a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#top">Home</a>
          <a href="#services">Services</a>
          <a href="#stylists">Stylists</a>
          <a href="#salon">Salon</a>
          <a href="#journal">Journal</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="nav-cta">
          <a 
            href="#booking" 
            className="btn btn-solid" 
            onMouseEnter={() => updateCursor('Book', true)}
            onMouseLeave={() => updateCursor('', false)}
          >
            Book Appointment
          </a>
          <button 
            className="nav-burger" 
            id="burger" 
            aria-label="Open menu" 
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} id="mobileMenu">
        <a href="#top" onClick={closeMenu}>Home</a>
        <a href="#services" onClick={closeMenu}>Services</a>
        <a href="#stylists" onClick={closeMenu}>Stylists</a>
        <a href="#salon" onClick={closeMenu}>Salon</a>
        <a href="#journal" onClick={closeMenu}>Journal</a>
        <a href="#contact" onClick={closeMenu}>Contact</a>
      </div>
    </>
  );
}

import { Link } from 'react-router-dom'
import { hours, siteInfo } from '../data/siteData'
import FlameGlyph from './FlameGlyph'
import './footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <FlameGlyph size={20} color="var(--ember)" />
            <span>{siteInfo.name}</span>
          </div>
          <p>
            A live-fire kitchen and bar since {siteInfo.since}. Wood-fired plates, natural wine,
            and a room lit by the hearth.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Explore</h4>
          <ul>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/reservations">Reservations</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Hours</h4>
          <ul className="footer-hours">
            {hours.map((h) => (
              <li key={h.day}>
                <span>{h.day}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Visit</h4>
          <ul>
            <li>{siteInfo.address}</li>
            <li><a href={`tel:${siteInfo.phone.replace(/[^0-9+]/g, '')}`}>{siteInfo.phone}</a></li>
            <li><a href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a></li>
          </ul>
          <div className="footer-social">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="Yelp">YP</a>
          </div>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <p>© {new Date().getFullYear()} {siteInfo.name}. All rights reserved.</p>
        <p className="footer-demo-note">Demo website — content and imagery for illustration only.</p>
      </div>
    </footer>
  )
}

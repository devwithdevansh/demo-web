import { Phone, Navigation, ClipboardList, MessageCircle, MapPin } from 'lucide-react';
import { PHONE_DISPLAY, WHATSAPP_NUMBER, studios } from '../content';

// A fixed, app-style action row for mobile -- the same five shortcuts a
// studio's own Google Business card gives you (Call / Direction / Enquiry /
// WhatsApp / Locations). Desktop already has the header and a full page of
// CTAs, so this stays mobile-only; App.jsx reserves the matching space at
// the bottom of the page so it never covers the last section.
export default function ActionBar() {
  const nearest = studios[0];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${nearest.pos.join(',')}`;

  return (
    <nav className="action-bar" aria-label="Quick actions">
      <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`}>
        <Phone size={19} strokeWidth={1.8} />
        Call
      </a>
      <a href={directionsUrl} target="_blank" rel="noreferrer">
        <Navigation size={19} strokeWidth={1.8} />
        Direction
      </a>
      <a href="#book">
        <ClipboardList size={19} strokeWidth={1.8} />
        Enquiry
      </a>
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="ab-whatsapp">
        <MessageCircle size={19} strokeWidth={1.8} />
        WhatsApp
      </a>
      <a href="#studios">
        <MapPin size={19} strokeWidth={1.8} />
        Locations
      </a>
    </nav>
  );
}

import { Phone, Navigation, ClipboardList, MessageCircle, MapPin } from 'lucide-react';

// A fixed, app-style action row for mobile -- the same five shortcuts a
// studio's own Google Business card gives you (Call / Direction / Enquiry /
// WhatsApp / Locations). Desktop already has the header and a full page of
// CTAs, so this stays mobile-only. Ported from Boond's and Kavach's own
// ActionBar; Kohinoor doesn't have its own content.js with real contact
// details, so this uses the same DWD contact line those two use and a maps
// search (not a fixed lat/lng pin) built from the address text already in
// Footer.jsx, since no real coordinates exist for this demo site yet.
const PHONE_DISPLAY = '+91 96876 29341';
const WHATSAPP_NUMBER = '919687629341';
const ADDRESS = 'Unit 4, Industrial Quarter';

export default function ActionBar() {
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

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
      <a href="#booking">
        <ClipboardList size={19} strokeWidth={1.8} />
        Enquiry
      </a>
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="ab-whatsapp">
        <MessageCircle size={19} strokeWidth={1.8} />
        WhatsApp
      </a>
      <a href="#studio">
        <MapPin size={19} strokeWidth={1.8} />
        Locations
      </a>
    </nav>
  );
}

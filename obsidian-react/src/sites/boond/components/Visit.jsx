import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
// Leaflet's own stylesheet positions every pane, tile and marker -- without
// it the map renders as a couple of stray tiles with no pins.
import 'leaflet/dist/leaflet.css';
import { studio, landmarks, PICKUP_RADIUS_KM, ADDRESS, HOURS, PHONE_DISPLAY, WHATSAPP_NUMBER } from '../content';

const studioIcon = L.divIcon({ className: '', html: '<div class="pin-studio"></div>', iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -12] });
const dotIcon = L.divIcon({ className: '', html: '<div class="pin-dot"></div>', iconSize: [10, 10], iconAnchor: [5, 5], popupAnchor: [0, -6] });
const youIcon = L.divIcon({ className: '', html: '<div class="pin-dot" style="background:#3fa9d9;width:14px;height:14px"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });

function km([a, b], [c, d]) {
  const R = 6371, r = (x) => (x * Math.PI) / 180;
  const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Leaflet measures its container once, when the map mounts, and only loads
// tiles for that box. This page's pinned GSAP sections, Lenis and a tablet
// rotating all resize or shift it afterwards, which left an L-shaped patch
// of tiles with grey everywhere else. Re-measure whenever the box changes.
function KeepSized() {
  const map = useMap();
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => ro.disconnect();
  }, [map]);
  return null;
}

function FitTo({ you }) {
  const map = useMap();
  useEffect(() => {
    if (you) map.flyToBounds([studio.pos, you], { padding: [60, 60], duration: 1.2, maxZoom: 14 });
  }, [you, map]);
  return null;
}

export default function Visit() {
  const [zone, setZone] = useState(true);
  const [you, setYou] = useState(null);
  const [msg, setMsg] = useState('');
  const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const check = () => {
    if (!navigator.geolocation) { setMsg('Your browser can’t share location. Message us your area instead.'); return; }
    setMsg('Finding you…');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = [p.coords.latitude, p.coords.longitude];
        const d = km(studio.pos, pos);
        setYou(pos);
        setMsg(d <= PICKUP_RADIUS_KM
          ? `You’re ${d.toFixed(1)} km away. Pickup and drop are free.`
          : `You’re ${d.toFixed(1)} km away, outside free pickup. We can still collect for ₹20 per extra km.`);
      },
      () => setMsg('Location is blocked. Allow it in your browser, or message us your area.'),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <section id="visit" className="wrap py-[clamp(96px,16vh,180px)]">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10 md:mb-14">
        <h2 className="wide d2 m-0 max-w-[12ch]">Drop in, or we’ll come to you</h2>
        <p className="lede m-0 muted">Free pickup and drop anywhere inside the blue circle.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
        <div className="relative h-[60vh] min-h-[380px] rounded-[10px] overflow-hidden isolate">
          <MapContainer center={studio.pos} zoom={12} scrollWheelZoom={false} dragging={!touch} className="h-full w-full">
            {/* Standard OSM raster tiles, no API key needed -- CARTO's free
                light tiles now require a key and serve an "API KEY REQUIRED"
                watermark without one. The `.leaflet-tile-pane` filter in
                boond.css softens OSM's colours toward CARTO's light look. */}
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
            {zone && <Circle center={studio.pos} radius={PICKUP_RADIUS_KM * 1000} pathOptions={{ color: '#3fa9d9', weight: 2, fillColor: '#3fa9d9', fillOpacity: 0.1 }} />}
            <Marker position={studio.pos} icon={studioIcon}><Popup><strong>Beadline studio</strong><br />{ADDRESS[0]}</Popup></Marker>
            {landmarks.map((l) => (
              <Marker key={l.name} position={l.pos} icon={dotIcon}>
                <Popup><strong>{l.name}</strong><br />{l.inside ? 'Free pickup' : 'Outside free pickup'}</Popup>
              </Marker>
            ))}
            {you && <Marker position={you} icon={youIcon}><Popup>You</Popup></Marker>}
            <FitTo you={you} />
            <KeepSized />
          </MapContainer>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <p className="m-0 font-semibold">Studio</p>
            <p className="m-0 muted">{ADDRESS[0]}<br />{ADDRESS[1]}</p>
          </div>
          <div>
            <p className="m-0 font-semibold">Hours</p>
            <p className="m-0 muted">{HOURS}</p>
          </div>
          <div>
            <p className="m-0 font-semibold">Phone and WhatsApp</p>
            <a className="link" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">{PHONE_DISPLAY}</a>
          </div>
          <div className="flex flex-col items-start gap-3">
            <button className="btn" onClick={check}>Check if you’re in the pickup zone</button>
            <label className="flex items-center gap-2 text-[15px] cursor-pointer">
              <input type="checkbox" checked={zone} onChange={(e) => setZone(e.target.checked)} className="w-4 h-4 accent-[#3fa9d9]" />
              Show pickup zone on the map
            </label>
            <p role="status" className="m-0 min-h-[48px] text-[15px]">{msg}</p>
          </div>
          <a className="link" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${studio.pos.join(',')}`}>Directions in Google Maps</a>
        </div>
      </div>
    </section>
  );
}

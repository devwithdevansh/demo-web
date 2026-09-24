import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
// Leaflet's own stylesheet positions every pane, tile and marker -- without
// it the map renders as a couple of stray tiles with no pins.
import 'leaflet/dist/leaflet.css';
import { Star, Phone, Navigation, MapPinned, Clock } from 'lucide-react';
import { studios, BRAND } from '../content';

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

const pinIcon = (active) => L.divIcon({
  className: '', html: `<div class="${active ? 'pin-pulse' : ''}"><div class="pin-studio${active ? ' active' : ''}"></div></div>`,
  iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14],
});

function fmt12(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

// Live open/closed state from the visitor's own clock, matched against each
// studio's hours. Good enough for a demo; a real deploy should account for
// the studio's own timezone explicitly rather than trusting the browser's.
function openState(hours) {
  const now = new Date();
  const day = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = hours.open.split(':').map(Number);
  const [ch, cm] = hours.close.split(':').map(Number);
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;
  const isOpenDay = hours.days.includes(day);
  const isOpen = isOpenDay && minutesNow >= openMin && minutesNow < closeMin;
  return {
    isOpen,
    label: isOpen ? `Closes at ${fmt12(hours.close)}` : `Opens at ${fmt12(hours.open)}`,
  };
}

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={13} className={i < Math.round(rating) ? 'fill-[var(--lacquer-bright)] text-[var(--lacquer-bright)]' : 'text-[var(--line)]'} />
      ))}
    </span>
  );
}

function FlyTo({ pos }) {
  const map = useMap();
  useMemo(() => { if (pos) map.flyTo(pos, 13, { duration: 1 }); }, [pos, map]); // eslint-disable-line
  return null;
}

function StudioCard({ s, active, onSelect }) {
  const state = openState(s.hours);
  const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${s.pos.join(',')}`;
  return (
    <div className={`glass rounded-[16px] p-5 md:p-6 transition-colors ${active ? 'border-[var(--lacquer)]' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="display text-[19px] m-0 leading-tight">{s.name}</p>
          <p className="m-0 mt-2 text-[14px] text-[var(--paper-dim)]">{s.address[0]}<br />{s.address[1]}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${state.isOpen ? 'bg-[rgba(95,199,214,.14)] text-[var(--ceramic)]' : 'bg-[rgba(238,234,224,.08)] text-[var(--paper-dim)]'}`}>
          <Clock size={12} /> {state.isOpen ? 'Open now' : 'Closed'}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[13px]">
        <Stars rating={s.rating} />
        <span className="font-semibold">{s.rating.toFixed(1)}</span>
        <span className="text-[var(--paper-faint)]">({s.reviewCount} Google reviews)</span>
      </div>
      <p className="m-0 mt-2 text-[13px] text-[var(--paper-dim)]">{state.label}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a href={`tel:${s.phone.replace(/\s/g, '')}`} className="btn ghost sm"><Phone size={14} /> {s.phone}</a>
        <a href={dirUrl} target="_blank" rel="noreferrer" className="btn ghost sm"><Navigation size={14} /> Drive direction</a>
        <button onClick={() => onSelect(s.id)} className="btn sm solid"><MapPinned size={14} /> View on map</button>
      </div>
    </div>
  );
}

export default function Locator() {
  const [activeId, setActiveId] = useState(studios[0].id);
  const active = studios.find((s) => s.id === activeId);
  const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  return (
    <section id="studios" className="bg-[var(--ink-2)] wrap py-[clamp(96px,16vh,180px)]">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10 md:mb-14">
        <div className="flex items-center gap-5">
          <div className="coin w-[74px] h-[74px] shrink-0 hidden sm:block" aria-hidden="true">
            <div className="coin-face w-full h-full rounded-full bg-[var(--panel)] border border-[var(--lacquer)] flex items-center justify-center text-center">
              <span className="font-mono text-[9px] leading-tight text-[var(--lacquer-bright)] tracking-[.05em]">CERTIFIED<br />NETWORK</span>
            </div>
          </div>
          <div>
            <span className="eyebrow mb-4">Studio locator</span>
            <h2 className="display d2 m-0 max-w-[14ch]">Three studios. One standard.</h2>
          </div>
        </div>
        <p className="lede m-0">Every {BRAND} studio runs the same process, the same lights and the same warranty paperwork — pick whichever is closest.</p>
      </div>

      <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12">
        <div className="relative h-[56vh] min-h-[380px] rounded-[16px] overflow-hidden isolate order-2 lg:order-1">
          <MapContainer center={active.pos} zoom={12} scrollWheelZoom={false} dragging={!touch} className="h-full w-full">
            {/* Standard OSM raster tiles, no API key needed. They're light by
                default; the `.leaflet-tile-pane` filter in index.css darkens
                them to match the theme (CARTO's free dark tiles now require
                a key and serve a watermarked image without one). */}
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
            {studios.map((s) => (
              <Marker key={s.id} position={s.pos} icon={pinIcon(s.id === activeId)} eventHandlers={{ click: () => setActiveId(s.id) }}>
                <Popup>
                  <strong>{s.name}</strong><br />
                  {s.address[0]}<br />
                  {s.rating.toFixed(1)} ★ ({s.reviewCount})
                </Popup>
              </Marker>
            ))}
            <FlyTo pos={active.pos} />
            <KeepSized />
          </MapContainer>
        </div>

        <div className="order-1 lg:order-2 flex flex-col gap-4">
          {studios.map((s) => (
            <StudioCard key={s.id} s={s} active={s.id === activeId} onSelect={setActiveId} />
          ))}
        </div>
      </div>
    </section>
  );
}

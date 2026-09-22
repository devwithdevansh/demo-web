import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { places } from '../content';

const icon = (home, active) => L.divIcon({
  className: '',
  html: `<div class="pin${home ? ' home' : ''}${active ? ' active' : ''}"></div>`,
  iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -12],
});

function FlyTo({ place, markers }) {
  const map = useMap();
  useEffect(() => {
    if (!place) return;
    map.flyTo(place.pos, place.id === 'bhuj' || place.id === 'dholavira' ? 9 : 11, { duration: 1.4 });
    const t = setTimeout(() => markers.current[place.id]?.openPopup(), 1450);
    return () => clearTimeout(t);
  }, [place, map, markers]);
  return null;
}

export default function MapSection() {
  const [activeId, setActiveId] = useState('saltlight');
  const markers = useRef({});
  const active = useMemo(() => places.find((p) => p.id === activeId), [activeId]);
  const home = places[0];
  const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  return (
    <section id="map" className="wrap py-[clamp(96px,16vh,180px)]">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10 md:mb-14">
        <h2 className="serif d2 m-0 max-w-[13ch]">Where the road runs out</h2>
        <p className="m-0 max-w-[36ch] muted">Eighty kilometres north of Bhuj, the last stop before the salt. Pick a place to see how far it is.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
        <div className="relative h-[62vh] min-h-[380px] rounded-[3px] overflow-hidden isolate">
          <MapContainer center={home.pos} zoom={9} scrollWheelZoom={false} dragging={!touch} className="h-full w-full" aria-label="Map of Saltlight and nearby places">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd" maxZoom={19}
            />
            {places.map((p) => (
              <Marker
                key={p.id} position={p.pos} icon={icon(p.home, p.id === activeId)}
                ref={(m) => { if (m) markers.current[p.id] = m; }}
                eventHandlers={{ click: () => setActiveId(p.id) }}
              >
                <Popup>
                  <strong>{p.name}</strong><br />{p.note}
                  {p.drive && <><br /><span style={{ opacity: .7 }}>{p.drive} from Saltlight</span></>}
                </Popup>
              </Marker>
            ))}
            <FlyTo place={active} markers={markers} />
          </MapContainer>
        </div>

        <ul className="list-none m-0 p-0 border-t border-current/25" aria-label="Nearby places">
          {places.map((p) => (
            <li key={p.id} className="border-b border-current/25">
              <button
                onClick={() => setActiveId(p.id)}
                aria-pressed={p.id === activeId}
                className="w-full text-left py-4 flex items-baseline justify-between gap-4 cursor-pointer transition-opacity"
                style={{ opacity: p.id === activeId ? 1 : 0.6 }}
              >
                <span>
                  <span className="block text-[18px] font-medium">{p.name}</span>
                  <span className="block text-[15px] muted">{p.note}</span>
                </span>
                <span className="tabular-nums whitespace-nowrap text-[15px]">{p.drive ?? 'Home'}</span>
              </button>
            </li>
          ))}
          <li className="pt-6">
            <a className="link" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${home.pos.join(',')}`}>
              Get directions in Google Maps
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

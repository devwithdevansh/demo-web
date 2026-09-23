// ─────────────────────────────────────────────────────────────
// Every service, price, studio, image, video and review lives here.
// Images hotlink from Unsplash out of the box. After downloading them
// (see MEDIA.md) into /public/media, set USE_LOCAL = true.
// Videos load from /public/media/video — until you add them, the
// poster image is shown, so nothing breaks.
// ─────────────────────────────────────────────────────────────

export const USE_LOCAL = false;

export const BRAND = 'Kavach';
export const TAGLINE = 'Car Detailing & Paint Protection Studio';
export const WHATSAPP_NUMBER = '919687629341'; // country code + number, no "+"
export const PHONE_DISPLAY = '+91 96876 29341';
export const EMAIL = 'studio@kavach.in';
export const INSTAGRAM = 'https://instagram.com';

const U = (id, w = 2000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
const img = (id, local, w) => ({ remote: U(id, w), local: `/media/images/${local}` });
export const src = (m) => (USE_LOCAL ? m.local : m.remote);

export const media = {
  // Hero: shown twice (a desaturated "dusty" layer over a clean one), masked
  // into an ellipse so it floats on the dark backdrop like a product shot.
  // The dust wipe clip-reveals the clean layer as you scroll.
  hero: img('photo-1520340356584-f9917d1eea6f', 'hero-car.jpg', 2400),
  // Optional: a real transparent PNG car cutout, local-only (Unsplash has no
  // alpha channel to give us). Drop one in and the hero uses it directly,
  // full quality, instead of the masked-photo approximation above.
  heroCutout: '/media/images/hero-car-cutout.png',
  beforeAfter: img('photo-1611820972863-59eaff523aba', 'before-after.jpg', 1800),
  beadingPoster: img('photo-1607860108855-64acf2078ed9', 'beading-poster.jpg', 2400),
  beadingVideo: '/media/video/water-sheeting.mp4',
  foamGrey: img('photo-1633014041037-f5446fb4ce99', 'foam-wash.jpg', 1400),
  foamSports: img('photo-1608506375591-b90e1f955e4b', 'foam-sports-car.jpg', 1600),
  interior: img('photo-1605437241278-c1806d14a4d9', 'interior.jpg', 1400),
  polisher: img('photo-1620584898989-d39f7f9ed1b7', 'paint-correction.jpg', 1400),
  polishVideo: '/media/video/paint-correction.mp4',
  wax: img('photo-1708805282706-f44730b7e527', 'ceramic-coating.jpg', 1400),
  microfibre: img('photo-1732357624591-f2137085659b', 'ppf-wrap.jpg', 1400),
  steering: img('photo-1620584899131-a5ff5f8fbb03', 'steering.jpg', 1400),
  tireBrush: img('photo-1708805282683-50a060eba80f', 'tire-brush.jpg', 1400),
  wheelWash: img('photo-1565689876697-e467b6c54da2', 'wheel-wash.jpg', 1400),
  wetTire: img('photo-1708805283017-c662be2c7a44', 'wet-tire.jpg', 1400),
  sponge: img('photo-1694678505383-676d78ea3b96', 'handover.jpg', 1400),
};

export const sizes = ['Hatchback', 'Sedan', 'SUV', 'Luxury'];

// price per size, in the same order as `sizes`
export const services = [
  {
    name: 'Signature wash & decon',
    time: '3 hours',
    prices: [1499, 1899, 2499, 3499],
    body: 'Snow foam, two-bucket hand wash, iron and tar removal, clay bar. The base every other service starts from.',
    includes: ['Wheel faces and arches', 'Door and boot jambs', 'Spray sealant, 4 weeks'],
    image: media.foamGrey,
  },
  {
    name: 'Interior deep clean',
    time: '5 hours',
    prices: [2999, 3499, 4499, 5999],
    body: 'Seats and carpets shampooed and hot-water extracted, roof liner and vents steamed, leather cleaned and conditioned.',
    includes: ['Seat and carpet extraction', 'Leather care', 'Odour and UV treatment'],
    image: media.interior,
  },
  {
    name: 'Paint correction',
    time: '1 to 2 days',
    prices: [8999, 11999, 14999, 19999],
    body: 'Machine compounding and polishing over swirls, wash marks and light scratches. Paint depth is measured before and after every panel.',
    includes: ['Paint depth mapping', 'Two-stage machine polish', 'Before / after photo report'],
    image: media.polisher,
  },
  {
    name: 'Ceramic coating, 9H',
    time: '2 days',
    prices: [17999, 21999, 26999, 34999],
    body: 'Correction plus a 9H ceramic layer on paint, glass, wheels and trim. Water beads and rolls, dust rinses off in seconds.',
    includes: ['Includes paint correction', '3-year warranty', 'Free inspection at 6 months'],
    image: media.wax,
  },
  {
    name: 'Graphene coating',
    time: '2 to 3 days',
    prices: [26999, 32999, 39999, 49999],
    body: 'A graphene-infused topcoat over ceramic for extra hydrophobicity, heat resistance and a deeper, wetter shine that lasts longer in the sun.',
    includes: ['Includes paint correction', '5-year warranty', 'Priority slot for top-ups'],
    image: media.beadingPoster,
  },
  {
    name: 'Paint protection film',
    time: '3 to 4 days',
    prices: [64999, 79999, 94999, 129999],
    body: 'Self-healing TPU film over the full body. Stone chips, key marks and bird droppings stay on the film, not on your paint.',
    includes: ['Full body, gloss or matte', '10-year warranty', 'Edges wrapped by hand, no cuts on panel lines'],
    image: media.microfibre,
  },
];

// Real sequence, so numbering is meaningful here.
export const steps = [
  { title: 'Inspect under lights', body: 'Every car is walked around under swirl-finder lights with a paint-depth gauge, and we agree in writing on what will be fixed.', image: media.hero },
  { title: 'Wash and decontaminate', body: 'Foam, two-bucket hand wash, iron remover, clay. Nothing stuck to the paint reaches a machine pad.', image: media.foamSports },
  { title: 'Correct', body: 'Compound and polish panel by panel until the swirls are gone. This is where most of the hours go, on any coating job.', image: media.polisher, video: media.polishVideo },
  { title: 'Protect', body: 'Ceramic, graphene or film goes on in a dust-controlled bay and cures under lamps overnight.', image: media.wax },
  { title: 'Quality check & handover', body: 'You see the car under the same lights you saw it in on day one, plus a written report and aftercare notes on WhatsApp.', image: media.sponge },
];

export const work = [
  { car: 'Fortuner, pearl white', tag: 'Ceramic', image: media.hero },
  { car: 'Creta, wheels refinished', tag: 'Wheels', image: media.wheelWash },
  { car: 'City, swirl removal', tag: 'Correction', image: media.polisher },
  { car: 'XUV700, full PPF', tag: 'PPF', image: media.microfibre },
  { car: 'Thar, cabin reset', tag: 'Interior', image: media.interior },
  { car: 'Nexon, tyre and arch detail', tag: 'Wheels', image: media.tireBrush },
  { car: 'Verna, one-step polish', tag: 'Correction', image: media.foamSports },
  { car: 'Seltos, graphene coat', tag: 'Ceramic', image: media.steering },
];
export const workTags = ['All', 'Ceramic', 'PPF', 'Correction', 'Wheels', 'Interior'];

// ── Studios ──────────────────────────────────────────────────
// Coordinates are approximate for the area named — confirm the exact pin
// for each studio before launch. Hours are 24h "HH:MM"; `days` is 0=Sun..6=Sat.
export const studios = [
  {
    id: 'ahmedabad',
    name: 'Kavach Studio — SG Highway, Ahmedabad',
    city: 'Ahmedabad',
    area: 'SG Highway',
    address: ['Shed 4, Iscon Cross Road', 'SG Highway, Ahmedabad, Gujarat 380054'],
    pos: [23.0300, 72.5100],
    phone: '+91 98765 43210',
    whatsapp: '919876543210',
    rating: 4.9,
    reviewCount: 412,
    hours: { open: '10:00', close: '19:00', days: [1, 2, 3, 4, 5, 6] },
  },
  {
    id: 'surat',
    name: 'Kavach Studio — Adajan, Surat',
    city: 'Surat',
    area: 'Adajan',
    address: ['Devbhumi Complex, Nr. Yogi Complex', 'Below Sardar Bridge, Adajan, Surat, Gujarat 395009'],
    pos: [21.1959, 72.7735],
    phone: '+91 98765 11223',
    whatsapp: '919876511223',
    rating: 4.9,
    reviewCount: 334,
    hours: { open: '10:00', close: '19:00', days: [1, 2, 3, 4, 5, 6] },
  },
  {
    id: 'vadodara',
    name: 'Kavach Studio — Alkapuri, Vadodara',
    city: 'Vadodara',
    area: 'Alkapuri',
    address: ['2nd Floor, Siddharth Complex', 'RC Dutt Road, Alkapuri, Vadodara, Gujarat 390007'],
    pos: [22.3100, 73.1700],
    phone: '+91 98765 99887',
    whatsapp: '919876599887',
    rating: 4.8,
    reviewCount: 216,
    hours: { open: '10:30', close: '19:30', days: [1, 2, 3, 4, 5, 6] },
  },
];

export const reviews = [
  { quote: 'Dropped my Creta at 9, picked it up at 6 and it looked better than the showroom delivery. Coating still beading water eight months on.', by: 'Harsh P.', studio: 'Ahmedabad', rating: 5 },
  { quote: 'They showed me the paint-depth readings before and after. First studio that explained anything instead of just quoting a package.', by: 'Nidhi V.', studio: 'Surat', rating: 5 },
  { quote: 'Six months after the graphene coat, the car still comes out of the wash bucket looking wet-waxed. Worth every rupee.', by: 'Rakesh J.', studio: 'Vadodara', rating: 5 },
  { quote: 'Full-body PPF, zero visible seams on the bumper. Two stone chips already stopped a bad scratch from happening.', by: 'Ananya S.', studio: 'Ahmedabad', rating: 5 },
  { quote: 'Interior detail took the new-car smell back after three years of two dogs and one toddler. Genuinely didn’t think that was possible.', by: 'Farhan Q.', studio: 'Surat', rating: 4 },
];

export const trust = [
  { value: '9H', label: 'Ceramic hardness' },
  { value: '10 yr', label: 'PPF warranty' },
  { value: '3', label: 'Studios in Gujarat' },
  { value: '4.9', label: 'Average rating' },
];

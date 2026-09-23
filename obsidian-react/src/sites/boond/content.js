// ─────────────────────────────────────────────────────────────
// Every service, price, image, video, place and contact lives here.
// Images load from Unsplash out of the box. After downloading them
// (see MEDIA.md) into /public/media, set USE_LOCAL = true.
// Videos load from /public/media/video — until you add them, the
// poster image is shown, so nothing breaks.
// ─────────────────────────────────────────────────────────────

export const USE_LOCAL = false;

export const BRAND = 'Boond';
export const WHATSAPP_NUMBER = '919999999999'; // country code + number, no "+"
export const PHONE_DISPLAY = '+91 99999 99999';
export const EMAIL = 'hello@boond.in';
export const ADDRESS = ['Shed 14, Kalawad Road', 'Rajkot, Gujarat 360005'];
export const HOURS = 'Mon to Sat, 9 am to 8 pm. Sunday by appointment.';

const U = (id, w = 2000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
const img = (id, local, w) => ({ remote: U(id, w), local: `/media/images/${local}` });
export const src = (m) => (USE_LOCAL ? m.local : m.remote);

export const media = {
  hero: img('photo-1619431856706-ca2cc58258f6', 'hero-car.jpg', 2400),
  beadingPoster: img('photo-1607860108855-64acf2078ed9', 'beading-poster.jpg', 2400),
  beadingVideo: '/media/video/water-beading.mp4',
  foam: img('photo-1608506375591-b90e1f955e4b', 'foam-sports-car.jpg', 1600),
  foamGrey: img('photo-1633014041037-f5446fb4ce99', 'foam-grey-car.jpg', 1400),
  polisher: img('photo-1620584898989-d39f7f9ed1b7', 'polisher.jpg', 1400),
  wax: img('photo-1708805282706-f44730b7e527', 'waxing.jpg', 1400),
  interior: img('photo-1605437241278-c1806d14a4d9', 'interior.jpg', 1400),
  steering: img('photo-1620584899131-a5ff5f8fbb03', 'steering.jpg', 1400),
  tireBrush: img('photo-1708805282683-50a060eba80f', 'tire-brush.jpg', 1400),
  wheelWash: img('photo-1565689876697-e467b6c54da2', 'wheel-wash.jpg', 1400),
  wetTire: img('photo-1708805283017-c662be2c7a44', 'wet-tire.jpg', 1400),
  cloth: img('photo-1732357624591-f2137085659b', 'microfibre.jpg', 1400),
  sponge: img('photo-1694678505383-676d78ea3b96', 'sponge-wash.jpg', 1400),
  blackCar: img('photo-1520340356584-f9917d1eea6f', 'black-car.jpg', 1400),
  processVideo: '/media/video/polishing.mp4',
};

export const sizes = ['Hatchback', 'Sedan', 'SUV'];

// price per size, in the same order as `sizes`
export const services = [
  {
    name: 'Foam wash and decon',
    time: '3 hours',
    prices: [1499, 1899, 2499],
    body: 'Snow foam, two-bucket hand wash, iron remover and clay bar. The paint comes out smooth to the touch, ready for wax or coating.',
    includes: ['Wheel faces and arches', 'Door jambs', 'Spray sealant, 1 month'],
    image: media.foamGrey,
  },
  {
    name: 'Interior deep clean',
    time: '5 hours',
    prices: [2999, 3499, 4499],
    body: 'Seats shampooed and hot-water extracted, roof liner and vents steamed, leather cleaned and conditioned. Smells like nothing at all.',
    includes: ['Seat and carpet extraction', 'Leather care', 'Odour treatment'],
    image: media.interior,
  },
  {
    name: 'Paint correction',
    time: '1 to 2 days',
    prices: [8999, 11999, 14999],
    body: 'Machine compounding and polishing to remove swirls, wash marks and light scratches. We measure paint thickness before every pass.',
    includes: ['Paint depth reading', 'Two-stage polish', 'Before and after photos'],
    image: media.polisher,
  },
  {
    name: 'Ceramic coating',
    time: '2 days',
    prices: [17999, 21999, 26999],
    body: 'Correction plus a 9H ceramic layer on paint, glass, wheels and trim. Water beads off, dust rinses off, and it keeps its gloss for years.',
    includes: ['Includes paint correction', '3-year warranty', 'Free check-up at 6 months'],
    image: media.wax,
  },
  {
    name: 'Paint protection film',
    time: '3 to 4 days',
    prices: [64999, 79999, 94999],
    body: 'Self-healing TPU film over the full body. Stone chips, key marks and bird droppings stay on the film, not your paint.',
    includes: ['Full body, gloss or matte', '10-year warranty', 'Edges wrapped by hand'],
    image: media.cloth,
  },
];

// Real sequence, so numbering is meaningful here.
export const steps = [
  { title: 'Inspect under lights', body: 'We walk around the car with you under swirl-finder lights and a paint gauge, and agree on what we will fix.', image: media.blackCar },
  { title: 'Wash and decontaminate', body: 'Foam, hand wash, iron remover, clay. Everything stuck to the paint comes off before a machine touches it.', image: media.foam },
  { title: 'Correct', body: 'Compound and polish panel by panel until the swirls are gone. This is where most of the hours go.', image: media.polisher, video: '/media/video/polishing.mp4' },
  { title: 'Protect', body: 'Ceramic, film or sealant goes on in a dust-controlled bay and cures overnight.', image: media.wax },
  { title: 'Hand over', body: 'You see it under the same lights you saw it in on day one. Then we send you aftercare tips on WhatsApp.', image: media.sponge },
];

export const work = [
  { car: 'Fortuner, pearl white', tag: 'Ceramic', image: media.hero },
  { car: 'Creta, wheels refinished', tag: 'Wheels', image: media.wheelWash },
  { car: 'City, swirl removal', tag: 'Correction', image: media.polisher },
  { car: 'XUV700, cabin reset', tag: 'Interior', image: media.interior },
  { car: 'Thar, full foam', tag: 'Ceramic', image: media.foam },
  { car: 'Nexon, tyre and arch', tag: 'Wheels', image: media.tireBrush },
  { car: 'Verna, one-step polish', tag: 'Correction', image: media.cloth },
  { car: 'Seltos, steering and leather', tag: 'Interior', image: media.steering },
];
export const workTags = ['All', 'Ceramic', 'Correction', 'Interior', 'Wheels'];

// Coordinates are approximate — confirm the real studio pin before launch.
export const studio = { name: BRAND, pos: [22.2856, 70.7727] };
export const PICKUP_RADIUS_KM = 8;
export const landmarks = [
  { name: 'Race Course', pos: [22.3006, 70.7982], inside: true },
  { name: 'Kalawad Road', pos: [22.2765, 70.7612], inside: true },
  { name: '150 Ft Ring Road', pos: [22.2893, 70.7545], inside: true },
  { name: 'Rajkot airport (HIRASAR)', pos: [22.3778, 71.0357], inside: false },
];

export const reviews = [
  { quote: 'Picked up my Creta at 9, returned it at 7 and it looked better than the showroom delivery.', by: 'Harsh P., Kalawad Road' },
  { quote: 'They showed me the paint readings before and after. First detailer in Rajkot who explained anything.', by: 'Nidhi V., Race Course' },
  { quote: 'Six months after ceramic, the dust still rinses off with just water.', by: 'Rakesh J., University Road' },
];

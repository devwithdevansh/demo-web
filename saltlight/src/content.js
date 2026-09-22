// ─────────────────────────────────────────────────────────────
// Every image, video, room, place and contact lives here.
// Images load from Unsplash out of the box. Once you download them
// (see MEDIA.md), drop them in /public/media and set USE_LOCAL = true.
// Videos always load from /public/media/video — until you add them,
// the matching poster image is shown instead, so nothing breaks.
// ─────────────────────────────────────────────────────────────

export const USE_LOCAL = false;

export const WHATSAPP_NUMBER = '919999999999'; // country code + number, no "+"
export const EMAIL = 'stay@saltlight.in';

const U = (id, w = 2000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

const img = (id, local, w) => ({ remote: U(id, w), local: `/media/images/${local}` });
export const src = (m) => (USE_LOCAL ? m.local : m.remote);

export const media = {
  heroPoster: img('photo-1628265036737-eb481ccf95bd', 'hero-poster.jpg', 2400),
  heroVideo: '/media/video/hero-saltflat.mp4',

  sunrise: img('photo-1664150543913-66f20bf84ba9', 'day-sunrise.jpg'),
  noon: img('photo-1628265512314-a9464859fe0c', 'day-noon.jpg'),
  dusk: img('photo-1690786648154-bc52fe4f642d', 'day-dusk.jpg'),
  duskVideo: '/media/video/dusk-timelapse.mp4',
  nightVideo: '/media/video/night-stars.mp4',

  roomBhunga: img('photo-1660733617811-3d905e6c37c4', 'room-bhunga.jpg', 1400),
  roomMirror: img('photo-1549472899-1ed757265f81', 'room-mirror.jpg', 1400),
  roomSky: img('photo-1670688599212-737088d7bbd5', 'room-sky.jpg', 1400),

  craftLantern: img('photo-1604216958967-ee0ec1dd9b64', 'craft-lantern.jpg', 1400),
  craftCart: img('photo-1669015881702-951de590db31', 'craft-cart.jpg', 1400),
  craftCamels: img('photo-1710305983691-a3bd5e078da6', 'craft-camels.jpg', 1400),
  craftVideo: '/media/video/craft-hands.mp4',

  footer: img('photo-1670406312373-6d4d1776e4aa', 'footer-walk.jpg', 2400),
};

export const day = [
  {
    time: '06:40',
    title: 'Walk out before the sun',
    body: 'The salt is still cold and blue. We leave a flask of kahwa at your door and a lantern for the first kilometre.',
    image: media.sunrise,
    tone: { bg: '#E9ECEA', fg: '#1B2244' },
  },
  {
    time: '12:30',
    title: 'Noon is for shade',
    body: 'The crust glares white at midday. Lunch is bajra rotla and kadhi under the courtyard neem, then a long nap.',
    image: media.noon,
    tone: { bg: '#DCD2C0', fg: '#2A2233' },
  },
  {
    time: '18:10',
    title: 'Sunset from the edge',
    body: 'A camel cart takes you two kilometres onto the Rann. The horizon disappears and the sky does all the work.',
    image: media.dusk,
    video: media.duskVideo,
    tone: { bg: '#A2352A', fg: '#F3E9E1' },
  },
  {
    time: '22:00',
    title: 'Moonrise on the salt',
    body: 'On full-moon nights the whole desert lights up. We switch off every bulb on the property so you can see it properly.',
    night: true,
    video: media.nightVideo,
    tone: { bg: '#0F1430', fg: '#E9ECEA' },
  },
];

export const rooms = [
  {
    name: 'Mud bhunga',
    detail: 'Round, cool, thick-walled. Sleeps two.',
    price: '₹9,800',
    image: media.roomBhunga,
  },
  {
    name: 'Mirror bhunga',
    detail: 'Hand-set mirror work by Hodka artisans. Sleeps three.',
    price: '₹13,500',
    image: media.roomMirror,
  },
  {
    name: 'Sky tent',
    detail: 'Canvas roof that rolls back for the stars. Sleeps two.',
    price: '₹11,200',
    image: media.roomSky,
  },
];

export const crafts = [
  {
    village: 'Hodka',
    craft: 'Mirror embroidery',
    body: 'Women from twelve families stitch the cushions, hangings and bedcovers in every room. You can visit the workshop on any morning.',
    image: media.craftLantern,
  },
  {
    village: 'Bhirandiyara',
    craft: 'Mawa sweets',
    body: 'The milk-fudge stop on the road in. Our driver will insist on it, and he is right.',
    image: media.craftCart,
  },
  {
    village: 'Dhordo',
    craft: 'Camel herding',
    body: 'Maldhari herders run the camel carts and the sunset rides. Every ride fee goes straight to the family.',
    image: media.craftCamels,
  },
];

// Coordinates are approximate — confirm the real property pin before launch.
export const places = [
  { id: 'saltlight', name: 'Saltlight', note: 'You are here', drive: null, pos: [23.826, 69.672], home: true },
  { id: 'rann', name: 'White Rann viewpoint', note: 'Sunrise and moonrise walks', drive: '10 min', pos: [23.868, 69.655] },
  { id: 'hodka', name: 'Hodka village', note: 'Mirror embroidery workshops', drive: '20 min', pos: [23.735, 69.724] },
  { id: 'kala', name: 'Kala Dungar', note: 'Highest point in Kutch, best sunset', drive: '50 min', pos: [23.917, 69.826] },
  { id: 'bhirandiyara', name: 'Bhirandiyara', note: 'Mawa sweets on the road in', drive: '25 min', pos: [23.63, 69.69] },
  { id: 'bhuj', name: 'Bhuj airport', note: 'Pickup included', drive: '1 h 40 min', pos: [23.2878, 69.6702] },
  { id: 'dholavira', name: 'Dholavira', note: 'Harappan city, day trip', drive: '4 h', pos: [23.8871, 70.213] },
];

export const notes = [
  { quote: 'We came for the full moon and ended up staying for the silence. The mirror bhunga is ridiculous in the best way.', by: 'Aarti and Kunal, Ahmedabad' },
  { quote: 'The sunset cart ride was the single best hour of our trip across Gujarat.', by: 'Meera S., Pune' },
  { quote: 'Switching off every light for moonrise sounds like a gimmick. It is not.', by: 'Tom H., London' },
];

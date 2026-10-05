/**
 * SAMPLE GYM
 * ----------
 * The fictional gym used across the demos. Every detail here is invented;
 * swap these values to preview a real gym's name, plans and timings.
 */

/** The 379 hero frames are the only local media. Photos reuse stills from the same clip. */
export const FRAME_COUNT = 379;
export const framePath = (i: number) => `/frames/frame_${String(i).padStart(4, '0')}.jpg`;

export const sampleGym = {
  name: 'Ironpeak Fitness',
  wordmark: 'IRONPEAK',
  tagline: 'Strength. Discipline. Community.',
  address: ['2nd Floor, Sample Arcade', 'Demo Road, Sample City 000000'],
  phone: '+91 00000 00000',
  email: 'hello@ironpeak.example',
  timings: [
    { days: 'Monday to Saturday', hours: '5:30 AM to 10:30 PM' },
    { days: 'Sunday', hours: '7:00 AM to 1:00 PM' },
  ],
  about:
    'Ironpeak is a neighbourhood strength and conditioning gym. Train on your own, join a class, or work one-to-one with a coach.',
  facilities: [
    { name: 'Free Weight Floor', detail: 'Dumbbells to 50 kg, six benches and plenty of room to move.' },
    { name: 'Power Racks', detail: 'Four racks with platforms for squats, presses and deadlifts.' },
    { name: 'Cardio Deck', detail: 'Treadmills, bikes and rowers facing the windows.' },
    { name: 'Functional Zone', detail: 'Turf lane, sleds, kettlebells and battle ropes.' },
    { name: 'Group Studio', detail: 'Yoga, mobility and HIIT classes through the week.' },
    { name: 'Lockers & Showers', detail: 'Daily-use lockers and clean changing rooms.' },
  ],
  plans: [
    { name: 'Basic', monthly: 1499, yearly: 14990, features: ['Gym floor access', 'Standard equipment', 'Locker access'], highlight: false },
    { name: 'Pro', monthly: 2999, yearly: 29990, features: ['Everything in Basic', 'All group classes', 'Recovery zone access'], highlight: false },
    { name: 'Elite', monthly: 5499, yearly: 54990, features: ['Everything in Pro', 'Dedicated trainer access', 'Priority booking', 'Monthly progress review'], highlight: true },
  ],
  trainers: [
    { name: 'Alex Rey', role: 'Strength Coach', focus: 'Barbell lifting and strength programmes' },
    { name: 'Priya Nair', role: 'Fitness Coach', focus: 'Fat loss and general fitness' },
    { name: 'Rahul Mehta', role: 'Performance Coach', focus: 'Boxing, CrossFit and sport conditioning' },
    { name: 'Sara Kade', role: 'Conditioning Coach', focus: 'Mobility, yoga and beginners' },
  ],
  // Stills from the hero clip, cropped differently so the gallery has some variety.
  gallery: [
    { frame: 379, position: '50% 50%', caption: 'Bench press station' },
    { frame: 90, position: '85% 60%', caption: 'Loaded and ready' },
    { frame: 1, position: '15% 30%', caption: 'Free weight floor' },
    { frame: 180, position: '60% 40%', caption: 'Morning session' },
    { frame: 270, position: '30% 55%', caption: 'Under the bar' },
  ],
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

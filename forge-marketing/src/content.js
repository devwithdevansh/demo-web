/*
 * FORGE MARKETING CONTENT
 * -----------------------
 * Prices, package wording, optional modules and the demo link live here, so a
 * change is made once and shows up on the flyer, brochure, stories and post.
 * After editing, run "npm run export" in the forge-marketing folder.
 *
 * Headlines and layout are in the .html files next to this one.
 */
window.FORGE = {
  brand: {
    name: 'FORGE',
    by: 'by DevWithDevansh',
    place: 'Rajkot, Gujarat',
  },

  // The live demo. The QR code on the materials is generated from this address.
  demoUrl: 'https://demo-web-forge-gym.onrender.com/',
  demoUrlShort: 'demo-web-forge-gym.onrender.com',
  showQr: true,

  // Left empty on purpose: no phone number or email has been confirmed for print.
  // Fill it in (for example "WhatsApp: 9xxxx xxxxx") and it appears next to every call to action.
  contactLine: '',

  cta: 'Message us to see how FORGE could fit your gym.',
  pricingNote: 'Proposed pricing; final scope and third-party charges may vary.',
  demoNote: 'Demo screens show a sample gym with sample data.',

  packages: {
    essential: {
      name: 'Essential',
      line: 'Get Found Online',
      price: '₹999',
      forWho: 'For gyms that need a professional online presence.',
      includesLabel: 'What you get',
      includes: [
        'Simple, mobile-friendly gym website for one location',
        'Gym details, timings, facilities, trainers and membership information',
        'Enquiry form and contact / WhatsApp links',
        'Initial photo and short-video shoot for the website launch, as per agreed scope',
      ],
      short: ['Mobile-friendly gym website', 'Timings, facilities, trainers, plans', 'Enquiry form + WhatsApp link', 'Launch photo and video shoot (agreed scope)'],
    },
    growth: {
      name: 'Growth',
      line: 'Run Your Gym',
      price: '₹2,499',
      forWho: 'For gyms that want to organise everyday operations.',
      includesLabel: 'Everything in Essential, plus',
      includes: [
        'Member and membership records',
        'Membership plans and expiry tracking',
        'Front-desk and QR check-in',
        'Payment records and due tracking',
        'Renewal and lead follow-up',
        'Daily owner view and basic reports',
      ],
      short: ['Members, plans and expiry dates', 'Front-desk and QR check-in', 'Payments and dues', 'Renewal and lead follow-up', 'Daily owner view and reports'],
    },
    performance: {
      name: 'Performance',
      line: 'Coach & Retain',
      price: '₹4,499',
      forWho: 'For gyms that want to improve the trainer and member experience.',
      includesLabel: 'Everything in Growth, plus',
      includes: [
        'Trainer dashboard',
        'Member web portal with membership plan and timetable',
        'Workout plan and training-video links',
        'Progress notes and measurements',
        'Personal-training session tracking',
        'Staff-managed diet guidance',
      ],
      short: ['Trainer dashboard', 'Member web portal', 'Workout plans with video links', 'Progress notes and measurements', 'PT session tracking', 'Staff-managed diet guidance'],
    },
  },

  // status is one of: Optional, Preview, Custom scope
  modules: [
    { name: 'WhatsApp notifications', status: 'Optional', note: 'Availability, message types and setup are confirmed for your gym. WhatsApp message charges are separate.', short: 'Setup and message charges are confirmed for your gym.' },
    { name: 'UPI payment links', status: 'Optional', note: 'Payment provider and transaction charges may apply.', short: 'Provider and transaction charges may apply.' },
    { name: 'UPI Autopay', status: 'Preview', note: 'Planned pilot. Not generally available yet.', short: 'Planned pilot.' },
    { name: 'Trainer Plus', status: 'Preview', note: 'Planned pilot. Not generally available yet.', short: 'Planned pilot.' },
    { name: 'Additional locations', status: 'Custom scope', note: 'Contact us.' },
    { name: 'Extra shoots, content changes, integrations, custom workflows', status: 'Custom scope', note: 'Available after scope confirmation.' },
  ],
};

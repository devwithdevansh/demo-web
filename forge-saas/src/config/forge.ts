/**
 * FORGE PRODUCT CONFIG
 * --------------------
 * Package copy, proposed pricing, add-ons and contact details live here so
 * they can be changed without touching any page. Prices are proposals, not
 * confirmed pricing, and every screen that shows them says so.
 */

export type PackageKey = 'essential' | 'growth' | 'performance';
export type Readiness = 'Available in demo' | 'Preview' | 'Coming soon';

export const PRICING_NOTE = 'Proposed pricing, shown for discussion. Final pricing is confirmed before you sign up.';
export const FEES_NOTE =
  'WhatsApp and payment providers charge their own fees. Those are billed by the provider and are separate from your FORGE subscription.';

export const CONTACT = {
  email: 'devwithdevansh@gmail.com',
  subject: 'FORGE walkthrough for my gym',
  body: 'Hi,\n\nI looked at the FORGE demo and would like a walkthrough for my gym.\n\nGym name:\nCity:\nPackage I am interested in:\n',
};
export const contactHref = `mailto:${CONTACT.email}?subject=${encodeURIComponent(CONTACT.subject)}&body=${encodeURIComponent(CONTACT.body)}`;

export interface ForgePackage {
  key: PackageKey;
  name: string;
  line: string;
  promise: string;
  summary: string;
  suits: string;
  /** Proposed monthly price in rupees. Change here only. */
  pricePerMonth: number;
  includes: string[];
  route: string;
}

export const PACKAGES: ForgePackage[] = [
  {
    key: 'essential',
    name: 'Essential',
    line: 'Get Found Online',
    promise: 'Build your online presence',
    summary: 'A website for your gym that looks sharp on a phone and makes it easy for people to enquire.',
    suits: 'Gyms that mainly need to be found, look professional and get enquiries.',
    pricePerMonth: 999,
    includes: [
      'Your own gym website',
      'Plans, trainers, photos and video',
      'Location, timings and contact details',
      'Enquiry form and WhatsApp button',
      'Looks right on every phone',
    ],
    route: '/demo/essential',
  },
  {
    key: 'growth',
    name: 'Growth',
    line: 'Run Your Gym',
    promise: 'Organise gym operations',
    summary: 'Members, fees, attendance and enquiries in one place instead of registers and spreadsheets.',
    suits: 'Gyms with a front desk, where the owner wants a clear picture of each day.',
    pricePerMonth: 2499,
    includes: [
      'Everything in Essential',
      'Members, plans and expiry dates',
      'Front-desk and QR check-in',
      'Payments and dues tracking',
      'Renewal list and lead follow-up dates',
      'Daily owner view and basic reports',
    ],
    route: '/demo/growth',
  },
  {
    key: 'performance',
    name: 'Performance',
    line: 'Coach & Retain',
    promise: 'Connect trainers and members',
    summary: 'Trainers and members get their own login for workout plans, progress and PT sessions.',
    suits: 'Gyms with personal training and a coaching team.',
    pricePerMonth: 4499,
    includes: [
      'Everything in Growth',
      'Trainer dashboard with daily tasks',
      'Member portal with plan and timetable',
      'Workout plans with video links',
      'Progress notes and measurements',
      'PT session tracking and staff diet guidance',
    ],
    route: '/demo/performance',
  },
];

export const packageByKey = (key: PackageKey) => PACKAGES.find((p) => p.key === key)!;

export type AddonKey = 'whatsapp' | 'upiLinks' | 'autopay' | 'leadFollowup' | 'trainerPlus' | 'multiBranch';

export interface ForgeAddon {
  key: AddonKey;
  name: string;
  does: string;
  extends: PackageKey[];
  readiness: Readiness;
  /** What the demo actually does, stated plainly. */
  demoNote: string;
  thirdParty?: string;
}

export const ADDONS: ForgeAddon[] = [
  {
    key: 'whatsapp',
    name: 'WhatsApp notifications',
    does: 'Send renewal, dues and welcome messages from the member list using ready-made templates.',
    extends: ['growth', 'performance'],
    readiness: 'Available in demo',
    demoNote: 'With WhatsApp connected, demo messages are delivered to the presenter\u2019s demo phone only. Otherwise the message is drafted and logged as simulated.',
    thirdParty: 'WhatsApp provider charges per message.',
  },
  {
    key: 'upiLinks',
    name: 'UPI payment links',
    does: 'Create a payment link for a member’s dues and see it marked paid in the fee records.',
    extends: ['growth', 'performance'],
    readiness: 'Available in demo',
    demoNote: 'With a payment gateway in test mode, the link takes a real test payment. Otherwise it opens a practice page. No real money moves either way.',
    thirdParty: 'Payment gateway charges per transaction.',
  },
  {
    key: 'autopay',
    name: 'UPI Autopay',
    does: 'Members approve a recurring payment for their plan, and can pause or cancel it themselves at any time.',
    extends: ['growth', 'performance'],
    readiness: 'Preview',
    demoNote: 'The demo shows the request, member approval, pause and cancel steps. No mandate is created and nothing is charged.',
    thirdParty: 'Payment gateway charges per mandate and per collection.',
  },
  {
    key: 'leadFollowup',
    name: 'Lead follow-up',
    does: 'A follow-up queue for enquiries with a ready message draft for each one.',
    extends: ['growth', 'performance'],
    readiness: 'Available in demo',
    demoNote: 'The queue and drafts work in the demo. Sending a draft uses WhatsApp notifications.',
  },
  {
    key: 'trainerPlus',
    name: 'Trainer Plus',
    does: 'Ready-made workout templates that a trainer can apply to a member and then adjust.',
    extends: ['performance'],
    readiness: 'Preview',
    demoNote: 'Three sample templates are available in the trainer’s plan editor.',
  },
  {
    key: 'multiBranch',
    name: 'Additional location',
    does: 'Run more than one branch under a single owner login, with records kept separately for each branch.',
    extends: ['growth', 'performance'],
    readiness: 'Coming soon',
    demoNote: 'Not in the demo yet.',
  },
];

export const inr = (amount: number) => `₹${Math.round(amount).toLocaleString('en-IN')}`;

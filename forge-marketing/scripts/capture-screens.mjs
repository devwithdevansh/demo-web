// Takes fresh phone-size screenshots of the live FORGE demo for use in the materials.
// The demo shows a fictional gym with sample data, and the materials say so.
// Usage: npm run screens            (optional: DEMO_URL=https://... npm run screens)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './browser.mjs';

const DEMO = (process.env.DEMO_URL || 'https://demo-web-forge-gym.onrender.com').replace(/\/+$/, '');
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'screens');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// name, path, text to wait for, and whether to bring the page heading to the top first
const SHOTS = [
  ['website', '/demo/essential', null, false],
  ['owner-today', '/demo/growth/owner', 'Checked in today', true],
  ['members', '/demo/growth/owner/members', 'IP-1001', true],
  ['attendance', '/demo/growth/owner/attendance', 'QR check-in', true],
  ['payments', '/demo/growth/owner/payments', 'Dues to collect', true],
  ['trainer', '/demo/performance/trainer', "Today's tasks", true],
  ['member-home', '/demo/performance/member', 'Membership', true],
  ['member-workout', '/demo/performance/member/workout', 'Monday', true],
  ['member-pass', '/demo/performance/member/pass', 'IP-1001', true],
];

const browser = await launch();
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

for (const [name, route, waitFor, toHeading] of SHOTS) {
  await page.goto(DEMO + route, { waitUntil: 'networkidle2', timeout: 120000 });
  if (waitFor) {
    await page.waitForFunction((t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()), { timeout: 120000 }, waitFor);
  } else {
    await sleep(3200); // the sample website's opening animation
  }
  if (toHeading) {
    // Start the picture at the screen's own heading, below the demo's navigation.
    await page.evaluate(() => {
      const h = document.querySelector('main h1');
      if (h) window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 76);
    });
  }
  await sleep(700);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log(`saved assets/screens/${name}.png`);
}
await browser.close();

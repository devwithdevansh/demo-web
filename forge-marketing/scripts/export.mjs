// Exports the designs in src/ to shareable files in export/.
// Usage: npm run export
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import QRCode from 'qrcode';
import { launch } from './browser.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (name) => pathToFileURL(path.join(root, 'src', name)).href;
const out = (...parts) => path.join(root, 'export', ...parts);

// ---- the QR code always matches the demo link in content.js ----
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(path.join(root, 'src', 'content.js'), 'utf8'), sandbox);
const content = sandbox.window.FORGE;
writeFileSync(
  path.join(root, 'assets', 'qr-demo.svg'),
  await QRCode.toString(content.demoUrl, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#0a0a0a', light: '#f1efe8' } }),
);

rmSync(out(), { recursive: true, force: true });
for (const dir of ['', 'brochure', 'stories']) mkdirSync(out(dir), { recursive: true });

const browser = await launch();
const warnings = [];

async function open(file, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(src(file), { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 300));

  // Layout check: nothing may spill outside its sheet, and no line of text may be cut off.
  const problems = await page.evaluate(() => {
    const found = [];
    document.querySelectorAll('.sheet').forEach((sheet, index) => {
      const box = sheet.getBoundingClientRect();
      sheet.querySelectorAll('*').forEach((el) => {
        if (el.closest('.photo, .shade, .phone, svg, .bleed') || !el.getClientRects().length) return;
        const r = el.getBoundingClientRect();
        const label = `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} "${(el.textContent || '').trim().slice(0, 30)}"`;
        if (r.right > box.right + 1 || r.bottom > box.bottom + 1 || r.left < box.left - 1 || r.top < box.top - 1) found.push(`sheet ${index + 1}: ${label} spills outside the sheet`);
        if (el.children.length === 0 && el.scrollWidth > el.clientWidth + 1) found.push(`sheet ${index + 1}: ${label} is clipped`);
        // Story cards keep a clear strip at the top and bottom, because WhatsApp covers those with its own controls.
        if (sheet.classList.contains('card')) {
          const style = getComputedStyle(sheet);
          if (r.bottom > box.bottom - parseFloat(style.paddingBottom) + 2 || r.top < box.top + parseFloat(style.paddingTop) - 2) found.push(`sheet ${index + 1}: ${label} runs into the strip WhatsApp covers`);
        }
      });
    });
    return found;
  });
  warnings.push(...problems.map((p) => `${file} · ${p}`));
  return page;
}

const pdf = (page, file) => page.pdf({ path: out(file), printBackground: true, preferCSSPageSize: true });

// ---- flyer ----
{
  const page = await open('flyer.html', { width: 900, height: 1250, deviceScaleFactor: 2.5 });
  await (await page.$('.sheet')).screenshot({ path: out('forge-flyer-a4.png') });
  await pdf(page, 'forge-flyer-a4.pdf');
  await page.close();
  console.log('flyer: PNG + PDF');
}

// ---- brochure ----
{
  const page = await open('brochure.html', { width: 900, height: 1250, deviceScaleFactor: 2 });
  const sheets = await page.$$('.sheet');
  for (const [i, sheet] of sheets.entries()) await sheet.screenshot({ path: out('brochure', `forge-brochure-page-${i + 1}.png`) });
  await pdf(page, 'forge-brochure.pdf');
  await page.close();
  console.log(`brochure: ${sheets.length} pages, PNG each + PDF`);
}

// ---- WhatsApp Status / story cards: exactly 1080 x 1920 ----
const storyFiles = [];
{
  const page = await open('stories.html', { width: 1160, height: 2000, deviceScaleFactor: 1 });
  const cards = await page.$$('.card');
  for (const [i, card] of cards.entries()) {
    const name = await card.evaluate((el) => el.dataset.name || 'card');
    const file = out('stories', `forge-story-${String(i + 1).padStart(2, '0')}-${name}.png`);
    await card.screenshot({ path: file });
    storyFiles.push(file);
  }
  await pdf(page, 'forge-stories.pdf');
  await page.close();
  console.log(`stories: ${cards.length} cards at 1080x1920, PNG each + combined PDF`);
}

// ---- square post: exactly 1080 x 1080 ----
{
  const page = await open('post.html', { width: 1160, height: 1160, deviceScaleFactor: 1 });
  await (await page.$('.sheet')).screenshot({ path: out('forge-post-1080.png') });
  await page.close();
  console.log('post: 1080x1080 PNG');
}

// ---- contact sheet of the story cards ----
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
  const cells = storyFiles.map((f, i) => `<figure><img src="data:image/png;base64,${readFileSync(f).toString('base64')}" /><figcaption>${String(i + 1).padStart(2, '0')} · ${path.basename(f).replace(/^forge-story-\d+-|\.png$/g, '')}</figcaption></figure>`).join('');
  await page.setContent(
    `<body style="margin:0;background:#1c1c1a;font:12px monospace;color:#c9c7bf"><div id="s" style="display:grid;grid-template-columns:repeat(4,1fr);gap:28px;padding:36px;width:1600px;box-sizing:border-box">${cells}</div>
     <style>figure{margin:0}img{width:100%;display:block}figcaption{padding-top:10px;letter-spacing:.1em;text-transform:uppercase}</style></body>`,
    { waitUntil: 'networkidle0' },
  );
  await (await page.$('#s')).screenshot({ path: out('forge-stories-contact-sheet.png') });
  await page.close();
  console.log('stories: contact sheet PNG');
}

await browser.close();
console.log(warnings.length ? `\nLayout warnings (${warnings.length}):\n${[...new Set(warnings)].join('\n')}` : '\nLayout check passed: nothing spills or is clipped.');
console.log(`\nDone. Files are in ${out()}`);

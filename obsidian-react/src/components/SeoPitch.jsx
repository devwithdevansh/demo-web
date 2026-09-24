import { useState } from 'react';
import { Check } from 'lucide-react';

// The yearly Google-visibility plan this whole section argues for. One
// constant so the price can change without hunting through the copy.
const PLAN_PRICE = 999;

// Rough cost-per-click for local-service searches in India (2026 agency
// benchmarks put local services around ₹10–60, busy metros higher). These
// are only starting points for the sliders -- the owner can drag to their
// own number while the pitch is being made.
const CITY_PRESETS = [
  { name: 'Smaller town', cpc: 15 },
  { name: 'Rajkot / Surat', cpc: 30 },
  { name: 'Ahmedabad / metro', cpc: 60 },
];

// Share of clicks on a local search results page, from BrightLocal /
// local-pack click studies. Rounded; kept here so the bars and the
// source line stay in sync.
const CLICK_SHARE = [
  { label: 'Google Maps top 3', value: 44, highlight: true },
  { label: 'Regular results', value: 29, highlight: true },
  { label: 'Paid ads', value: 20 },
];

const PLAN_ITEMS = [
  'Fast pages Google can actually read — not an empty JavaScript shell',
  'Title, description and schema for every page (address, hours, prices, rating)',
  'Google Business Profile set up, verified and linked to the site',
  'One page per service per city, e.g. “Ceramic coating in Rajkot”',
  'WhatsApp review link so every happy customer can leave a Google review',
  'Sitemap, robots.txt and Search Console, kept healthy all year',
];

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

// The business case for the sites above: a detailing studio can keep paying
// Google for every click, or own a spot in the results people actually
// click. Honest by design -- no rank guarantees (Google itself says nobody
// can promise #1), and the 3–6 month timeline is stated up front.
export default function SeoPitch() {
  const [cpc, setCpc] = useState(CITY_PRESETS[1].cpc);
  const [clicks, setClicks] = useState(10);

  const adsPerYear = cpc * clicks * 365;
  const saved = adsPerYear - PLAN_PRICE;
  const multiple = Math.round(adsPerYear / PLAN_PRICE);
  // Keep the plan bar visible even when the ads bar dwarfs it.
  const planWidth = Math.max((PLAN_PRICE / adsPerYear) * 100, 1.5);

  return (
    <section className="pb-[clamp(64px,10vw,110px)]">
      <div className="mb-[32px]">
        <p className="eyebrow mb-[14px]">Google visibility</p>
        <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.05] font-semibold max-w-[22ch] m-0">
          Ads are rent. A site that ranks is yours.
        </h2>
        <p className="mt-[14px] mb-0 max-w-[62ch] text-[14px] md:text-[15px] text-[var(--paper-dim)] leading-[1.6]">
          Google Ads charge you every time someone clicks — and the calls stop the day the budget
          does. A site built to rank keeps bringing people in from Google search and Maps, for{' '}
          {inr(PLAN_PRICE)} a year.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-[24px] items-start">
        {/* Calculator */}
        <div className="seo-card">
          <p className="eyebrow mb-[16px]">What ads would cost you</p>

          <div className="flex flex-wrap gap-[8px] mb-[22px]" role="group" aria-label="City presets">
            {CITY_PRESETS.map((c) => (
              <button
                key={c.name}
                type="button"
                className="seo-chip"
                aria-pressed={cpc === c.cpc}
                onClick={() => setCpc(c.cpc)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <label className="seo-slider">
            <span className="flex justify-between text-[13px] text-[var(--paper-dim)]">
              Cost per click <strong className="text-[var(--paper)]">{inr(cpc)}</strong>
            </span>
            <input type="range" min="10" max="150" step="5" value={cpc} onChange={(e) => setCpc(Number(e.target.value))} />
          </label>

          <label className="seo-slider">
            <span className="flex justify-between text-[13px] text-[var(--paper-dim)]">
              Clicks per day <strong className="text-[var(--paper)]">{clicks}</strong>
            </span>
            <input type="range" min="3" max="40" step="1" value={clicks} onChange={(e) => setClicks(Number(e.target.value))} />
          </label>

          <div className="mt-[26px] flex flex-col gap-[14px]">
            <div>
              <div className="flex justify-between items-baseline text-[13px] mb-[6px]">
                <span className="text-[var(--paper-dim)]">Google Ads, per year</span>
                <span className="text-[20px] font-semibold">{inr(adsPerYear)}</span>
              </div>
              <div className="seo-bar"><span className="seo-bar-ads" style={{ width: '100%' }} /></div>
            </div>
            <div>
              <div className="flex justify-between items-baseline text-[13px] mb-[6px]">
                <span className="text-[var(--paper-dim)]">DWD Google-ready plan, per year</span>
                <span className="text-[20px] font-semibold text-[var(--brass-bright)]">{inr(PLAN_PRICE)}</span>
              </div>
              <div className="seo-bar"><span className="seo-bar-plan" style={{ width: `${planWidth}%` }} /></div>
            </div>
          </div>

          <p className="mt-[22px] mb-0 text-[15px] leading-[1.5]" aria-live="polite">
            That's <strong className="text-[var(--brass-bright)]">{multiple}×</strong> the plan price —{' '}
            {inr(saved)} a year that can stay in the business.
          </p>
        </div>

        {/* Where people click */}
        <div className="seo-card">
          <p className="eyebrow mb-[16px]">Where local searchers click</p>
          <div className="flex flex-col gap-[14px]">
            {CLICK_SHARE.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-[13px] mb-[6px]">
                  <span className="text-[var(--paper-dim)]">{s.label}</span>
                  <span className="font-semibold">{s.value}%</span>
                </div>
                <div className="seo-bar">
                  <span className={s.highlight ? 'seo-bar-plan' : 'seo-bar-ads'} style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="seo-stat mt-[24px]">
            <span className="seo-stat-num">17.6%</span>
            <span className="text-[13px] text-[var(--paper-dim)] leading-[1.45]">
              of clicks go to the #1 Google Maps listing. The top paid ad gets about{' '}
              <strong className="text-[var(--paper)]">2.1%</strong>.
            </span>
          </div>

          <p className="mt-[16px] mb-0 text-[11px] text-[var(--paper-faint)] leading-[1.5]">
            Sources: BrightLocal and local-pack click studies; 2026 Google Ads CPC benchmarks for India. Figures rounded.
          </p>
        </div>
      </div>

      {/* What the plan includes */}
      <div className="seo-card mt-[24px]">
        <div className="flex flex-wrap items-baseline justify-between gap-[12px] mb-[18px]">
          <p className="eyebrow m-0">What {inr(PLAN_PRICE)}/year covers</p>
          <span className="text-[13px] text-[var(--paper-faint)]">Every site above can ship with it</span>
        </div>
        <ul className="grid md:grid-cols-2 gap-x-[28px] gap-y-[12px] m-0 p-0 list-none">
          {PLAN_ITEMS.map((item) => (
            <li key={item} className="flex gap-[10px] text-[14px] leading-[1.5]">
              <Check size={16} className="shrink-0 mt-[3px] text-[var(--brass-bright)]" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-[22px] mb-0 pt-[18px] border-t border-[var(--line)] text-[12.5px] text-[var(--paper-faint)] leading-[1.6]">
          Straight talk: nobody can guarantee a #1 spot on Google — Google says so itself, and anyone
          promising it is bluffing. What we do is build every signal Google ranks local businesses on.
          Results usually show within 3–6 months; ads are still handy for an instant launch, this is
          how you stop depending on them.
        </p>
      </div>
    </section>
  );
}

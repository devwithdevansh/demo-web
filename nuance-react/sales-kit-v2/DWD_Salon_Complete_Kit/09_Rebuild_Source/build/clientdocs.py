"""Client-facing one-pager, comparison sheet and proposal template (updated packages, Google Maps, expense manager, Gujarati)."""
from lib import *
from content import *

A = (ROOT / "assets").as_uri()
LOGO = f"{A}/Logo/DWD_Logo_Original.png"
S_, G_, Pr, C_ = T["starter"], T["growth"], T["pro"], T["custom"]
X = "em{font-style:italic;color:var(--terra);font-weight:400}h1,h2{font-weight:400}.card.terra .eyebrow{color:var(--char)}.card.sand .eyebrow{color:#7a5f33}"


def onepager():
    FP = P["offers"]["founding_partner"]
    steps = [("1", "FREE", "We check your Google profile and website", "અમે તમારી Google પ્રોફાઇલ અને વેબસાઇટ મફતમાં ચેક કરીએ છીએ."),
             ("2", "FREE", "We show your salon online (a demo)", "તમારા સલૂનનો ઓનલાઇન ડેમો મફતમાં બતાવીએ છીએ."),
             ("3", "YOU DECIDE", "Like it? Go ahead. Nothing to pay before you say yes", "ગમે તો આગળ વધો. તમે હા કહો ત્યાં સુધી કોઈ ચુકવણી નહીં.")]
    st = "".join(f'''<div class="card" style="padding:4mm;background:#fff"><div style="display:flex;align-items:center;gap:2.5mm;margin-bottom:1.5mm"><div style="width:8mm;height:8mm;border-radius:50%;background:var(--char);color:var(--gold);display:flex;align-items:center;justify-content:center;font-weight:700">{n}</div><span class="pill{' dk' if tag == 'YOU DECIDE' else ''}" style="font-size:7pt">{tag}</span></div>
<div style="font-size:10.5pt;color:var(--char);font-weight:700;line-height:1.25">{en}</div><div class="gu" style="font-size:9pt;color:var(--terra);margin-top:1.5mm;line-height:1.35">{gu}</div></div>''' for n, tag, en, gu in steps)
    body = f'''
<img src="{PH('interior_backwash')}" style="position:absolute;inset:0 0 auto 0;width:100%;height:68mm;object-fit:cover;object-position:50% 55%">
<div style="position:absolute;inset:0 0 auto 0;height:68mm;background:linear-gradient(180deg,rgba(12,11,10,.35),rgba(12,11,10,.05) 45%,rgba(12,11,10,.7))"></div>
<img class="logo" src="{LOGO}" style="position:absolute;left:14mm;top:10mm">
<div style="position:absolute;left:14mm;right:14mm;top:52mm;font-size:7.5pt;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);font-weight:700">Websites, Google Maps &amp; booking for salons in Gujarat</div>
<div style="position:absolute;left:14mm;right:14mm;top:74mm">
<h1 style="font-size:25pt;line-height:1.06">Get found on Google.<br>Get booked on <em>WhatsApp.</em></h1>
<div class="gu serif" style="font-size:13pt;color:var(--terra);margin:1.5mm 0 3mm">Google પર શોધાઓ. WhatsApp પર બુકિંગ મેળવો.</div>
<div class="eyebrow" style="margin-bottom:1.5mm">Our offer in 3 simple steps · અમારી ઓફર, 3 સરળ પગલાં</div>
<div class="grid g3" style="gap:2.5mm;margin-bottom:3.5mm">{st}</div>
<div style="background:var(--char);color:#E9E1D6;border-radius:3.5mm;padding:4.5mm 5.5mm;margin-bottom:3mm">
<div style="display:flex;justify-content:space-between;align-items:center;gap:4mm"><div><span class="pill" style="font-size:7pt">Special offer · first {FP['slots']} salons only</span><div class="serif" style="font-size:14pt;color:#fff;margin-top:1.2mm">Starter website + Google Maps</div>
<div style="font-size:9pt;color:#cfc6b8;margin-top:.5mm">Gujarati + English website (5 pages) · Google Maps profile · WhatsApp booking button · review QR</div></div>
<div style="text-align:right;white-space:nowrap"><div style="font-size:10pt;text-decoration:line-through;color:#9a8f80">{inr(T['starter']['setup'])}</div><div class="serif" style="font-size:25pt;color:var(--gold);line-height:1">{inr(founding('starter'))}</div><div style="font-size:8.2pt;color:#cfc6b8">30% off setup</div></div></div>
<div style="border-top:.3mm solid rgba(201,171,120,.35);margin-top:3mm;padding-top:2.5mm;font-size:9pt;color:#cfc6b8">After that: <b style="color:#fff">{inr(annual('starter'))} a year</b> (about {monthly(annual('starter'))} a month) for hosting, backups and support. Price locked for {FP['price_lock_years']} years. Want online booking and expense tracking? <b style="color:#fff">Growth {inr(founding('growth'))}</b> or <b style="color:#fff">Pro {inr(founding('pro'))}</b> setup, built together with you.</div></div>
<div class="card sand" style="padding:4mm 5mm;margin-bottom:3mm"><div class="eyebrow" style="margin-bottom:1mm;color:#7a5f33">ગુજરાતીમાં, સરળ રીતે</div>
<div class="gu" style="font-size:10pt;line-height:1.55;color:var(--char)">1. અમે તમારી Google પ્રોફાઇલ અને વેબસાઇટ <b>મફતમાં</b> ચેક કરીએ છીએ.<br>2. તમારા સલૂનનો ઓનલાઇન ડેમો <b>મફતમાં</b> બતાવીએ છીએ.<br>3. ગમે તો જ આગળ વધો. તમે હા કહો ત્યાં સુધી <b>કોઈ ચુકવણી નહીં</b>.<br><b>પહેલા 3 સલૂન માટે ખાસ છૂટ:</b> Starter {inr(T['starter']['setup'])} ને બદલે <b>{inr(founding('starter'))}</b>.</div></div>
<div style="display:flex;justify-content:space-between;align-items:center;background:var(--gold);color:var(--char);border-radius:3mm;padding:3.5mm 5mm"><div><div class="serif" style="font-size:14pt;color:var(--char);font-weight:700">Message “AUDIT” on WhatsApp to start</div><div class="gu" style="font-size:9pt">શરૂ કરવા WhatsApp પર “AUDIT” લખો</div></div>
<div style="display:flex;gap:4mm;align-items:center"><div style="text-align:right;font-size:8.8pt;font-weight:700">{WEB}<br>{EMAIL}<br>[Insert WhatsApp number]</div><div style="width:19mm;height:19mm;border:.3mm dashed var(--char);display:flex;align-items:center;justify-content:center;font-size:6.5pt;text-align:center">[QR code]</div></div></div>
<p class="note" style="margin-top:1.5mm;font-size:7.4pt">Prices in INR, excluding GST. Offer closes after {FP['slots']} salons. Growth and Pro are built with our first {FP['slots']} salons with a written timeline. We do not promise a Google ranking: Google does not allow paid local ranking.</p></div>'''
    render("DWD_Salon_One_Pager_A4", doc("DevWithDevansh – Salon one-pager", [page(body)], X))


def comparison():
    sc = [("Entry-level app (₹1,499/mo)", 1499 * 36, "var(--taupe)"), ("Mid-tier app + WhatsApp", (2500 + 2000) * 36 + 2500, "var(--sage)"),
          ("DWD Starter", total("starter", "1-3", 3), "var(--terra)"), ("DWD Growth", total("growth", "1-3", 3), "var(--gold)"), ("DWD Pro", total("pro", "1-3", 3), "var(--char)")]
    mx = max(v for _, v, _ in sc)
    bars = "".join(f'<div style="margin-bottom:3mm"><div class="small" style="display:flex;justify-content:space-between"><b>{a}</b><span>{inr(v)}</span></div><div style="height:6mm;background:#EFE7DB;border-radius:2mm"><div style="height:6mm;width:{v / mx * 100:.0f}%;background:{c};border-radius:2mm"></div></div></div>' for a, v, c in sc)
    qs = [("Do clients choose you partly by how your brand and website look?", "Tailored"), ("Do you want to be found on Google Maps with a complete profile?", "Tailored"),
          ("Do you need full billing, inventory and payroll from day one?", "App"), ("Do you want to start today with no design work?", "App"),
          ("Is owning your client and expense data important?", "Tailored"), ("Do you want one yearly plan instead of stacked add-ons?", "Tailored"), ("Do you already use a tool you like?", "Integrate")]
    tr = "".join(f"<tr><td>{q}</td><td><b>{a}</b></td></tr>" for q, a in qs)
    p1 = page(f'''<div class="eyebrow">Choosing the right system</div><h2 style="font-size:22pt">A subscription app or a tailored system?<br>Both are fair choices.</h2><div class="guh gu small" style="color:var(--terra)">એપ કે તમારા સલૂન માટે બનેલી સિસ્ટમ? બંને યોગ્ય વિકલ્પ છે.</div>
<p>The right answer depends on your salon. Here is the cost over three years and seven questions to help you decide.</p>
<div class="card" style="margin:4mm 0;padding:5mm"><h3 style="font-size:12.5pt">Three-year cost, 1–3 stylists (illustration)</h3>{bars}
<p class="note">Subscription figures from published India comparisons, October 2026, indicative: an entry-level app at ₹1,499/month; a mid-tier app at ₹2,500/month plus WhatsApp at ₹2,000/month and a ₹2,500 setup fee. Ours are the proposed plans (setup + three yearly fees). Excludes GST, gateway fees and WhatsApp provider charges. Starter includes the Google Maps work; Growth and Pro modules are built with founding partners. Check each provider's current price.</p></div>
<h3 style="font-size:12.5pt">Seven questions</h3><table class="tight" style="font-size:9.5pt"><tr><th>If this sounds like you…</th><th>Lean toward</th></tr>{tr}</table>
<p class="small" style="margin-top:3mm">If most answers point to <b>Tailored</b>, let's talk. If they point to <b>App</b>, a subscription tool is probably the right call, and we will say so. We can also build the website and Google presence around a tool you already use.</p>''', n=1, label="DevWithDevansh · Salon solutions")
    render("DWD_Salon_Comparison_Sheet", doc("DevWithDevansh – Comparison sheet", [p1], X + ".tight td,.tight th{padding:2.2mm 3mm}"))


def proposal():
    ph = lambda s: f'<span style="background:#F1E6D2;padding:0 1mm">[{s}]</span>'
    p1 = page(f'''<img class="logo" src="{LOGO}"><div class="eyebrow" style="margin-top:5mm">Proposal · પ્રપોઝલ</div>
<h1 style="font-size:26pt">{ph("Salon name")}: website, Google Maps and booking</h1>
<p class="lead" style="margin-top:2mm">Prepared for {ph("Owner name")} · {ph("Date")} · Valid for 15 days · Reference {ph("DWD-SAL-001")} · Language: {ph("Gujarati / English / Both")}</p>
<h3 style="margin-top:4mm">What we heard</h3><p>{ph("2–3 sentences in the owner's own words: how clients find and book today, what takes time, what they want to improve.")}</p>
<h3>Plan</h3><p>{ph("Starter / Growth / Pro / Custom / Google Maps setup only")} · {ph("number")} stylists · {ph("number")} branch(es)</p>
<h3>What we will deliver</h3>
<table class="tight"><tr><th>Item</th><th>Included?</th><th>Status</th></tr>
<tr><td class='k'>Bilingual website, up to 5 pages</td><td>{ph("yes/no")}</td><td>Ready now</td></tr>
<tr><td class='k'>Google profile setup + optimisation, map on site, review QR</td><td>{ph("yes/no")}</td><td>Ready now</td></tr>
<tr><td class='k'>WhatsApp click-to-book and call buttons</td><td>{ph("yes/no")}</td><td>Ready now</td></tr>
<tr><td class='k'>Booking requests, owner dashboard, client list</td><td>{ph("yes/no")}</td><td>Founding-partner build: {ph("target date")}</td></tr>
<tr><td class='k'>Expense manager + monthly summary</td><td>{ph("yes/no")}</td><td>Founding-partner build: {ph("target date")}</td></tr>
<tr><td class='k'>Local SEO &amp; Google Maps care (monthly)</td><td>{ph("yes/no")}</td><td>Ready now</td></tr>
<tr><td class='k'>Add-ons: {ph("list")}</td><td>{ph("yes/no")}</td><td>{ph("status")}</td></tr></table>
<p class="note">We do not promise a Google ranking or a number of bookings. Google does not allow paid local ranking; we improve your profile, reviews and website and report what changes.</p>
<h3>Timeline</h3><table class="tight"><tr><th>Step</th><th>What happens</th><th>When</th></tr><tr><td class='k'>Understand &amp; design</td><td>Workshop, content and photos, design preview</td><td>{ph("dates")}</td></tr><tr><td class='k'>Build</td><td>Previews and your feedback</td><td>{ph("dates")}</td></tr><tr><td class='k'>Test &amp; launch</td><td>Phone testing, Google profile verified, handover call</td><td>{ph("date")}</td></tr><tr><td class='k'>Support</td><td>Covered by the yearly platform plan</td><td>From launch</td></tr></table>''', n=1, label="DevWithDevansh · Proposal")
    inv = f'''<table class="tight"><tr><th>Item</th><th>Amount (INR)</th><th>When</th></tr>
<tr><td class='k'>One-time setup ({ph("plan")})</td><td>{ph("amount")}</td><td>50% at start · 50% at launch</td></tr>
<tr><td class='k'>Add-ons: {ph("list")}</td><td>{ph("amount")}</td><td>With setup</td></tr>
<tr><td class='k'>Annual platform &amp; support</td><td>{ph("amount")}<br><span class="small">≈ {ph("monthly")} per month</span></td><td>Year 1 invoiced at launch; renews yearly</td></tr>
<tr><td class='k'>Local SEO &amp; Google care ({ph("if chosen")})</td><td>{inr(ADD['local_seo']['price'])} per month</td><td>Monthly; cancel after 3 months with 30 days' notice</td></tr>
<tr><td class='k'>Third-party charges</td><td>At actual cost</td><td>WhatsApp, payment gateway, SMS, domain: shown separately</td></tr>
<tr class="hl"><td class='k'>Total due before launch</td><td><b>{ph("total")}</b> + GST as applicable</td><td></td></tr></table>'''
    terms = [
        "<b>What the annual platform fee covers:</b> hosting, database, backups, security, monitoring, updates and support.",
        f"<b>Support:</b> {ph('response times, e.g. next business day')} during {ph('hours')}.",
        "<b>Renewal:</b> reminder 30 days before; invoice 14 days before. Price changes need 60 days' written notice.",
        f"<b>Ownership:</b> {ph('confirm: client owns content, brand assets and client data; state terms for source code and hosting access')}.",
        f"<b>Credits:</b> {O_CREDIT}% of Starter setup is credited if you upgrade to Growth or Pro within 6 months.",
        "<b>Changes in scope</b> are quoted in writing before work starts.",
        f"<b>Founding-partner terms (if applicable):</b> {ph('discount, price lock, testimonial and showcase permission')}.",
        "<b>Cancelling:</b> " + ph("state notice period and what is exported to the client"),
    ]
    p2 = page(f'''<div class="eyebrow">Investment</div><h2 style="font-size:22pt">Clear costs, in one place</h2>{inv}
<p class="note" style="margin-top:2mm">Pay 2 years ahead and receive {P['offers']['prepay_2yr_discount_pct']}% off the platform fee for both years.</p>
<h3 style="margin-top:5mm">Terms in plain language</h3><ul class="small">{"".join(f"<li>{t}</li>" for t in terms)}</ul>
<h3 style="margin-top:4mm">Accept</h3><div class="grid g2"><div class="card" style="height:28mm"><div class="small">For {ph("Salon name")}</div><div class="small" style="margin-top:10mm">Name / signature / date</div></div><div class="card" style="height:28mm"><div class="small">For DevWithDevansh</div><div class="small" style="margin-top:10mm">Name / signature / date</div></div></div>''', n=2, label="DevWithDevansh · Proposal")
    h = doc("DevWithDevansh – Salon proposal template", [p1, p2], X + ".tight td,.tight th{padding:2mm 3mm;font-size:9.5pt}").replace("<body>", '<body contenteditable="true">')
    render("DWD_Salon_Proposal_Template", h)


O_CREDIT = P["offers"]["upgrade_credit_pct"]


def build():
    onepager(); comparison(); proposal()


if __name__ == "__main__":
    build()

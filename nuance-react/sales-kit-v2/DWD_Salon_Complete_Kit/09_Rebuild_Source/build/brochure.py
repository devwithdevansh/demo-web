"""11-page A4 sales brochure built to convert: outcome cover with a free offer, the cost of being invisible, three steps with real screens,
Google Maps, see-it-before-you-pay, plans with break-even maths, the founding offer with a value stack, honest pricing, promises + FAQ,
a Gujarati page and a three-step call to action. One photo per placement. Honest status chips; no invented proof."""
from lib import *
from content import *

A = (ROOT / "assets").as_uri()
LOGO = f"{A}/Logo/DWD_Logo_Original.png"
SCR = lambda n: f"{A}/screens/{n}.png"
S_, G_, Pr, C_ = T["starter"], T["growth"], T["pro"], T["custom"]
O = P["offers"]; FP = O["founding_partner"]
TICKET = P["assumptions"]["avg_ticket"]
NAVB = ["Why act", "3 steps", "Google Maps", "See it first", "Plans", "Founding offer", "Pricing", "Promises", "ગુજરાતી", "Talk"]

X = """
.page{padding:15mm 16mm 20mm}
em{font-style:italic;color:var(--terra);font-weight:400}.dark em{color:var(--gold)}
h1,h2{font-weight:400}h2{font-size:26pt;line-height:1.08}h1{font-size:40pt;line-height:1.02}
.sec{font-size:8.5pt;letter-spacing:.2em;text-transform:uppercase;color:var(--terra);font-weight:700;margin-bottom:3mm;display:flex;gap:3mm;align-items:center}
.sec:before{content:"";width:8mm;height:.4mm;background:var(--terra)}.dark .sec{color:var(--gold)}.dark .sec:before{background:var(--gold)}
.ph{border-radius:4mm;object-fit:cover;display:block;width:100%}
.nav{position:absolute;left:16mm;right:16mm;bottom:7mm;display:flex;justify-content:space-between;align-items:center;font-size:6.4pt;letter-spacing:.04em;color:#9a8f80;text-transform:uppercase;border-top:.25mm solid rgba(127,127,127,.3);padding-top:2.5mm}
.nav b{color:var(--char)}.dark .nav b{color:var(--gold)}.nav span{margin-left:2.4mm}.nav .l{margin:0;font-weight:700;color:var(--char);letter-spacing:.02em;text-transform:none;font-size:8pt}.dark .nav .l{color:#fff}
.guh{font-size:10.5pt;color:var(--terra);margin-bottom:1.5mm}.dark .guh{color:var(--gold)}
.badge{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--gold);color:var(--char);font-weight:700;text-align:center;line-height:1.1}
.pill{display:inline-block;background:var(--gold);color:var(--char);font-size:8pt;letter-spacing:.12em;text-transform:uppercase;font-weight:700;padding:1mm 3mm;border-radius:10mm}
.pill.dk{background:var(--char);color:var(--gold)}
.bignum{font-family:Cambria,Georgia,serif;color:var(--gold);line-height:1}
.quote{background:var(--char);color:#E9E1D6;border-radius:4mm;padding:6mm;font-family:Cambria,Georgia,serif;font-size:15pt;line-height:1.25}.quote em{color:var(--gold)}
.shot{border-radius:3mm;border:.3mm solid var(--sand);width:100%;display:block}
.tight td,.tight th{padding:1.4mm 2.6mm}.tight{font-size:8.8pt}
.card.terra .eyebrow{color:var(--char)}.card.sand .eyebrow{color:#7a5f33}
.lt,.lt td,.lt p{color:var(--mid)}.lt h3{color:var(--char)!important}.lt td.k{color:var(--char)}.lt tr.hl td{background:#F1E6D2}
.strike{text-decoration:line-through;opacity:.6}
.tick li{list-style:none;position:relative;padding-left:5mm}.tick li:before{content:"✓";position:absolute;left:0;color:var(--terra);font-weight:700}.tick{margin-left:0}
.dark .tick li:before{color:var(--gold)}
.step{display:flex;gap:4mm;align-items:flex-start}.step .n{font-family:Cambria,Georgia,serif;font-size:26pt;color:var(--gold);line-height:1;min-width:13mm}
.step h3{margin:0 0 1mm;font-size:14.5pt}.step p{font-size:10pt;margin:0;color:#cfc6b8}
"""


def pg(body, n, dark=False):
    nav = "".join(f"<span>{'<b>' + t + '</b>' if i == n - 2 else t}</span>" for i, t in enumerate(NAVB))
    foot = f'<div class="nav"><span class="l">DevWithDevansh</span><div>{nav}</div><span class="l">{n:02d} / 11</span></div>'
    return f'<section class="page {"dark" if dark else ""}">{body}{foot}</section>'


def cover():
    return f'''<section class="page dark" style="padding:0">
<img class="ph" src="{PH('salon_woman_wavy')}" style="position:absolute;inset:0 0 auto 0;height:190mm;border-radius:0;object-position:50% 20%">
<div style="position:absolute;inset:0 0 auto 0;height:190mm;background:linear-gradient(180deg,rgba(12,11,10,.5) 0%,rgba(12,11,10,0) 28%,rgba(12,11,10,.15) 55%,rgba(12,11,10,.97) 100%)"></div>
<div style="position:absolute;left:16mm;right:16mm;top:13mm;display:flex;justify-content:space-between;align-items:center;color:#fff">
<div style="display:flex;gap:3mm;align-items:center"><img class="logo" src="{LOGO}" style="height:10mm"><div><b style="font-family:Cambria,serif">DevWithDevansh</b><div style="font-size:7.5pt;opacity:.85">Websites, Google Maps &amp; booking for salons</div></div></div>
<div style="font-size:7.5pt;letter-spacing:.18em;text-transform:uppercase;text-align:right">For salons in Gujarat</div></div>
<div class="badge" style="position:absolute;right:15mm;top:70mm;width:42mm;height:42mm;font-size:9pt;transform:rotate(8deg);box-shadow:0 2mm 6mm rgba(0,0,0,.35)"><div><div style="font-size:15pt;font-family:Cambria,serif">FREE</div>Google audit<br>+ demo of<br><b>your</b> salon</div></div>
<div style="position:absolute;left:16mm;right:16mm;top:140mm">
<div class="pill">Get found · Get booked · Know your numbers</div>
<h1 style="color:#fff;margin-top:4mm;font-size:35pt">Customers are searching for a salon <em style="color:var(--gold)">right now.</em><br>Make sure they find <em style="color:var(--gold)">yours.</em></h1>
<div class="gu" style="color:var(--gold);font-size:14pt;margin-top:3mm">{GU['tagline']}</div></div>
<div style="position:absolute;left:16mm;right:16mm;top:200mm"><p class="lead" style="color:#E9E1D6;max-width:150mm">A Gujarati and English website, a complete Google Maps profile and one-tap WhatsApp booking, built around the way your salon works. You see your own demo before you pay anything.</p>
<div class="grid g3" style="gap:3mm;margin-top:3mm">
<div style="border-left:.8mm solid var(--gold);padding-left:3mm"><b style="color:#fff">Get found</b><div class="small" style="color:#cfc6b8">Google Maps + website</div></div>
<div style="border-left:.8mm solid var(--gold);padding-left:3mm"><b style="color:#fff">Get booked</b><div class="small" style="color:#cfc6b8">WhatsApp, then a dashboard</div></div>
<div style="border-left:.8mm solid var(--gold);padding-left:3mm"><b style="color:#fff">Know your numbers</b><div class="small" style="color:#cfc6b8">Clients and expenses</div></div></div></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:32mm;background:var(--gold);color:var(--char);padding:6mm 16mm;display:flex;justify-content:space-between;align-items:center">
<div><div style="font-size:8pt;letter-spacing:.18em;text-transform:uppercase;font-weight:700">Founding offer · first {FP['slots']} salons only</div><div class="serif" style="font-size:17pt;color:var(--char)">{FP['setup_discount_pct']}% off setup · price locked {FP['price_lock_years']} years</div></div>
<div style="text-align:right;font-size:9.5pt;font-weight:700">{WEB}<br>{EMAIL}<br>[Insert WhatsApp number]</div></div></section>'''


def invisible():
    ex = [("Missed bookings a month", "5"), ("Average ticket", inr(TICKET)), ("Lost every month", inr(5 * TICKET)), ("Lost every year", inr(5 * TICKET * 12))]
    rows = "".join(f'<div style="flex:1;text-align:center;padding:4mm 2mm;border-right:.3mm solid rgba(201,171,120,.35)"><div class="bignum" style="font-size:24pt">{v}</div><div class="small" style="color:#cfc6b8">{k}</div></div>' for k, v in ex)
    return pg(f'''<div class="sec">01 · Why act now</div>
<h2>Every missed call is <em>a client who booked someone else.</em></h2><div class="guh gu">{GU['problem_h']}</div>
<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:5mm;margin:3mm 0 5mm;align-items:stretch">
<div><p class="lead">A new client searches on a phone, compares three salons in seconds and books the one they can <b>find</b>, <b>trust</b> and <b>reach</b> fastest.</p>
<ul class="tick" style="font-size:11pt"><li>Your Google profile is thin or missing: they scroll past you.</li><li>There is no website: they cannot see your services and prices.</li><li>Booking means a call nobody answers: they message the next salon.</li><li>Rent, salaries and products live in a notebook: you cannot say what the month earned.</li></ul></div>
<img class="ph" src="{PH('colour_busy')}" style="height:98mm;object-position:50% 45%"></div>
<div class="card char" style="padding:0;overflow:hidden"><div style="padding:4mm 6mm 0"><div class="eyebrow" style="color:var(--gold)">The simple arithmetic: what missed bookings cost (example, use your own numbers)</div></div>
<div style="display:flex;border-top:.3mm solid rgba(201,171,120,.35)">{rows}</div></div>
<div class="grid g2" style="margin-top:5mm">
<div class="card" style="padding:6mm"><h3 style="font-size:13.5pt">If you do nothing</h3><ul style="margin:0 0 0 4mm;font-size:10.8pt"><li>Same missed calls, same scattered diary</li><li>Competitors with a Google profile and WhatsApp booking keep getting the click</li><li>Month-end stays guesswork</li></ul></div>
<div class="card terra" style="padding:6mm"><h3 style="font-size:13.5pt">With us</h3><ul style="margin:0 0 0 4mm;font-size:10.8pt"><li>Found on Google Maps with a complete profile</li><li>One tap books you on WhatsApp</li><li>Clients and expenses in one simple view</li></ul></div></div>
<p class="note" style="margin-top:3mm">Arithmetic only, not a forecast: it multiplies the numbers shown. Your real figures decide the result; the calculator lets you type your own.</p>''', 2)


def steps3():
    cols = [("1", "Get found", "શોધાઓ", "ui_google", ["Complete Google Maps profile", "Gujarati + English website", "Review link + QR"], "Ready now"),
            ("2", "Get booked", "બુકિંગ મેળવો", "ui_booking", ["WhatsApp booking in one tap", "Booking requests in one list", "Client notes and history"], "Founding-partner build"),
            ("3", "Know your numbers", "તમારા આંકડા જાણો", "ui_expense", ["Daily expenses in 30 seconds", "Salaries, advances, vendor dues", "Monthly summary, Excel export"], "Founding-partner build")]
    cs = "".join(f'''<div class="card" style="padding:0;overflow:hidden"><div style="background:#141210"><img src="{SCR(img)}" style="width:100%;display:block"></div>
<div style="padding:5mm 4.5mm"><div class="bignum" style="font-size:26pt;color:var(--terra)">{n}</div><h3 style="font-size:15pt;margin-bottom:0">{t}</h3><div class="gu small" style="color:var(--terra);margin-bottom:3mm">{g}</div>
<ul class="tick" style="margin-bottom:3mm;font-size:10.5pt">{"".join(f"<li>{b}</li>" for b in bl)}</ul>{status_chip(st)}</div></div>''' for n, t, g, img, bl, st in cols)
    return pg(f'''<div class="sec">02 · The solution</div>
<h2>Three steps. <em>Start with one.</em></h2><div class="guh gu">{GU['build_h']}</div>
<p class="lead" style="max-width:150mm">Most salons start with step 1 and add the others when they are ready. You never pay for what you do not need.</p>
<div class="grid g3" style="gap:3mm;margin:5mm 0 6mm">{cs}</div>
<div class="grid g2" style="margin-top:2mm"><div class="quote" style="font-size:13pt;padding:5mm">We don't ask your salon to change everything <em>just to fit our software.</em></div>
<div class="card sand" style="padding:5mm"><h3 style="font-size:12.5pt">Ready now vs built with you</h3><p class="small" style="margin:0">Step 1 can be delivered today. Steps 2 and 3 are built together with our first {FP['slots']} salons, with a written timeline, and discounted for it. We always say which is which. {GU['honest']}</p></div></div>
<p class="note" style="margin-top:3mm">Screens are illustrative concepts with sample data for a fictional salon.</p>''', 3)


def maps():
    return pg(f'''<div class="sec">03 · Google Maps</div>
<h2>People who search <em>“salon near me”</em><br>decide in seconds.</h2><div class="guh gu">{GU['maps_h']}</div>
<img class="shot" src="{SCR('ui_google')}" style="margin:3mm 0 5mm">
<div class="grid g2">
<div class="card" style="padding:5mm"><h3 style="font-size:13pt">What we do</h3><ul class="tick small" style="margin:0"><li>Claim and complete your Google profile: categories, services, hours, photos</li><li>Link it to your Gujarati + English website</li><li>Google-review link and a printable QR for your counter</li><li>Map and directions on your site; local schema and sitemap</li><li>Optional monthly care: weekly posts, review-reply drafts, report</li></ul></div>
<div class="card sand" style="padding:5mm"><h3 style="font-size:13pt">What we will not promise</h3><p class="small">No one can promise a top position. Google says: <i>“There's no way to request or pay for a better local ranking on Google.”</i> Local results depend on relevance, distance and prominence. We make your profile, reviews and website strong, and report what changes.</p><p class="small gu" style="color:var(--terra)">Maps પર ટોચના રેન્કની ગેરંટી કોઈ આપી શકતું નથી. અમે પ્રોફાઇલ, રિવ્યૂ અને વેબસાઇટ મજબૂત બનાવીએ છીએ.</p></div></div>
<div class="grid g3" style="margin-top:4mm"><div class="card" style="padding:4mm"><span class="pill">Free</span><p class="small" style="margin:1.5mm 0 0"><b>12-point audit</b> of your Google profile, website and booking path.</p></div><div class="card" style="padding:4mm"><span class="pill dk">{inr(ADD['gmaps']['price'])}</span><p class="small" style="margin:1.5mm 0 0"><b>Maps setup only</b>, if you already have a website.</p></div><div class="card" style="padding:4mm"><span class="pill dk">{inr(ADD['local_seo']['price'])}/mo</span><p class="small" style="margin:1.5mm 0 0"><b>Care</b>: weekly posts and monthly report. Cancel after 3 months.</p></div></div>''', 4)


def seefirst():
    steps = [("01", "Free audit", "30 minutes. We check your Google profile, website and booking path and give you a one-page report. Yours to keep, even if we never work together."),
             ("02", "Your own demo", "We show a concept of your salon online: your name, your services, a WhatsApp booking button. You see it before any payment."),
             ("03", "Clear proposal", "Written scope, fixed price, what is ready and what is built with you. No surprises."),
             ("04", "Approve the design", "You see the design preview and approve it before launch. Two revision rounds are included."),
             ("05", "Launch and handover", "Phone testing, verified Google profile, review QR printed, 30-minute handover call."),
             ("06", "Grow when ready", "Add booking, expenses or monthly Google care later, with credit toward upgrades.")]
    st = "".join(f'<div class="step"><div class="n">{n}</div><div><h3>{t}</h3><p>{d}</p></div></div>' for n, t, d in steps)
    return pg(f'''<div class="sec">04 · See it first</div>
<h2>See your salon online <em>before you pay anything.</em></h2><div class="guh gu">{GU['process_h']}</div>
<div style="display:grid;grid-template-columns:1.25fr .75fr;gap:6mm;margin-top:4mm"><div style="display:grid;gap:4.5mm">{st}</div>
<div><img class="ph" src="{PH('arch_mirror_stylist')}" style="height:150mm;object-position:50% 30%"><div class="card char" style="margin-top:3mm;padding:4mm"><div class="eyebrow" style="color:var(--gold);margin-bottom:1mm">The first step is free</div><p class="small" style="margin:0;color:#cfc6b8">No card, no commitment. If it is not for you, you still keep the audit.</p></div></div></div>''', 5, dark=True)


def plans():
    def rows(k):
        if k == "starter":
            return f'<div class="small" style="display:flex;justify-content:space-between;border-bottom:.2mm solid rgba(127,127,127,.35);padding:1mm 0"><span>Up to 5 pages</span><b>{inr(annual(k))}</b></div>'
        return "".join(f'<div class="small" style="display:flex;justify-content:space-between;border-bottom:.2mm solid rgba(127,127,127,.35);padding:1mm 0"><span>{BAND_LABEL[b]}</span><b>{inr(annual(k, b))}</b></div>' for b in BANDS)

    def col(k, cls):
        t = T[k]; be = breakeven(k)
        eb = 'style="color:var(--gold)"' if cls == "char" else ""
        return f'''<div class="card {cls}" style="padding:4.5mm"><div class="eyebrow" {eb}>{t['name']} · {t['outcome']}</div><div class="gu small" style="margin:-2mm 0 1mm;opacity:.85">{t['gu']}</div>
<p class="small" style="min-height:12mm;margin-bottom:1mm">{t['tagline']}</p><div style="margin-bottom:2mm">{status_chip(t['status'])}</div>
<div class="small" style="opacity:.8">One-time setup</div><div class="price" style="font-size:20pt">{inr(t['setup'])}</div>
<div class="small" style="margin-top:1mm"><span class="pill{' dk' if cls != 'char' else ''}" style="font-size:7pt">Founding {inr(founding(k))}</span></div>
<div class="small" style="opacity:.8;margin-top:2mm">Yearly platform &amp; support</div>{rows(k)}
<div style="margin-top:2.5mm;padding-top:2mm;border-top:.3mm dashed rgba(127,127,127,.5);font-size:8.6pt"><b>Covered by about {be} extra booking{'s' if be > 1 else ''} a month</b><br><span style="opacity:.8">at a {inr(TICKET)} average ticket, year 1</span></div></div>'''
    short = [r for r in MATRIX if r[0] in ("Bilingual website (up to 5 pages)", "Google Maps profile setup + optimisation", "WhatsApp click-to-book + call buttons", "Online booking requests + owner dashboard", "Client list, notes, visit history", "Expense manager + monthly profit view", "Staff schedules, attendance-lite, roles")]
    trs = "".join(f"<tr><td class='k'>{a}</td><td>{b}</td><td>{c}</td><td>{d}</td></tr>" for a, b, c, d, e in short)
    return pg(f'''<div class="sec">05 · Plans</div>
<h2>Pick your starting point. <em>Grow when you are ready.</em></h2><div class="guh gu">{GU['plans_h']}</div>
<div class="grid g3" style="margin:3mm 0 4mm;gap:3mm">{col('starter', 'sand')}{col('growth', 'terra')}{col('pro', 'char')}</div>
<table class="tight"><tr><th style="width:44%">What you get</th><th>Starter</th><th>Growth</th><th>Pro</th></tr>{trs}</table>
<div class="grid g2" style="margin-top:3mm"><div class="card sand" style="padding:4mm"><b class="serif" style="color:var(--char)">Start small, upgrade with credit</b><p class="small" style="margin:1mm 0 0">{O['upgrade_credit_pct']}% of your Starter setup is credited if you move to Growth or Pro within 6 months.</p></div>
<div class="card sand" style="padding:4mm"><b class="serif" style="color:var(--char)">Custom</b><p class="small" style="margin:1mm 0 0">Multi-branch or special workflow: setup from {inr(C_['setup_from'])}, quoted after discovery.</p></div></div>
<p class="note" style="margin-top:2.5mm">INR, excluding GST. “Founding” = the founding-partner setup price. Break-even is arithmetic at the stated ticket, not a forecast. Growth and Pro are built with our first {FP['slots']} salons with a written timeline.</p>''', 6)


def founding_page():
    items = [("Bilingual 5-page website", "₹12,500–₹37,500"), ("Google profile setup and optimisation", "₹2,000–₹8,000"), ("First-year hosting, SSL and backups", "₹2,000–₹8,000"), ("Review link + printable QR, WhatsApp booking button", "included"), ("Gujarati + English copy for your services", "included")]
    vs = "".join(f'<tr><td class="k">{a}</td><td>{b}</td></tr>' for a, b in items)
    return pg(f'''<div class="sec">06 · Founding offer</div>
<h2 style="color:#fff">{FP['slots']} salons. <em>{FP['setup_discount_pct']}% off. Price locked {FP['price_lock_years']} years.</em></h2><div class="guh gu">{GU['founding']}</div>
<p class="lead" style="color:#cfc6b8;max-width:155mm">We are building our booking and expense modules together with our first {FP['slots']} salons. You get the lowest price we will ever offer; we get honest feedback and proof that it works. When the three places are taken, the offer closes.</p>
<div class="grid g3" style="gap:3mm;margin:4mm 0">
{''.join(f'<div class="card" style="background:#1a1816;border-color:#2e2a26;padding:4.5mm"><div class="eyebrow" style="color:var(--gold)">{T[k]["name"]}</div><div class="small strike" style="color:#9a8f80">{inr(T[k]["setup"])} setup</div><div class="price" style="font-size:25pt;color:var(--gold)">{inr(founding(k))}</div><div class="small" style="color:#cfc6b8">setup · then {inr(annual(k, "1-3"))}/year, locked for {FP["price_lock_years"]} years</div></div>' for k in ("starter", "growth", "pro"))}</div>
<div class="grid g2" style="gap:4mm">
<div class="card lt" style="padding:4.5mm;background:#F4EFE6"><h3 style="font-size:12.5pt">What Starter would cost if bought separately</h3><table class="tight">{vs}<tr class="hl"><td class="k">Typical total, year 1</td><td><b>₹16,500–₹53,500</b></td></tr><tr class="hl"><td class="k">Starter, year 1 (list)</td><td><b>{inr(total('starter', '1-3', 1))}</b></td></tr><tr class="hl"><td class="k">Starter, year 1 (founding)</td><td><b>{inr(founding('starter') + annual('starter'))}</b></td></tr></table><p class="note" style="margin-top:1.5mm">Reported India ranges for freelancers and agencies (Oct 2026). Your quotes may differ.</p></div>
<div><div class="card terra" style="padding:4.5mm;margin-bottom:3mm"><h3 style="font-size:12.5pt">You get</h3><ul class="tick small" style="margin:0"><li>The lowest setup price we will offer</li><li>Price locked for {FP['price_lock_years']} years</li><li>Your needs shape the booking and expense features</li><li>Priority support while we build</li></ul></div>
<div class="card" style="background:#1a1816;border-color:#2e2a26;padding:4.5mm"><h3 style="font-size:12.5pt;color:#fff">We ask in return</h3><ul class="tick small" style="margin:0;color:#cfc6b8"><li>Honest feedback every week for a few weeks</li><li>A short, genuine testimonial if you are happy</li><li>Permission to show the finished work</li></ul></div></div></div>
<div style="margin-top:4mm;background:var(--gold);color:var(--char);border-radius:3mm;padding:4mm 6mm;display:flex;justify-content:space-between;align-items:center"><div><b class="serif" style="font-size:14pt">Message “FOUNDING” to reserve a place.</b><div class="small">Free audit first. No payment until you approve the proposal.</div></div><div style="font-weight:700;text-align:right;font-size:9.5pt">[Insert WhatsApp number]<br>{EMAIL}</div></div>''', 7, dark=True)


def pricing():
    add = "".join(f"<tr><td class='k'>{a['name']}</td><td>{inr(a['price'])} <span class='small'>{a['unit']}</span></td><td>{status_chip(a['status'])}</td></tr>" for a in P["addons"])
    cmp = [("Branded Gujarati + English website", "Booking page, limited branding", "Yes"), ("Google Maps care", "Not included", "Included (setup); optional monthly care"), ("Client and expense data", "Held on the platform", "Held in your system, exportable"), ("GST billing, inventory, payroll", "<span class='ok'>Mature, ready-made</span>", "Not built; we work with your tool")]
    ct = "".join(f"<tr><td class='k'>{a}</td><td>{b}</td><td>{c}</td></tr>" for a, b, c in cmp)
    return pg(f'''<div class="sec">07 · Pricing</div>
<h2>Clear prices. <em>One yearly plan.</em></h2><div class="guh gu">{GU['pricing_h']}</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin:3mm 0 4mm">
<div class="card" style="padding:3.5mm"><div class="eyebrow">How it works</div>
<table style="font-size:9.5pt"><tr><td class="k" style="width:27%">One-time</td><td>Setup: website, Google profile, training</td></tr><tr><td class="k">Yearly</td><td>Platform &amp; support: hosting, backups, security, updates</td></tr><tr><td class="k">Optional</td><td>Add-ons and monthly Google care</td></tr><tr><td class="k">At cost</td><td>WhatsApp, payment gateway, domain</td></tr></table></div>
<div class="card char" style="padding:5mm"><div class="eyebrow" style="color:var(--gold)">Starting from</div><div class="price" style="font-size:32pt">{inr(S_['setup'])}</div><div class="small">setup, then <b>{inr(annual('starter'))} / year</b> (about {monthly(annual('starter'))} a month)</div><p class="small" style="margin-top:2mm;opacity:.8">{GU['gst']} Pay 2 years ahead: {O['prepay_2yr_discount_pct']}% off the platform fee.</p></div></div>
<table class="tight"><tr><th>Add-on</th><th>Price</th><th>Status</th></tr>{add}</table>
<p class="small" style="margin:2mm 0">Extra branch: {inr(P['extra_branch_annual'])} per year. Referral thank-you: {inr(O['referral_credit'])} credit when a salon you introduce signs.</p>
<h3 style="font-size:12pt">An honest comparison with a subscription salon app</h3>
<table class="tight"><tr><th style="width:30%"></th><th>Subscription app</th><th>Our ladder</th></tr>{ct}</table>
<p class="note" style="margin-top:2mm">Apps: about ₹799–₹4,200+ a month, WhatsApp often extra (India comparisons, Oct 2026). An app is better if you need billing and inventory today; we can build your site and Google presence around it.</p>''', 8)


def promises():
    pr = ["A fixed price in writing, with the scope", "You approve the design before launch", "Honest status on every module: ready, built with you, or later", "No ranking promises, and no invented results", f"Monthly Google care: cancel any time after 3 months", "Your content, photos and client data stay yours"]
    faq = [("Is it expensive?", f"Starter is {inr(S_['setup'])} once and {inr(annual('starter'))} a year, about {monthly(annual('starter'))} a month. About {breakeven('starter')} extra bookings a month at a {inr(TICKET)} ticket covers year 1."),
           ("Will I really get more customers?", "No one can honestly promise that. We make you easier to find, trust and book, and send a monthly report so you can see what changes."),
           ("I'm not technical.", "Send us your photos and services. We build it, in Gujarati if you like, and finish with a 30-minute handover call."),
           ("What if I don't like the design?", "You see a preview and approve it before launch. If it is still not right after two rounds, we stop and refund your start payment."),
           ("I already use an app.", "Keep it. We build your website and Google presence around it, and do not touch your billing."),
           ("Do I own my website and data?", "Your content, photos and client data are yours. Hosting and source-code terms are explained in writing before you start.")]
    fq = "".join(f'<div style="margin-bottom:5.5mm"><b class="serif" style="color:var(--char);font-size:12.5pt">{q}</b><div style="margin-top:.8mm;font-size:10.8pt">{a}</div></div>' for q, a in faq)
    return pg(f'''<div class="sec">08 · Promises</div>
<h2>You risk very little. <em>Here is why.</em></h2><div class="guh gu">તમારા માટે જોખમ ઓછું: લેખિત ભાવ, લોંચ પહેલાં ડિઝાઇનની મંજૂરી, અને ડેટા તમારો.</div>
<div style="display:grid;grid-template-columns:.9fr 1.1fr;gap:6mm;margin-top:4mm">
<div><div class="card char" style="padding:5mm"><div class="eyebrow" style="color:var(--gold)">Our six promises</div><ul class="tick" style="margin:0;color:#E9E1D6">{"".join(f'<li style="margin-bottom:4.5mm;font-size:11.8pt">{p}</li>' for p in pr)}</ul></div>
<img class="ph" src="{PH('stylist_cutting')}" style="height:88mm;object-position:50% 25%;margin-top:5mm"></div>
<div><div class="eyebrow">Questions owners ask</div>{fq}</div></div>''', 9)


def gujarati():
    return pg(f'''<div class="sec gu">09 · ગુજરાતીમાં સારાંશ</div>
<h2 class="gu" style="font-size:24pt">તમારો સલૂન.<br><em>Google Maps પર. WhatsApp પર. હિસાબમાં.</em></h2>
<p class="lead gu" style="max-width:155mm">{GU['cover_sub']} {GU['honest']}</p>
<div class="grid" style="gap:3mm;margin:4mm 0">
<div class="card sand" style="padding:4mm"><h3 class="gu" style="font-size:13.5pt">Starter · {S_['gu']}</h3><p class="gu small" style="margin-bottom:1mm">{GU['starter']}</p><p class="small" style="margin:0"><b>{inr(S_['setup'])}</b> સેટઅપ + <b>{inr(annual('starter'))}</b> દર વર્ષે (લગભગ {monthly(annual('starter'))} દર મહિને) · <b>ફાઉન્ડિંગ: {inr(founding('starter'))}</b></p></div>
<div class="card terra" style="padding:4mm"><h3 class="gu" style="font-size:13.5pt">Growth · {G_['gu']}</h3><p class="gu small" style="margin-bottom:1mm">{GU['growth']}</p><p class="small" style="margin:0"><b>{inr(G_['setup'])}</b> સેટઅપ + <b>{inr(annual('growth','1-3'))}</b> દર વર્ષે (1–3 સ્ટાઇલિસ્ટ) · <b>ફાઉન્ડિંગ: {inr(founding('growth'))}</b></p></div>
<div class="card char" style="padding:4mm"><h3 class="gu" style="font-size:13.5pt">Pro · {Pr['gu']}</h3><p class="gu small" style="margin-bottom:1mm">{GU['pro']}</p><p class="small" style="margin:0"><b>{inr(Pr['setup'])}</b> સેટઅપ + <b>{inr(annual('pro','1-3'))}</b> દર વર્ષે (1–3 સ્ટાઇલિસ્ટ) · <b>ફાઉન્ડિંગ: {inr(founding('pro'))}</b></p></div></div>
<div class="card" style="padding:4mm"><h3 class="gu" style="font-size:13pt">કેમ જોખમ ઓછું?</h3><p class="gu small" style="margin:0">લેખિત ભાવ અને સ્કોપ · લોંચ પહેલાં ડિઝાઇનની મંજૂરી તમારી · કોઈ રેન્કિંગનું ખોટું વચન નહીં · Google કેર 3 મહિના પછી ગમે ત્યારે બંધ · તમારો ડેટા તમારો.</p></div>
<div class="grid g2" style="margin-top:3mm"><div class="card" style="padding:4mm"><h3 class="gu" style="font-size:12.5pt">{GU['audit_h']}</h3><p class="gu small" style="margin:0">તમારી Google પ્રોફાઇલ, વેબસાઇટ અને બુકિંગના રસ્તાની 12 મુદ્દાની તપાસ, મફતમાં.</p></div>
<div class="card" style="padding:4mm"><h3 class="gu" style="font-size:12.5pt">ફાઉન્ડિંગ પાર્ટનર</h3><p class="gu small" style="margin:0">{GU['founding']}</p></div></div>
<div class="card char" style="margin-top:3mm;padding:4.5mm"><div class="eyebrow">ફ્રી કન્સલ્ટેશન</div><h3 class="gu" style="font-size:15pt;margin-bottom:1mm">{GU['talk_h']}</h3><p class="gu small" style="margin:0">{GU['no_obl']} · {GU['gst']}</p></div>
<p class="note gu" style="margin-top:2mm">ગુજરાતી લખાણ છાપતા પહેલા કોઈ ગુજરાતી ભાષી પાસે એક વાર વંચાવી લેવા વિનંતી.</p>''', 10)


def talk():
    st = [("1", "Message us", "Say “AUDIT”. We reply the same day."), ("2", "Get your free audit + demo", "One page of fixes and a concept of your salon online."), ("3", "Decide", "Start with Starter, take a founding place, or walk away with the audit.")]
    sh = "".join(f'<div class="step" style="margin-bottom:4mm"><div class="n">{n}</div><div><h3 style="color:#fff">{t}</h3><p>{d}</p></div></div>' for n, t, d in st)
    return f'''<section class="page dark" style="padding:0">
<img class="ph" src="{PH('avantgarde')}" style="position:absolute;inset:0 0 auto 0;height:110mm;border-radius:0;object-position:50% 20%">
<div style="position:absolute;inset:0 0 auto 0;height:110mm;background:linear-gradient(180deg,rgba(12,11,10,.1),rgba(12,11,10,1))"></div>
<div style="position:absolute;left:16mm;right:16mm;top:84mm"><div class="sec">10 · Let's talk</div>
<h2 style="font-size:30pt;color:#fff">Your salon doesn't need <br>more software. <em>It needs to be found, booked and understood.</em></h2><div class="gu" style="color:var(--gold);font-size:13pt;margin-top:2mm">{GU['talk_h']}</div></div>
<div style="position:absolute;left:16mm;right:16mm;top:166mm;display:grid;grid-template-columns:1.1fr .9fr;gap:8mm">
<div>{sh}</div>
<div class="card" style="background:#1a1816;border-color:#2e2a26;padding:5mm"><span class="pill">Free · no obligation</span><h3 style="color:#fff;margin-top:2mm">Free Google &amp; website audit<br>+ demo of your salon</h3><p class="small" style="color:#cfc6b8;margin:0 0 2mm">✓ Personalised &nbsp; ✓ Practical &nbsp; ✓ Yours to keep</p>
<div style="background:var(--gold);color:var(--char);display:inline-block;padding:2mm 5mm;border-radius:2mm;font-weight:700;font-size:10pt">Book your free audit →</div></div></div>
<div style="position:absolute;left:16mm;right:16mm;top:238mm;display:flex;justify-content:space-between;align-items:center"><div style="font-size:10.5pt;color:#E9E1D6;line-height:1.7">🌐 {WEB}<br>✉ {EMAIL}<br>☎ [Insert WhatsApp number]</div>
<div style="width:26mm;height:26mm;border:.3mm dashed var(--gold);display:flex;align-items:center;justify-content:center;font-size:7.5pt;color:var(--gold);text-align:center">[QR code<br>to WhatsApp]</div></div>
<div class="nav" style="color:#9a8f80"><span class="l">DevWithDevansh</span><div style="font-size:7pt">Websites, Google Maps &amp; booking for salons</div><span class="l">11 / 11</span></div></section>'''


def build():
    pages = [cover(), invisible(), steps3(), maps(), seefirst(), plans(), founding_page(), pricing(), promises(), gujarati(), talk()]
    render("DWD_Salon_Brochure_A4", doc("DevWithDevansh – Salon Brochure", pages, X))


if __name__ == "__main__":
    build()

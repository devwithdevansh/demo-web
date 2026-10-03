"""Strategy part A: audit, market research, product strategy.
Blocks: ("p", text) ("ul", [..]) ("h3", text) ("table", headers, rows) ("callout", text) ("note", text).
Inline **bold** is supported. A table cell may be a dict {"t": text, "chip": css-class}."""
from lib import *
from content import *


def audit():
    score = [
        ("First impression", "4", "Strong dark/gold cover, clear promise", "Same three photos everywhere; looks like a template after page 3", "One photo, one place; real salon photos"),
        ("Visual hierarchy and typography", "4", "Serif headline, italic gold accent, clean tables", "Dense text pages for WhatsApp/phone reading", "Add a 1-page bilingual share sheet; larger type on one-pager"),
        ("Colour palette", "4", "Consistent black / gold / cream", "Calculator and some files used an older palette", "One palette in every format (done)"),
        ("Image quality and repetition", "2", "Moody, premium feel", "Three AI-looking photos reused about 14 times; one shows a fictional sign; no Indian salons", "17 licensed Pexels photos, one placement each, licence log"),
        ("Content clarity / product explanation", "2", "Plain language, honest tone", "Reads like 'software services'; features not outcomes; unclear what exists today", "Outcome headlines + status chips (Ready now / Founding-partner build / Roadmap)"),
        ("Pricing and offer", "2", "Transparent prices, yearly model explained", "Six plan prices + five add-ons = decision fatigue; Professional promised unbuilt features at ₹34,999", "Three outcome packages, one 'from' price, honest status"),
        ("Trust signals", "1", "Founding-partner idea, no fake claims", "No case study, no real photos, no reviews, no named salon", "Founding-3 programme to create proof; photo log; honest limits"),
        ("Local relevance", "1", "None", "No Gujarati, no Google Maps story, no WhatsApp-first flow", "Gujarati headlines and summary page; Google Maps package"),
        ("Calls to action", "4", "Free consultation + demo is clear", "No low-risk first step below ₹12,999", "Free audit and ₹4,999 Google Maps setup as entry points"),
        ("Mobile readability", "3", "HTML calculator works on phones", "A4 PDFs are small on phones", "Bilingual one-pager sized for WhatsApp; calculator link"),
    ]
    reality = [
        ("Premium website (static, React template 'Nuance')", "Exists as a demo", "Sellable today (Starter)"),
        ("WhatsApp click-to-book", "Not in the demo; trivial to add", "Sellable today (Starter)"),
        ("Google Business Profile + Maps + schema", "A service, not software", "Sellable today (Starter, add-on)"),
        ("Online booking, dashboard, client list", "Mock-ups only; not built", "Founding-partner build (Growth)"),
        ("Expense manager, profit view", "Not built", "Founding-partner build (Pro, add-on)"),
        ("Staff schedules, memberships, payments, WhatsApp API", "Not built", "Roadmap"),
        ("GST billing, POS, inventory", "Not planned", "Integrate with the salon's existing tool"),
    ]
    rep = [
        ("Nuance photo 'barber studio'", "Brochure p2, p3, p5; deck p2, p3, p7; one-pager (crops)", "7", "Replace with distinct licensed photos; screenshots on product pages"),
        ("Nuance photo 'portrait'", "Brochure cover, p4; deck cover, p11; UI mock-up", "5", "Keep only inside the UI mock-up"),
        ("Nuance photo 'avant-garde'", "Brochure p8; deck p14", "2", "Brochure only"),
    ]
    retain = [
        ("Keep", "Palette and type (black #0C0B0A, gold #C9AB78, cream #F4EFE6, Cambria/Calibri); 'Your Salon. Your Style. Your System.'; honest tone; six-step process; free consultation CTA; calculator; Say/Ask/Show notes; founding-partner idea"),
        ("Modify", "Package names and prices (Starter/Growth/Pro); brochure structure (adds Google Maps and Gujarati pages); deck order; scripts (Gujarati added); comparison sheet; proposal template; one-pager"),
        ("Remove", "Essential/Professional wording that implied built features; repeated Nuance photos; leftover terracotta colours; 'full booking' promised at ₹34,999"),
        ("Create", "Google Maps offer; expense manager; Gujarati copy; status chips; three offer structures; revenue model; 30-day calendar; funnel metrics; editable Word and PowerPoint masters"),
    ]
    return ("1 · Audit", [
        ("p", "**Verdict (brand and conversion review).** The kit looks premium and is honest, and that is a good base. As a way to win clients it is not yet appealing enough: it sells a feature list that does not fully exist, it has no local-language or Google Maps angle, it has no proof, and it repeats the same three photos. Overall about **2.6 / 5** (my judgement, not a measured score)."),
        ("h3", "Scorecard"),
        ("table", ["Criterion", "Score /5", "Working", "Problem", "Fix applied"], [list(r) for r in score]),
        ("h3", "Product reality check: what exists today"),
        ("p", "Forge/Nuance is currently a static, polished website template. The kit must not sell as built what is not built. Every package now carries a status."),
        ("table", ["Capability", "Today", "How to sell it"], [list(r) for r in reality]),
        ("h3", "Repeated images"),
        ("table", ["Source image", "Where it appeared", "Times", "Fix"], [list(r) for r in rep]),
        ("p", "Three AI-looking source images were used about 14 times. Repetition makes a kit feel templated and weakens trust. Rule now: **one photo, one placement** across all client documents; product pages use real UI screens or diagrams instead of photos."),
        ("h3", "Keep / modify / remove / create"),
        ("table", ["Action", "Items"], [list(r) for r in retain]),
    ])


def research():
    comp_rows = []
    for n, tgt, model, entry, mid, prem, feat, src, lab in COMP:
        txt, cls = LBL[lab]
        comp_rows.append([f"**{n}**" + chr(10) + tgt, model + chr(10) + f"Entry: {entry}" + chr(10) + f"Mid: {mid}" + chr(10) + f"Premium: {prem}", feat, {"t": txt, "chip": cls}, src])
    return ("2 · Market research", [
        ("p", "Sources are listed on the last page. Labels: **Verified** = read on the vendor's official page; **Claim / third-party** = vendor claim or an aggregator, blog or competitor article (treat as indicative and possibly biased); **Observation** = my reading of the research."),
        ("h3", "How the market is layered"),
        ("ul", ["**Enterprise chains:** Zenoti (custom quotes, multi-location, payroll). Out of reach and out of scope for small salons.",
                "**India-fit suites for small and mid salons:** Zylu, MioSalon, DINGG, Salonist. Booking, billing, GST, staff and commission, WhatsApp; roughly ₹800 to ₹4,000 a month with WhatsApp often extra.",
                "**Freemium marketplace:** Fresha. Free core, paid add-ons, and a fee on new clients it brings.",
                "**Free or cheap expense/billing tools:** Khatabook (free), Vyapar (about ₹2,400 to ₹3,500 a year). Not salon-specific.",
                "**Freelancers and agencies:** websites and Google profile work, one-time or monthly.",
                "**Notebook, WhatsApp, Instagram DM, Excel:** what most small salons actually use."]),
        ("h3", "Competitor and alternative comparison"),
        ("table", ["Name and target", "Model and prices", "Key features", "Evidence", "Source"], comp_rows, [15, 31, 27, 13, 14]),
        ("note", "Prices are as reported in October 2026 and change often. MioSalon and DINGG do not publish prices on their official pages, so the figures shown are third-party reports. Fresha figures are largely US-dollar; confirm India pricing before quoting."),
        ("h3", "Which products are 'covered the market' and what is trending"),
        ("ul", ["**Observation:** the India-fit suites (Zylu, Mio, DINGG, Salonist) already cover booking, billing, GST, staff, commission and expense tracking for small and mid salons. Competing with them feature for feature is not a good use of a small team.",
                "**Verified:** MioSalon documents an expense and cash-register module; DINGG lists expense tracking, attendance, salary and commission. Expense management is therefore a normal expectation, not a novelty. Our difference must be the owner-friendly, local-language, done-for-you experience, not the feature name.",
                "**Claim / third-party:** the major global platforms and India-fit suites are moving toward WhatsApp automation, memberships and loyalty, AI-assisted support, and marketplace discovery.",
                "**Claim / third-party:** salons without automated reminders report around 20% no-shows; reminders and deposits are reported to cut this substantially; about 64% of salon customers are reported to discover their current salon on Instagram. Treat as directional.",
                "**Verified (Google):** local results rank on relevance, distance and prominence, and 'there's no way to request or pay for a better local ranking on Google'. So the Google Maps offer must be profile quality, reviews and website, never a ranking promise."]),
        ("h3", "The gap we can credibly fill"),
        ("callout", "**Observation:** apps are built for salons that already want software. Many small Gujarat salons are not there yet: they are not found on Google Maps, have no website, and run on WhatsApp and a diary. A **local-language, Google-first, done-for-you** ladder (get found, get booked, know your numbers) meets them where they are, then grows into software. That is the wedge."),
        ("h3", "What Gujarat and India buyers expect differently"),
        ("ul", ["WhatsApp is the booking channel; many owners will not install another app.",
                "UPI and cash; GST billing is not always a daily need for small parlours.",
                "Price sensitivity is high and one-time lumps feel heavy: show a monthly equivalent and a small first step.",
                "Trust is personal: visits, referrals and a visible local reference matter more than slides.",
                "Gujarati comfort in speech and WhatsApp, English for technical words (booking, Google Maps, dashboard)."]),
    ])


def product():
    rm = [[f"**{r[0]}**", f"{r[1]} → {r[2]}", r[3], f"{r[4]} · {r[5]}", r[6]] for r in ROADMAP]
    return ("3 · Product strategy", [
        ("p", "**Recommendation:** do not launch Forge/Nuance as a standalone salon-software product against Zylu, Mio and DINGG. Sell it as a **ladder of outcomes** from DevWithDevansh: get found (website + Google Maps), get booked (booking requests + dashboard), know your numbers (expense manager + profit view). The website is the sellable asset today; the booking and expense modules are built with the first three founding partners."),
        ("h3", "Feature plan"),
        ("table", ["Feature", "Customer problem → business value", "Priority", "Complexity · status today", "Recommendation"], rm, [24, 28, 12, 16, 20]),
        ("h3", "How it evolves without losing focus"),
        ("table", ["Phase", "When", "Scope", "Exit test"], [
            ["0 · Sell now", "Weeks 1–4", "Starter: bilingual website, Google Maps setup, WhatsApp booking, review QR", "3 paid Starter or Maps-setup clients"],
            ["1 · Booking core", "Weeks 3–8 (built with founding partners)", "Booking requests → owner dashboard → client list; one-tap WhatsApp reminders; monthly report", "2 salons use the dashboard daily for 30 days"],
            ["2 · Expense manager", "Weeks 8–14", "Daily expenses, categories, vendor dues, salaries/advances, monthly summary, Excel export; income entry", "Owners open it weekly; month-end summary used"],
            ["3 · Premium add-ons", "After 5+ clients", "WhatsApp API reminders, deposits, memberships, staff rota, PWA", "Add-on requested by 3+ clients before building"],
        ]),
        ("h3", "Build approach"),
        ("ul", ["**One reusable template, many salons.** One codebase with per-salon configuration (name, colours, services, language, stylists) on a shared managed backend. Do not hand-build each client; that kills margin.",
                "**Keep cost per client small.** Estimated infrastructure about ₹1,500 to ₹3,500 per client per year (assumption; use your real hosting bill).",
                "**Use what exists.** Open-source or managed services for authentication, database and email; WhatsApp click-to-chat first, API later.",
                "**Language built in.** Every public page and the dashboard labels support Gujarati and English from day one."]),
        ("h3", "Out of scope for now"),
        ("p", "GST billing and POS, inventory, native iOS/Android apps and multi-branch reporting. Competitors are strong and these have high build and support cost. If a salon needs them, integrate with the tool it already uses."),
    ])

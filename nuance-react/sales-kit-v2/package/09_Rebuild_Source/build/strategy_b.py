"""Strategy part B: offers and packages, pricing, marketing."""
from lib import *
from content import *

A = P["assumptions"]


def rev_model(n):
    mix = A["mix"]
    rnd = lambda x: int(x + 0.5)  # half-up, same as Excel ROUND
    cnt = {"growth": rnd(n * mix["growth"]), "pro": rnd(n * mix["pro"])}
    cnt["starter"] = n - cnt["growth"] - cnt["pro"]
    seo_n = rnd(n * A["local_seo_take_rate"])
    band = A["avg_band"]
    setup = sum(cnt[k] * T[k]["setup"] for k in cnt)
    plat = sum(cnt[k] * annual(k, band) for k in cnt)
    seo = seo_n * ADD["local_seo"]["price"] * A["local_seo_months_year1"]
    rev1 = setup + plat + seo
    hc = A["hourly_cost"]
    deliver = sum(cnt[k] * A["delivery_hours"][k] for k in cnt) * hc
    support = sum(cnt[k] * A["support_hours_per_year"][k] for k in cnt) * hc
    infra = sum(cnt[k] * A["infra_cost_per_year"][k] for k in cnt)
    seo_cost = seo_n * A["seo_hours_per_month"] * A["local_seo_months_year1"] * hc
    acq = n * A["acquisition_hours_per_customer"] * hc
    cost1 = deliver + support + infra + seo_cost + acq
    build = A["platform_build_hours"] * hc
    hours1 = (deliver + support + seo_cost + acq) / hc
    rev2 = plat + seo_n * ADD["local_seo"]["price"] * 12
    cost2 = support + infra + seo_n * A["seo_hours_per_month"] * 12 * hc
    return dict(n=n, cnt=cnt, seo_n=seo_n, setup=setup, plat=plat, seo=seo, rev1=rev1, cost1=cost1, profit1=rev1 - cost1, build=build,
                hours1=hours1, fte=hours1 / 1800, rev2=rev2, cost2=cost2, profit2=rev2 - cost2)


def offers():
    packs = []
    for k in ("starter", "growth", "pro", "custom"):
        t, p = T[k], PKG[k]
        price = (f"Setup {inr(t['setup'])}; yearly {inr(annual(k))}" if k == "starter" else
                 f"Setup {inr(t['setup'])}; yearly {inr(annual(k, '1-3'))} / {inr(annual(k, '4-8'))} / {inr(annual(k, '9-15'))} (1–3 / 4–8 / 9–15 stylists)" if k in ("growth", "pro") else
                 f"Setup from {inr(t['setup_from'])}; yearly from {inr(t['annual_from'])}")
        packs.append(("kv", f"{t['name']} · {t['outcome']}  ({t['status']})", [
            ["Ideal customer", p["ideal"]], ["Main problem solved", p["problem"]], ["Included", chr(10).join("• " + x for x in p["includes"])],
            ["Deliverables", p["deliverables"]], ["Price (INR, excl. GST)", price], ["Limits and exclusions", chr(10).join("• " + x for x in p["limits"])],
            ["Why it is attractive", p["why"]]]))
    s3 = lambda k: total(k, "1-3", 3)
    struct = [
        ["A · Setup + yearly platform plan (recommended core)", "One-time setup, then one yearly fee that covers hosting, support and updates", f"Clear; yearly cash; natural renewal and upgrade call; fits productised delivery", "Indian SMBs resist lumps; renewal needs reminders and proof", f"Starter 3-year cost {inr(s3('starter'))}; Growth {inr(s3('growth'))}"],
        ["B · Monthly retainer ('Digital Salon Manager')", "Fixed monthly fee including site, Google care, content and support", "Lowest entry feel; steady monthly income; strong for Local SEO work", "Higher churn; cash flow risk; constant support load; harder to price software value", "Use only for Local SEO add-on (₹3,999/mo), not for the base product"],
        ["C · Project + annual maintenance contract", "Higher one-time project price, then 15–20% a year for maintenance", "Familiar to Indian SMEs; bigger upfront cash", "Little recurring revenue; customers delay maintenance; encourages custom one-offs", "Use for Custom quotes only"],
    ]
    seo = [
        ["Google Business Profile claim, verification help, categories, services, hours, attributes", "Starter, Growth, Pro, Maps setup"],
        ["Photos, logo and cover guidance; first 10 post captions in Gujarati and English", "Starter, Growth, Pro, Maps setup"],
        ["Website: LocalBusiness schema, titles, descriptions, sitemap, mobile speed, embedded map and directions", "Starter, Growth, Pro"],
        ["Google-review link and printable QR; reply templates", "Starter, Growth, Pro, Maps setup"],
        ["Weekly posts, review-reply drafts, photo and hours updates, 5–10 directory listings, monthly report", f"Separate: Local SEO care {inr(ADD['local_seo']['price'])}/month"],
        ["Rankings, number of calls or reviews, position 'on page one'", "Never promised. Google does not allow paid ranking."],
    ]
    return ("4 · Offers and packages", [
        ("p", "We sell outcomes, not features: **get found**, **get booked**, **know your numbers**. Four packages, each with a plain status so we never sell a feature that does not exist yet."),
        ("h3", "Package definitions"),
        *packs,
        ("h3", "Optional add-ons"),
        ("table", ["Add-on", "Price", "Unit", "Notes", "Status"], [[a["name"], inr(a["price"]), a["unit"], a["note"], a["status"]] for a in P["addons"]]),
        ("p", f"Extra branch: {inr(P['extra_branch_annual'])} per year. Third-party charges (WhatsApp provider, payment gateway, SMS, domain) are billed at actual cost. The market reports WhatsApp utility messages at about ₹0.115 each plus provider fees, so reminders are cheap to pass through."),
        ("h3", "Three offer structures compared"),
        ("table", ["Structure", "How it works", "Advantages", "Disadvantages", "Use"], struct),
        ("callout", "**Recommendation:** lead with structure A for the packages, offer a quarterly instalment on request, use structure B only for the Local SEO add-on, and use structure C only for Custom quotes. Reason: A is the only structure that gives a repeatable product with yearly recurring revenue and a natural upgrade conversation."),
        ("h3", "Google Maps and local SEO: what is included and what is not"),
        ("table", ["Deliverable", "Where"], seo),
        ("note", "Google's own help page states there is no way to request or pay for a better local ranking. We sell better profiles, better reviews and a better website, and report what happens; we never promise a position."),
        ("h3", "Introductory offers and their effect"),
        ("table", ["Offer", "Cost to us", "Profitability / perceived value", "Long-term expectation", "Decision"], [list(r) for r in PROMOS]),
    ])


def pricing():
    ladder = []
    for k in ("starter", "growth", "pro"):
        bands = ["1-3"] if k == "starter" else BANDS
        for b in bands:
            ladder.append([f"{T[k]['name']}" + ("" if k == "starter" else f" · {BAND_LABEL[b]}"), inr(T[k]["setup"]), inr(annual(k, b)), monthly(annual(k, b)), inr(total(k, b, 1)), inr(total(k, b, 3)), inr(round(total(k, b, 3) / 36))])
    ladder.append(["Custom", "from " + inr(T["custom"]["setup_from"]), "from " + inr(T["custom"]["annual_from"]), "", "", "quoted", ""])
    pos = [
        ["Notebook / WhatsApp", "₹0", "₹0", "Time and missed bookings"],
        ["Freelance 5-page site + Google setup (market ₹5k to ₹15k + ₹2k to ₹8k)", "₹7,000 to ₹23,000", "₹2,500 to ₹9,000 hosting/domain", "No booking, no Maps care"],
        ["Entry salon app ₹1,499/mo", "₹0 to ₹1,999", inr(1499 * 36), "No custom site; add-ons extra"],
        ["Mid-tier app + WhatsApp (₹2,500 + ₹2,000/mo + ₹2,500 setup)", "₹2,500", inr((2500 + 2000) * 36 + 2500), "Mature billing and inventory"],
        ["DWD Starter", inr(T["starter"]["setup"]), inr(total("starter", "1-3", 3)), "Site + Google Maps"],
        ["DWD Growth (1–3 stylists)", inr(T["growth"]["setup"]), inr(total("growth", "1-3", 3)), "Site + Maps + bookings + clients"],
        ["DWD Pro (1–3 stylists)", inr(T["pro"]["setup"]), inr(total("pro", "1-3", 3)), "Adds expense and profit view"],
    ]
    strat = [
        ["1 · Budget market-entry", "Starter ₹7,999 + ₹2,999/yr; Growth ₹19,999; Pro ₹34,999", "Fast first customers; low resistance; many referrals", "Margin near or below your hourly cost; attracts price-shoppers; hard to raise later; support load per rupee is high", "Tiny parlours, home studios"],
        ["2 · Balanced value-based (recommended core)", f"Starter {inr(T['starter']['setup'])} + {inr(annual('starter'))}/yr; Growth {inr(T['growth']['setup'])}; Pro {inr(T['pro']['setup'])}", "Priced near a freelancer site for Starter; below mid-tier apps once WhatsApp is added; healthy margin", "Needs proof; Growth/Pro delivered through a build programme at first", "Neighbourhood and boutique salons, barbershops"],
        ["3 · Premium service-led", "Starter ₹24,999 + ₹9,999/yr; Growth ₹59,999; Pro ₹1,10,000 + managed content", "High margin per client; positions as an agency", "No references yet; long sales cycle; Gujarat SMB price sensitivity; more service labour", "Boutique chains, bridal studios, multi-branch"],
    ]
    rs = [rev_model(n) for n in (10, 25, 50, 100)]
    rm = [["Starter / Growth / Pro customers"] + [f"{r['cnt']['starter']} / {r['cnt']['growth']} / {r['cnt']['pro']}" for r in rs],
          ["Setup revenue"] + [inr(r["setup"]) for r in rs], ["Platform fees (year 1)"] + [inr(r["plat"]) for r in rs],
          ["Local SEO care (20% take-up, 9 months)"] + [inr(r["seo"]) for r in rs], ["**Year-1 revenue**"] + [f"**{inr(r['rev1'])}**" for r in rs],
          ["Year-1 cost: delivery, support, infrastructure, SEO work, sales time"] + [inr(r["cost1"]) for r in rs],
          ["**Year-1 profit** (before platform build, tax, GST)"] + [f"**{inr(r['profit1'])}**" for r in rs],
          ["Hours implied in year 1"] + [f"{r['hours1']:.0f} h ({r['fte']:.1f} FTE)" for r in rs],
          ["Year-2 recurring revenue (platform + SEO)"] + [inr(r["rev2"]) for r in rs], ["Year-2 recurring profit"] + [inr(r["profit2"]) for r in rs]]
    return ("5 · Pricing research and strategy", [
        ("h3", "Where our packages sit against the market (1–3 stylists, 3 years)"),
        ("table", ["Alternative", "Setup", "3-year cost", "Note"], pos),
        ("note", "Competitor figures are indicative, from third-party reports (October 2026). Excludes GST, payment-gateway fees and WhatsApp provider charges."),
        ("p", "**Read it honestly.** Starter costs about what a freelancer charges for a site alone, but includes the Google Maps work. Growth lands between an entry app and a mid-tier app with WhatsApp, and Pro stays below a mid-tier app while adding a website, Google care and an expense view. We are never the cheapest entry app; we are the cheapest way to get **found, booked and organised in one local-language package**."),
        ("h3", "Three pricing strategies"),
        ("table", ["Strategy", "Price points", "Advantages", "Risks", "Target customer"], strat),
        ("callout", "**Recommendation (reasoning, not fact):** use strategy 2 for the packages, with a low-risk entry wedge (free audit, ₹4,999 Google Maps setup, Starter) so a cautious owner can start small, and the 50% Starter credit toward Growth/Pro. Test strategy 3 pricing only on boutique salons once there are three references. Avoid strategy 1: at about ₹650 per hour of effort for Starter, a ₹7,999 price would fall below a sustainable rate."),
        ("h3", "Recommended ladder"),
        ("table", ["Plan · size", "Setup", "Yearly", "≈ per month", "Year 1", "3-year total", "≈ per month (3 yr)"], ladder),
        ("h3", "Revenue illustration: 10, 25, 50 and 100 customers"),
        ("p", "Illustration only. **Revenue is not profit.** Mix, hours and the hourly cost are assumptions in data/pricing.json; replace them with your real numbers."),
        ("table", ["With this many customers", "10", "25", "50", "100"], rm),
        ("ul", [f"Assumptions: mix {int(A['mix']['starter']*100)}% / {int(A['mix']['growth']*100)}% / {int(A['mix']['pro']*100)}%; 1–3 stylists; hourly cost {inr(A['hourly_cost'])} (value of your own time); delivery hours {A['delivery_hours']['starter']} / {A['delivery_hours']['growth']} / {A['delivery_hours']['pro']}; support hours a year {A['support_hours_per_year']['starter']} / {A['support_hours_per_year']['growth']} / {A['support_hours_per_year']['pro']}; infrastructure {inr(A['infra_cost_per_year']['starter'])} / {inr(A['infra_cost_per_year']['growth'])} / {inr(A['infra_cost_per_year']['pro'])} a year; {A['acquisition_hours_per_customer']} sales hours per customer.",
                f"One-time platform build is excluded: about {A['platform_build_hours']} hours, or {inr(A['platform_build_hours'] * A['hourly_cost'])} at the same hourly cost.",
                "WhatsApp provider and payment-gateway charges are pass-through and excluded. GST is excluded.",
                "**Capacity warning:** at 100 customers the hours imply more than one person full time. Delivery hours should fall as the template matures, but plan hiring or a ceiling (for example two new salons a month) before promising dates."]),
    ])


def marketing():
    seg_raw = [
        ["1 · Neighbourhood salons and ladies' parlours", "1–3 chairs, owner-operator", "Not found on Maps; DM and call bookings; no website", "Notebook, WhatsApp, Instagram", "High", "More walk-ins and calls; look professional", "'Too expensive'; 'my clients come anyway'; 'I don't know tech'", "Owner", "Starter; Google Maps setup; Gujarati-first"],
        ["2 · Boutique and bridal studios", "4–10 stylists; Instagram-led", "Instagram followers who cannot book; brand not matching the site", "Instagram, maybe a Wix site, sometimes an app", "Medium", "Brand, bookings, repeat clients", "'We have an app'; 'will it look like us?'", "Owner or manager", "Growth; bilingual brand site; Local SEO care"],
        ["3 · Men's salons and barbershops", "2–6 chairs; walk-in heavy; staff commission", "Rent, salaries, product costs not tracked; no online presence", "Diary, Khatabook", "Medium", "See the month's profit; fewer disputes on advances", "'Khatabook is free'", "Owner", "Pro with expense manager; Starter first"],
        ["4 · Home studios and freelance beauticians", "1 person", "Invisible beyond Instagram", "Instagram, WhatsApp", "Very high", "A professional link and Maps listing", "Price", "Owner", "Google Maps setup only"],
        ["5 · Multi-branch local chains", "3–10 outlets", "No cross-branch view; inconsistent branding", "Excel, a billing tool", "Low–Medium", "Control and consistency", "'We have software'; long decisions", "Owner and ops manager", "Custom; start with one pilot branch"],
        ["6 · Salons already using an app", "Any size", "Their site and Google profile are weak; the app's booking page is generic", "Zylu, Mio, DINGG, etc.", "Medium", "Be found and look premium without changing their billing tool", "'We already use software'", "Owner", "Starter only; integrate, do not replace"],
    ]
    labels = ["Size / type", "Challenges", "Today they use", "Budget", "Motivation", "Likely objections", "Decision-maker", "Our offer"]
    seg = [("kv", r[0], [[labels[i], r[i + 1]] for i in range(8)]) for r in seg_raw]
    channels = [
        ["Google Maps (as a research tool)", "List salons in 2–3 areas; filter by reviews, photos, missing website, recent activity; note one specific gap each", "High", "1", "Free; the source of every personalised first message"],
        ["Google Business Profile (our own)", "Claim DWD's profile as a service business; add Gujarati + English description, services, work photos", "Low", "1", "Credibility; shows we do what we sell"],
        ["WhatsApp Business", "Catalogue of packages, quick replies, labels per lead stage; first-contact channel", "Medium", "1", "Respect opt-in and policy; one personalised message per salon"],
        ["Instagram", "Reels of before/after Google profile and booking flow; comment before DM", "Medium", "2", "Where owners and clients already are"],
        ["In-person visits", "Quiet weekday afternoons with the one-pager and a tablet demo; ask for 10 minutes", "High", "1", "Highest trust for neighbourhood salons"],
        ["Referrals and partners", "Product distributor reps, chair/equipment dealers, beauty academies, CAs, photographers: referral credit", "Medium", "1", "One partner can open many salons"],
        ["Personalised email", "For boutique salons and chains that list an email", "Low", "3", "Lower response in this segment"],
        ["LinkedIn", "Multi-branch owners; case studies; the founder's profile", "Low", "3", "English only"],
        ["Industry communities", "Salon-owner WhatsApp and Facebook groups: help first, no spam", "Medium", "2", "Join as a helpful expert; follow group rules"],
        ["Demos and pilots", "Personalised demo of their salon; founding-partner pilot", "High", "1", "The conversion step"],
    ]
    need = ["Few or no recent Google reviews, or reviews mentioning waiting, phone not answered, or booking confusion",
            "No website, or a website with no booking path or no Gujarati",
            "Active Instagram with followers but a 'DM to book' bio",
            "Photos missing, wrong hours, no services listed on Google",
            "3+ stylists but no visible system", "Owner reachable on WhatsApp"]
    steps = [
        ["1 · Find", "Google Maps list for two areas; add to the tracker", "100 researched salons"],
        ["2 · Audit", "10-minute check: Google profile, website, booking path, reviews", "One specific problem each"],
        ["3 · Problem", "Pick the single most useful finding", "One sentence"],
        ["4 · Offer", "Match to Starter, Maps setup or Growth; prepare their demo", "Personal offer"],
        ["5 · Contact", "Owner on WhatsApp, or in person", "First message (English or Gujarati)"],
        ["6 · Consult", "10–30 minute call or visit with the demo", "Meeting"],
        ["7 · Proposal", "Within 24 hours, from the template", "Proposal"],
        ["8 · Follow up", "Day 2, 5, 10, then close out politely", "Decision or nurture"],
        ["9 · Onboard", "Checklist: content, photos, domain, Google access, handover call", "Live"],
        ["10 · Proof", "Review request, testimonial, before/after, referral ask", "Social proof"],
    ]
    ex = [
        ["English WhatsApp (first message)", "Hi [Name], this is Devansh. I looked at [Salon] on Google Maps. [One true observation, e.g. 'Your photos are great but there is no link to book or a website.'] Quick question: do most of your bookings come by call, WhatsApp or Instagram?"],
        ["Gujarati WhatsApp (first message)", "નમસ્તે [નામ] ભાઈ/બેન, હું દેવાંશ. [સલૂનનું નામ] ને Google Maps પર જોયું. [એક સાચું, ચોક્કસ અવલોકન, જેમ કે: ‘ફોટા સરસ છે, પણ વેબસાઇટની લિંક અને બુકિંગનો રસ્તો દેખાતો નથી.’] એક નાનો પ્રશ્ન: તમારા મોટા ભાગના બુકિંગ કોલ, WhatsApp કે Instagram પરથી આવે છે?"],
        ["Audit offer (Gujarati)", "નમસ્તે [નામ], મેં [સલૂન] ની Google પ્રોફાઇલ ચેક કરી. 3 નાની વાતો મળી જે સુધારી શકાય. આખો 1 પાનાનો રિપોર્ટ મફતમાં મોકલું?"],
        ["Expense pitch (English)", "How long does the month-end hisaab of rent, salaries and products take you? We build a simple system where a daily expense takes 30 seconds and the month summary appears on its own."],
        ["Expense pitch (Gujarati)", "મહિનાના અંતે ખર્ચ અને કમાણીનો હિસાબ ડાયરીમાં કરવામાં કેટલો સમય જાય છે? અમે એવી સરળ સિસ્ટમ બનાવીએ છીએ જ્યાં રોજનો ખર્ચ 30 સેકન્ડમાં લખાય અને મહિનાનો સારાંશ આપોઆપ મળે."],
    ]
    pillars = [["Be found", "Google Maps and local search: profile fixes, reviews, photos"], ["Be booked", "WhatsApp booking, reminders, no-shows"], ["Know your numbers", "Expense and profit clarity"], ["Proof", "Founding-partner results, before/after, behind the scenes"], ["Offers", "Free audit, Starter, Maps setup, founding slots"]]
    cal = CALENDAR
    return ("6 · Marketing strategy", [
        ("p", "DevWithDevansh is the service provider; the salon ladder is one offering. The plan below is for a small developer team finding salons that genuinely need what we build."),
        ("h3", "A · Target segments"),
        *seg,
        ("callout", "**Test first:** segments 1 and 2 (plus segment 6 for quick Starter wins) in **one city or two neighbourhoods** you can visit in person. Not every salon is a fit: skip salons with no owner involvement, or already on a heavy chain system."),
        ("h3", "B · Positioning and messaging"),
        ("table", ["Item", "Copy"], [
            ["Brand positioning", "DevWithDevansh is the local technology partner that helps salons get found on Google Maps, get booked on WhatsApp, and know their numbers, built around how the salon already works."],
            ["Product positioning", "A ladder from website to booking to books. Start with what you need; grow when you are ready. Gujarati and English from day one."],
            ["Value proposition", "More people can find you, booking is one tap, and you can see the day and the month clearly, without learning complicated software."],
            ["Short brand pitch", "We help salons get found on Google Maps, take bookings on WhatsApp, and keep clients and expenses in one simple system. Free audit first, then only what you need."],
            ["Hero headlines (EN)", "Get found on Google Maps. Get booked on WhatsApp. Know your numbers."],
            ["Hero headlines (GU)", "Google Maps પર શોધાઓ. WhatsApp પર બુકિંગ મેળવો. તમારા આંકડા જાણો."],
            ["Mixed (GU + EN)", "તમારો સલૂન, હવે Google Maps પર. Booking WhatsApp પર. હિસાબ એક જ જગ્યાએ."],
            ["Calls to action", "Get my free Google audit · Book a free consultation · See a demo for my salon"],
            ["Avoid", "'Revolutionary', 'best', 'digital transformation', 'guaranteed ranking', 'double your bookings'"],
        ]),
        ("h3", "C · How to find salons with a real need"),
        ("ul", need),
        ("h3", "Channels"),
        ("table", ["Channel", "How we use it", "Effort", "Priority (1 = first)", "Notes"], channels),
        ("h3", "Ten-step outreach process"),
        ("table", ["Step", "What to do", "Output"], steps),
        ("h3", "Example outreach messages (English and Gujarati)"),
        ("table", ["Message", "Text"], ex),
        ("note", "Gujarati is drafted for natural reading. Have a native speaker proofread before sending or printing."),
        ("h3", "D · Content strategy"),
        ("table", ["Pillar", "Focus"], pillars),
        ("p", "Formats: 15–30 second screen-recording reels (a Google profile fixed in 60 seconds, a booking in one tap), carousels, WhatsApp status, Google Business Profile posts for DWD, founder posts on LinkedIn, FAQs, and founding-partner stories once real. Use Gujarati and English; keep technical words in English."),
        ("h3", "30-day content calendar"),
        ("table", ["Day", "Pillar · format", "Hook (EN)", "Hook (GU)", "CTA"], [[str(r[0]), f"{r[1]} · {r[2]}", r[3], r[4], r[5]] for r in cal]),
    ])


CALENDAR = [
    (1, "Be found", "Reel", "Search 'salon near me'. Who shows up first?", "‘સલૂન નજીકમાં’ સર્ચ કરો. પહેલું કોણ દેખાય છે?", "Free Google audit"),
    (2, "Be found", "Carousel", "5 things every salon's Google profile needs", "સલૂનની Google પ્રોફાઇલમાં આ 5 વસ્તુ જરૂરી", "Save and share"),
    (3, "Be found", "GBP post", "Our services and hours, updated", "અમારી સર્વિસ અને સમય", "Message us"),
    (4, "Be found", "Reel", "Wrong opening hours cost you walk-ins", "ખોટો સમય એટલે ગુમાવેલા ગ્રાહક", "Check your hours"),
    (5, "Be found", "Story", "Poll: Do you know your Google rating?", "તમારું Google રેટિંગ ખબર છે?", "Reply"),
    (6, "Be found", "Carousel", "How to ask for a review without feeling awkward", "રિવ્યૂ કેવી રીતે માંગવો", "Get the QR"),
    (7, "Proof", "Reel", "Behind the scenes: building a salon website", "સલૂન વેબસાઇટ કેવી રીતે બને છે", "Follow"),
    (8, "Be booked", "Reel", "WhatsApp booking in one tap", "WhatsApp બુકિંગ, એક ક્લિકમાં", "See the demo"),
    (9, "Be booked", "Carousel", "3 reasons clients don't book (and how to fix them)", "ગ્રાહક બુકિંગ કેમ નથી કરતા", "Free audit"),
    (10, "Be booked", "Story", "Where do your bookings come from? Call / DM / WhatsApp", "બુકિંગ ક્યાંથી આવે છે?", "Vote"),
    (11, "Be booked", "Reel", "Diary vs dashboard: tomorrow at a glance", "ડાયરી કે ડેશબોર્ડ?", "Ask for a demo"),
    (12, "Be booked", "Carousel", "No-shows: simple reminders that help", "નો-શો ઘટાડવાના સરળ રસ્તા", "Download checklist"),
    (13, "Offers", "Post", "Free Google and website audit: how it works", "મફત ઓડિટ કેવી રીતે કામ કરે છે", "Book the audit"),
    (14, "Proof", "Reel", "A 60-second profile fix, before and after", "60 સેકન્ડમાં પ્રોફાઇલ સુધારો", "Message us"),
    (15, "Know your numbers", "Reel", "Where did this month's money go?", "આ મહિનાના પૈસા ક્યાં ગયા?", "See the demo"),
    (16, "Know your numbers", "Carousel", "6 expense categories every salon should track", "સલૂનના 6 ખર્ચ જે લખવા જોઈએ", "Save"),
    (17, "Know your numbers", "Story", "Poll: Do you know last month's profit?", "ગયા મહિનાનો નફો ખબર છે?", "Vote"),
    (18, "Know your numbers", "Reel", "Salary advances: stop the arguments", "એડવાન્સનો હિસાબ સાફ", "Ask for a demo"),
    (19, "Know your numbers", "Carousel", "Month-end in 5 minutes", "મહિનાનો અંત 5 મિનિટમાં", "Share"),
    (20, "Offers", "Post", "Starter: bilingual site + Google Maps, from " + inr(T["starter"]["setup"]), "Starter: બે ભાષામાં વેબસાઇટ + Google Maps", "Free consultation"),
    (21, "Proof", "Reel", "Why we show prices openly", "ભાવ કેમ ખુલ્લા રાખીએ છીએ", "Read the plans"),
    (22, "Be found", "Carousel", "Gujarati or English? Why both help", "ગુજરાતી કે અંગ્રેજી? બંને કેમ", "Free audit"),
    (23, "Be found", "Reel", "Photos that make people click 'Call'", "ફોટા જે કોલ કરાવે", "Message us"),
    (24, "Be booked", "Reel", "Instagram bio that books clients", "Instagram બાયો જે બુકિંગ લાવે", "Get the template"),
    (25, "Offers", "Story", "3 founding-partner slots: what you get and give", "3 ફાઉન્ડિંગ પાર્ટનર સ્લોટ", "Apply"),
    (26, "Proof", "Post", "What we will not promise (rank #1, double bookings)", "જે અમે વચન નથી આપતા", "Read why"),
    (27, "Know your numbers", "Reel", "Vendor dues: never lose track again", "સપ્લાયરનું ઉધાર, હિસાબ સાફ", "See the demo"),
    (28, "Be booked", "Carousel", "Client notes: remember every preference", "ગ્રાહકની પસંદગી યાદ રાખો", "Save"),
    (29, "Proof", "Reel", "Monthly report: what changed on Google", "માસિક રિપોર્ટ", "Ask for a sample"),
    (30, "Offers", "Post", "Month recap and free audit slots this week", "આ અઠવાડિયાના ફ્રી ઓડિટ", "Book the audit"),
]

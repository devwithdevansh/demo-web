"""Shared copy for every document (PDF, PPTX, DOCX, XLSX). Numbers come from data/pricing.json via lib.
Gujarati lines are drafted for natural reading; have a native speaker proofread before print."""
from lib import *

# ---------------------------------------------------------------- Gujarati copy bank
GU = {
    "tagline": "તમારો સલૂન. તમારી સ્ટાઇલ. તમારી સિસ્ટમ.",
    "cover_sub": "તમારા સલૂન માટે વેબસાઇટ, Google Maps, બુકિંગ અને હિસાબ, એક જ જગ્યાએ.",
    "problem_h": "તમારો દિવસ હજી પણ આવો જ ચાલે છે?",
    "problem_sub": "કોલ, WhatsApp, ડાયરી અને યાદશક્તિ પર ચાલતું કામ ક્યારેક ગ્રાહક ગુમાવી દે છે.",
    "journey_h": "ગ્રાહકનો અનુભવ તમારા સલૂનમાં આવતા પહેલાં જ શરૂ થઈ જાય છે.",
    "flow_h": "પહેલી ક્લિકથી કાયમી ગ્રાહક સુધી.",
    "build_h": "એક પાર્ટનર, તમારા સલૂનનો દરેક ભાગ.",
    "maps_h": "Google Maps પર લોકો તમને શોધી શકે છે?",
    "maps_sub": "નજીકમાં સલૂન શોધતો ગ્રાહક સૌથી પહેલાં Google Maps જુએ છે.",
    "whatsapp_h": "WhatsApp પર બુકિંગ, એક ક્લિકમાં.",
    "expense_h": "મહિનાને અંતે ખરેખર કેટલી કમાણી? એક નજરમાં જુઓ.",
    "expense_sub": "ખર્ચ, પગાર, ઉધાર અને નફો, એક જ જગ્યાએ.",
    "process_h": "તમારા કામની રીતથી, તમારી સિસ્ટમ સુધી.",
    "changes_h": "તમારા સલૂનમાં શું બદલાશે?",
    "plans_h": "જરૂર હોય એટલું જ શરૂ કરો, પછી આગળ વધો.",
    "pricing_h": "સરળ, સ્પષ્ટ વાર્ષિક પ્લાન.",
    "yearly": "એક વાર સેટઅપ, પછી એક જ સ્પષ્ટ વાર્ષિક ફી.",
    "gst": "કિંમતો GST સિવાયની છે.",
    "talk_h": "ફ્રી કન્સલ્ટેશન અને તમારા સલૂન માટે ડેમો.",
    "cta": "ફ્રી કન્સલ્ટેશન બુક કરો",
    "no_obl": "કોઈ બંધન નહીં · તમારા કામ પ્રમાણે · વ્યવહારુ",
    "audit_h": "મફત Google અને વેબસાઇટ ઓડિટ",
    "questions_h": "શરૂ કરવા માટે થોડા પ્રશ્નો",
    "starter": "Starter: બે ભાષામાં વેબસાઇટ + Google Maps + WhatsApp બુકિંગ.",
    "growth": "Growth: ઓનલાઇન બુકિંગ રિક્વેસ્ટ, ડેશબોર્ડ અને ગ્રાહક યાદી.",
    "pro": "Pro: ખર્ચનો હિસાબ, સ્ટાફ અને મહિનાનો નફો-ખર્ચ એક નજરમાં.",
    "founding": "ફાઉન્ડિંગ પાર્ટનર: પહેલા 3 સલૂન માટે સેટઅપ પર 30% છૂટ અને 3 વર્ષ સુધી ભાવ સ્થિર.",
    "honest": "જે અમે આજે આપી શકીએ છીએ અને જે સાથે મળીને બનાવીશું, તે અમે સ્પષ્ટ કહીએ છીએ.",
}

NAV = ["Problem", "What we build", "Google Maps", "How we work", "Results", "Plans", "Pricing", "ગુજરાતી", "Talk"]

# ---------------------------------------------------------------- what we build (9 areas)
AREAS = [
    ("Bilingual website", "Gujarati + English pages: services with prices, stylists, gallery, contact.", "બે ભાષામાં વેબસાઇટ", "Ready now"),
    ("Google Maps & local search", "Profile setup, categories, photos, review link and a map on your site.", "Google Maps અને લોકલ સર્ચ", "Ready now"),
    ("WhatsApp booking", "One tap opens WhatsApp with the service and time already typed.", "WhatsApp બુકિંગ", "Ready now"),
    ("Booking dashboard", "Requests arrive in one list: confirm, reschedule or cancel.", "બુકિંગ ડેશબોર્ડ", "Founding-partner build"),
    ("Client records", "Phone, notes, last visit and preferences in one place.", "ગ્રાહક રેકોર્ડ", "Founding-partner build"),
    ("Reminders & reviews", "Reminder messages and a Google-review link or QR code.", "રિમાઇન્ડર અને રિવ્યૂ", "Founding-partner build"),
    ("Expense manager", "Daily expenses, vendor dues, salaries and advances, monthly summary.", "ખર્ચનો હિસાબ", "Founding-partner build"),
    ("Staff & memberships", "Schedules, attendance-lite, packages and memberships.", "સ્ટાફ અને મેમ્બરશિપ", "Roadmap"),
    ("Custom & integrations", "Branches, special workflows, tools you already use.", "ખાસ જરૂરિયાતો", "Scoped per salon"),
]

# ---------------------------------------------------------------- packages
PKG = {
    "starter": {
        "ideal": "Neighbourhood salons, ladies' parlours and barbers with 1–5 chairs that are not yet found online.",
        "problem": "Customers search 'salon near me', see competitors first, and have no easy way to book.",
        "includes": ["Gujarati + English website, up to 5 pages (home, services with prices, stylists, gallery, contact)",
                     "WhatsApp click-to-book and call buttons on every page",
                     "Google Business Profile setup and optimisation: categories, services, hours, photos, link to your site",
                     "Map and directions on the website, Google-review link and printable QR",
                     "Basic technical SEO: page titles, LocalBusiness schema, sitemap, mobile speed",
                     "First-year hosting, SSL and backups; domain at actual cost"],
        "deliverables": "Live website, verified and optimised Google profile, review QR, 30-minute handover call.",
        "limits": ["No online booking system or dashboard (WhatsApp booking only)", "No ranking guarantee: Google does not allow paid rankings", "Up to 2 revision rounds before launch"],
        "why": "Deliverable today. Costs about what a freelancer charges for a site alone, and adds the Google Maps work that actually brings walk-ins.",
    },
    "growth": {
        "ideal": "Salons with 3–8 stylists that take many bookings by call and DM and want to see the day clearly.",
        "problem": "Appointments are scattered, changes are forgotten, and the owner cannot see tomorrow at a glance.",
        "includes": ["Everything in Starter",
                     "Online booking requests: service, stylist, preferred time, saved and alerted to you on WhatsApp/email",
                     "Owner dashboard: today and upcoming, confirm, reschedule, cancel",
                     "Client list with phone, notes and visit history",
                     "One-tap WhatsApp reminders from the dashboard",
                     "Monthly Google and website report (visits, calls, direction requests, reviews)"],
        "deliverables": "Everything in Starter plus a working booking and client system, owner training, monthly report.",
        "limits": ["Reminders are one-tap, not fully automatic (automation is a paid add-on)", "No billing/GST/POS or inventory", "Delivered through the founding-partner build programme while the platform matures"],
        "why": "Replaces the notebook and DM chaos, and keeps clients and bookings in a system the salon owns.",
    },
    "pro": {
        "ideal": "Established salons and barbershops with a team, rent, salaries and product purchases to track.",
        "problem": "The owner is busy all day and still cannot say, at month end, what was earned and where the money went.",
        "includes": ["Everything in Growth",
                     "Expense manager: daily expenses by category, vendor dues, salaries and advances, petty cash",
                     "Simple daily income entry and a monthly profit-and-expense snapshot with Excel export",
                     "Staff schedules and attendance-lite",
                     "Roles: owner, manager, stylist",
                     "Priority support"],
        "deliverables": "Growth deliverables plus the expense and profit view, staff schedule and role setup, training.",
        "limits": ["Not an accounting or GST filing system", "Automated WhatsApp reminders and online payments are separate add-ons", "Delivered through the founding-partner build programme"],
        "why": "Adds the number owners worry about most: how much was actually earned this month.",
    },
    "custom": {
        "ideal": "Multi-branch groups and salons with special workflows.",
        "problem": "A standard package does not fit.",
        "includes": ["Scoped in discovery: multi-branch, integrations, special workflows, custom reports"],
        "deliverables": "Written scope, fixed quote, milestone plan.",
        "limits": ["Priced on scope after a discovery call"],
        "why": "Built around your exact workflow.",
    },
}

# ---------------------------------------------------------------- plan comparison matrix (brochure / proposal / docx)
Y, N = "✓", "—"
MATRIX = [
    ("Bilingual website (up to 5 pages)", Y, Y, Y, "Tailored"),
    ("Google Maps profile setup + optimisation", Y, Y, Y, "Tailored"),
    ("WhatsApp click-to-book + call buttons", Y, Y, Y, Y),
    ("Basic SEO (titles, schema, sitemap, speed)", Y, Y, Y, Y),
    ("Google-review link + printable QR", Y, Y, Y, Y),
    ("Online booking requests + owner dashboard", N, Y, Y, "Tailored"),
    ("Client list, notes, visit history", N, Y, Y, "Tailored"),
    ("One-tap WhatsApp reminders", N, Y, Y, "Tailored"),
    ("Monthly Google + website report", N, Y, Y, "Tailored"),
    ("Expense manager + monthly profit view", N, f"Add-on {inr(ADD['expense']['price'])}", Y, "Tailored"),
    ("Staff schedules, attendance-lite, roles", N, N, Y, "Tailored"),
    ("Extra branch", f"{inr(P['extra_branch_annual'])}/yr", f"{inr(P['extra_branch_annual'])}/yr", f"{inr(P['extra_branch_annual'])}/yr", "In scope"),
]

# ---------------------------------------------------------------- feature roadmap (strategy)
# (feature, customer problem, business value, bucket, complexity, status, recommendation)
ROADMAP = [
    ("Bilingual website (GU + EN)", "Not found or trusted online", "Lead capture, trust", "Must-have", "Low", "Ready now", "Sell today"),
    ("Google Business Profile + Maps embed + LocalBusiness schema", "Invisible on Maps", "Walk-ins and calls", "Must-have", "Low", "Ready now", "Sell today; core of the offer"),
    ("WhatsApp click-to-book + call buttons", "Clients prefer WhatsApp", "Fewer lost enquiries", "Must-have", "Low", "Ready now", "Sell today"),
    ("Review link + QR", "Few Google reviews", "Prominence signal", "Must-have", "Low", "Ready now", "Sell today"),
    ("Booking request form → dashboard", "Calls and DMs scattered", "One list of bookings", "Must-have (Growth)", "Medium", "Founding-partner build", "Build first; 2–3 weeks"),
    ("Client list + notes + visit history", "History lives in memory", "Retention", "High-value", "Medium", "Founding-partner build", "Build with booking"),
    ("One-tap WhatsApp reminders", "No-shows", "Fewer empty slots", "High-value", "Low", "Founding-partner build", "Build with booking"),
    ("Expense manager (categories, vendors, salaries/advances, monthly summary, Excel)", "Owner cannot see profit", "Differentiator vs apps", "High-value (Pro)", "Medium", "Founding-partner build", "Build second; validate with 3 salons"),
    ("Daily income entry + profit snapshot", "Same", "Completes the expense story", "High-value (Pro)", "Low–Medium", "Founding-partner build", "Build with expense"),
    ("Staff schedules + attendance-lite + roles", "Rota by hand", "Fewer clashes", "High-value (Pro)", "Medium", "Roadmap", "After first 3 clients"),
    ("Monthly Google + website report", "No proof of value", "Retention, upsell", "High-value", "Low", "Ready now (manual)", "Start manual, automate later"),
    ("Automated WhatsApp API reminders", "Manual effort", "Convenience", "Optional premium", "Medium", "Roadmap", "Add-on; provider cost at actual"),
    ("Online payments / deposits", "No-shows, cash handling", "Fewer no-shows", "Optional premium", "Medium", "Roadmap", "Add-on"),
    ("Memberships / packages tracker", "Repeat visits", "Retention", "Optional premium", "Medium", "Roadmap", "Add-on"),
    ("Installable app (PWA)", "App-like feel", "Convenience", "Optional premium", "Medium", "Roadmap", "Add-on"),
    ("AI features (reply drafting, caption generation)", "Time spent writing", "Internal efficiency first", "Future", "Low–Medium", "Roadmap", "Use internally for Google posts before selling it"),
    ("Multi-branch", "Chains", "Higher ticket", "Future", "High", "Scoped per salon", "Custom quote only"),
    ("GST billing / POS", "Competitors are strong", "Low differentiation", "Not worth building yet", "High", "—", "Integrate with the salon's current tool"),
    ("Inventory management", "Competitors are strong", "Low differentiation", "Not worth building yet", "High", "—", "Skip"),
    ("Native iOS/Android apps", "App store presence", "High cost, low need", "Not worth building yet", "High", "—", "PWA instead"),
]

# ---------------------------------------------------------------- competitor table (strategy)
# (name, target, model, entry, mid, premium, key features, source, label)  label: F fact (official page) / C claim or third-party report / O observation
COMP = [
    ("Fresha", "Solo to multi-chair salons, global", "Free core + paid add-ons + marketplace fee", "₹0 core", "Add-ons reported to pass ₹7,000/mo for a 5-staff salon (competitor blog)", "Team plan about $14.95 per bookable member (reported)",
     "Booking, POS, marketplace. Fee: 20% of a new client's first booking from its marketplace, minimum about $6 (published per summaries)", "fresha.com/pricing; salonboost.online; schedulingkit.com", "C"),
    ("Zylu", "Small to mid salons, India-fit", "Monthly subscription, INR plans", "Lite ₹799/mo", "Grow ₹1,599/mo", "Standard / Premium higher (INR not captured; intl $69 / $199)",
     "Booking, POS, staff and commission, CRM, inventory, memberships, reminders; official page lists WhatsApp API included; done-for-you setup ₹1,999 + GST", "zylu.co/pricing; capterra.com/p/247991/Zylu", "F"),
    ("MioSalon", "Small to mid salons, India", "Tiered: Free / Standard / Premium", "Prices not shown on official page", "Reported ₹1,499 to ₹4,200/mo (third party)", "Premium: dedicated account manager",
     "GST billing, expense and cash-register reports (official support docs), analytics; WhatsApp API reported ₹2,000/mo extra (competitor blog)", "miosalon.com/pricing; support.miosalon.com", "C"),
    ("DINGG", "Growing salons and chains", "Quote on request", "On request (official page: book a demo)", "Reported about ₹1,999 to ₹2,999/mo (third party)", "Multi-location on request",
     "Customer profiles, reminders, expense tracking, staff attendance, salary and commission (official blog)", "dingg.app; cleomitra.com; softwaresuggest.com", "C"),
    ("Salonist", "Small to mid salons", "Monthly subscription", "Reported ₹1,056/mo", "Reported up to ₹1,887/mo; others report about ₹4,000", "n/a",
     "POS, CRM, loyalty, app; WhatsApp automation reported as paid", "salonboost.online; cleomitra.com", "C"),
    ("Zenoti", "Enterprise chains", "Custom quote", "n/a", "n/a", "Reported ₹15,000 to ₹2,00,000/mo (third party)",
     "Multi-location, payroll, analytics; long onboarding reported", "zenoti.com; codingclave.com", "C"),
    ("Vagaro", "Global, US-led", "Monthly per bookable staff", "$30/mo (1 staff)", "$50 to $70/mo", "$90/mo (7+ staff), reported",
     "Booking, marketplace, POS; manual GST setup reported for India", "glossystack.com; cleomitra.com", "C"),
    ("Khatabook", "Any small business (not salon-specific)", "Free core", "₹0", "n/a", "n/a", "Expense and ledger tracking", "capterra.com/p/197475/KhataBook", "C"),
    ("Vyapar", "Small business billing, GST", "Annual licence", "₹2,399/yr (desktop)", "₹2,799 to ₹3,499/yr (desktop + mobile)", "n/a", "GST billing, inventory, expenses", "getapp.com; capterra.com/p/180579/Vyapar", "C"),
    ("Freelance site + Google setup", "Local businesses", "One-time + optional monthly", "Site ₹5,000 to ₹15,000; Google profile setup ₹2,000 to ₹8,000", "Site ₹12,500 to ₹37,500", "Local SEO ₹4,000 to ₹15,000/mo (reported)",
     "Website, GBP setup, citations, reviews", "pagetraffic.in; kabirdigitalmedia.in; jigsawkraft.com", "C"),
    ("Notebook / WhatsApp / Instagram DM / Excel", "Most small salons", "No fee", "₹0", "—", "—", "Total flexibility, no structure. Time and missed bookings are the cost.", "Observation", "O"),
]
LBL = {"F": ("Verified: official page", "l-fact"), "C": ("Competitor claim / third-party report", "l-claim"), "O": ("Research observation", "l-obs")}

SOURCES = [
    ("Google Business Profile Help: how local ranking is determined (quote: 'There's no way to request or pay for a better local ranking on Google.')", "https://support.google.com/business/answer/7091"),
    ("Zylu pricing (official)", "https://zylu.co/pricing/"),
    ("Fresha pricing (official)", "https://www.fresha.com/pricing"),
    ("MioSalon expense management support article", "https://support.miosalon.com/support/solutions/articles/19000157783-tutorial-46-what-is-expense-management-and-how-to-manage-them-"),
    ("DINGG salon expense management guide", "https://dingg.app/blogs/expense-management-for-your-salon-and-spa"),
    ("Salon software comparison, India (SalonBoost; competitor blog, treat as biased)", "https://salonboost.online/compare-salon-softwares"),
    ("Top salon software in India (Cleomitra; competitor blog)", "https://www.cleomitra.com/blog/top-10-best-salon-management-software-india-2026"),
    ("Salon management software cost in India (CodingClave)", "https://codingclave.com/guides/salon-management-software-cost-india-2026"),
    ("Local SEO pricing, India (Kabir Digital Media; agency page)", "https://kabirdigitalmedia.in/local-seo-pricing-packages/"),
    ("Google My Business optimisation cost, India (Jigsawkraft)", "https://www.jigsawkraft.com/post/google-my-business-optimization-cost-in-india-2026-real-pricing-breakdown-for-local-businesses"),
    ("Website design cost in India 2026 (PageTraffic)", "https://www.pagetraffic.in/blog/website-design-cost/"),
    ("Vyapar pricing (GetApp)", "https://www.getapp.com/finance-accounting-software/a/vyapar/"),
    ("WhatsApp Business API pricing, India 2026 (Whautomate; utility about ₹0.115 per message)", "https://whautomate.com/whatsapp-business-api-pricing-india"),
    ("Internet in India 2024, IAMAI-KANTAR, as reported by IBEF (886 million users; Indic-language growth)", "https://www.ibef.org/news/india-s-internet-users-to-exceed-900-million-in-2025-driven-by-indic-languages"),
    ("Salon booking and no-show statistics (SchedulingKit, Zenoti survey summaries)", "https://schedulingkit.com/statistics/salon-industry-statistics"),
    ("Salon trends 2026: memberships, Instagram discovery (ReSpark, DINGG)", "https://respark.in/blog/salon-trends/"),
]

PROMOS = [
    ("Free Google & website audit", "Costs about 30 minutes per salon. Creates the reason to talk and shows a specific problem.", "Low cost; high lead quality", "Positive if specific; cheap if sent to everyone", "Keep. Limit to salons you have researched."),
    ("Founding partner (3 salons): 30% off setup, 3-year price lock", "Setup revenue down by 30% on three accounts; locks yearly fee.", "Buys testimonials, photos and platform feedback", "Positive if limited and honest about why", "Keep. Close after three; never reopen."),
    ("Starter credit: 50% of Starter setup credited toward Growth/Pro within 6 months", "Gives up about ₹6,500 of margin on upgrades.", "Makes the small first step feel safe and creates an upgrade path", "Positive: shows a ladder, not a trap", "Keep. Expect upgrades to repay it."),
    ("Pay 2 years ahead: 10% off platform fee", "Costs ₹600–₹3,600 per account over two years.", "Improves cash flow and retention", "Neutral", "Keep."),
    ("Referral credit ₹2,000", "Cheaper than most acquisition costs.", "Warm leads from salon networks", "Positive", "Keep."),
    ("Blanket discounts / festival sales", "Reduce margin on every deal.", "Trains buyers to wait for a discount", "Makes the product look cheap", "Avoid."),
]

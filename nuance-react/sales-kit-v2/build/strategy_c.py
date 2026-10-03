"""Strategy part C: language, visual review, website and funnel, sales tools, launch plan, final recommendations."""
from lib import *
from content import *

# one photo, one placement (kept in sync with the build modules; also written to the licence log)
PHOTO_MAP = {
    "salon_woman_wavy": "Brochure p1 (cover)", "colour_busy": "Brochure p2 (problem)", "interior_modern": "Word master cover",
    "arch_mirror_stylist": "Brochure p5 (see it first)", "stylist_cutting": "Brochure p9 (promises)", "avantgarde": "Brochure p11 (closing)",
    "interior_backwash": "One-pager", "stylist_mannequin": "Deck slide 1 (cover)", "stylist_male_blonde": "Deck slide 2 (journey)", "barbershop_wide": "Deck slide 3 (reality)",
    "receptionist_tablet": "Deck slide 9 (expense)", "cape_client": "Deck slide 10 (clarity)", "interior_mirrors": "Deck slide 14 (process)",
    "stylist_client_colour": "Deck slide 17 (questions)", "reception_desk": "Deck slide 18 (closing)",
    "portrait": "UI mock-up: website home (only)", "stylist_pair": "UI mock-up: stylist avatar", "stylist_mirror_smile": "UI mock-up: stylist avatar", "barber_elder": "UI mock-up: stylist avatar",
}


def language():
    seg = [
        ["Neighbourhood salon owner (WhatsApp, in person)", "Gujarati first, English for tech words", "Fastest to understand and trust; most conversation is spoken", "નમસ્તે, તમારો સલૂન Google Maps પર શોધાય છે?"],
        ["Salon's own client website", "Bilingual with a language toggle; default by locality", "Clients mix languages; Gujarati builds local trust, English suits urban and premium", "Book now · બુકિંગ કરો"],
        ["Boutique and bridal studios, Instagram", "English headline + Gujarati supporting line, or natural mix", "Brand-led audience that reads both", "Be found. Be booked. · શોધાઓ. બુકિંગ મેળવો."],
        ["Barbershops and men's salons", "Gujarati/English mix", "Casual tone; technical words are English anyway", "ખર્ચ અને કમાણી, એક જ જગ્યાએ"],
        ["LinkedIn, multi-branch owners", "English", "Professional context; case-study style", "A single view of every branch"],
        ["Brochure and one-pager", "Bilingual headlines + a Gujarati summary page", "Print is shared and forwarded; one file serves both audiences", "See the Gujarati page of the brochure"],
        ["Google Business Profile", "English name and categories; description in English with a Gujarati line", "Search matching uses English categories; Gujarati reassures locals", "Hair salon · વાળ અને બ્યુટી સલૂન"],
        ["Meeting deck", "English slides, Gujarati headings, spoken Gujarati", "Slides stay printable; conversation stays comfortable", "Each deck slide has a Gujarati line"],
        ["Proposal and agreement", "English, with a Gujarati summary on request", "Legal clarity", "Summary in Gujarati for the owner"],
    ]
    ex = [
        ["Headline", "Get found on Google Maps. Get booked on WhatsApp.", "Google Maps પર શોધાઓ. WhatsApp પર બુકિંગ મેળવો.", "તમારો સલૂન, હવે Google Maps પર"],
        ["Product description", "A Gujarati + English website, a verified Google profile and a WhatsApp booking button, ready in weeks.", "બે ભાષામાં વેબસાઇટ, Google પર પાકી પ્રોફાઇલ અને WhatsApp બુકિંગનું બટન, થોડા અઠવાડિયામાં તૈયાર.", "Website + Google profile + WhatsApp booking, બધું એક પેકેજમાં"],
        ["Social caption", "Do customers searching 'salon near me' find you? Message us for a free Google audit.", "નજીકમાં સલૂન શોધતા ગ્રાહકને તમે મળો છો? મફત Google ઓડિટ માટે મેસેજ કરો.", "‘Salon near me’ માં તમારું નામ આવે છે? Free audit માટે મેસેજ કરો."],
        ["WhatsApp message", "Hi [Name], I checked [Salon]'s Google profile and found 3 small fixes. Can I send the 1-page report?", "નમસ્તે [નામ], મેં [સલૂન] ની Google પ્રોફાઇલ ચેક કરી. 3 નાના સુધારા મળ્યા. 1 પાનાનો રિપોર્ટ મોકલું?", "Hi [નામ], તમારી Google profile માં 3 નાના fixes મળ્યા. Report મોકલું?"],
        ["Website section headings", "Services · Prices · Stylists · Gallery · Contact · Book now", "સર્વિસ · ભાવ · સ્ટાઇલિસ્ટ · ગેલેરી · સંપર્ક · બુકિંગ કરો", "Services · ભાવ · Stylists · Gallery · Contact · Book કરો"],
        ["Sales pitch (30 seconds)", "We build websites, Google Maps presence and booking systems for salons, around how you work. We start with a free audit, then build only what you need.", "અમે સલૂન માટે વેબસાઇટ, Google Maps અને બુકિંગ સિસ્ટમ બનાવીએ છીએ, તમારા કામની રીત પ્રમાણે. પહેલા મફત ઓડિટ કરીએ, પછી જરૂર હોય એટલું જ બનાવીએ.", "અમે salons માટે website, Google Maps અને booking બનાવીએ છીએ. પહેલા free audit, પછી જરૂર હોય એટલું જ."],
        ["Honest limit", "No one can guarantee a top Maps rank. We make your profile, reviews and website strong.", "Maps પર ટોચના રેન્કની ગેરંટી કોઈ આપી શકતું નથી. અમે પ્રોફાઇલ, રિવ્યૂ અને વેબસાઇટ મજબૂત બનાવીએ છીએ.", "Rank ની ગેરંટી નહીં, પણ profile + reviews + website પાકા"],
    ]
    return ("7 · Gujarati and English", [
        ("p", "**Do not decide on preference alone.** What the evidence supports: India's internet growth is driven by Indic-language users (IAMAI-KANTAR 'Internet in India 2024', reported by IBEF: about 886 million users in 2024, with Indic languages driving growth; the same coverage reports that about 57% of urban users also prefer regional-language content). I did not find Gujarati-specific data on small-business owners, so treat the recommendation below as a hypothesis to test with real replies."),
        ("h3", "Recommendation by segment and channel"),
        ("table", ["Segment / channel", "Language", "Why", "Example"], seg),
        ("callout", "**Rule of thumb:** speak and message neighbourhood owners in Gujarati; keep brand and technical words (Google Maps, WhatsApp, booking, dashboard) in English; make every public document bilingual at headline level. **Test:** send half of the first 40 messages in Gujarati and half in English and compare reply rates."),
        ("h3", "Examples: English, Gujarati and natural mix"),
        ("table", ["Use", "English", "Gujarati", "Gujarati-English mix"], ex),
        ("note", "Drafted for natural, simple Gujarati rather than word-for-word translation. A native speaker should proofread before printing or publishing."),
    ])


def visual():
    rows = [
        ["Same three photos reused about 14 times", "Looks templated; weakens trust", "One photo, one placement; use real UI screens on product pages; real salon photos from the first partner", "Brochure cover: new licensed portrait; 'what we build' page: a modern salon interior; no photo repeats"],
        ["Generic 'software services' language", "Owners cannot see what they get", "Outcome headlines and plain-language descriptions", "Before: 'Booking & appointments.' After: 'Clients tap WhatsApp, the request lands in one list, you confirm in a tap.'"],
        ["Six plan prices plus five add-ons", "Decision fatigue; unclear what is one-time vs yearly", "Three outcome packages, one 'from' price, setup and yearly shown on separate lines", "Starter: ₹12,999 setup + ₹5,999 a year (about ₹500 a month)"],
        ["Features promised that do not exist yet", "Breaks trust at delivery", "Status chips: Ready now / Founding-partner build / Roadmap", "Growth: 'Founding-partner build: delivered together, with a written timeline'"],
        ["No Google Maps or local SEO story", "Misses the main reason local customers arrive", "A Google Maps page and package; honest 'no ranking guarantee'", "'We make your profile, reviews and website strong; we never promise a position.'"],
        ["No expense or money view", "Misses the owner's biggest worry", "Expense manager in Pro and as an add-on", "'See this month's earnings and expenses at a glance.'"],
        ["English only", "Weak connection with neighbourhood owners", "Gujarati headlines everywhere; Gujarati summary page; Gujarati outreach", "Cover: 'તમારો સલૂન. તમારી સ્ટાઇલ. તમારી સિસ્ટમ.'"],
        ["No proof or trust signals", "Cold buyers hesitate", "Founding-partner programme; photo licence log; honest limits; real reviews when available", "'First three salons get 30% off setup and a 3-year price lock, in return for feedback and a testimonial.'"],
        ["A4 PDFs are small on phones", "Owners read on WhatsApp", "Bilingual one-pager and an HTML calculator", "Share the one-pager first, the brochure second"],
    ]
    shots = ["Welcome moment at a real partner salon (with written release)", "Stylist and client at the mirror", "Owner with a phone showing the Google profile", "Before/after of the Google profile and website on a phone", "Reception or WhatsApp booking on a phone", "Price list board / services menu in Gujarati", "Team photo", "Exterior with the shop name (for Maps)"]
    return ("8 · Brochure, deck and visual review", [
        ("p", "Review of the previous kit as a brand and conversion expert. The scorecard is in section 1; this section lists each major problem with its fix and example."),
        ("table", ["Current issue", "Why it matters", "Suggested improvement", "Example of revised content"], rows),
        ("h3", "Photo policy and placement map"),
        ("ul", ["Licensed photography only (Pexels licence), logged with source, photographer and date. One photo, one placement.",
                "Pexels licence: free for commercial use; do not imply endorsement; do not resell unaltered. Recognisable people are stock models, not clients; never present them as real clients.",
                "Replace with partner-salon photos (with written releases) as soon as the first founding partner launches.",
                "Product screenshots and diagrams are used where the topic is software, not mood photography."]),
        ("table", ["Photo file", "Placement"], [[k, v] for k, v in PHOTO_MAP.items()]),
        ("h3", "Shot list for the first partner salon"),
        ("ul", shots),
    ])


def website():
    site = [
        ["Home", "Explain the offer in 5 seconds", "Hero, problem, 3-step solution, pricing preview, FAQ, free-audit form"],
        ["Salons (product overview)", "Show the ladder", "Get found / get booked / know your numbers; screens; status chips"],
        ["Features", "Detail without jargon", "Google Maps, WhatsApp booking, dashboard, expense manager, bilingual site"],
        ["Plans and pricing", "Clear packages", "Starter / Growth / Pro / Custom, yearly model, add-ons, calculator"],
        ["Use cases", "Show who it is for", "Neighbourhood salon, boutique, barbershop (real ones as they launch)"],
        ["FAQ", "Remove doubts", "Ranking promise, billing software, language, ownership, support"],
        ["About DevWithDevansh", "Trust", "Who we are, how we work, limits, contact"],
        ["Contact and consultation", "Convert", "WhatsApp button, short form, calendar link"],
        ["Demo", "Show, do not tell", "Personalised demo links for each prospect"],
    ]
    landing = [
        ["Hero headline", "Get found on Google Maps. Get booked on WhatsApp. Know your numbers."],
        ["Hero (Gujarati)", "Google Maps પર શોધાઓ. WhatsApp પર બુકિંગ મેળવો. તમારા આંકડા જાણો."],
        ["Subheadline", "Websites, booking and simple books for salons in Gujarat. Gujarati and English. Start with a free Google audit."],
        ["Primary / secondary CTA", "Get my free Google audit  ·  See the salon demo"],
        ["Problem", "Customers search 'salon near me' and book the one they can find, trust and reach quickly. If your profile is thin, your website is missing and bookings live in a diary, they go elsewhere."],
        ["Solution (3 steps)", "1 Get found: bilingual website and a verified Google profile. 2 Get booked: WhatsApp booking, then a simple dashboard. 3 Know your numbers: expenses and a monthly summary."],
        ["Benefits", "More people can find you · Booking in one tap · One place for clients · A clear monthly picture · No new app to learn"],
        ["Features", "Gujarati + English site · Google Maps setup · WhatsApp booking · Booking dashboard · Client notes · Expense manager"],
        ["Pricing preview", f"Starter from {inr(T['starter']['setup'])} setup + {inr(annual('starter'))} a year. Growth and Pro for salons that want bookings and books in one system."],
        ["Trust section", "Open prices. Honest status on every feature. No ranking guarantees. Photos are licensed and logged. Real salon stories appear here as they launch, never before."],
        ["FAQ", "Do you guarantee a top Google rank? No: Google does not allow paid ranking. · Do I need to change my billing software? No. · Is Gujarati supported? Yes. · What after launch? The yearly plan covers hosting, backups, updates and support. · Can I upgrade later? Yes, with a credit on Starter. · Who owns my data? You."],
    ]
    funnel = [
        ["Lead found", "Salons researched", "Count in tracker", "Tracker"],
        ["Contacted", "Messages sent / visits", "Contacted ÷ researched", "Tracker"],
        ["Reply", "Reply rate", "Replies ÷ contacted", "WhatsApp labels"],
        ["Audit/demo", "Demo booking rate", "Demos ÷ replies", "Calendar"],
        ["Proposal", "Proposal rate", "Proposals ÷ demos", "Tracker"],
        ["Paid", "Proposal conversion", "Won ÷ proposals", "Invoices"],
        ["Acquisition cost", "Hours per customer", "Total sales and delivery-setup hours ÷ customers", "Time log"],
        ["Revenue per customer", "Setup + yearly + add-ons", "Revenue ÷ customers", "Invoices"],
        ["Retention", "Renewal rate", "Renewed ÷ due", "Renewal list"],
        ["Referrals", "Referral rate", "Referred leads ÷ customers", "Tracker"],
    ]
    return ("9 · Website and sales funnel", [
        ("h3", "Website structure"),
        ("table", ["Page", "Purpose", "Sections"], site),
        ("h3", "Landing page sample copy"),
        ("table", ["Section", "Copy"], landing),
        ("h3", "Funnel and metrics"),
        ("p", "Stages: lead found → contacted → reply → audit/demo → proposal → paid → live → review and referral → renewal. No benchmarks are assumed; set targets after the first 40 contacts."),
        ("table", ["Stage", "Metric", "How to measure", "Where"], funnel),
    ])


def sales():
    q = ["How do most new clients find your salon today?", "Do clients book by call, WhatsApp, Instagram, walk-in or website?", "What happens when you search 'salon near me' on your phone?", "How do you keep track of tomorrow's appointments?",
         "What do you keep about returning clients, and where?", "How do you track daily expenses, salaries and vendor dues?", "How long does month-end take?", "Which tools do you already use and like?", "One location or several?", "What is the one thing you most want to be simpler?"]
    demo = ["Search 'salon near me' with them and show where they appear", "Show their personalised website demo (their name, services, Gujarati toggle)", "Tap WhatsApp booking and show the message arriving", "Show the dashboard (clearly labelled illustrative until built)", "Show the expense summary", "Agree one next step: proposal, pilot or nothing"]
    prop = ["What we heard", "What we will build and what we will not", "Plan, status of each module (Ready / Founding-partner build)", "Timeline", "Investment: setup, yearly, add-ons, third-party", "Support and response times", "Ownership and data", "Founding-partner terms if applicable", "Acceptance"]
    seq = [["Same day", "WhatsApp thanks + one-page summary"], ["Day 2", "Proposal"], ["Day 5", "Short follow-up with one relevant example"], ["Day 10", "Check-in; offer a small first step (Maps setup)"], ["Day 20", "Polite close; move to nurture list"]]
    onb = ["Signed proposal and first payment", "Collect: logo, 10+ photos, service list with prices, hours, address, phone, WhatsApp number", "Domain and Google profile access", "Gujarati + English copy approved", "Design preview approved", "Build, test on phones", "Launch; Google profile verified and linked", "Handover call; review QR printed", "Day 30 check-in; request review and testimonial", "Renewal date set; reminder 30 days before"]
    obj = [
        ["We already use software", "Good. What do you like and miss? We don't replace billing. We make you easier to find and book, and we work with your tool."],
        ["We manage everything manually", "Which part takes the longest? We can start with Google Maps and WhatsApp booking: nothing new to learn."],
        ["This is too expensive", f"Starter is about {monthly(annual('starter') + T['starter']['setup'])} a month in year one (setup spread over 12 months) and covers the site and the Maps work. What would you compare it with? There is also a ₹4,999 Maps-only option and a 50% Starter credit toward Growth."],
        ["We do not need this", "Search 'salon near me' on your phone with me. If you appear first with photos and reviews, we may not be needed; if not, here is the gap."],
        ["Can you customise it?", "Starter has a fixed scope, Growth and Pro are configured to your services and team, Custom is quoted after discovery."],
        ["What happens after implementation?", "The yearly plan covers hosting, backups, updates and support, with response times written in the proposal."],
        ["How is this different from other tools?", "Apps are tools you set up yourself. We do the Google, website and booking set-up for you in Gujarati and English, and work with your app if you have one."],
        ["Will you guarantee top ranking or more bookings?", "No. Google does not allow paid ranking and no one can promise bookings. We strengthen the profile, reviews and website and report what changes."],
        ["Is the booking system built already?", "Starter is ready. Growth and Pro are built with our first three partners; we show what exists, give a written timeline, and discount setup for it."],
    ]
    return ("10 · Sales tools and objections", [
        ("h3", "30-second pitch"),
        ("callout", "**EN:** We build websites, Google Maps presence and booking systems for salons, around how you work. We start with a free audit of your Google profile and website, then build only what you need.  **GU:** અમે સલૂન માટે વેબસાઇટ, Google Maps અને બુકિંગ સિસ્ટમ બનાવીએ છીએ, તમારા કામની રીત પ્રમાણે. પહેલા તમારી પ્રોફાઇલનું મફત ઓડિટ કરીએ, પછી જરૂર હોય એટલું જ બનાવીએ."),
        ("h3", "Two-minute explanation"),
        ("p", "Most customers find a salon by searching on their phone. We make sure you appear with correct hours, services, photos and reviews, and a Gujarati and English website that explains your services and prices. Booking is one tap on WhatsApp. If you want more, your requests land in a simple dashboard with client notes, and later your daily expenses and salaries are kept in one place with a monthly summary. You choose the step; we only build what fits."),
        ("h3", "Discovery questions (use 2–3 per meeting)"),
        ("ul", q),
        ("h3", "Demonstration flow"),
        ("ol", demo),
        ("h3", "Proposal outline"),
        ("ol", prop),
        ("h3", "Follow-up sequence"),
        ("table", ["When", "What"], seq),
        ("h3", "Onboarding checklist"),
        ("ul", onb),
        ("h3", "Objections and responses"),
        ("table", ["They say", "You say"], obj),
        ("note", "No pressure tactics: no fake urgency, no invented discounts. The founding-partner offer is real and limited to three salons."),
    ])


def plan90():
    rows = [
        ["Days 1–30 · Validate and prepare", "Finish prices and Gujarati proofreading; claim DWD's Google profile; list 100 salons; audit 30; 10 conversations; build the Starter demo with a Gujarati toggle; start the booking core", "Updated kit, tracker, Starter demo, 30 audits, 10 interviews", "About 60–80 h", "Phone, WhatsApp number, one city focus", "3 meetings booked; 2 owners say 'send a proposal'", "Over-building before selling; Gujarati errors", "City focus; final prices; founding-partner terms"],
        ["Days 31–60 · Outreach and pilots", "Contact 25 salons a week; run demos; sign up to 3 founding partners; deliver Starter, begin Growth builds; collect feedback weekly; test Gujarati vs English", "3 signed partners; dashboard in use at 1–2 salons; message results", "About 15–20 h a week", "Booking core working; partner photos and content", "3 signed; 1 live; reply-rate difference known", "Delivery delay; scope creep; too many unpaid pilots", "Which package to push; whether to keep Growth price"],
        ["Days 61–90 · Improve and repeat", "Ship expense manager to 1–2 partners; publish a real case study; review conversion at each funnel stage; add referral and partner channel; renew pricing", "Case study, testimonial, onboarding checklist, repeatable process, profit review", "About 15 h a week", "Partner permission to show work", "2 salons using the dashboard for 30 days; 1 testimonial; first referral", "Single point of failure (one developer); support load", "Invest more, hire, or narrow the offer"],
    ]
    names = ["Key activities", "Deliverables", "Estimated effort", "Dependencies", "Success indicators", "Risks", "Decisions before proceeding"]
    tr = [[names[i]] + [r[i + 1] for r in rows] for i in range(7)]
    return ("11 · 30-, 60- and 90-day plan", [
        ("table", ["", rows[0][0], rows[1][0], rows[2][0]], tr),
        ("note", "Success indicators are checkpoints to judge evidence, not predictions. Adjust after the first 40 contacts."),
    ])


def final():
    qa = [
        ["1 · Is it ready to sell as is?", "Partly. Starter (bilingual site, Google Maps setup, WhatsApp booking) can be sold and delivered now. Growth and Pro should be sold only as founding-partner builds with a written timeline."],
        ["2 · Fix before launch", "Confirm prices; proofread Gujarati; claim DWD's own Google profile; add WhatsApp number; Gujarati toggle on the demo; a live Starter demo link; remove any claim that a module exists before it does."],
        ["3 · Outside the initial scope", "GST billing and POS, inventory, native apps, multi-branch reporting, automated WhatsApp API (until requested by three clients)."],
        ["4 · First problem to validate", "'Customers cannot find us on Google Maps and bookings are scattered across call, DM and diary.' Validate the expense/profit need second, with barbershop and boutique owners."],
        ["5 · Initial packages", "Free audit → Google Maps setup (₹4,999) or Starter → Growth as a founding-partner build."],
        ["6 · Pricing models to test", "Setup + yearly vs a quarterly instalment for Starter; Starter at ₹12,999 vs ₹9,999 across two groups of 20 contacts; Maps-only ₹4,999 as the entry step."],
        ["7 · Positioning vs alternatives", "Not another app. The local, done-for-you way to be found, booked and organised, in Gujarati and English, working alongside the tool they already use."],
        ["8 · Channels to test first", "In-person visits, WhatsApp with a specific audit, Google Maps research, and two partner referrals. Instagram and LinkedIn second."],
        ["9 · First 10 acquisition attempts", "Ten salons from two neighbouring streets; audit each; visit five and WhatsApp five (half in Gujarati); offer the audit report; log replies; follow the 14-day cadence."],
        ["10 · Evidence to invest more", "Examples to agree in advance: at least 3 paying clients; 2 salons using the dashboard daily for 30 days; 1 genuine testimonial; reply and meeting rates that repeat in a second area. No unsupported success prediction."],
    ]
    act = [
        ["Do immediately", "Confirm prices; send Gujarati copy for proofreading; claim DWD's Google profile; add WhatsApp number; start the 100-salon list; run 10 audits"],
        ["Do before launch", "Starter demo with Gujarati toggle; licence log; proposal template reviewed; onboarding checklist; renewal reminder routine"],
        ["Test with customers", "Gujarati vs English openers; Starter price points; Maps-only entry; in-person vs WhatsApp; expense manager interest"],
        ["Build later", "Expense manager (after booking core), staff rota, WhatsApp API, memberships, payments, PWA"],
        ["Avoid for now", "GST/POS, inventory, native apps, blanket discounts, ranking promises, copying every competitor feature"],
    ]
    dec = ["Final prices and whether to publish the full ladder or only 'from' prices", "Founding-partner terms (30% off, 3 slots, 3-year lock)", "GST registration and invoicing", "Which city or neighbourhoods first", "Capacity per month and who builds the booking core", "Photo policy: stock now, partner photos later", "Gujarati proofreader", "WhatsApp number and Google profile owner"]
    ass = ["Prices are proposals derived from third-party market reports (October 2026).", "Hourly cost, delivery and support hours, and infrastructure costs are assumptions.", "Gujarati copy has not been proofread by a native speaker.", "Competitor figures may be stale or biased; MioSalon and DINGG do not publish prices.", "No Gujarati-specific small-business language data was found.", "The prompt referred to 'Forge'; this kit applies it to the salon product (Nuance / Salon kit)."]
    return ("12 · Final recommendations", [
        ("table", ["Question", "Answer"], qa),
        ("h3", "Prioritised action list"),
        ("table", ["When", "Actions"], act),
        ("h3", "Decisions that need your input"),
        ("ul", dec),
        ("h3", "Assumptions"),
        ("ul", ass),
        ("h3", "Sources"),
        ("ul", [f"{t}: {u}" for t, u in SOURCES]),
    ])

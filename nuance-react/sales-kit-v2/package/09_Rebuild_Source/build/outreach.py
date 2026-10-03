"""Outreach scripts (PDF + Markdown): English and Gujarati, Google-audit-led. Edit freely, then re-run build_all.py."""
import html as H
from lib import *
from content import GU

CRED = P["offers"]["upgrade_credit_pct"]
# (title, channel, when, language, body). Placeholders in [brackets].
SCRIPTS = [
    ("First message (Google Maps observation)", "WhatsApp", "Day 0", "EN",
     "Hi [Name], this is Devansh. I looked at [Salon name] on Google Maps. [One true, specific observation, e.g. \"Your photos are great but there is no link to book or a website.\"]\n\nQuick question: do most of your bookings come by call, WhatsApp or Instagram?"),
    ("First message (Google Maps observation)", "WhatsApp", "Day 0", "GU",
     "નમસ્તે [નામ] ભાઈ/બેન, હું દેવાંશ. [સલૂનનું નામ] ને Google Maps પર જોયું. [એક સાચું, ચોક્કસ અવલોકન, જેમ કે: ‘ફોટા સરસ છે, પણ વેબસાઇટની લિંક અને બુકિંગનો રસ્તો દેખાતો નથી.’]\n\nએક નાનો પ્રશ્ન: તમારા મોટા ભાગના બુકિંગ કોલ, WhatsApp કે Instagram પરથી આવે છે?"),
    ("Free audit offer", "WhatsApp", "Day 1–2", "EN",
     "Hi [Name], I checked [Salon name]'s Google profile and website and found 3 small things that could bring you more calls and walk-ins: 1) [..] 2) [..] 3) [..]. Shall I send the 1-page report? It's free, no obligation."),
    ("Free audit offer", "WhatsApp", "Day 1–2", "GU",
     "નમસ્તે [નામ], મેં [સલૂન] ની Google પ્રોફાઇલ અને વેબસાઇટ ચેક કરી. વધુ કોલ અને ગ્રાહક લાવી શકે એવી 3 નાની વાતો મળી: 1) [..] 2) [..] 3) [..]. આખો 1 પાનાનો રિપોર્ટ મફતમાં મોકલું? કોઈ બંધન નથી."),
    ("Instagram opener", "Instagram DM", "Day 2", "EN",
     "Hi! Loved your [specific post/work]. I help salons get found on Google Maps and take bookings on WhatsApp. Curious how clients book with you today: DM, call or a link? No pitch, just learning how salons handle it."),
    ("If they reply: send their demo", "WhatsApp", "Day 3", "EN",
     "Thanks, [Name]! That's helpful. I made a quick idea of how [Salon name] could look online, with your services and a WhatsApp booking button: [link]. It's a concept, not a finished site. Would 10 minutes this week be useful to walk through it?"),
    ("If they reply: send their demo", "WhatsApp", "Day 3", "GU",
     "આભાર [નામ]! ઘણું ઉપયોગી. [સલૂનનું નામ] ઓનલાઇન કેવો દેખાઈ શકે એનો એક નમૂનો બનાવ્યો છે, તમારી સર્વિસ અને WhatsApp બુકિંગ બટન સાથે: [લિંક]. આ ફક્ત નમૂનો છે, તૈયાર વેબસાઇટ નથી. આ અઠવાડિયે 10 મિનિટ બતાવવા મળે?"),
    ("In-person visit", "Visit", "Day 3–9", "EN",
     "\"Hello, I'm Devansh. I help local salons get found on Google Maps. I looked at yours and prepared one page of ideas. Do you have 10 minutes? If it's not useful, I'll leave the page and go.\"  (Bring the one-pager and a tablet with their demo. Go on a quiet weekday afternoon.)"),
    ("Email follow-up", "Email", "Day 6", "EN",
     "Subject: 3 small fixes for [Salon name]'s Google profile\n\nHi [Name],\n\nI looked at [Salon name]'s Google profile and website and noticed [observation]. Fixing it usually helps new clients find you and book more easily, and I'd like to show you what that could look like with your own services and colours.\n\nIt's a free 10-minute call, no obligation. Would [day] at [time] work?\n\nDevansh\nDevWithDevansh · " + WEB + " · [Insert WhatsApp number]"),
    ("Voice note", "WhatsApp", "Day 9", "GU",
     "(30 સેકન્ડ) \"નમસ્તે [નામ], દેવાંશ બોલું છું. [સલૂનનું નામ] માટે એક નાનો નમૂનો બનાવ્યો છે, લિંક મોકલી છે. કામનું ન લાગે તો કોઈ વાંધો નથી, બસ બતાવવાનું મન થયું.\""),
    ("Polite close-out", "WhatsApp", "Day 14", "EN",
     "Hi [Name], I'll stop messaging so I don't crowd you. The demo for [Salon name] is at [link] whenever it's useful. Wishing you a busy season!"),
    ("Polite close-out", "WhatsApp", "Day 14", "GU",
     "નમસ્તે [નામ], વધુ મેસેજ નહીં કરું. [સલૂનનું નામ] નો નમૂનો [લિંક] પર છે, ક્યારેય કામ લાગે તો જોજો. તમારા કામમાં બરકત રહે!"),
    ("Expense manager pitch (barbershops, boutiques)", "WhatsApp", "After reply", "EN",
     "How long does the month-end hisaab of rent, salaries and products take you? We build a simple system where a daily expense takes 30 seconds and the month summary appears on its own. We're building it with our first three salons, so the setup is discounted. Want to see a sample?"),
    ("Expense manager pitch (barbershops, boutiques)", "WhatsApp", "After reply", "GU",
     "મહિનાના અંતે ભાડું, પગાર અને પ્રોડક્ટ ખર્ચનો હિસાબ કરવામાં કેટલો સમય જાય છે? અમે એવી સરળ સિસ્ટમ બનાવીએ છીએ જ્યાં રોજનો ખર્ચ 30 સેકન્ડમાં લખાય અને મહિનાનો સારાંશ આપોઆપ મળે. પહેલા 3 સલૂન સાથે બનાવી રહ્યા છીએ, એટલે સેટઅપ પર છૂટ છે. નમૂનો જોવો છે?"),
    ("After the meeting", "WhatsApp + email", "Within 24 h", "EN",
     "Thanks for your time today, [Name]. As discussed: [plan], setup [amount], yearly platform fee [amount] (about [monthly] a month), third-party charges at actual cost. Status of each module is in the proposal. If you start with Starter, " + str(CRED) + "% of its setup is credited if you upgrade within 6 months. I'll check in on [day]."),
    ("Referral and partner ask", "WhatsApp", "After launch", "EN",
     "Hi [Name], thank you for trusting us with [Salon name]. If you know another salon owner who'd like a similar setup, an introduction would mean a lot, and we'll credit " + inr(P['offers']['referral_credit']) + " to your next yearly fee when they sign."),
    ("Partner pitch (product distributors, equipment dealers, CAs)", "WhatsApp / visit", "Any time", "EN",
     "Hi [Name], I build websites and Google Maps presence for salons. Many of your salon customers are not found online. If you introduce salons who want it, I'll thank you with " + inr(P['offers']['referral_credit']) + " credit or a share you choose, and I'll make sure your customers get a careful start. Can I show you what I do in 10 minutes?"),
    ("Renewal reminder", "Email", "30 days before renewal", "EN",
     "Hi [Name], your [Plan] platform plan for [Salon name] renews on [date] for [amount] + GST as applicable. It covers hosting, backups, security, updates and support. Here is what changed this year: [summary]. Shall I send the invoice, or would you like to add anything first (e.g. Google care, WhatsApp reminders)?"),
    ("Yearly review call", "Call", "Month 11", "EN",
     "Agenda (20 min): 1) what worked this year, 2) what takes your team time now, 3) one add-on worth considering, 4) renewal and the 2-year option (" + str(P['offers']['prepay_2yr_discount_pct']) + "% off the platform fee)."),
]
RULES = [
    "One personalised message per salon. No copy-paste blasts.",
    "Every opener includes one true, specific observation about their salon.",
    "Gujarati for neighbourhood owners on WhatsApp; English for LinkedIn and chains; test half and half and compare replies.",
    "Always make it easy to say no. After day 14, stop.",
    "Never claim results you can't prove: no 'rank #1', no 'double your bookings', no invented client counts.",
    "Say what exists today (Starter) and what is built with founding partners (Growth, Pro).",
    "Keep WhatsApp messages under about 60 words. Use WhatsApp Business and respect its policies.",
    "Have a native speaker proofread the Gujarati before first use.",
]


def build():
    cards = []
    for t, ch, when, lang, body in SCRIPTS:
        b = H.escape(body).replace("\n", "<br>")
        cls = "gu" if lang == "GU" else ""
        cards.append(f'<div class="card" style="margin-bottom:3mm;break-inside:avoid;padding:4.5mm"><div style="display:flex;justify-content:space-between;gap:3mm"><h3 style="font-size:11.5pt;margin:0">{H.escape(t)} <span class="tag">{lang}</span></h3><span class="tag">{ch} · {when}</span></div><p class="small {cls}" style="margin:2mm 0 0;font-size:9.6pt">{b}</p></div>')
    per = 5
    pages = []
    cover = page(f'''<div class="eyebrow">Internal · ready to copy</div><h1 style="font-size:36pt;color:#fff;margin-top:26mm;font-weight:400">Outreach<br>scripts <span style="color:var(--gold);font-style:italic">· English &amp; ગુજરાતી</span></h1>
<p class="lead" style="color:#E9E1D6;max-width:150mm;margin-top:8mm">Messages for every step: first contact led by a Google observation, the free audit, demo, in-person visit, expense pitch, referral and partner asks, and yearly renewal.</p>
<div class="card" style="position:absolute;left:16mm;right:16mm;bottom:16mm;background:#2a2725;border-color:#3b3633;color:#E9E1D6"><div class="eyebrow">Rules</div><ul class="small" style="color:#E9E1D6">{"".join(f"<li>{r}</li>" for r in RULES)}</ul></div>''', cls="dark")
    pages.append(cover)
    for i in range(0, len(cards), per):
        pages.append(page(f'<div class="eyebrow">Scripts</div>{"".join(cards[i:i+per])}', n=i // per + 2, label="DevWithDevansh · Outreach scripts · internal"))
    render("DWD_Salon_Outreach_Scripts", doc("DevWithDevansh – Outreach scripts", pages))
    md = ["# DevWithDevansh – Salon outreach scripts (English and Gujarati)\n", "## Rules\n"] + [f"- {r}" for r in RULES] + [""]
    for t, ch, when, lang, body in SCRIPTS:
        md += [f"## {t} [{lang}]  \n*{ch} · {when}*\n", "```", body, "```\n"]
    (OUT / "DWD_Salon_Outreach_Scripts.md").write_text("\n".join(md), encoding="utf-8")


if __name__ == "__main__":
    build()

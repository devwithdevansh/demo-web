"""Editable Word master: client document copy and tables, full playbook, outreach scripts, photo log, sources.
Same content as the PDFs (shared modules), so a change in pricing.json or content.py flows into every format."""
import json, re
from docx import Document
from docx.shared import Pt, RGBColor, Mm, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from lib import *
from content import *
import strategy
import strategy_c
import outreach

CHAR, GOLD, DGOLD, MIDC = RGBColor(0x0C, 0x0B, 0x0A), RGBColor(0xC9, 0xAB, 0x78), RGBColor(0xA9, 0x89, 0x5A), RGBColor(0x4A, 0x43, 0x3A)
S_, G_, Pr, C_ = T["starter"], T["growth"], T["pro"], T["custom"]
O = P["offers"]


def has_gu(t): return any("઀" <= ch <= "૿" for ch in t)


def set_font(run, name="Calibri", size=None, bold=None, italic=None, color=None):
    run.font.name = name
    rPr = run._r.get_or_add_rPr()
    rf = rPr.find(qn("w:rFonts"))
    if rf is None: rf = OxmlElement("w:rFonts"); rPr.append(rf)
    for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"): rf.set(qn(a), name)
    if size: run.font.size = Pt(size)
    if bold is not None: run.font.bold = bold
    if italic is not None: run.font.italic = italic
    if color is not None: run.font.color.rgb = color


def add_text(p, text, size=10.5, bold=False, italic=False, color=MIDC, serif=False):
    """Adds text with **bold** support; Gujarati runs use Nirmala UI."""
    parts = re.split(r"(\*\*.+?\*\*)", text)
    for part in parts:
        if not part: continue
        b = bold
        if part.startswith("**") and part.endswith("**"): part = part[2:-2]; b = True
        segs = re.split(r"([઀-૿][઀-૿\s,.\-‘’“”()·]*)", part)
        for seg in segs:
            if not seg: continue
            r = p.add_run(seg)
            fam = "Nirmala UI" if has_gu(seg) else ("Cambria" if serif else "Calibri")
            set_font(r, fam, size, b, italic, color)


def shade(cell, hex_):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd"); shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), hex_); tcPr.append(shd)


def set_borders(tbl):
    tblPr = tbl._tbl.tblPr
    b = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{edge}"); e.set(qn("w:val"), "single"); e.set(qn("w:sz"), "4"); e.set(qn("w:color"), "E8DFD0"); b.append(e)
    tblPr.append(b)


def cell_text(cell, v, size, bold=False, color=MIDC):
    cell.text = ""
    txt = v["t"] if isinstance(v, dict) else str(v)
    if isinstance(v, dict): txt = f"[{txt}]"
    lines = txt.split("\n")
    for i, ln in enumerate(lines):
        p = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
        p.paragraph_format.space_after = Pt(1); p.paragraph_format.space_before = Pt(0)
        add_text(p, ln, size, bold, False, color)


def add_table(doc, headers, rows, widths=None, size=None):
    n = len(headers)
    size = size or (8 if n >= 6 else 9)
    t = doc.add_table(rows=1, cols=n); t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False
    set_borders(t)
    for j, h in enumerate(headers):
        c = t.rows[0].cells[j]; shade(c, "0C0B0A"); cell_text(c, h, size, True, GOLD)
    hdr = t.rows[0]._tr.get_or_add_trPr(); th = OxmlElement("w:tblHeader"); th.set(qn("w:val"), "true"); hdr.append(th)
    for r in rows:
        cells = t.add_row().cells
        for j, v in enumerate(r):
            if j == 0: shade(cells[j], "EFE7D8")
            cell_text(cells[j], v, size, j == 0, CHAR if j == 0 else MIDC)
    total = 174.0
    if widths:
        tot = sum(widths)
        for row in t.rows:
            for j, c in enumerate(row.cells): c.width = Mm(total * widths[j] / tot)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


def h(doc, text, level):
    p = doc.add_heading(level=level)
    r = p.add_run(text); set_font(r, "Cambria", {1: 22, 2: 16, 3: 12.5}[level], True, False, CHAR if level < 3 else DGOLD)
    p.paragraph_format.space_before = Pt({1: 18, 2: 14, 3: 8}[level]); p.paragraph_format.space_after = Pt(4); p.paragraph_format.keep_with_next = True
    return p


def para(doc, text, size=10.5, italic=False, color=MIDC, after=4):
    p = doc.add_paragraph(); add_text(p, text, size, False, italic, color); p.paragraph_format.space_after = Pt(after); return p


def bullets(doc, items, numbered=False):
    for it in items:
        p = doc.add_paragraph(style="List Number" if numbered else "List Bullet"); add_text(p, it, 10); p.paragraph_format.space_after = Pt(1)


def callout(doc, text):
    t = doc.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = t.rows[0].cells[0]; shade(c, "0C0B0A"); c.text = ""
    p = c.paragraphs[0]; add_text(p, text, 10, False, False, RGBColor(0xE9, 0xE1, 0xD6))
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def write_blocks(doc, blocks):
    for b in blocks:
        k = b[0]
        if k == "p": para(doc, b[1])
        elif k == "note": para(doc, b[1], 9, True, RGBColor(0x7A, 0x6E, 0x64))
        elif k == "h3": h(doc, b[1], 3)
        elif k == "ul": bullets(doc, b[1])
        elif k == "ol": bullets(doc, b[1], True)
        elif k == "callout": callout(doc, b[1])
        elif k == "table": add_table(doc, b[1], b[2], b[3] if len(b) > 3 else None)
        elif k == "kv":
            h(doc, b[1], 3); add_table(doc, ["Item", "Detail"], b[2], [1, 4], 9)


def picture(doc, path, width_mm, caption=None):
    doc.add_picture(str(path), width=Mm(width_mm))
    if caption: para(doc, caption, 8.5, True, RGBColor(0x7A, 0x6E, 0x64))


def toc(doc):
    p = doc.add_paragraph()
    r = p.add_run(); f1 = OxmlElement("w:fldChar"); f1.set(qn("w:fldCharType"), "begin"); r._r.append(f1)
    r2 = p.add_run(); it = OxmlElement("w:instrText"); it.set(qn("xml:space"), "preserve"); it.text = 'TOC \\o "1-2" \\h \\z \\u'; r2._r.append(it)
    r3 = p.add_run(); f2 = OxmlElement("w:fldChar"); f2.set(qn("w:fldCharType"), "separate"); r3._r.append(f2)
    r4 = p.add_run("Right-click here and choose Update field to build the table of contents."); set_font(r4, "Calibri", 10, False, True, MIDC)
    r5 = p.add_run(); f3 = OxmlElement("w:fldChar"); f3.set(qn("w:fldCharType"), "end"); r5._r.append(f3)


def page_number_footer(section):
    fp = section.footer.paragraphs[0]; fp.text = ""
    add_text(fp, "DevWithDevansh · Salon sales kit · editable master · page ", 8, False, False, RGBColor(0x8A, 0x7D, 0x72))
    r = fp.add_run(); f1 = OxmlElement("w:fldChar"); f1.set(qn("w:fldCharType"), "begin"); r._r.append(f1)
    r2 = fp.add_run(); it = OxmlElement("w:instrText"); it.text = "PAGE"; r2._r.append(it)
    r3 = fp.add_run(); f2 = OxmlElement("w:fldChar"); f2.set(qn("w:fldCharType"), "end"); r3._r.append(f2)
    for r_ in fp.runs: set_font(r_, "Calibri", 8, None, None, RGBColor(0x8A, 0x7D, 0x72))


def ladder_rows():
    rows = []
    for k in ("starter", "growth", "pro"):
        for b in (["1-3"] if k == "starter" else BANDS):
            rows.append([T[k]["name"] + ("" if k == "starter" else f" · {BAND_LABEL[b]}"), inr(T[k]["setup"]), inr(annual(k, b)), monthly(annual(k, b)), inr(total(k, b, 1)), inr(total(k, b, 3)), T[k]["status"]])
    rows.append(["Custom", "from " + inr(C_["setup_from"]), "from " + inr(C_["annual_from"]), "", "", "quoted", C_["status"]])
    return rows


def client_part(doc):
    h(doc, "Part A · Client documents (editable copy)", 1)
    para(doc, "Edit the wording here, then copy it into the HTML/PDF source or use this file directly. Prices are from data/pricing.json (proposals, INR, excluding GST).")
    h(doc, "A1 · Brochure (11 pages, offer-led)", 2)
    tk = P["assumptions"]["avg_ticket"]
    h(doc, "Page 1 · Cover", 3)
    para(doc, "**Customers are searching for a salon right now. Make sure they find yours.**", 12)
    para(doc, GU["tagline"]); para(doc, "A Gujarati and English website, a complete Google Maps profile and one-tap WhatsApp booking, built around the way your salon works. You see your own demo before you pay anything.")
    para(doc, "Badge: FREE Google audit + demo of your salon. Band: Founding offer, first " + str(O["founding_partner"]["slots"]) + " salons only: " + str(O["founding_partner"]["setup_discount_pct"]) + "% off setup, price locked " + str(O["founding_partner"]["price_lock_years"]) + " years.")
    picture(doc, ROOT / "assets" / "photos" / "salon_woman_wavy.jpg", 55, "Photo: Pexels (TONI&GUY PONDICHERRY). One placement: brochure cover.")
    h(doc, "Page 2 · Why act now", 3)
    para(doc, "**Every missed call is a client who booked someone else.**  " + GU["problem_h"])
    bullets(doc, ["Your Google profile is thin or missing: they scroll past you.", "There is no website: they cannot see your services and prices.", "Booking means a call nobody answers: they message the next salon.", "Rent, salaries and products live in a notebook: you cannot say what the month earned."])
    add_table(doc, ["Example arithmetic (use your own numbers)", "Value"], [["Missed bookings a month", "5"], ["Average ticket", inr(tk)], ["Lost every month", inr(5 * tk)], ["Lost every year", inr(5 * tk * 12)]], [4, 2])
    para(doc, "If you do nothing: same missed calls, same scattered diary, competitors with a Google profile and WhatsApp booking keep getting the click. With us: found on Google Maps, one tap books you on WhatsApp, clients and expenses in one view. Arithmetic only, not a forecast.")
    h(doc, "Page 3 · The solution: three steps", 3)
    add_table(doc, ["Step", "What you get", "Gujarati", "Status"], [["1 Get found", "Complete Google Maps profile; Gujarati + English website; review link + QR", "શોધાઓ", "Ready now"], ["2 Get booked", "WhatsApp booking in one tap; booking requests in one list; client notes and history", "બુકિંગ મેળવો", "Founding-partner build"], ["3 Know your numbers", "Daily expenses in 30 seconds; salaries, advances, vendor dues; monthly summary, Excel export", "તમારા આંકડા જાણો", "Founding-partner build"]], [1.6, 5, 2, 2])
    h(doc, "Page 4 · Google Maps", 3)
    para(doc, "**People who search 'salon near me' decide in seconds.**  " + GU["maps_h"])
    bullets(doc, ["Claim and complete your Google profile: categories, services, hours, photos", "Link it to your Gujarati + English website", "Google-review link and a printable QR", "Map and directions on your site, local schema and a sitemap", "Optional monthly care: weekly posts, review-reply drafts, a report"])
    para(doc, "What we will not promise: No one can promise a top position. Google says: “There's no way to request or pay for a better local ranking on Google.” We make your profile, reviews and website strong and report what changes.")
    para(doc, f"Free 12-point audit · Maps setup {inr(ADD['gmaps']['price'])} · Care {inr(ADD['local_seo']['price'])}/month (cancel after 3 months).")
    picture(doc, ROOT / "assets" / "screens" / "ui_google.png", 120, "Illustrative concept: Google listing mock-up (fictional salon, sample data).")
    h(doc, "Page 5 · See it first", 3)
    para(doc, "**See your salon online before you pay anything.**")
    bullets(doc, ["Free audit: 30 minutes; a one-page report that is yours to keep.", "Your own demo: your name, services and a WhatsApp booking button, before any payment.", "Clear proposal: written scope, fixed price, what is ready and what is built with you.",
                  "Approve the design: you approve the preview before launch; two revision rounds included.", "Launch and handover: phone testing, verified Google profile, review QR printed, 30-minute handover call.", "Grow when ready: add booking, expenses or Google care later, with credit toward upgrades."], True)
    h(doc, "Page 6 · Plans (with break-even)", 3)
    add_table(doc, ["Plan", "Setup", "Founding setup", "Yearly", "Extra bookings a month to cover year 1 at " + inr(tk), "Status"],
              [[f"{T[k]['name']} · {T[k]['outcome']}", inr(T[k]["setup"]), inr(founding(k)), inr(annual(k, "1-3")), str(breakeven(k)), T[k]["status"]] for k in ("starter", "growth", "pro")], [2.4, 1.2, 1.4, 1.2, 2.2, 2])
    add_table(doc, ["What you get", "Starter", "Growth", "Pro", "Custom"], [list(r) for r in MATRIX], [4, 1.4, 1.8, 1.4, 1.4])
    add_table(doc, ["Plan", "Setup", "Yearly", "≈ per month", "Year 1", "3-year total", "Status"], ladder_rows(), [2.2, 1.2, 1.2, 1.1, 1.2, 1.3, 2])
    para(doc, "INR, excluding GST. Break-even is arithmetic at the stated ticket, not a forecast. Growth and Pro are delivered through our founding-partner build programme with a written timeline.", 9, True)
    h(doc, "Page 7 · Founding offer", 3)
    para(doc, f"**{O['founding_partner']['slots']} salons. {O['founding_partner']['setup_discount_pct']}% off. Price locked {O['founding_partner']['price_lock_years']} years.**  " + GU["founding"])
    add_table(doc, ["Plan", "List setup", "Founding setup", "Yearly (locked)"], [[T[k]["name"], inr(T[k]["setup"]), inr(founding(k)), inr(annual(k, "1-3"))] for k in ("starter", "growth", "pro")], [2, 2, 2, 2])
    add_table(doc, ["Starter if bought separately (reported India ranges, Oct 2026)", "Typical price"], [["Bilingual 5-page website", "₹12,500–₹37,500"], ["Google profile setup and optimisation", "₹2,000–₹8,000"], ["First-year hosting, SSL, backups", "₹2,000–₹8,000"], ["Review QR, WhatsApp button, Gujarati + English copy", "included"], ["Typical total, year 1", "₹16,500–₹53,500"], ["Starter year 1 (list)", inr(total("starter", "1-3", 1))], ["Starter year 1 (founding)", inr(founding("starter") + annual("starter"))]], [5, 2])
    bullets(doc, ["You get: the lowest setup price we will offer; price locked for 3 years; your needs shape the booking and expense features; priority support while we build.", "We ask: honest feedback for a few weeks; a short, genuine testimonial if you are happy; permission to show the finished work.", "Call to action: Message “FOUNDING” to reserve a place. Free audit first; no payment until you approve the proposal."])
    h(doc, "Page 8 · Pricing", 3)
    add_table(doc, ["Add-on", "Price", "Unit", "Status", "Notes"], [[a["name"], inr(a["price"]), a["unit"], a["status"], a["note"]] for a in P["addons"]], [3.5, 1, 1, 1.8, 4])
    bullets(doc, [f"Extra branch: {inr(P['extra_branch_annual'])} per year. Third-party charges at actual cost.", f"Start small, upgrade with credit: {O['upgrade_credit_pct']}% of Starter setup credited if you move to Growth or Pro within 6 months.", f"Pay 2 years ahead: {O['prepay_2yr_discount_pct']}% off the platform fee.", f"Referral credit {inr(O['referral_credit'])}."])
    para(doc, "Honest comparison with a subscription app: apps cost about ₹799–₹4,200+ a month with WhatsApp often extra; an app is better if you need billing and inventory today. We build your website and Google presence around it.")
    h(doc, "Page 9 · Promises and questions", 3)
    bullets(doc, ["A fixed price in writing, with the scope", "You approve the design before launch", "Honest status on every module: ready, built with you, or later", "No ranking promises, and no invented results", "Monthly Google care: cancel any time after 3 months", "Your content, photos and client data stay yours"])
    add_table(doc, ["Question", "Answer"], [["Is it expensive?", f"Starter is {inr(S_['setup'])} once and {inr(annual('starter'))} a year. About {breakeven('starter')} extra bookings a month at a {inr(tk)} ticket covers year 1."], ["Will I really get more customers?", "No one can honestly promise that. We make you easier to find, trust and book, and send a monthly report."],
                                          ["I'm not technical.", "Send us your photos and services. We build it, in Gujarati if you like, and finish with a 30-minute handover call."], ["What if I don't like the design?", "You see a preview and approve it before launch. If it is still not right after two rounds, we stop and refund your start payment. [Confirm this refund promise before use.]"],
                                          ["I already use an app.", "Keep it. We build around it and do not touch your billing."], ["Do I own my website and data?", "Your content, photos and client data are yours. Hosting and source-code terms are explained in writing before you start."]], [2, 6])
    h(doc, "Page 10 · ગુજરાતીમાં સારાંશ", 3)
    for k in ("cover_sub", "honest", "starter", "growth", "pro", "audit_h", "founding", "yearly", "gst", "talk_h", "no_obl"): para(doc, GU[k])
    para(doc, "ફાઉન્ડિંગ ભાવ: Starter " + inr(founding("starter")) + " · Growth " + inr(founding("growth")) + " · Pro " + inr(founding("pro")) + " સેટઅપ.")
    h(doc, "Page 11 · Let's talk", 3)
    para(doc, "Your salon doesn't need more software. It needs to be found, booked and understood.  " + GU["talk_h"])
    para(doc, "Three steps: 1 Message us (say “AUDIT”). 2 Get your free audit + demo. 3 Decide: start with Starter, take a founding place, or walk away with the audit.")
    para(doc, f"{WEB} · {EMAIL} · [Insert WhatsApp number] · [QR code to WhatsApp]")
    h(doc, "A2 · One-pager (one page)", 2)
    para(doc, "**Get found on Google. Get booked on WhatsApp.**  Google પર શોધાઓ. WhatsApp પર બુકિંગ મેળવો.")
    para(doc, "Our offer in 3 simple steps: 1) FREE: we check your Google profile and website. 2) FREE: we show your salon online (a demo). 3) YOU DECIDE: like it? Go ahead. Nothing to pay before you say yes.")
    para(doc, f"Special offer, first {O['founding_partner']['slots']} salons only: Starter website + Google Maps, {inr(founding('starter'))} setup instead of {inr(T['starter']['setup'])} (30% off). Includes a Gujarati + English website (5 pages), Google Maps profile, WhatsApp booking button and review QR.")
    para(doc, f"After that: {inr(annual('starter'))} a year (about {monthly(annual('starter'))} a month) for hosting, backups and support; price locked for {O['founding_partner']['price_lock_years']} years. Want online booking and expense tracking? Growth {inr(founding('growth'))} or Pro {inr(founding('pro'))} setup, built together with you.")
    para(doc, "ગુજરાતીમાં: 1. અમે તમારી Google પ્રોફાઇલ અને વેબસાઇટ મફતમાં ચેક કરીએ છીએ. 2. તમારા સલૂનનો ઓનલાઇન ડેમો મફતમાં બતાવીએ છીએ. 3. ગમે તો જ આગળ વધો. તમે હા કહો ત્યાં સુધી કોઈ ચુકવણી નહીં. પહેલા 3 સલૂન માટે ખાસ છૂટ: Starter " + inr(T['starter']['setup']) + " ને બદલે " + inr(founding('starter')) + ".")
    para(doc, f"Call to action: Message “AUDIT” on WhatsApp to start. {WEB} · {EMAIL} · [Insert WhatsApp number] · [QR code]")
    para(doc, "Prices in INR, excluding GST. Offer closes after 3 salons. Growth and Pro are built with our first 3 salons with a written timeline. We do not promise a Google ranking.", 9, True)
    h(doc, "A3 · Comparison sheet", 2)
    sc = [("Entry-level app (₹1,499/mo)", 1499 * 36), ("Mid-tier app + WhatsApp (₹2,500 + ₹2,000/mo + ₹2,500 setup)", (2500 + 2000) * 36 + 2500), ("DWD Starter", total("starter", "1-3", 3)), ("DWD Growth", total("growth", "1-3", 3)), ("DWD Pro", total("pro", "1-3", 3))]
    add_table(doc, ["Three-year cost, 1–3 stylists", "Total", "≈ per month"], [[a, inr(v), inr(round(v / 36))] for a, v in sc], [5, 1.5, 1.5])
    add_table(doc, ["If this sounds like you…", "Lean toward"], [["Clients choose you partly by your brand and website", "Tailored"], ["You want a complete Google Maps profile", "Tailored"], ["You need full billing, inventory and payroll from day one", "App"],
                                                              ["You want to start today with no design work", "App"], ["Owning your client and expense data matters", "Tailored"], ["You want one yearly plan, not stacked add-ons", "Tailored"], ["You already use a tool you like", "Integrate"]], [5, 1.5])
    h(doc, "A4 · Proposal template", 2)
    para(doc, "[Salon name]: website, Google Maps and booking · Prepared for [Owner name] · [Date] · Valid 15 days · Reference [DWD-SAL-001] · Language [Gujarati / English / Both]")
    para(doc, "**What we heard:** [2–3 sentences in the owner's own words]")
    para(doc, "**Plan:** [Starter / Growth / Pro / Custom / Google Maps setup only] · [number] stylists · [number] branches")
    add_table(doc, ["Item", "Included?", "Status"], [["Bilingual website, up to 5 pages", "[yes/no]", "Ready now"], ["Google profile setup + optimisation, map on site, review QR", "[yes/no]", "Ready now"], ["WhatsApp click-to-book and call buttons", "[yes/no]", "Ready now"],
                                                  ["Booking requests, owner dashboard, client list", "[yes/no]", "Founding-partner build: [target date]"], ["Expense manager + monthly summary", "[yes/no]", "Founding-partner build: [target date]"], ["Local SEO & Google Maps care (monthly)", "[yes/no]", "Ready now"]], [5, 1.5, 3])
    add_table(doc, ["Investment item", "Amount (INR)", "When"], [["One-time setup ([plan])", "[amount]", "50% at start · 50% at launch"], ["Add-ons: [list]", "[amount]", "With setup"], ["Annual platform & support", "[amount] (≈ [monthly]/month)", "Year 1 invoiced at launch; renews yearly"],
                                                         ["Local SEO & Google care (if chosen)", inr(ADD["local_seo"]["price"]) + " per month", "Monthly; cancel after 3 months with 30 days' notice"], ["Third-party charges", "At actual cost", "WhatsApp, payment gateway, SMS, domain"], ["Total due before launch", "[total] + GST", ""]], [4, 3, 4])
    bullets(doc, ["What the annual fee covers: hosting, database, backups, security, monitoring, updates and support.", "Support: [response times] during [hours].", "Renewal: reminder 30 days before; invoice 14 days before; price changes need 60 days' written notice.",
                  "Ownership: [confirm: client owns content, brand assets and client data; state terms for source code and hosting access].", f"Credit: {O['upgrade_credit_pct']}% of Starter setup credited if you upgrade within 6 months.", "Changes in scope are quoted in writing first.",
                  "Founding-partner terms (if applicable): [discount, price lock, testimonial and showcase permission].", "Cancelling: [notice period and what is exported to the client]."])


def photo_log(doc):
    log = json.loads((ROOT / "data" / "photo_log.json").read_text(encoding="utf-8"))
    rows = []
    for e in log:
        used = strategy_c.PHOTO_MAP.get(e["file"].rsplit(".", 1)[0], "")
        rows.append([e["file"], e["description"], e["photographer"], e["source"] + (" · " + e["url"] if e["url"] else ""), e["licence"], e["date_added"], used])
    add_table(doc, ["File", "Description", "Photographer", "Source / link", "Licence", "Date", "Placement"], rows, [2, 2.4, 2, 3.6, 3, 1.2, 2.4])


def scripts_part(doc):
    h(doc, "Part C · Outreach scripts (English and Gujarati)", 1)
    para(doc, "Rules", 11, False, CHAR)
    bullets(doc, outreach.RULES)
    for t, ch, when, lang, body in outreach.SCRIPTS:
        h(doc, f"{t} [{lang}] · {ch} · {when}", 3)
        for ln in body.split("\n"):
            if ln.strip(): para(doc, ln, 10)


def build():
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Mm(210), Mm(297)
    sec.left_margin = sec.right_margin = Mm(18); sec.top_margin = Mm(18); sec.bottom_margin = Mm(18)
    st = doc.styles["Normal"]; st.font.name = "Calibri"; st.font.size = Pt(10.5)
    for s_ in ("List Bullet", "List Number"): doc.styles[s_].font.name = "Calibri"; doc.styles[s_].font.size = Pt(10)
    page_number_footer(sec)
    # cover
    p = doc.add_paragraph(); add_text(p, "DEVWITHDEVANSH · SOFTWARE DEVELOPMENT & BUSINESS AUTOMATION SOLUTIONS", 8.5, True, False, DGOLD)
    p = doc.add_paragraph(); p.paragraph_format.space_before = Pt(50)
    add_text(p, "Salon sales kit", 38, False, False, CHAR, True)
    p = doc.add_paragraph(); add_text(p, "Editable master: documents, strategy, pricing, Gujarati copy and scripts", 15, False, True, DGOLD, True)
    para(doc, "Written for DevWithDevansh: a small developer team finding salons that need software. Internal parts (B, C, D) are not for clients.", 11)
    picture(doc, ROOT / "assets" / "photos" / "interior_modern.jpg", 150, "Photo: Pexels (Max Vakhtbovych). Placement: brochure page 3.")
    h(doc, "How to use this file", 3)
    bullets(doc, ["Edit text and tables directly. Headings feed the table of contents (right-click it → Update field).", "Prices come from data/pricing.json; to change them everywhere (PDFs, PowerPoint, Excel), edit that file and rebuild.",
                  "Gujarati is drafted for natural reading; have a native speaker proofread before print.", "Palette: near-black #0C0B0A, gold #C9AB78, deep gold #A9895A, cream #F4EFE6, sand #E8DFD0. Cambria, Calibri, Nirmala UI."])
    h(doc, "Contents", 2); toc(doc)
    doc.add_page_break()
    client_part(doc)
    doc.add_page_break()
    h(doc, "Part B · Internal playbook", 1)
    para(doc, "Audit, market research, product plan, offers, pricing, marketing, Gujarati strategy, visual review, funnel, sales tools, 90-day plan and recommendations. Not for clients.")
    for title, blocks in strategy.sections():
        h(doc, title, 2); write_blocks(doc, blocks)
    scripts_part(doc)
    h(doc, "Part D · Photo licence log", 1)
    para(doc, "One photo, one placement. Pexels licence: free for commercial use; do not imply endorsement; do not resell unaltered. Replace with partner-salon photos (with releases) as soon as possible.")
    photo_log(doc)
    # update fields on open so the TOC fills
    settings = doc.settings.element
    uf = OxmlElement("w:updateFields"); uf.set(qn("w:val"), "true"); settings.append(uf)
    doc.core_properties.title = "DevWithDevansh Salon sales kit (editable master)"; doc.core_properties.author = "DevWithDevansh"
    out = OUT / "DWD_Salon_MASTER_Editable.docx"; doc.save(out); print("saved", out)


if __name__ == "__main__":
    build()

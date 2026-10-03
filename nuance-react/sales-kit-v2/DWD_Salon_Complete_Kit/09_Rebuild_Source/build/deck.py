"""Photo-led 18-slide sales deck (16:9, Noir Atelier), python-pptx. Editable native shapes and text.
One photo per placement, Gujarati headings, honest status labels, Say / Ask / Show speaker notes on every slide."""
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree
from lib import *
from content import *

CHAR, GOLD, CREAM, SAND, MID, WHITE, DGOLD = (RGBColor.from_string(x) for x in ("0C0B0A", "C9AB78", "F4EFE6", "E8DFD0", "4A433A", "FFFFFF", "A9895A"))
SOFT = RGBColor.from_string("CFC6B8")
GREY = RGBColor.from_string("8A7D72")
S_, G_, Pr, C_ = T["starter"], T["growth"], T["pro"], T["custom"]
PHD, SCR = ROOT / "assets" / "photos", ROOT / "assets" / "screens"
TMP = ROOT / "assets" / "_crop"; TMP.mkdir(exist_ok=True)
W, H = 13.333, 7.5
GU_FONT = "Nirmala UI"


def has_gu(t): return any("઀" <= ch <= "૿" for ch in t)


def crop_to(path, w, h, focus=(0.5, 0.5)):
    im = Image.open(path).convert("RGB"); tw = w / h
    iw, ih = im.size
    if iw / ih > tw: nw, nh = int(ih * tw), ih
    else: nw, nh = iw, int(iw / tw)
    l = int((iw - nw) * focus[0]); t = int((ih - nh) * focus[1])
    out = TMP / f"{path.stem}_{int(w*100)}x{int(h*100)}_{int(focus[0]*10)}{int(focus[1]*10)}.jpg"
    im.crop((l, t, l + nw, t + nh)).save(out, quality=92); return out


def photo(s, name, x, y, w, h, focus=(0.5, 0.5)):
    return s.shapes.add_picture(str(crop_to(PHD / f"{name}.jpg", w, h, focus)), Inches(x), Inches(y), Inches(w), Inches(h))


def screen(s, name, x, y, w, frame=True):
    h = w * .625
    if frame: rect(s, x - .04, y - .04, w + .08, h + .08, GOLD)
    s.shapes.add_picture(str(SCR / f"{name}.png"), Inches(x), Inches(y), Inches(w), Inches(h))
    return h


def rect(s, x, y, w, h, fill, alpha=None, rounded=False, line=None):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if rounded: sh.adjustments[0] = 0.05
    if line: sh.line.color.rgb = line; sh.line.width = Pt(0.75)
    else: sh.line.fill.background()
    if alpha is not None:
        clr = sh.fill._xPr.find(qn("a:solidFill")).find(qn("a:srgbClr"))
        a = etree.SubElement(clr, qn("a:alpha")); a.set("val", str(int(alpha * 100000)))
    return sh


def text(s, x, y, w, h, t, size=14, bold=False, color=MID, font="Calibri", italic=False, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, space=4, spacing=None):
    """Text between ‹ › is italic gold accent. Gujarati runs use Nirmala UI."""
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)); tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, line in enumerate(t.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); p.alignment = align; p.space_after = Pt(space)
        for j, seg in enumerate(line.replace("›", "‹").split("‹")):
            if not seg: continue
            acc = j % 2 == 1
            r = p.add_run(); r.text = seg; f = r.font; f.size = Pt(size); f.bold = bold; f.name = GU_FONT if has_gu(seg) else font
            f.italic = (italic or acc) and not has_gu(seg); f.color.rgb = (GOLD if color in (WHITE, CREAM) else DGOLD) if acc else color
            if has_gu(seg):
                rPr = r._r.get_or_add_rPr(); cs = etree.SubElement(rPr, qn("a:cs")); cs.set("typeface", GU_FONT)
            if spacing: r._r.get_or_add_rPr().set("spc", str(spacing))
    return tb


def eyebrow(s, x, y, t, dark=False):
    text(s, x, y, 8, .3, t.upper(), 10.5, True, GOLD if dark else DGOLD, spacing=250)


def guline(s, x, y, w, t, dark=False, size=15):
    text(s, x, y, w, .4, t, size, False, GOLD if dark else DGOLD)


def slide(prs, bg, notes):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    s.background.fill.solid(); s.background.fill.fore_color.rgb = bg
    s.notes_slide.notes_text_frame.text = notes
    return s


def footer(s, n, dark):
    text(s, .6, 7.08, 4, .25, "DevWithDevansh", 9.5, True, WHITE if dark else CHAR, "Cambria")
    text(s, 11.2, 7.08, 1.55, .25, f"{n:02d}", 9.5, False, GREY, align=PP_ALIGN.RIGHT)


def title(s, t, dark=False, x=.6, y=.9, w=7.5, size=36):
    text(s, x, y, w, 1.6, t, size, False, WHITE if dark else CHAR, "Cambria", space=0)


def chip(s, x, y, status, dark=False):
    col = {"Ready now": "7DA55A", "Founding-partner build": "C9AB78", "Roadmap": "8A7D72", "Scoped per salon": "8A7D72"}.get(status, "8A7D72")
    text(s, x, y, 2.5, .2, "● " + status.upper(), 8, True, RGBColor.from_string(col), spacing=100)


# ----------------------------------------------------------------------------------------------- slides
def s_cover(prs, n):
    s = slide(prs, CHAR, "Say: Welcome. We build websites, Google Maps presence, booking and simple books for salons, designed around how your salon already works.\nAsk: How many stylists do you have, and how do clients find and book today?\nShow: Nothing yet; let this slide sit while you introduce yourself.")
    photo(s, "stylist_mannequin", 6.9, 0, 6.433, 7.5, (0.5, 0.15))
    text(s, .7, .6, 6, .3, "DEVWITHDEVANSH", 12, True, WHITE, "Cambria", spacing=300)
    text(s, .7, .95, 6, .3, "Software Development & Business Automation Solutions", 10, False, SOFT)
    eyebrow(s, .7, 2.0, "Get found · Get booked · Know your numbers", True)
    text(s, .7, 2.4, 6.2, 2.6, "Your Salon.\nYour Style.\n‹Your System.›", 52, False, WHITE, "Cambria", space=0)
    guline(s, .7, 5.15, 6, GU["tagline"], True, 17)
    text(s, .7, 5.75, 5.8, 1, "A Gujarati and English website, Google Maps presence and WhatsApp booking, built around the way your salon works.", 15, False, SOFT)
    rect(s, .7, 6.8, .6, .03, GOLD); text(s, 1.45, 6.68, 5, .3, "Start simple · Grow with your salon", 11, False, GOLD)


def s_before(prs, n):
    s = slide(prs, CREAM, "Say: A client decides in minutes, usually on Google or Instagram, then books. Every gap between those steps is a chance to lose them.\nAsk: How do new clients currently find you and book their first appointment?\nShow: The brochure's problem page if they want to see it.")
    photo(s, "stylist_male_blonde", 0, 0, 5.2, 7.5, (0.5, 0.3))
    eyebrow(s, 5.9, .75, "01 · The journey")
    title(s, "The client experience begins ‹before the client walks in.›", x=5.9, y=1.1, w=6.9, size=32)
    guline(s, 5.9, 2.75, 6.9, GU["journey_h"], size=13)
    steps = [("Discover", "Google Maps, Instagram, a friend"), ("Explore services", "What do you offer, and at what price?"), ("Choose a stylist", "Who is right for me?"), ("Book", "A call, a message, or one clear step"), ("Visit", "A welcome that feels organised"), ("Return", "A reason and a reminder to come back")]
    for i, (a, b) in enumerate(steps):
        y = 3.4 + i * .58
        rect(s, 5.9, y, .4, .4, CHAR); text(s, 5.9, y + .07, .4, .3, f"{i+1}", 12, True, GOLD, align=PP_ALIGN.CENTER)
        text(s, 6.55, y + .04, 2.5, .4, a, 15, True, CHAR, "Cambria"); text(s, 9.1, y + .08, 3.7, .4, b, 12, False, MID)
    footer(s, n, False)


def s_ops(prs, n):
    s = slide(prs, CHAR, "Say: These are possibilities, not assumptions. Some may not affect you at all.\nAsk: Which of these takes the most time in your week?\nShow: Nothing; keep it conversational.")
    photo(s, "barbershop_wide", 7.4, 0, 5.933, 7.5, (0.5, 0.3)); rect(s, 7.4, 0, 5.933, 7.5, CHAR, .25)
    eyebrow(s, .7, .75, "02 · The reality", True)
    title(s, "Great service takes focus. ‹Operations should support it.›", True, y=1.1, w=6.4, size=30)
    guline(s, .7, 2.65, 6.4, GU["problem_h"], True, 14)
    items = ["Appointments across calls, messages and a diary", "Last-minute changes and missed follow-ups", "Client preferences spread across places", "Rent, salaries and product costs in a notebook", "Not on Google Maps, or an incomplete profile", "A social presence that does not lead to a booking"]
    for i, t in enumerate(items):
        y = 3.2 + i * .54
        text(s, .7, y, .5, .4, f"0{i+1}", 14, True, GOLD, "Cambria"); text(s, 1.35, y + .02, 5.7, .5, t, 14.5, False, WHITE)
    text(s, .7, 6.55, 6.4, .4, "Every salon is different. The first step is finding out which of these affects yours.", 11.5, False, SOFT, italic=True)
    footer(s, n, True)


def s_flow(prs, n):
    s = slide(prs, CREAM, "Say: The aim is a more connected path from first search to loyal client. We do not promise that no-shows disappear.\nAsk: Where does the path break for your salon today?\nShow: The two rows; point at the gaps.")
    eyebrow(s, .6, .6, "03 · The opportunity")
    title(s, "From first search to ‹loyal client.›", y=.95, w=9, size=36); guline(s, .6, 1.85, 9, GU["flow_h"])
    stg = ["Search", "Services", "Stylist", "Book", "Visit", "Return"]
    text(s, .6, 2.45, 6, .3, "WITHOUT A CONNECTED FLOW", 10.5, True, MID, spacing=200)
    for i, t in enumerate(stg):
        x = .6 + i * 2.05; rect(s, x, 2.85, 1.85, .85, WHITE, rounded=True, line=SAND)
        text(s, x, 2.85, 1.85, .85, t, 14, False, MID, "Cambria", align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        if i % 2 == 1: text(s, x + 1.55, 3.1, .8, .3, "gap?", 10, False, RGBColor.from_string("A0402A"), italic=True)
    text(s, .6, 4.4, 6, .3, "WITH A CONNECTED FLOW", 10.5, True, DGOLD, spacing=200)
    for i, t in enumerate(stg):
        x = .6 + i * 2.05; rect(s, x, 4.8, 1.85, .85, CHAR, rounded=True)
        text(s, x, 4.8, 1.85, .85, t, 14, False, WHITE, "Cambria", align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        if i < 5: rect(s, x + 1.85, 5.22, .2, .03, GOLD)
    text(s, .6, 6.05, 12, .6, "Potential: found on Google Maps · a clear way to book · organised appointments · consistent reminders where configured · a clear monthly picture.", 13, False, MID)
    footer(s, n, False)


def s_maps(prs, n):
    s = slide(prs, CREAM, "Say: Most local customers start on Google Maps. We make sure your profile is complete and accurate and that your website and reviews support it. We cannot promise a position: Google does not allow paid local ranking.\nAsk: What shows when you search 'salon near me' from your shop?\nShow: Do that search live with the owner; then the Google mock-up.")
    eyebrow(s, .6, .5, "04 · Google Maps")
    title(s, "Can people ‹find you› on Google Maps?", y=.85, w=10, size=32); guline(s, .6, 1.65, 9, GU["maps_h"])
    screen(s, "ui_google", .6, 2.3, 6.9)
    text(s, 8.0, 2.3, 4.8, .3, "WHAT WE DO", 10.5, True, DGOLD, spacing=200)
    text(s, 8.0, 2.65, 4.8, 2.3, "• Claim and complete your Google profile\n• Services, hours, categories, photos\n• Link to your Gujarati + English website\n• Google-review link and printable QR\n• Map and directions on your site\n• Optional monthly care and a report", 12.5, False, MID, space=5)
    rect(s, 8.0, 5.0, 4.75, 1.6, CHAR, rounded=True)
    text(s, 8.25, 5.12, 4.3, .3, "WHAT WE DO NOT PROMISE", 10, True, GOLD, spacing=150)
    text(s, 8.25, 5.45, 4.3, 1.1, "Google: “There's no way to request or pay for a better local ranking.” We strengthen your profile, reviews and website, and show what changes.", 12, False, WHITE, space=3)
    text(s, .6, 6.5, 7, .3, "Illustrative concept. Fictional salon, sample data.", 10, False, GREY, italic=True)
    footer(s, n, False)


def s_build(prs, n):
    s = slide(prs, CREAM, "Say: These are possible capabilities. Ready now means we can deliver today; Founding-partner build means we build it with our first three salons; Roadmap means later.\nAsk: If you could add one of these tomorrow, which would you choose?\nShow: The brochure's 'What we can build' page.")
    eyebrow(s, .6, .5, "05 · What we can build")
    title(s, "One partner. ‹Every part› of your salon.", y=.85, w=11, size=32); guline(s, .6, 1.6, 9, GU["build_h"], size=14)
    for i, (a, d, g, st) in enumerate(AREAS):
        x = .6 + (i % 3) * 4.1; y = 2.15 + (i // 3) * 1.6
        rect(s, x, y, 3.9, 1.45, WHITE, rounded=True, line=SAND)
        text(s, x + .2, y + .14, .6, .4, f"{i+1:02d}", 12, True, DGOLD, "Cambria")
        text(s, x + .75, y + .12, 3.0, .4, a, 14, True, CHAR, "Cambria"); text(s, x + .75, y + .45, 3.0, .3, g, 10.5, False, DGOLD)
        text(s, x + .75, y + .72, 3.0, .45, d, 10, False, MID); chip(s, x + .75, y + 1.18, st)
    footer(s, n, False)


def s_ui(prs, n):
    s = slide(prs, CHAR, "Say: These are illustrative concepts, not finished products. They show what can be designed from your own requirements, in your brand.\nAsk: What would you want your clients to see first?\nShow: Walk through the home page, then the booking flow.")
    eyebrow(s, .6, .5, "06 · Designed to feel like your brand", True)
    title(s, "What your clients could see. ‹Illustrative concept.›", True, y=.85, w=12, size=30)
    screen(s, "ui_home", .6, 2.0, 5.9); screen(s, "ui_booking", 6.85, 2.0, 5.9)
    text(s, .6, 6.2, 5.9, .5, "Website home: your brand, your services, one clear way to book.", 12.5, False, SOFT)
    text(s, 6.85, 6.2, 5.9, .5, "Booking: service, stylist and time in a few taps, with a confirmation and reminder.", 12.5, False, SOFT)
    text(s, .6, 6.75, 8, .25, "Fictional salon 'Maison Aura'. Sample content only. Growth: founding-partner build.", 10, False, GREY, italic=True)
    footer(s, n, True)


def s_owner(prs, n):
    s = slide(prs, CHAR, "Say: Behind the scenes, the owner sees the day at a glance. Again an illustrative concept; yours would be built from your workflow.\nAsk: How do you see today's appointments right now: a diary, a phone, a screen?\nShow: The calendar view.")
    eyebrow(s, .6, .5, "07 · Behind the chair", True)
    title(s, "The whole day, ‹at a glance.›", True, y=.85, w=7, size=32); guline(s, .6, 1.55, 7, "આખો દિવસ, એક નજરમાં.", True, 14)
    screen(s, "ui_dash", .6, 2.1, 7.2)
    pts = [("Today's calendar", "Each stylist's day in one view."), ("Client history", "Preferences and past visits, where the stylist needs them."), ("Team and availability", "Schedules and changes without phone tag.")]
    for i, (a, b) in enumerate(pts):
        yy = 2.25 + i * 1.3
        rect(s, 8.9, yy + .05, .05, .85, GOLD)
        text(s, 9.15, yy, 3.7, .4, a, 17, False, WHITE, "Cambria"); text(s, 9.15, yy + .45, 3.6, .8, b, 12.5, False, SOFT)
    text(s, .6, 6.8, 8, .25, "Fictional salon 'Maison Aura'. Sample content only. Illustrative concept.", 10, False, GREY, italic=True)
    footer(s, n, True)


def s_expense(prs, n):
    s = slide(prs, CREAM, "Say: Most owners are busy all day and still cannot say what the month earned. The expense manager keeps rent, salaries, products and vendor dues in one place with a monthly summary. It is not an accounting or GST system.\nAsk: How long does month-end take you now?\nShow: The expense screen. It is built with our first three partners, so setup is discounted.")
    eyebrow(s, .6, .5, "08 · Know your numbers")
    title(s, "Where did this month's ‹money go?›", y=.85, w=10, size=32); guline(s, .6, 1.6, 9, GU["expense_h"], size=14)
    screen(s, "ui_expense", .6, 2.2, 7.2)
    photo(s, "receptionist_tablet", 8.3, 2.15, 4.45, 2.2, (0.5, 0.4))
    text(s, 8.3, 4.55, 4.45, 2.0, "Daily expenses by category\nVendor dues, salaries and advances\nMonthly summary and Excel export\nIncluded in Pro; add-on for Growth (" + inr(ADD['expense']['price']) + ")", 12.5, False, MID, space=5)
    chip(s, 8.3, 6.3, "Founding-partner build")
    text(s, .6, 6.6, 7.2, .3, "Illustrative concept with sample data. Not an accounting or GST filing system.", 10, False, GREY, italic=True)
    footer(s, n, False)


def s_clarity(prs, n):
    s = slide(prs, CREAM, "Say: We are not promising revenue or time saved. The goal is clarity: less juggling, more context.\nAsk: If one part of your salon's day could become simpler, which would you pick?\nShow: Nothing; listen.")
    photo(s, "cape_client", 0, 0, 6.2, 7.5, (0.5, 0.3))
    eyebrow(s, 6.9, .75, "09 · What changes")
    title(s, "More clarity ‹behind the chair.›", x=6.9, y=1.1, w=6, size=34); guline(s, 6.9, 2.15, 6, GU["changes_h"], size=14)
    oc = [("See the day clearly", "Bookings and changes in one list."), ("A smoother booking path", "From first search to confirmed appointment."), ("Remember every client", "Preferences and history at hand."), ("Know your numbers", "Expenses and a monthly summary.")]
    for i, (a, b) in enumerate(oc):
        y = 2.85 + i * .95
        rect(s, 6.9, y + .05, .05, .6, GOLD)
        text(s, 7.15, y, 5.5, .4, a, 16, True, CHAR, "Cambria"); text(s, 7.15, y + .38, 5.5, .4, b, 12.5, False, MID)
    text(s, 6.9, 6.6, 5.8, .5, "The goal is not more software. It is a better-fitting way to manage the work that matters.", 12, False, MID, italic=True)
    footer(s, n, False)


def s_plans(prs, n):
    s = slide(prs, CHAR, "Say: Three levels. Starter is ready today and covers the website and Google Maps. Growth adds booking and clients; Pro adds expenses and staff. Growth and Pro are built with our first three founding partners with a written timeline. Custom is quoted.\nAsk: Which of these sounds closest to where your salon is today?\nShow: The plans page of the brochure. Prices are proposed; the final quotation follows consultation.")
    eyebrow(s, .6, .5, "10 · Where to start", True)
    title(s, "Start with what you need. ‹Grow from there.›", True, y=.85, w=12, size=32); guline(s, .6, 1.6, 9, GU["plans_h"], True, 14)
    cols = [("starter", [f"Up to 5 pages   {inr(annual('starter'))}", f"≈ {monthly(annual('starter'))} a month"], SAND, CHAR),
            ("growth", [f"{BAND_LABEL[b]}   {inr(annual('growth', b))}" for b in BANDS], GOLD, CHAR),
            ("pro", [f"{BAND_LABEL[b]}   {inr(annual('pro', b))}" for b in BANDS], RGBColor.from_string("1C1A17"), WHITE)]
    for i, (k, rows, fill, fg) in enumerate(cols):
        t = T[k]; x = .6 + i * 4.1
        rect(s, x, 2.15, 3.9, 4.0, fill, rounded=True, line=RGBColor.from_string("3A352F") if fg == WHITE else None)
        text(s, x + .3, 2.35, 3.3, .3, f"{t['name'].upper()} · {t['outcome'].upper()}", 10.5, True, GOLD if fg == WHITE else CHAR, spacing=200)
        text(s, x + .3, 2.7, 3.3, .3, t["gu"], 12, False, GOLD if fg == WHITE else RGBColor.from_string("5A4520"))
        text(s, x + .3, 3.05, 3.3, .7, t["tagline"], 12.5, False, fg, "Cambria")
        text(s, x + .3, 3.9, 3.3, .3, "One-time setup", 10.5, False, fg); text(s, x + .3, 4.12, 3.4, .6, inr(t["setup"]), 28, True, fg, "Cambria")
        text(s, x + .3, 4.85, 3.3, .3, "Yearly platform & support", 10.5, False, fg); text(s, x + .3, 5.1, 3.4, 1.0, "\n".join(rows), 12.5, False, fg, space=5)
        chip(s, x + .3, 5.93, t["status"])
    rect(s, .6, 6.3, 12.15, .5, RGBColor.from_string("1C1A17"), rounded=True, line=RGBColor.from_string("3A352F"))
    text(s, .85, 6.4, 11.7, .3, f"Custom: multi-branch, special workflows, integrations. Setup from {inr(C_['setup_from'])}, yearly from {inr(C_['annual_from'])}, quoted after discovery.", 11.5, False, SOFT)
    text(s, .6, 6.85, 12, .25, "Proposed structure, INR, excluding GST. Final scope and quotation confirmed after consultation.", 10, False, GREY, italic=True)
    footer(s, n, True)


def s_yearly(prs, n):
    o = P["offers"]
    s = slide(prs, CREAM, "Say: You pay once to set up, then one yearly platform fee covering hosting, backups, security, updates and support. We show the monthly equivalent so you can compare with apps. Add-ons are one-time except Google care.\nAsk: Would you rather start with the basics and add features later?\nShow: The pricing page of the brochure.")
    eyebrow(s, .6, .5, "11 · How yearly billing works")
    title(s, "One clear yearly plan. ‹Not a pile of add-ons.›", y=.85, w=12, size=32); guline(s, .6, 1.6, 9, GU["yearly"], size=14)
    rect(s, .6, 2.15, 5.9, 1.5, WHITE, rounded=True, line=SAND); text(s, .9, 2.3, 5.3, .4, "Pay once to set up", 18, False, CHAR, "Cambria")
    text(s, .9, 2.8, 5.3, .8, "Website, Google profile, booking setup, branding, training. You approve the design before launch.", 12.5, False, MID)
    rect(s, 6.75, 2.15, 6.0, 1.5, WHITE, rounded=True, line=SAND); text(s, 7.05, 2.3, 5.4, .4, "Then one annual platform fee", 18, False, CHAR, "Cambria")
    text(s, 7.05, 2.8, 5.4, .8, f"Hosting, backups, security, updates, support. Billed yearly in advance, reminder 30 days before. Starter is about {monthly(annual('starter'))} a month.", 12.5, False, MID)
    text(s, .6, 3.95, 6, .4, "Optional add-ons", 15, True, CHAR, "Cambria")
    text(s, .6, 4.35, 6.6, 2.4, "\n".join(f"{a['name']}   {inr(a['price'])} {a['unit']}" for a in P["addons"]) + f"\nExtra branch   {inr(P['extra_branch_annual'])} / year", 11.5, False, MID, space=4)
    rect(s, 7.4, 3.95, 5.35, 2.85, CHAR, rounded=True)
    text(s, 7.7, 4.1, 4.8, .3, "START SMALL, UPGRADE WITH CREDIT", 10, True, GOLD, spacing=150); text(s, 7.7, 4.4, 4.8, .5, f"{o['upgrade_credit_pct']}% of Starter setup is credited if you move to Growth or Pro within 6 months", 12, False, WHITE)
    text(s, 7.7, 5.1, 4.8, .3, f"FOUNDING PARTNER · {o['founding_partner']['slots']} SALONS", 10, True, GOLD, spacing=150)
    text(s, 7.7, 5.4, 4.8, .7, f"{o['founding_partner']['setup_discount_pct']}% off setup, price locked {o['founding_partner']['price_lock_years']} years, for feedback and a short testimonial", 12, False, WHITE)
    text(s, 7.7, 6.2, 4.8, .5, f"Pay 2 years ahead: {o['prepay_2yr_discount_pct']}% off the platform fee.", 12, False, SOFT)
    footer(s, n, False)


def s_compare(prs, n):
    s = slide(prs, CREAM, "Say: Subscription apps are a good choice for many salons, and we'll say so if one fits you better. Where we differ is the branded Gujarati and English website, the Google Maps work, one yearly plan and owning your data.\nAsk: Do you use an app today? What do you pay, including extras like WhatsApp?\nShow: This slide, then the calculator, typing their numbers.")
    eyebrow(s, .6, .5, "12 · An honest comparison")
    title(s, "Three years of cost, ‹side by side.›", y=.85, w=11, size=32)
    sc = [("Entry-level app (₹1,499 / month)", 1499 * 36, RGBColor.from_string("D9D0C1")), ("Mid-tier app + WhatsApp", (2500 + 2000) * 36 + 2500, RGBColor.from_string("8A7D72")),
          ("DWD Starter (site + Google Maps)", total("starter", "1-3", 3), DGOLD), ("DWD Growth", total("growth", "1-3", 3), GOLD), ("DWD Pro (adds expense manager)", total("pro", "1-3", 3), CHAR)]
    mx = max(v for _, v, _ in sc)
    for i, (nme, v, c) in enumerate(sc):
        y = 1.95 + i * .72
        text(s, .6, y, 6, .3, nme, 13, True, CHAR); text(s, 10.7, y, 2.05, .3, inr(v), 13, True, CHAR, align=PP_ALIGN.RIGHT)
        rect(s, .6, y + .32, 12.15, .22, RGBColor.from_string("EAE2D3")); rect(s, .6, y + .32, 12.15 * v / mx, .22, c)
    rect(s, .6, 5.6, 6.0, 1.15, WHITE, rounded=True, line=SAND); text(s, .85, 5.72, 5.5, 1.0, "An app fits better if you need full billing, inventory and payroll today, or want to start immediately with no design.", 12, False, MID)
    rect(s, 6.75, 5.6, 6.0, 1.15, CHAR, rounded=True); text(s, 7.0, 5.72, 5.5, 1.0, "A tailored ladder fits better if your brand, Google Maps presence and a Gujarati website drive bookings, and you want your own data and one yearly plan.", 12, False, WHITE)
    text(s, .6, 6.85, 12, .25, "1–3 stylists, 3 years. Subscription prices from published India comparisons (Oct 2026), indicative; excludes GST, gateway and WhatsApp provider fees.", 9.5, False, MID, italic=True)
    footer(s, n, False)


def s_process(prs, n):
    s = slide(prs, CHAR, "Say: We start by listening, then build only what your salon needs. We don't ask your salon to change everything to fit a generic system.\nAsk: Who in your team should be part of the first workshop?\nShow: The six steps.")
    photo(s, "interior_mirrors", 0, 0, W, 3.2, (0.5, 0.45)); rect(s, 0, 0, W, 3.2, CHAR, .6)
    eyebrow(s, .6, .55, "13 · How we work", True)
    title(s, "From your workflow to ‹a working solution.›", True, y=.9, w=12, size=34); guline(s, .6, 1.85, 9, GU["process_h"], True, 14)
    steps = [("01", "Understand", "Services, clients, team, goals"), ("02", "Identify", "What is manual or invisible"), ("03", "Design", "The solution and your brand"), ("04", "Build", "Around your workflow, with previews"), ("05", "Launch", "Test, train, go live"), ("06", "Grow", "Add modules; yearly support")]
    for i, (a, b, c) in enumerate(steps):
        x = .6 + i * 2.05; y = 3.7 + (i % 2) * .5
        text(s, x, y, 1.9, .6, a, 30, False, GOLD, "Cambria"); text(s, x, y + .65, 1.9, .4, b, 16, True, WHITE, "Cambria"); text(s, x, y + 1.05, 1.9, .9, c, 11.5, False, SOFT)
    text(s, .6, 6.45, 12, .4, "‹We don't ask your salon to change everything just to fit a generic system.›", 15, False, WHITE, "Cambria")
    footer(s, n, True)


def s_scope(prs, n):
    s = slide(prs, CREAM, "Say: Scope first, then a clear proposal. No surprises: setup, yearly fee, and third-party charges at actual cost. The proposal states which modules are ready and which are built with founding partners.\nAsk: Is there anything you would want fixed in writing before deciding, such as support response times?\nShow: The proposal template.")
    eyebrow(s, .6, .6, "14 · Commercial clarity")
    title(s, "Scope first. ‹Then a clear proposal.›", y=.95, w=7, size=32)
    rows = [("01", "One-time setup", "Website, Google profile, modules agreed in scope"), ("02", "Annual platform & support", "Hosting, backups, security, updates, support"), ("03", "Optional add-ons and Google care", "Based on requirements; monthly care is optional"), ("04", "Third-party charges", "WhatsApp, payments, SMS, domain, at actual cost")]
    for i, (a, b, c) in enumerate(rows):
        y = 2.7 + i * .95
        text(s, .6, y, .8, .5, a, 24, False, DGOLD, "Cambria"); text(s, 1.5, y, 5.5, .4, b, 17, True, CHAR, "Cambria"); text(s, 1.5, y + .42, 5.5, .4, c, 12.5, False, MID)
    rect(s, 7.6, 1.0, 5.1, 5.6, CHAR, rounded=True)
    text(s, 7.95, 1.35, 4.4, .3, "SALON SOFTWARE · STARTING FROM", 10.5, True, GOLD, spacing=200)
    text(s, 7.95, 1.85, 4.4, 1, inr(S_["setup"]), 52, False, WHITE, "Cambria")
    text(s, 7.95, 3.05, 4.4, .8, f"setup, then {inr(annual('starter'))} per year\n(about {monthly(annual('starter'))} a month), Starter", 14, False, SOFT)
    text(s, 7.95, 4.2, 4.4, 1.4, "A starting point, not the price of every solution. Final quotation depends on scope, stylists and locations, add-ons, integrations and support needs.", 12, False, SOFT)
    text(s, 7.95, 5.5, 4.4, .5, GU["gst"], 12, False, GOLD)
    rect(s, 7.95, 6.0, .6, .03, GOLD); text(s, 7.95, 6.12, 4.4, .4, "INR, excluding GST", 10.5, False, GOLD)
    footer(s, n, False)


def s_gujarati(prs, n):
    s = slide(prs, CREAM, "Say: (in Gujarati) Summarise the three levels, the free audit and the founding-partner offer in your own words.\nAsk: કયો પ્લાન તમારા સલૂન માટે સૌથી નજીક લાગે છે?\nShow: This slide. Have a native speaker proofread the Gujarati before first use.")
    eyebrow(s, .6, .5, "15 · ગુજરાતીમાં સારાંશ")
    text(s, .6, .85, 12, 1.2, "તમારો સલૂન. ‹Google Maps પર. WhatsApp પર. હિસાબમાં.›", 34, False, CHAR, "Cambria", space=0)
    text(s, .6, 1.95, 11.5, .5, GU["cover_sub"], 15, False, MID)
    cards = [(S_, GU["starter"], f"{inr(S_['setup'])} સેટઅપ + {inr(annual('starter'))} દર વર્ષે", SAND, CHAR), (G_, GU["growth"], f"{inr(G_['setup'])} સેટઅપ + {inr(annual('growth', '1-3'))} દર વર્ષે", GOLD, CHAR), (Pr, GU["pro"], f"{inr(Pr['setup'])} સેટઅપ + {inr(annual('pro', '1-3'))} દર વર્ષે", CHAR, WHITE)]
    for i, (t, line, price, fill, fg) in enumerate(cards):
        x = .6 + i * 4.1
        rect(s, x, 2.75, 3.9, 2.3, fill, rounded=True)
        text(s, x + .25, 2.9, 3.4, .4, f"{t['name']} · {t['gu']}", 16, True, fg, "Cambria"); text(s, x + .25, 3.4, 3.4, 1.0, line, 12, False, fg); text(s, x + .25, 4.35, 3.4, .5, price, 12.5, True, fg)
    rect(s, .6, 5.3, 12.15, 1.3, CHAR, rounded=True)
    text(s, .9, 5.42, 11.5, .4, GU["audit_h"] + " · " + GU["cta"], 17, False, WHITE, "Cambria")
    text(s, .9, 5.95, 11.5, .6, GU["founding"] + "  " + GU["no_obl"], 12, False, SOFT)
    text(s, .6, 6.8, 12, .25, GU["yearly"] + " " + GU["gst"], 10.5, False, MID)
    footer(s, n, False)


def s_ask(prs, n):
    s = slide(prs, CREAM, "Say: Before I recommend anything, I'd like to understand your salon. Pick whichever question is easiest to start with.\nAsk: Choose two or three of these, never all.\nShow: Nothing. Take notes; this becomes the proposal's 'What we heard'.")
    photo(s, "stylist_client_colour", 8.9, 0, 4.433, 7.5, (0.5, 0.25))
    eyebrow(s, .6, .6, "16 · Let's talk about your salon")
    title(s, "A few questions ‹to start.›", y=.95, w=7.5, size=34); guline(s, .6, 1.75, 7.5, GU["questions_h"], size=14)
    qs = ["How do most new clients find your salon today?", "What shows when you search 'salon near me' on your phone?", "Do clients book by phone, WhatsApp, Instagram, walk-in?", "How do you track tomorrow's appointments and client history?", "How do you track daily expenses, salaries and vendor dues?"]
    for i, q in enumerate(qs):
        y = 2.4 + i * .85
        text(s, .6, y, .7, .5, f"{i+1}", 28, False, DGOLD, "Cambria"); text(s, 1.35, y + .05, 7.0, .8, q, 16, False, CHAR, "Cambria")
    footer(s, n, False)


def s_close(prs, n):
    s = slide(prs, CHAR, "Say: The next step is a free audit of your Google profile and website, then a conversation and a demo built around your salon. No obligation.\nAsk: When would be a good 30 minutes this week?\nShow: This slide; leave the contact details on screen.")
    photo(s, "reception_desk", 0, 0, W, H, (0.5, 0.5)); rect(s, 0, 0, W, H, CHAR, .7)
    eyebrow(s, .8, .9, "17 · Next step", True)
    text(s, .8, 1.3, 11, 2.8, "Your salon doesn't need\nmore software.\n‹It needs the right software.›", 44, False, WHITE, "Cambria", space=0)
    guline(s, .8, 4.0, 8, GU["talk_h"], True, 17)
    rect(s, .8, 4.65, 6.3, 1.75, RGBColor.from_string("151311"), alpha=.9, rounded=True, line=RGBColor.from_string("3A352F"))
    text(s, 1.1, 4.8, 5.8, .4, "Free Google & website audit + consultation", 18, False, WHITE, "Cambria"); text(s, 1.1, 5.3, 5.8, .3, "+ FREE TAILORED DEMO", 10.5, True, GOLD, spacing=200)
    text(s, 1.1, 5.7, 5.8, .5, "✓ No obligation     ✓ Based on your workflow     ✓ Practical", 12, False, SOFT)
    text(s, 7.8, 4.7, 5, 1.8, f"{WEB}\n{EMAIL}\n[Insert WhatsApp number]", 15, False, WHITE, space=8)
    footer(s, n, True)


FNS = [s_cover, s_before, s_ops, s_flow, s_maps, s_build, s_ui, s_owner, s_expense, s_clarity, s_plans, s_yearly, s_compare, s_process, s_scope, s_gujarati, s_ask, s_close]


def add_slides(prs, offset=0):
    for i, f in enumerate(FNS, 1): f(prs, i + offset)


def build():
    prs = Presentation(); prs.slide_width, prs.slide_height = Inches(W), Inches(H)
    add_slides(prs)
    out = OUT / "DWD_Salon_Sales_Deck_v2.pptx"; prs.save(out); print("saved", out, len(prs.slides), "slides")


if __name__ == "__main__":
    build()

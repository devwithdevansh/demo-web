"""Editable PowerPoint master: start-here slide + client sales deck + internal appendix
(what we changed, market and pricing snapshot, how a developer team attracts software-needing clients, three small plans, 90-day plan)."""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
import deck
from deck import *
from strategy_b import rev_model

N_DECK = len(deck.FNS)


def table(s, x, y, w, headers, rows, colw, size=10.5, hdr_size=10, row_h=0.42):
    shp = s.shapes.add_table(len(rows) + 1, len(headers), Inches(x), Inches(y), Inches(w), Inches(row_h * (len(rows) + 1)))
    tbl = shp.table
    tot = sum(colw)
    for j, cw in enumerate(colw): tbl.columns[j].width = Inches(w * cw / tot)
    for j, h in enumerate(headers):
        c = tbl.cell(0, j); c.fill.solid(); c.fill.fore_color.rgb = CHAR
        c.text_frame.text = h; r = c.text_frame.paragraphs[0].runs[0]; r.font.size = Pt(hdr_size); r.font.bold = True; r.font.color.rgb = GOLD; r.font.name = "Calibri"
    for i, row in enumerate(rows, 1):
        for j, v in enumerate(row):
            c = tbl.cell(i, j); c.fill.solid(); c.fill.fore_color.rgb = RGBColor.from_string("EFE7D8") if j == 0 else (WHITE if i % 2 else CREAM)
            tf = c.text_frame; tf.word_wrap = True; tf.text = str(v)
            for p in tf.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(size); r.font.name = GU_FONT if has_gu(r.text) else "Calibri"; r.font.color.rgb = CHAR if j == 0 else MID; r.font.bold = (j == 0)
            c.margin_left = c.margin_right = Inches(.08); c.margin_top = c.margin_bottom = Inches(.04)
    return tbl


def s_start(prs, n):
    s = slide(prs, CHAR, "Start here. This file holds every slide: the client deck (slides 2 to 19) and the internal appendix (slides 20 to 29). Everything is native PowerPoint, so text, tables and shapes can be edited directly.\nPrices come from data/pricing.json; if you change a price here, change it there too and rebuild so the PDFs and Word master stay in sync.")
    eyebrow(s, .6, .5, "Start here", True)
    title(s, "Salon sales kit, ‹editable master.›", True, y=.85, w=12, size=34)
    rows = [["Slides 2–19", "Client sales deck (18 slides, speaker notes)", "PPTX editable · PDF", "Client"], ["Slides 20–22", "Internal: divider, review of the previous kit, what we changed", "PPTX editable", "Internal"],
            ["Slides 23–24", "Internal: market snapshot, pricing and offer structures", "PPTX editable", "Internal"], ["Slides 25–29", "Internal: attracting clients, three small plans, 90 days", "PPTX editable", "Internal"],
            ["Word master", "Brochure copy, one-pager, proposal, full playbook, scripts, calendar", "DOCX editable", "Both"], ["Excel", "Calculator, price ladder, competitors, revenue model, lead tracker", "XLSX editable", "Internal"]]
    table(s, .6, 2.1, 12.1, ["Where", "What", "Format", "For"], rows, [2, 7, 3, 1.5], 12, 11, .5)
    text(s, .6, 5.7, 12, .8, "Palette: near-black #0C0B0A · gold #C9AB78 · deep gold #A9895A · cream #F4EFE6 · sand #E8DFD0. Cambria headlines, Calibri text, Nirmala UI for Gujarati.", 12, False, SOFT)
    footer(s, n, True)


def app_divider(prs, n):
    s = slide(prs, CHAR, "Internal appendix. Not for clients. Remove these slides before sharing the deck.")
    eyebrow(s, .8, 2.2, "Internal appendix · not for clients", True)
    text(s, .8, 2.7, 11, 2, "What we changed, and how we win\nsoftware-needing clients.", 44, False, WHITE, "Cambria", space=0)
    guline(s, .8, 4.8, 9, "ફેરફારો અને નવા ગ્રાહકો મેળવવાની યોજના", True, 17)
    footer(s, n, True)


def app_review(prs, n):
    s = slide(prs, CREAM, "Internal. The review of the previous kit as a brand and conversion expert.")
    eyebrow(s, .6, .5, "Review of the previous kit")
    title(s, "Premium and honest, ‹but not yet appealing enough.›", y=.85, w=12, size=30)
    rows = [["Image repetition", "2 / 5", "Three AI-looking photos reused ~14 times", "17 licensed photos, one placement each"], ["Product explanation", "2 / 5", "Feature list; unclear what exists", "Outcome headlines + status chips"],
            ["Pricing and offer", "2 / 5", "6 plan prices + 5 add-ons; unbuilt promises", "3 outcome packages, 'from' price, honest status"], ["Trust signals", "1 / 5", "No proof, no real photos", "Founding-3 programme, licence log, honest limits"],
            ["Local relevance", "1 / 5", "No Gujarati, no Google Maps", "Gujarati headlines/page; Google Maps package"], ["Visual quality, CTA", "4 / 5", "Strong palette, clear free-consultation CTA", "Kept; added free audit as a lower-risk first step"]]
    table(s, .6, 1.9, 12.1, ["Criterion", "Score", "Problem", "Fix applied"], rows, [2.2, 1, 4.5, 4.5], 11.5, 11, .55)
    text(s, .6, 5.9, 12, .8, "Overall about 2.6 / 5 (judgement, not a measured score). Product reality: Starter (site + Google Maps + WhatsApp booking) can be delivered today; booking dashboard and expense manager are built with the first three founding partners.", 13, False, MID)
    footer(s, n, False)


def app_changes(prs, n):
    s = slide(prs, CREAM, "Internal. Summary of every change made to the existing documents.")
    eyebrow(s, .6, .5, "What we changed")
    title(s, "Before → after, ‹document by document.›", y=.85, w=12, size=30)
    rows = [["Photos", "3 images, ~14 uses", "17 licensed Pexels photos; one photo, one placement; licence log"], ["Packages", "Essential / Professional / Custom, 6 prices", "Starter · Growth · Pro · Custom with status; Starter ₹12,999 + ₹5,999/yr"],
            ["Google Maps / local SEO", "Absent", "In every package; ₹4,999 Maps setup; ₹3,999/mo care; no ranking promise"], ["Expense management", "Absent", "Expense manager in Pro and as an add-on; screen mock-up"],
            ["Language", "English only", "Gujarati headlines on every document; Gujarati page and slide; Gujarati scripts"], ["Brochure", "8 pages", "11 pages, offer-led: free-audit badge, break-even maths, founding offer with value stack, promises + FAQ, Google Maps and Gujarati pages"],
            ["Deck", "15 slides", "18 slides: + Google Maps, + expense, + Gujarati; Gujarati headings"], ["Playbook", "9 pages", "Full market-entry playbook (research, offers, pricing, marketing, funnel, 90 days)"],
            ["Editable files", "PDFs + separate files", "Word master, PowerPoint master, Excel with revenue model"]]
    table(s, .6, 1.85, 12.1, ["Area", "Before", "After"], rows, [2.2, 3.5, 7], 11, 10.5, .5)
    footer(s, n, False)


def app_market(prs, n):
    s = slide(prs, CREAM, "Internal. Who has covered the market and where the gap is.")
    eyebrow(s, .6, .5, "Market snapshot")
    title(s, "Apps cover salons that want software. ‹We reach the rest.›", y=.85, w=12, size=28)
    rows = [["Enterprise chains", "Zenoti", "Custom quotes, multi-location, payroll", "Out of scope"], ["India-fit suites", "Zylu · MioSalon · DINGG · Salonist", "₹800–₹4,000/mo; billing, GST, staff, WhatsApp, expenses", "Do not compete feature for feature"],
            ["Freemium marketplace", "Fresha", "Free core + add-ons + 20% new-client fee", "Mention fees honestly"], ["Free/cheap books", "Khatabook · Vyapar", "Free to ~₹3,500/yr", "Our expense view must be salon-specific"],
            ["Freelancers", "Local web + Google setup", "Site ₹5k–15k; Google setup ₹2k–8k; SEO ₹4k–15k/mo", "Starter matches this, adds Maps care"], ["Notebook / WhatsApp / DM", "Most small salons", "₹0", "Our real competitor"]]
    table(s, .6, 1.8, 12.1, ["Layer", "Who", "Price / model", "Our stance"], rows, [2.2, 3, 4.5, 3.4], 11, 10.5, .55)
    rect(s, .6, 5.55, 12.1, 1.15, CHAR, rounded=True)
    text(s, .85, 5.67, 11.6, 1.0, "The gap (observation): local-language, Google-first, done-for-you. Get found, get booked, know your numbers. Google says local ranking cannot be bought, so we sell profile quality, reviews and a bilingual website, never a position.", 13, False, WHITE)
    footer(s, n, False)


def app_pricing(prs, n):
    s = slide(prs, CREAM, "Internal. Where our ladder sits against the market, and the three offer structures.")
    eyebrow(s, .6, .5, "Pricing and offer structures")
    title(s, "Not the cheapest app. ‹The cheapest way to be found, booked and organised.›", y=.85, w=12.2, size=26)
    pos = [["Freelance site + Google setup", "₹7,000–₹23,000", "No booking, no Maps care"], ["Entry app ₹1,499/mo", inr(1499 * 36), "No custom site"], ["Mid-tier app + WhatsApp", inr((2500 + 2000) * 36 + 2500), "Mature billing/inventory"],
           ["DWD Starter", inr(total("starter", "1-3", 3)), "Site + Google Maps"], ["DWD Growth", inr(total("growth", "1-3", 3)), "+ bookings, clients"], ["DWD Pro", inr(total("pro", "1-3", 3)), "+ expense view"]]
    table(s, .6, 2.0, 6.3, ["3-year cost, 1–3 stylists", "Total", "Note"], pos, [3, 1.6, 2.6], 10.5, 10, .5)
    st = [["A · Setup + yearly plan", "Recommended core: repeatable, recurring, upgrade path"], ["B · Monthly retainer", "Use only for Local SEO care (₹3,999/mo)"], ["C · Project + AMC", "Use only for Custom quotes"]]
    table(s, 7.2, 2.0, 5.5, ["Offer structure", "Use"], st, [2.4, 3.6], 10.5, 10, .6)
    text(s, 7.2, 4.2, 5.5, 1.8, "Pricing strategy: balanced value-based, with a low-risk entry (free audit, ₹4,999 Maps setup, Starter) and 50% Starter credit toward Growth/Pro. Avoid the budget strategy (Starter near ₹650 per hour of effort would fall below a sustainable rate).", 12, False, MID)
    r = rev_model(25)
    text(s, .6, 5.5, 12, 1.2, f"Illustration, 25 customers (60/30/10 mix): year-1 revenue {inr(r['rev1'])}, cost {inr(r['cost1'])}, profit before platform build {inr(r['profit1'])}; about {r['hours1']:.0f} hours ({r['fte']:.1f} FTE). Revenue is not profit; assumptions are in the Excel model.", 12, False, MID)
    footer(s, n, False)


def app_attract(prs, n):
    s = slide(prs, CHAR, "Internal. How a small developer team attracts clients who need software.")
    eyebrow(s, .6, .5, "How we attract clients who need software", True)
    title(s, "Find the need first. ‹Then offer the smallest useful step.›", True, y=.85, w=12.2, size=30)
    steps = [("1 Find", "Google Maps list of salons in two areas; flag the gap"), ("2 Audit", "10-minute check: profile, site, booking path, reviews"), ("3 Message", "One specific observation; Gujarati for neighbourhood owners"),
             ("4 Show", "Visit or demo with their salon's name"), ("5 Small yes", "Free audit → ₹4,999 Maps setup or Starter"), ("6 Grow", "Credit toward Growth/Pro; yearly plan")]
    for i, (a, b) in enumerate(steps):
        x = .6 + (i % 3) * 4.1; y = 2.15 + (i // 3) * 2.0
        rect(s, x, y, 3.9, 1.75, RGBColor.from_string("1C1A17"), rounded=True, line=RGBColor.from_string("3A352F"))
        text(s, x + .25, y + .15, 3.4, .4, a, 18, False, GOLD, "Cambria"); text(s, x + .25, y + .65, 3.4, 1.0, b, 12.5, False, WHITE)
    text(s, .6, 6.25, 12, .7, "Signals of a real need: thin Google profile, no website or booking path, 'DM to book', wrong hours, reviews mentioning waiting or an unanswered phone. Skip salons that already run a heavy chain system.", 12, False, SOFT)
    footer(s, n, True)


def plan_slide(prs, n, tag, name, goal, steps, kpis, risk):
    s = slide(prs, CREAM, f"Internal. Small plan {tag}: {name}.")
    eyebrow(s, .6, .5, f"Small plan {tag}")
    title(s, name, y=.85, w=12, size=32)
    text(s, .6, 1.75, 12, .6, goal, 14, False, MID)
    for i, st in enumerate(steps):
        y = 2.5 + i * .62
        text(s, .6, y, .6, .4, f"{i+1}", 20, False, DGOLD, "Cambria"); text(s, 1.3, y + .03, 6.4, .6, st, 13, False, CHAR)
    rect(s, 8.1, 2.5, 4.65, 2.2, CHAR, rounded=True)
    text(s, 8.35, 2.62, 4.2, .3, "TRACK", 10, True, GOLD, spacing=200); text(s, 8.35, 2.95, 4.2, 1.7, "\n".join("• " + k for k in kpis), 12, False, WHITE, space=4)
    rect(s, 8.1, 4.9, 4.65, 1.5, SAND, rounded=True)
    text(s, 8.35, 5.0, 4.2, .3, "RISK TO WATCH", 10, True, CHAR, spacing=200); text(s, 8.35, 5.3, 4.2, 1.0, risk, 11.5, False, CHAR)
    footer(s, n, False)


def app_plan_a(prs, n):
    plan_slide(prs, n, "A", "Maps-first wedge: free audit → ₹4,999 → Starter",
               "Lead with something free and specific, then offer the smallest paid step.",
               ["Week 1: list 100 salons in two areas from Google Maps; note one gap each",
                "Run 10 audits (10 minutes each); write 3 findings in plain words",
                "Send the audit by WhatsApp: Gujarati to half, English to half",
                "Visit the 5 best-scoring salons with the one-pager and their demo",
                f"Offer Maps setup ({inr(ADD['gmaps']['price'])}) or Starter ({inr(T['starter']['setup'])}); 50% credit toward Growth/Pro",
                "Log everything in the lead tracker; follow the 14-day cadence"],
               ["Audits sent / replies / meetings", "Gujarati vs English reply rate", "Paid Maps setups and Starters", "Hours per paid customer"], "A free audit sent to everyone is cheap and ignored. Send only researched, specific ones.")


def app_plan_b(prs, n):
    plan_slide(prs, n, "B", "Partner channel: let people who visit salons introduce you",
               "One partner can open dozens of salons. Salons trust people who already visit them.",
               ["List 15 partners: product distributor reps, chair and equipment dealers, beauty academies, accountants, photographers",
                "Visit with the one-pager; ask for 10 minutes; offer a clear referral thank-you",
                f"Referral credit {inr(P['offers']['referral_credit'])} on the salon's yearly fee, or a share the partner prefers",
                "Give each partner a Gujarati one-pager and a WhatsApp link with their name",
                "Report back monthly: introductions, audits, signed",
                "Thank publicly (with permission); keep two or three strong partners"],
               ["Partners contacted / active", "Introductions per partner", "Signed via partners", "Credit paid vs revenue"], "Partners may not understand the offer. Keep the pitch to one line: 'We get your salons found on Google Maps and booking on WhatsApp.'")


def app_plan_c(prs, n):
    plan_slide(prs, n, "C", "Founding-3 flywheel: build proof, then reuse it",
               "Turn three discounted builds into the proof every later sale needs.",
               ["Pick 3 salons: ideally one neighbourhood, one boutique, one barbershop",
                f"{P['offers']['founding_partner']['setup_discount_pct']}% off setup, price locked {P['offers']['founding_partner']['price_lock_years']} years, for feedback, a testimonial and permission to show results",
                "Build the booking core, then the expense manager, with them; weekly 15-minute feedback calls",
                "Capture before/after of the Google profile and website, and real photos (with releases)",
                "Publish a short case study and a 30-second video; ask each salon for two referrals",
                "Close the offer after three; reuse the modules for other appointment-based businesses (gyms, clinics, studios)"],
               ["Dashboard used daily for 30 days", "Reviews gained, calls from Google", "Testimonials and referrals", "Build hours per module"], "Unpaid pilots sprawl. Write the scope, the timeline and the end of the discount in the proposal.")


def app_90(prs, n):
    s = slide(prs, CHAR, "Internal. The 90-day plan and the decisions needed.")
    eyebrow(s, .6, .5, "90 days", True)
    title(s, "Validate, then pilot, then repeat. ‹Decide with evidence.›", True, y=.85, w=12.2, size=30)
    cols = [("Days 1–30", "Finish prices and Gujarati proofreading · claim DWD's Google profile · list 100 salons · 30 audits · 10 conversations · Starter demo with Gujarati toggle"),
            ("Days 31–60", "Contact 25 salons a week · demos · sign 3 founding partners · build booking core with them · test Gujarati vs English"),
            ("Days 61–90", "Ship expense manager to 1–2 partners · publish a real case study · review each funnel stage · add the partner channel")]
    for i, (a, b) in enumerate(cols):
        x = .6 + i * 4.1
        rect(s, x, 2.0, 3.9, 2.9, RGBColor.from_string("1C1A17"), rounded=True, line=RGBColor.from_string("3A352F"))
        text(s, x + .25, 2.15, 3.4, .4, a, 18, False, GOLD, "Cambria"); text(s, x + .25, 2.7, 3.4, 2.1, b, 12, False, WHITE)
    text(s, .6, 5.15, 12, 1.5, "Decisions only you can make: final prices · GST · founding-partner terms · first city or neighbourhoods · monthly capacity · who proofreads Gujarati · WhatsApp number and Google profile owner.\nEvidence to invest more (agree in advance): 3 paying clients, 2 salons using the dashboard daily for 30 days, 1 genuine testimonial, replies that repeat in a second area.", 12, False, SOFT, space=6)
    footer(s, n, True)


APP = [app_divider, app_review, app_changes, app_market, app_pricing, app_attract, app_plan_a, app_plan_b, app_plan_c, app_90]


def build():
    prs = Presentation(); prs.slide_width, prs.slide_height = Inches(W), Inches(H)
    s_start(prs, 1)
    deck.add_slides(prs, offset=1)
    for i, f in enumerate(APP):
        f(prs, 2 + N_DECK + i)
    out = OUT / "DWD_Salon_MASTER_Editable.pptx"; prs.save(out); print("saved", out, len(prs.slides), "slides")
    return len(prs.slides)


if __name__ == "__main__":
    build()

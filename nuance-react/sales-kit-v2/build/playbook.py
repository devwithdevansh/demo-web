"""Internal growth & pricing playbook (PDF). Flowing A4 pages built from the same blocks as the Word master."""
import fitz
from lib import *
import strategy

X = """
@page cover{margin:0}
@page wide{size:A4 landscape;margin:12mm 12mm 14mm}
.cover{page:cover}
.wide{page:wide;break-before:page;break-after:page}
em{font-style:italic;color:var(--terra);font-weight:400}.dark em{color:var(--gold)}h1,h2{font-weight:400}
.sec>h2{font-size:24pt}
"""


def cover(secs):
    toc = "".join(f'<div style="display:flex;gap:4mm;margin:1.6mm 0"><b style="color:var(--gold);min-width:6mm">{i}</b><span style="color:#E9E1D6">{esc(t.split(" · ", 1)[1])}</span></div>' for i, (t, _) in enumerate(secs, 1))
    dec = ["Confirm or edit the prices in data/pricing.json (all are proposals from research)", "Proofread the Gujarati copy with a native speaker", "Add your WhatsApp number and claim the DWD Google profile",
           "Choose the first city or neighbourhoods", "Decide founding-partner terms and your monthly capacity"]
    d = "".join(f"<li>{esc(x)}</li>" for x in dec)
    return f'''<section class="page dark cover"><div class="eyebrow">Internal · October 2026 · not for clients</div>
<h1 style="font-size:40pt;color:#fff;margin-top:22mm;font-weight:400">Salon growth, pricing<br>&amp; <em>market-entry playbook</em></h1>
<p class="lead" style="color:#E9E1D6;max-width:150mm;margin-top:6mm">Audit of the kit, market and pricing research, product plan, offers, Google Maps and local SEO, Gujarati messaging, sales tools and a 90-day launch plan. Written for a small developer team finding salons that need software.</p>
<div class="grid g2" style="position:absolute;left:16mm;right:16mm;bottom:16mm;gap:6mm">
<div class="card" style="background:#1a1816;border-color:#2e2a26"><div class="eyebrow">Contents</div><div style="font-size:9.5pt">{toc}</div></div>
<div class="card" style="background:#1a1816;border-color:#2e2a26"><div class="eyebrow">Decisions only you can make</div><ul class="small" style="color:#E9E1D6;font-size:9.5pt">{d}</ul></div></div></section>'''


def build():
    secs = strategy.sections()
    html_str = doc("DevWithDevansh – Salon growth, pricing & market-entry playbook (internal)", [cover(secs), f"<main>{strategy.sections_html(secs)}</main>"], FLOW + X)
    render("DWD_Salon_Growth_Pricing_Playbook", html_str)
    # stamp page numbers and add bookmarks
    pdf = OUT / "DWD_Salon_Growth_Pricing_Playbook.pdf"
    d = fitz.open(pdf)
    toc = [[1, "Cover and contents", 1]]
    for i, (t, _) in enumerate(secs, 1):
        for pn in range(1, d.page_count):
            if t in d[pn].get_text()[:400]:
                toc.append([1, t, pn + 1]); break
    for pn in range(1, d.page_count):
        pg = d[pn]; r = pg.rect
        pg.insert_text((r.width / 2 - 70, r.height - 18), f"DevWithDevansh · Internal playbook · {pn + 1}", fontsize=7, color=(0.54, 0.49, 0.45))
    d.set_toc(toc)
    d.save(OUT / "_pb.pdf", garbage=3, deflate=True); d.close()
    (OUT / "_pb.pdf").replace(pdf)
    print("playbook pages:", fitz.open(pdf).page_count)


if __name__ == "__main__":
    build()

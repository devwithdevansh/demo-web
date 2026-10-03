"""Builds the merged PDFs (client pack + complete internal kit) with divider pages that say which format/file each
section is, embeds the editable files (PPTX, XLSX, HTML, MD) inside the PDFs as attachments, and assembles the
numbered delivery folder + zip.  Run after build_all.py and the deck PDF export."""
import shutil, subprocess, zipfile
import fitz
from lib import *

PKG = ROOT / "package"
CALC_PNG = ROOT / "assets" / "screens" / "calculator_preview.png"

# (id, title, audience, one-line purpose, files shown on divider [(label, filename, kind)], pdf pages source or None)
SECTIONS = [
    ("brochure", "Brochure", "Client", "11 pages, offer-led: why act now, three steps, Google Maps, see it first, plans with break-even, the founding offer, pricing, promises, Gujarati page. Send after a first positive reply.",
     [("PDF · print / send", "DWD_Salon_Brochure_A4.pdf"), ("HTML · editable source", "DWD_Salon_Brochure_A4.html")], "DWD_Salon_Brochure_A4.pdf"),
    ("onepager", "One-pager", "Client", "A4 leave-behind with the starting price and the free consultation.",
     [("PDF · print / share", "DWD_Salon_One_Pager_A4.pdf")], "DWD_Salon_One_Pager_A4.pdf"),
    ("deck", "Sales deck", "Client", "18 photo-led slides for the meeting, with Gujarati headings and Say / Ask / Show speaker notes.",
     [("PPTX · editable (attached to this PDF)", "DWD_Salon_Sales_Deck_v2.pptx"), ("PDF · pages that follow", "DWD_Salon_Sales_Deck_v2.pdf")], "DWD_Salon_Sales_Deck_v2.pdf"),
    ("comparison", "Comparison sheet", "Client", "Subscription app vs tailored ladder: three-year cost and seven decision questions.",
     [("PDF · send when they say 'we use an app'", "DWD_Salon_Comparison_Sheet.pdf")], "DWD_Salon_Comparison_Sheet.pdf"),
    ("proposal", "Proposal template", "Client", "Exact scope, setup, yearly fee and terms. Send within 24 hours of the meeting.",
     [("HTML · editable: open, click, type, Print to PDF", "DWD_Salon_Proposal_Template.html"), ("PDF · blank template", "DWD_Salon_Proposal_Template.pdf")], "DWD_Salon_Proposal_Template.pdf"),
    ("calculator", "Price calculator", "Client", "Interactive plan-and-savings calculator. Co-fill it with the owner in the meeting.",
     [("HTML · interactive, works offline (attached)", "DWD_Salon_Price_Calculator.html"), ("XLSX · same maths in Excel (attached)", "DWD_Salon_Price_Calculator.xlsx")], "CALC"),
    ("playbook", "Growth & pricing playbook", "Internal", "Audit, market and pricing research, product plan, offers, Google Maps/local SEO, Gujarati strategy, funnel, sales tools, 90-day plan. Do not send to clients.",
     [("PDF · read", "DWD_Salon_Growth_Pricing_Playbook.pdf")], "DWD_Salon_Growth_Pricing_Playbook.pdf"),
    ("outreach", "Outreach scripts & lead tracker", "Internal", "Copy-ready messages in English and Gujarati, and a pipeline sheet with stage dropdowns.",
     [("PDF · read", "DWD_Salon_Outreach_Scripts.pdf"), ("MD · copy-paste text (attached)", "DWD_Salon_Outreach_Scripts.md"), ("XLSX · lead tracker (attached)", "DWD_Salon_Lead_Tracker.xlsx")], "DWD_Salon_Outreach_Scripts.pdf"),
    ("appendix", "What we changed, and how we win clients (slides)", "Internal", "Review of the previous kit, what changed, market and pricing snapshot, how a developer team attracts software-needing clients, three small plans, 90 days.",
     [("PPTX · editable master (attached)", "DWD_Salon_MASTER_Editable.pptx"), ("DOCX · editable master (attached)", "DWD_Salon_MASTER_Editable.docx"), ("PDF · slides that follow", "slides 20–29 of the PPTX master")], "APPENDIX"),
]
EMBED = {"deck": ["DWD_Salon_Sales_Deck_v2.pptx"], "brochure": ["DWD_Salon_Brochure_A4.html"], "proposal": ["DWD_Salon_Proposal_Template.html"],
         "calculator": ["DWD_Salon_Price_Calculator.html", "DWD_Salon_Price_Calculator.xlsx"], "outreach": ["DWD_Salon_Outreach_Scripts.md", "DWD_Salon_Lead_Tracker.xlsx"],
         "appendix": ["DWD_Salon_MASTER_Editable.pptx", "DWD_Salon_MASTER_Editable.docx"]}

X = """
.page{padding:18mm}.big{font-family:Cambria,Georgia,serif;font-size:120pt;color:var(--gold);line-height:1}
.chip{display:inline-block;border:.3mm solid var(--gold);border-radius:10mm;padding:1.2mm 4mm;margin:0 2mm 2mm 0;font-size:10.5pt;color:#E9E1D6}
em{font-style:italic;color:var(--terra);font-weight:400}.dark em{color:var(--gold)}h1,h2{font-weight:400}
.row td{font-size:9.5pt;padding:2mm 2.5mm}.int{background:#EFE7D8}
.b-client,.b-int{display:inline-block;font-size:8pt;letter-spacing:.14em;text-transform:uppercase;font-weight:700;padding:.8mm 3mm;border-radius:10mm}
.b-client{background:var(--gold);color:var(--char)}.b-int{background:var(--char);color:var(--gold)}
"""


def cover_html(title, sub, internal):
    return doc(title, [page(f'''<div class="eyebrow">DevWithDevansh · Software Development &amp; Business Automation Solutions</div>
<h1 style="font-size:46pt;color:#fff;margin-top:34mm;font-weight:400">Salon sales kit<br><em>{sub}</em></h1>
<p class="lead" style="color:#E9E1D6;max-width:140mm;margin-top:8mm">{"Every document, deck and tool for selling websites, booking and client systems to salons. Includes the internal playbook, scripts, and a closing section on what changed and how to attract clients." if internal else "Everything a salon owner needs to see: brochure, one-pager, sales deck, comparison, proposal and the price calculator."}</p>
<div class="card" style="position:absolute;left:18mm;right:18mm;bottom:18mm;background:#1a1816;border-color:#2e2a26">
<div class="eyebrow">{"Internal · not for clients" if internal else "Client pack"}</div><p class="small" style="margin:0;color:#cfc6b8">Editable files (PowerPoint, Excel, HTML) are attached inside this PDF. Open the attachments panel in your PDF reader to save them. Prices are proposed, in INR, excluding GST.</p></div>''', cls="dark")], X)


def divider_html(i, sec):
    sid, title, aud, purpose, files, _ = sec
    chips = "".join(f'<span class="chip"><b style="color:var(--gold)">{lbl.split(" · ")[0]}</b> · {lbl.split(" · ", 1)[1] if " · " in lbl else ""}<br><span style="font-size:8.5pt;opacity:.8">{fn}</span></span>' for lbl, fn in files)
    return doc(title, [page(f'''<div class="big">{i:02d}</div><div class="eyebrow" style="margin-top:6mm">{"Client-facing" if aud == "Client" else "Internal only"}</div>
<h1 style="font-size:40pt;color:#fff;font-weight:400">{title}</h1>
<p class="lead" style="color:#cfc6b8;max-width:150mm;margin-top:5mm">{purpose}</p>
<div style="margin-top:14mm"><div class="eyebrow">Formats and files</div>{chips}</div>''', cls="dark")], X)


def toc_html(secs, starts, internal):
    rows = "".join(f'<tr class="row"><td class="k" style="width:6%">{i:02d}</td><td><b style="color:var(--char);font-family:Cambria,serif;font-size:12pt">{s[1]}</b><br><span style="font-size:8.5pt">{s[3]}</span></td>'
                   f'<td style="width:33%;font-size:8.5pt">{"<br>".join(lbl.split(" · ")[0] + " · " + fn for lbl, fn in s[4])}</td><td style="width:9%"><span class="b-{"client" if s[2] == "Client" else "int"}">{s[2]}</span></td><td style="width:6%"><b>{starts[i-1]}</b></td></tr>' for i, s in enumerate(secs, 1))
    return doc("Contents", [page(f'''<div class="eyebrow">Contents</div><h2>What is in this kit, <em>and which file it is.</em></h2>
<table style="font-size:9.5pt"><tr><th>#</th><th>Document</th><th>Formats / files</th><th>For</th><th>Page</th></tr>{rows}</table>
<div class="grid g2" style="margin-top:6mm"><div class="card"><h3 style="font-size:12.5pt">One colour system</h3><p class="small" style="margin:0">Near-black <b>#0C0B0A</b> · gold <b>#C9AB78</b> · deep gold <b>#A9895A</b> · cream <b>#F4EFE6</b> · sand <b>#E8DFD0</b>. Cambria for headlines, Calibri for text, italic gold for the accent phrase.</p></div>
<div class="card"><h3 style="font-size:12.5pt">Editable files</h3><p class="small" style="margin:0">{"PPTX deck, XLSX calculator and tracker, HTML proposal and calculator are attached to this PDF. Change prices once in <i>pricing.json</i> and rebuild to update every file." if internal else "The PowerPoint deck, Excel calculator and the HTML proposal and calculator are attached to this PDF. Open the attachments panel in your PDF reader to save them."}</p></div></div>''', n=2, label="DevWithDevansh · Salon sales kit")], X)


def calc_page():
    subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=960,1500", "--virtual-time-budget=3000",
                    f"--screenshot={CALC_PNG}", (OUT / "DWD_Salon_Price_Calculator.html").as_uri()], check=True, capture_output=True, timeout=60)
    rows = "".join(f"<tr><td class='k'>{T[k]['name']} · {BAND_LABEL[b]}</td><td>{inr(T[k]['setup'])}</td><td>{inr(annual(k, b))}</td><td>{monthly(annual(k, b))}</td><td>{inr(total(k, b, 3))}</td></tr>" for k in ("starter", "growth", "pro") for b in (["1-3"] if k == "starter" else BANDS))
    h = doc("Price calculator", [page(f'''<div class="eyebrow">Price calculator · preview</div><h2>Type their numbers, <em>see their answer.</em></h2>
<div style="display:grid;grid-template-columns:1fr 1.1fr;gap:6mm"><img src="{CALC_PNG.as_uri()}" style="width:100%;border-radius:3mm;border:.3mm solid var(--sand)">
<div><h3 style="font-size:13pt">Price ladder (proposed, INR, excl. GST)</h3><table style="font-size:9pt"><tr><th>Plan · size</th><th>Setup</th><th>Yearly</th><th>/mo</th><th>3-yr</th></tr>{rows}</table>
<p class="small" style="margin-top:3mm">Open <b>DWD_Salon_Price_Calculator.html</b> in any browser (works offline), or use the XLSX for the same maths in Excel. Both are attached to this PDF.</p></div></div>''', n=1, label="DevWithDevansh · Salon sales kit")], X)
    return render("_calc_page", h)


def merge(internal, name):
    secs = [s for s in SECTIONS if internal or s[2] == "Client"]
    OUT.mkdir(exist_ok=True)
    render("_cover", cover_html("Salon sales kit", "complete" if internal else "client pack", internal))
    parts = []  # (section index, [pdf paths])
    for i, s in enumerate(secs, 1):
        render(f"_div{i}", divider_html(i, s))
        if s[5] == "APPENDIX":
            m = fitz.open(OUT / "DWD_Salon_MASTER_Editable.pdf"); m.select(list(range(19, m.page_count))); m.save(OUT / "_appendix.pdf"); m.close()
            body = OUT / "_appendix.pdf"
        else:
            body = OUT / "_calc_page.pdf" if s[5] == "CALC" else OUT / s[5]
        parts.append((OUT / f"_div{i}.pdf", body))
    starts, pn = [], 3
    for d, b in parts:
        starts.append(pn); pn += 1 + fitz.open(b).page_count
    render("_toc", toc_html(secs, starts, internal))
    out = fitz.open()
    out.insert_pdf(fitz.open(OUT / "_cover.pdf")); out.insert_pdf(fitz.open(OUT / "_toc.pdf"))
    toc = [[1, "Cover", 1], [1, "Contents", 2]]
    for i, (d, b) in enumerate(parts):
        out.insert_pdf(fitz.open(d)); out.insert_pdf(fitz.open(b))
        toc.append([1, f"{i+1:02d} {secs[i][1]} ({secs[i][2]})", starts[i]])
    out.set_toc(toc)
    # links on contents page
    tp = out[1]
    for i, s in enumerate(secs):
        for r in tp.search_for(s[1].split(' &')[0]):
            tp.insert_link({"kind": fitz.LINK_GOTO, "from": r, "page": starts[i] - 1}); break
    for s in secs:
        for fn in EMBED.get(s[0], []):
            out.embfile_add(fn, (OUT / fn).read_bytes(), desc=f"{s[1]}: editable source")
    out.set_metadata({"title": "DevWithDevansh Salon sales kit" + ("" if internal else " (client pack)"), "author": "DevWithDevansh"})
    out.save(OUT / f"{name}.pdf", garbage=3, deflate=True); print("saved", name, out.page_count, "pages")
    return secs


def folder():
    if PKG.exists(): shutil.rmtree(PKG)
    layout = {
        "00_Start_Here": ["DWD_Salon_Complete_Kit_INTERNAL.pdf", "DWD_Salon_Client_Pack.pdf", "DWD_Salon_MASTER_Editable.docx", "DWD_Salon_MASTER_Editable.pptx"],
        "01_Sales_Deck": ["DWD_Salon_Sales_Deck_v2.pptx", "DWD_Salon_Sales_Deck_v2.pdf"],
        "02_Brochure": ["DWD_Salon_Brochure_A4.pdf", "DWD_Salon_Brochure_A4.html"],
        "03_One_Pager": ["DWD_Salon_One_Pager_A4.pdf"],
        "04_Comparison_Sheet": ["DWD_Salon_Comparison_Sheet.pdf"],
        "05_Proposal_Template": ["DWD_Salon_Proposal_Template.html", "DWD_Salon_Proposal_Template.pdf"],
        "06_Price_Calculator": ["DWD_Salon_Price_Calculator.html", "DWD_Salon_Price_Calculator.xlsx"],
        "07_INTERNAL_Playbook": ["DWD_Salon_Growth_Pricing_Playbook.pdf"],
        "08_INTERNAL_Outreach": ["DWD_Salon_Outreach_Scripts.pdf", "DWD_Salon_Outreach_Scripts.md", "DWD_Salon_Lead_Tracker.xlsx"],
    }
    for d, fs in layout.items():
        (PKG / d).mkdir(parents=True, exist_ok=True)
        for f in fs: shutil.copy(OUT / f, PKG / d / f)
    for sub in ("data", "build", "assets"):
        shutil.copytree(ROOT / sub, PKG / "09_Rebuild_Source" / sub, ignore=shutil.ignore_patterns("__pycache__", "_crop", "*.html"))
    shutil.copy(ROOT / "README.md", PKG / "00_Start_Here" / "README.md")
    zp = ROOT / "DWD_Salon_Complete_Kit.zip"
    if zp.exists(): zp.unlink()
    with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
        for f in PKG.rglob("*"):
            if f.is_file(): z.write(f, Path("DWD_Salon_Complete_Kit") / f.relative_to(PKG))
    print("zip", zp, round(zp.stat().st_size / 1e6, 1), "MB")


from pathlib import Path


def build():
    calc_page()
    merge(True, "DWD_Salon_Complete_Kit_INTERNAL")
    merge(False, "DWD_Salon_Client_Pack")
    folder()


if __name__ == "__main__":
    build()

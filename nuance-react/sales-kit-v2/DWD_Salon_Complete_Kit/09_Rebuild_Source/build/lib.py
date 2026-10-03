import json, subprocess, pathlib, html, re, base64, mimetypes
from urllib.parse import unquote
from urllib.request import url2pathname

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
P = json.loads((ROOT / "data" / "pricing.json").read_text(encoding="utf-8"))
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
T = P["tiers"]
ADD = {a["key"]: a for a in P["addons"]}
BANDS = ["1-3", "4-8", "9-15"]
BAND_LABEL = {"1-3": "1–3 stylists", "4-8": "4–8 stylists", "9-15": "9–15 stylists"}
WEB = "devwithdevansh.com"
EMAIL = "devwithdevansh@gmail.com"
CONTACT = f"{WEB} · {EMAIL} · [Insert WhatsApp number]"
PH = lambda n: (ROOT / "assets" / "photos" / (n + ".jpg")).as_uri()


def inr(n):
    """Indian digit grouping: 1234567 -> ₹12,34,567"""
    s = str(int(n))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        parts = []
        while len(head) > 2:
            parts.insert(0, head[-2:]); head = head[:-2]
        if head: parts.insert(0, head)
        s = ",".join(parts + [tail])
    return "₹" + s


def monthly(n): return inr(round(n / 12))


def annual(tier, band="1-3"):
    a = T[tier]["annual"]
    return a if isinstance(a, (int, float)) else a[band]


def total(tier, band, years):
    return T[tier]["setup"] + annual(tier, band) * years


def founding(k):
    """Founding-partner setup price (list price less the founding discount)."""
    return round(T[k]["setup"] * (100 - P["offers"]["founding_partner"]["setup_discount_pct"]) / 100)


def breakeven(k, band="1-3", ticket=None, founding_price=False):
    """Extra bookings per month needed to cover year-1 cost at the given average ticket. Arithmetic, not a promise."""
    import math
    ticket = ticket or P["assumptions"]["avg_ticket"]
    setup = founding(k) if founding_price else T[k]["setup"]
    return math.ceil((setup + annual(k, band)) / ticket / 12)


def esc(s): return html.escape(s, quote=False)


CSS = """
:root{--terra:#A9895A;--gold:#C9AB78;--taupe:#D9D0C1;--sand:#E8DFD0;--mid:#4A433A;--ivory:#F4EFE6;--char:#0C0B0A;--sage:#8A7D72}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:Calibri,"Nirmala UI",Arial,sans-serif;color:var(--mid);background:#fff;font-size:12pt;line-height:1.5}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;background:var(--ivory);padding:16mm 16mm 18mm}
.page.dark{background:var(--char);color:#E9E1D6}
h1,h2,h3,.serif{font-family:Cambria,"Nirmala UI",Georgia,serif;color:var(--char);font-weight:700}
.dark h1,.dark h2,.dark h3{color:#fff}
h1{font-size:30pt;line-height:1.08}h2{font-size:25pt;line-height:1.12;margin-bottom:4mm}h3{font-size:14.5pt;margin-bottom:1.5mm}
.eyebrow{font-size:9pt;letter-spacing:.2em;text-transform:uppercase;color:var(--terra);font-weight:700;margin-bottom:3mm}
.dark .eyebrow{color:var(--gold)}
p{margin-bottom:2.5mm}
.lead{font-size:13.5pt;color:var(--mid)}
.muted{color:#7a6e64;font-size:8.5pt}
.card{background:#fff;border-radius:3.5mm;padding:6mm;border:.3mm solid var(--sand)}
.card.sand{background:var(--sand);border-color:var(--sand)}
.card.terra{background:var(--gold);color:var(--char);border-color:var(--gold)}.card.terra h3{color:var(--char)}
.card.char{background:var(--char);color:#E9E1D6;border-color:var(--char)}.card.char h3{color:#fff}
.grid{display:grid;gap:4mm}.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:1fr 1fr 1fr}.g4{grid-template-columns:repeat(4,1fr)}
table{width:100%;border-collapse:collapse;font-size:10.8pt}
th{background:var(--char);color:#fff;text-align:left;padding:3mm 3.5mm;font-weight:700;font-size:9.5pt;letter-spacing:.04em}
td{padding:3.2mm 3.5mm;border-bottom:.3mm solid var(--sand);vertical-align:top;background:#fff}
td.k{font-weight:700;color:var(--char);background:#EFE7D8}
tr.hl td{background:#F1E6D2}
.price{font-family:Cambria,Georgia,serif;font-size:26pt;color:var(--char);font-weight:700;line-height:1}
.char .price{color:#fff}.terra .price{color:var(--char)}
.small{font-size:10.3pt}.tag{display:inline-block;font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;font-weight:700;padding:.8mm 2.4mm;border-radius:10mm;background:var(--sand);color:var(--char)}
ul{margin:0 0 2.5mm 4.5mm}li{margin-bottom:1.2mm}
.ok{color:#4f6b3b;font-weight:700}.no{color:#a0402a;font-weight:700}
.foot{font-size:8.5pt;position:absolute;left:16mm;right:16mm;bottom:8mm;display:flex;justify-content:space-between;color:#8a7d72}
.dark .foot{color:#9b8f84}
.note{font-size:9pt;color:#7a6e64;font-style:italic}
.num{font-family:Cambria,Georgia,serif;font-size:26pt;color:var(--terra);font-weight:700;line-height:1}
.logo{height:11mm;background:#fff;border-radius:3mm;padding:1.5mm 3mm}
.gu{font-family:"Nirmala UI","Shruti",sans-serif}
.st{display:inline-block;font-size:7pt;letter-spacing:.1em;text-transform:uppercase;font-weight:700;padding:.5mm 2mm;border-radius:10mm;white-space:nowrap}
.st-now{background:#DCE8D0;color:#2f4a1f}.st-pilot{background:#F1E6D2;color:#6b5320}.st-road{background:#E4E0DA;color:#5a5249}
"""

# flowing (auto-paginated) documents, used for the long strategy playbook
FLOW = """
@page{size:A4;margin:16mm 16mm 18mm}
html{background:var(--ivory)}body{background:var(--ivory);font-size:10.5pt;line-height:1.5}
.sec{break-before:page}.sec:first-of-type{break-before:auto}
h2{font-size:22pt;margin:0 0 3mm;break-after:avoid}h3{font-size:13pt;margin:5mm 0 1.5mm;break-after:avoid}
table{margin:2mm 0 4mm;font-size:9pt}th,td{padding:2mm 2.6mm}tr{break-inside:avoid}thead{display:table-header-group}
.card{break-inside:avoid;margin:2mm 0 4mm}.cols{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.callout{background:var(--char);color:#E9E1D6;border-radius:3mm;padding:4mm 5mm;margin:3mm 0 4mm;break-inside:avoid}.callout b{color:var(--gold)}
.lbl{display:inline-block;font-size:7pt;letter-spacing:.08em;text-transform:uppercase;font-weight:700;padding:.4mm 1.8mm;border-radius:10mm;margin-right:1mm}
.l-fact{background:#DCE8D0;color:#2f4a1f}.l-claim{background:#F1E6D2;color:#6b5320}.l-obs{background:#E4E0DA;color:#5a5249}.l-rec{background:var(--char);color:var(--gold)}
ul{margin-bottom:2mm}li{margin-bottom:.8mm}
"""


def page(body, cls="", n=None, total=None, label="DevWithDevansh · Salon solutions"):
    foot = f'<div class="foot"><span>{label}</span><span>{n or ""}</span></div>' if n else ""
    return f'<section class="page {cls}">{body}{foot}</section>'


def doc(title, pages, extra_css=""):
    return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{html.escape(title)}</title><style>{CSS}{extra_css}</style></head><body>{"".join(pages)}</body></html>'


def embed(html_str):
    """Inline local file:// images as data URIs so the saved .html is portable."""
    def f(m):
        p = pathlib.Path(url2pathname(unquote(m.group(0)[len("file:"):])))
        mt = mimetypes.guess_type(p.name)[0] or "image/png"
        return f"data:{mt};base64," + base64.b64encode(p.read_bytes()).decode()
    return re.sub(r"file:///[^\"'\s)]+\.(?:png|jpg|jpeg)", f, html_str)


def render(name, html_str, pdf=True):
    OUT.mkdir(exist_ok=True)
    html_str = embed(html_str)
    h = OUT / f"{name}.html"; h.write_text(html_str, encoding="utf-8")
    if pdf:
        subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                        f"--print-to-pdf={OUT / (name + '.pdf')}", h.as_uri()],
                       check=True, capture_output=True, timeout=180)
    return h


def status_chip(s):
    cls = {"Ready now": "st-now", "Founding-partner build": "st-pilot", "Roadmap": "st-road", "Scoped per salon": "st-road"}.get(s, "st-road")
    return f'<span class="st {cls}">{s}</span>'

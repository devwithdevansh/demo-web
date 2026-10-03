"""Aggregates the strategy sections and renders them to HTML (flowing pages). The DOCX writer reads the same blocks."""
import re
import strategy_a, strategy_b, strategy_c
from lib import *


def sections():
    return [strategy_a.audit(), strategy_a.research(), strategy_a.product(), strategy_b.offers(), strategy_b.pricing(), strategy_b.marketing(),
            strategy_c.language(), strategy_c.visual(), strategy_c.website(), strategy_c.sales(), strategy_c.plan90(), strategy_c.final()]


def inline(s):
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", esc(s)).replace(chr(10), "<br>")


def cell(c):
    if isinstance(c, dict):
        return f'<span class="lbl {c["chip"]}">{esc(c["t"])}</span>'
    return inline(str(c))


def table_html(headers, rows, widths=None):
    n = len(headers)
    cls = ""
    fs = "font-size:8.4pt;" if n >= 6 else ""
    cg = ("<colgroup>" + "".join(f'<col style="width:{w}%">' for w in widths) + "</colgroup>") if widths else ""
    head = "".join(f"<th>{esc(h)}</th>" for h in headers)
    body = "".join("<tr>" + "".join(f'<td{" class=k" if i == 0 else ""}>{cell(c)}</td>' for i, c in enumerate(r)) + "</tr>" for r in rows)
    return f'<div class="{cls}"><table style="{fs}">{cg}<thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'


def kv_html(title, rows):
    body = "".join(f'<tr><td class="k" style="width:24%">{esc(a)}</td><td>{cell(c)}</td></tr>' for a, c in rows)
    return f'<div class="card" style="padding:0;overflow:hidden"><div style="background:var(--char);color:var(--gold);padding:2.5mm 4mm;font-family:Cambria,serif;font-size:11.5pt">{esc(title)}</div><table style="margin:0;font-size:9pt"><tbody>{body}</tbody></table></div>'


def block_html(b):
    k = b[0]
    if k == "p": return f"<p>{inline(b[1])}</p>"
    if k == "note": return f'<p class="note">{inline(b[1])}</p>'
    if k == "h3": return f"<h3>{esc(b[1])}</h3>"
    if k == "ul": return "<ul>" + "".join(f"<li>{inline(x)}</li>" for x in b[1]) + "</ul>"
    if k == "ol": return "<ol style='margin-left:5mm'>" + "".join(f"<li>{inline(x)}</li>" for x in b[1]) + "</ol>"
    if k == "callout": return f'<div class="callout">{inline(b[1])}</div>'
    if k == "table": return table_html(b[1], b[2], b[3] if len(b) > 3 else None)
    if k == "kv": return kv_html(b[1], b[2])
    raise ValueError(k)


def sections_html(secs):
    out = []
    for title, blocks in secs:
        out.append(f'<section class="sec"><div class="eyebrow">Internal playbook</div><h2>{esc(title)}</h2>' + "".join(block_html(b) for b in blocks) + "</section>")
    return "".join(out)

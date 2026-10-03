"""Price calculator (interactive HTML) and Excel workbook: calculator, price ladder, add-ons, competitors, formula-driven revenue model, lead tracker."""
import json
from lib import *
from content import COMP
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation

HTML = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Salon plan &amp; savings calculator</title><style>
:root{--terra:#A9895A;--gold:#C9AB78;--sand:#E8DFD0;--mid:#4A433A;--ivory:#F4EFE6;--char:#0C0B0A}
*{box-sizing:border-box}body{margin:0;font-family:Calibri,"Nirmala UI",Arial,sans-serif;background:var(--ivory);color:var(--mid);padding:16px}
.wrap{max-width:900px;margin:0 auto}h1{font-family:Cambria,Georgia,serif;color:var(--char);font-size:28px;margin:8px 0}
.eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--terra);font-weight:700}
.card{background:#fff;border:1px solid var(--sand);border-radius:14px;padding:18px;margin:14px 0}
.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
label{display:block;font-size:13px;font-weight:700;color:var(--char);margin-bottom:4px}
input,select{width:100%;padding:10px;border:1px solid #cdbfae;border-radius:8px;font-size:16px;background:#fff}
.big{font-family:Cambria,Georgia,serif;font-size:30px;color:var(--char);font-weight:700}
.k{font-size:12px;color:#7a6e64}.dark{background:var(--char);color:#E9E1D6}.dark .big{color:#fff}
.note{font-size:12px;color:#7a6e64;font-style:italic}.chk{display:flex;gap:8px;align-items:center;font-size:14px;margin:6px 0}.chk input{width:auto}
.st{font-size:10px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;padding:2px 7px;border-radius:10px;background:#F1E6D2;color:#6b5320;margin-left:6px}
</style></head><body><div class="wrap">
<div class="eyebrow">DevWithDevansh · Salon solutions</div><h1>Plan &amp; savings calculator</h1>
<p>Choose a plan, then compare it with what you pay today. Everything uses your own numbers. Prices are proposals in INR, excluding GST. <span style="font-family:'Nirmala UI'">તમારી પોતાની સંખ્યાઓ નાખો.</span></p>
<div class="card"><div class="row">
<div><label>Plan</label><select id="plan"></select></div>
<div><label>Stylists (Growth / Pro)</label><select id="band"><option value="1-3">1–3</option><option value="4-8">4–8</option><option value="9-15">9–15</option></select></div>
<div><label>Years to compare</label><select id="yrs"><option>1</option><option>2</option><option selected>3</option><option>5</option></select></div>
<div><label>Extra branches</label><input id="br" type="number" min="0" value="0"></div>
<div><label>Local SEO &amp; Google care (months per year)</label><input id="seo" type="number" min="0" max="12" value="0"></div></div>
<div id="addons" style="margin-top:10px"></div></div>
<div class="card dark"><div class="row">
<div><div class="k">One-time setup</div><div class="big" id="o_setup"></div></div>
<div><div class="k">Yearly platform fee</div><div class="big" id="o_year"></div><div class="k" id="o_month"></div></div>
<div><div class="k" id="o_tl"></div><div class="big" id="o_total"></div><div class="k" id="o_avg"></div></div></div>
<div class="k" id="o_status" style="margin-top:8px"></div></div>
<div class="card"><h3 style="margin-top:0">Compare with what you pay today</h3><div class="row">
<div><label>Current software, ₹ per month</label><input id="cur" type="number" min="0" value="2500"></div>
<div><label>WhatsApp / SMS extras, ₹ per month</label><input id="ext" type="number" min="0" value="2000"></div></div>
<p id="cmp" style="font-size:16px"></p>
<p class="note">If your current tool gives you billing, inventory or payroll that you need, count that too. We can work with it rather than replace it. A website and Google Maps work are not included in most apps.</p></div>
<div class="card"><h3 style="margin-top:0">Your own numbers: what a missed booking costs</h3><div class="row">
<div><label>Bookings per week</label><input id="bw" type="number" min="0" value="60"></div>
<div><label>Average ticket, ₹</label><input id="tk" type="number" min="0" value="900"></div>
<div><label>No-shows or last-minute drops, %</label><input id="ns" type="number" min="0" max="100" value="10"></div>
<div><label>Of these, how many could reminders recover? %</label><input id="rc" type="number" min="0" max="100" value="20"></div></div>
<p id="roi" style="font-size:16px"></p>
<p class="note">This only multiplies the numbers you typed. It is not a forecast or a promise.</p></div>
</div><script>
const P=__PRICING__;
const f=n=>"₹"+Math.round(n).toLocaleString("en-IN");
const $=id=>document.getElementById(id);
const planSel=$("plan");
for(const k of ["starter","growth","pro"])planSel.add(new Option(P.tiers[k].name+" · "+P.tiers[k].outcome,k));
P.addons.filter(a=>a.unit!=="per month").forEach((a,i)=>{$("addons").insertAdjacentHTML("beforeend",`<label class="chk"><input type="checkbox" data-k="${a.key}"> ${a.name} <span class="k">(+${f(a.price)} once)</span><span class="st">${a.status}</span></label>`)});
const ann=(t,b)=>typeof t.annual==="number"?t.annual:t.annual[b];
function calc(){
 const t=P.tiers[planSel.value],b=$("band").value,y=+$("yrs").value,br=+$("br").value||0,m=+$("seo").value||0;
 let setup=t.setup;document.querySelectorAll("#addons input:checked").forEach(c=>{setup+=P.addons.find(a=>a.key===c.dataset.k).price});
 const seoYear=m*P.seoPrice;
 const year=ann(t,b)+br*P.extraBranch,total=setup+(year+seoYear)*y;
 $("o_setup").textContent=f(setup);$("o_year").textContent=f(year+seoYear);$("o_month").textContent="about "+f((year+seoYear)/12)+" a month"+(seoYear?" (incl. Google care)":"");
 $("o_tl").textContent=y+"-year total";$("o_total").textContent=f(total);$("o_avg").textContent="about "+f(total/(12*y))+" a month on average";
 $("o_status").textContent="Status: "+t.status+(t.status!=="Ready now"?" — delivered through our founding-partner build programme with a written timeline.":"");
 const cur=((+$("cur").value||0)+(+$("ext").value||0))*12*y,d=cur-total;
 $("cmp").innerHTML=`Today's tools over ${y} years: <b>${f(cur)}</b>. This plan: <b>${f(total)}</b>. `+(d>0?`Difference: <b>${f(d)} less</b> with this plan.`:`This plan costs <b>${f(-d)} more</b> over this period. The extra buys a bilingual branded website, Google Maps work and one yearly plan; decide whether that is worth it for you.`);
 const miss=(+$("bw").value||0)*52*((+$("ns").value||0)/100),rec=miss*((+$("rc").value||0)/100),val=rec*(+$("tk").value||0);
 $("roi").innerHTML=`Missed bookings a year: <b>${Math.round(miss)}</b>. If reminders recovered ${$("rc").value||0}% of them: <b>${Math.round(rec)}</b> bookings, about <b>${f(val)}</b> a year at your ticket size.`;
}
document.querySelectorAll("input,select").forEach(e=>e.addEventListener("input",calc));calc();
</script></body></html>"""

HDR = PatternFill("solid", fgColor="0C0B0A"); HF = Font(bold=True, color="FFFFFF"); INP = PatternFill("solid", fgColor="F1E6D2")
INR_FMT = '"₹"#,##0'


def html():
    slim = {"tiers": {k: T[k] for k in ("starter", "growth", "pro")}, "addons": P["addons"], "extraBranch": P["extra_branch_annual"], "seoPrice": ADD["local_seo"]["price"]}
    (OUT / "DWD_Salon_Price_Calculator.html").write_text(HTML.replace("__PRICING__", json.dumps(slim, ensure_ascii=False)), encoding="utf-8")


def hdr(ws, row, cols):
    for j, h in enumerate(cols, 1):
        c = ws.cell(row, j, h); c.fill = HDR; c.font = HF; c.alignment = Alignment(wrap_text=True, vertical="top")


def xlsx():
    wb = Workbook()
    ws = wb.active; ws.title = "Price calculator"
    ws["A1"] = "Salon plan & savings calculator (cream cells are inputs; prices are proposals, excl. GST)"; ws["A1"].font = Font(bold=True, size=13)
    rows = [("Plan (Starter / Growth / Pro)", "Growth"), ("Stylist band (1-3 / 4-8 / 9-15)", "1-3"), ("Years to compare", 3), ("Extra branches", 0), ("Add-ons total (one-time)", 0),
            ("Local SEO months per year", 0), ("Current software, per month", 2500), ("WhatsApp / SMS extras, per month", 2000)]
    for i, (k, v) in enumerate(rows, start=3):
        ws.cell(i, 1, k); c = ws.cell(i, 2, v); c.fill = INP
    dv = DataValidation(type="list", formula1='"Starter,Growth,Pro"'); ws.add_data_validation(dv); dv.add("B3")
    dv2 = DataValidation(type="list", formula1='"1-3,4-8,9-15"'); ws.add_data_validation(dv2); dv2.add("B4")
    # price table
    ws["D2"] = "Price table"; ws["D2"].font = Font(bold=True)
    hdr_row = ["Plan", "Setup", "1-3", "4-8", "9-15"]
    for j, h in enumerate(hdr_row):
        c = ws.cell(3, 4 + j, h); c.fill = HDR; c.font = HF
    for r, k in enumerate(["starter", "growth", "pro"], start=4):
        t = T[k]; ws.cell(r, 4, t["name"]); ws.cell(r, 5, t["setup"])
        for j, b in enumerate(BANDS): ws.cell(r, 6 + j, annual(k, b))
    ws["D8"] = "Extra branch / year"; ws["E8"] = P["extra_branch_annual"]
    ws["D9"] = "Local SEO care / month"; ws["E9"] = ADD["local_seo"]["price"]
    out = [("One-time setup", "=INDEX(E4:E6,MATCH(B3,D4:D6,0))+B7"),
           ("Yearly platform fee (incl. branches, SEO care)", "=INDEX(F4:H6,MATCH(B3,D4:D6,0),MATCH(B4,F3:H3,0))+B6*E8+B8*E9"),
           ("Yearly fee per month (equivalent)", "=B13/12"),
           ("Total over chosen years (DWD)", "=B12+B13*B5"),
           ("Current tools over chosen years", "=(B9+B10)*12*B5"),
           ("Difference (positive = DWD cheaper)", "=B16-B15")]
    for i, (k, f) in enumerate(out, start=12):
        ws.cell(i, 1, k).font = Font(bold=True); c = ws.cell(i, 2, f); c.number_format = INR_FMT
    for r in (7, 9, 10): ws.cell(r, 2).number_format = INR_FMT
    ws["A19"] = "Competitor figures are indicative, from published India comparisons (Oct 2026). Not a forecast. Excludes GST and third-party charges."
    ws.column_dimensions["A"].width = 46; ws.column_dimensions["B"].width = 18; ws.column_dimensions["D"].width = 24
    for c in "EFGH": ws.column_dimensions[c].width = 12

    w2 = wb.create_sheet("Price ladder")
    hdr(w2, 1, ["Plan", "Stylists", "Setup", "Yearly", "Per month", "Year 1", "3-year total", "Status"])
    r = 2
    for k in ("starter", "growth", "pro"):
        for b in (["1-3"] if k == "starter" else BANDS):
            t = T[k]; w2.append([t["name"], b, t["setup"], annual(k, b), f"=D{r}/12", f"=C{r}+D{r}", f"=C{r}+3*D{r}", t["status"]]); r += 1
    w2.append(["Custom", "any", f"From {T['custom']['setup_from']}", f"From {T['custom']['annual_from']}", "", "", "quoted", T["custom"]["status"]])
    for row in w2.iter_rows(min_row=2, max_row=r - 1, min_col=3, max_col=7):
        for c in row: c.number_format = INR_FMT
    for c, w in zip("ABCDEFGH", (14, 10, 14, 14, 12, 14, 16, 26)): w2.column_dimensions[c].width = w

    w3 = wb.create_sheet("Add-ons")
    hdr(w3, 1, ["Add-on", "Price", "Unit", "Status", "Notes"])
    for a in P["addons"]: w3.append([a["name"], a["price"], a["unit"], a["status"], a["note"]])
    w3.append(["Extra branch", P["extra_branch_annual"], "per year", "Ready now", ""])
    for row in w3.iter_rows(min_row=2, min_col=2, max_col=2):
        for c in row: c.number_format = INR_FMT
    for c, w in zip("ABCDE", (52, 12, 12, 24, 70)): w3.column_dimensions[c].width = w

    w4 = wb.create_sheet("Competitors (indicative)")
    hdr(w4, 1, ["Name", "Target", "Model", "Entry", "Mid", "Premium", "Key features", "Evidence", "Source"])
    lab = {"F": "Verified: official page", "C": "Competitor claim / third-party report", "O": "Research observation"}
    for n, tgt, model, entry, mid, prem, feat, src, l in COMP: w4.append([n, tgt, model, entry, mid, prem, feat, lab[l], src])
    for c, w in zip("ABCDEFGHI", (28, 30, 30, 26, 30, 30, 60, 30, 50)): w4.column_dimensions[c].width = w

    # formula-driven revenue model
    w5 = wb.create_sheet("Revenue model")
    A = P["assumptions"]
    w5["A1"] = "Revenue illustration (cream cells are assumptions; edit them). Revenue is not profit."; w5["A1"].font = Font(bold=True, size=13)
    ass = [("Mix: Starter", A["mix"]["starter"]), ("Mix: Growth", A["mix"]["growth"]), ("Mix: Pro", A["mix"]["pro"]), ("Local SEO take-up", A["local_seo_take_rate"]), ("Local SEO months in year 1", A["local_seo_months_year1"]),
           ("Hourly cost (value of your time)", A["hourly_cost"]), ("Delivery hours: Starter", A["delivery_hours"]["starter"]), ("Delivery hours: Growth", A["delivery_hours"]["growth"]), ("Delivery hours: Pro", A["delivery_hours"]["pro"]),
           ("Support hours/yr: Starter", A["support_hours_per_year"]["starter"]), ("Support hours/yr: Growth", A["support_hours_per_year"]["growth"]), ("Support hours/yr: Pro", A["support_hours_per_year"]["pro"]),
           ("Infra cost/yr: Starter", A["infra_cost_per_year"]["starter"]), ("Infra cost/yr: Growth", A["infra_cost_per_year"]["growth"]), ("Infra cost/yr: Pro", A["infra_cost_per_year"]["pro"]),
           ("SEO hours per month", A["seo_hours_per_month"]), ("Sales hours per customer", A["acquisition_hours_per_customer"]),
           ("Starter setup", T["starter"]["setup"]), ("Growth setup", T["growth"]["setup"]), ("Pro setup", T["pro"]["setup"]),
           ("Starter yearly", annual("starter")), ("Growth yearly (1-3)", annual("growth")), ("Pro yearly (1-3)", annual("pro")), ("Local SEO per month", ADD["local_seo"]["price"])]
    for i, (k, v) in enumerate(ass, start=3):
        w5.cell(i, 1, k); c = w5.cell(i, 2, v); c.fill = INP
    ref = {k: f"$B${i}" for i, (k, _) in enumerate(ass, start=3)}
    R = lambda k: ref[k]
    r0 = 3; w5.cell(r0 - 1, 4, "Customers").font = Font(bold=True)
    hdr(w5, 3, [""] * 3 + ["Metric", "10", "25", "50", "100"])
    metrics = [("Starter count", lambda c: f"=ROUND({c}$4*{R('Mix: Starter')},0)"), ("Growth count", lambda c: f"=ROUND({c}$4*{R('Mix: Growth')},0)"), ("Pro count", lambda c: f"=ROUND({c}$4*{R('Mix: Pro')},0)")]
    w5.cell(4, 4, "Customers (number)")
    for j, n in enumerate((10, 25, 50, 100)): w5.cell(4, 5 + j, n).fill = INP
    labels = ["Growth customers", "Pro customers", "Starter customers", "Setup revenue", "Platform fees (yr 1)", "Local SEO revenue (yr 1)", "Year-1 revenue", "Year-1 cost", "Year-1 profit (before platform build, tax, GST)", "Hours implied (yr 1)", "FTE implied (1,800 h)", "Year-2 recurring revenue", "Year-2 recurring cost", "Year-2 recurring profit"]
    for i, l in enumerate(labels, start=5): w5.cell(i, 4, l)
    for j in range(4):
        c = "EFGH"[j]
        f = {5: f"=ROUND({c}4*{R('Mix: Growth')},0)", 6: f"=ROUND({c}4*{R('Mix: Pro')},0)", 7: f"={c}4-{c}5-{c}6",
             8: f"={c}7*{R('Starter setup')}+{c}5*{R('Growth setup')}+{c}6*{R('Pro setup')}",
             9: f"={c}7*{R('Starter yearly')}+{c}5*{R('Growth yearly (1-3)')}+{c}6*{R('Pro yearly (1-3)')}",
             10: f"=ROUND({c}4*{R('Local SEO take-up')},0)*{R('Local SEO per month')}*{R('Local SEO months in year 1')}",
             11: f"={c}8+{c}9+{c}10",
             12: f"=({c}7*{R('Delivery hours: Starter')}+{c}5*{R('Delivery hours: Growth')}+{c}6*{R('Delivery hours: Pro')}+{c}7*{R('Support hours/yr: Starter')}+{c}5*{R('Support hours/yr: Growth')}+{c}6*{R('Support hours/yr: Pro')}+ROUND({c}4*{R('Local SEO take-up')},0)*{R('SEO hours per month')}*{R('Local SEO months in year 1')}+{c}4*{R('Sales hours per customer')})*{R('Hourly cost (value of your time)')}+{c}7*{R('Infra cost/yr: Starter')}+{c}5*{R('Infra cost/yr: Growth')}+{c}6*{R('Infra cost/yr: Pro')}",
             13: f"={c}11-{c}12",
             14: f"=({c}12-({c}7*{R('Infra cost/yr: Starter')}+{c}5*{R('Infra cost/yr: Growth')}+{c}6*{R('Infra cost/yr: Pro')}))/{R('Hourly cost (value of your time)')}",
             15: f"={c}14/1800",
             16: f"={c}9+ROUND({c}4*{R('Local SEO take-up')},0)*{R('Local SEO per month')}*12",
             17: f"=({c}7*{R('Support hours/yr: Starter')}+{c}5*{R('Support hours/yr: Growth')}+{c}6*{R('Support hours/yr: Pro')}+ROUND({c}4*{R('Local SEO take-up')},0)*{R('SEO hours per month')}*12)*{R('Hourly cost (value of your time)')}+{c}7*{R('Infra cost/yr: Starter')}+{c}5*{R('Infra cost/yr: Growth')}+{c}6*{R('Infra cost/yr: Pro')}",
             18: f"={c}16-{c}17"}
        for row, fx in f.items():
            cell = w5.cell(row, 5 + j, fx)
            if row in (8, 9, 10, 11, 12, 13, 16, 17, 18): cell.number_format = INR_FMT
            if row in (14, 15): cell.number_format = "0.0"
    w5["D20"] = "One-time platform build is excluded (about 200 h). WhatsApp provider and gateway charges are pass-through. Capacity: at 100 customers the hours imply more than one person full time."
    w5.column_dimensions["A"].width = 34; w5.column_dimensions["D"].width = 46
    for c in "BEFGH": w5.column_dimensions[c].width = 16
    wb.save(OUT / "DWD_Salon_Price_Calculator.xlsx")

    lt = Workbook(); s = lt.active; s.title = "Leads"
    cols = ["Salon", "Owner", "Area", "Phone/WhatsApp", "Instagram", "Google rating", "Reviews", "Google profile complete? (Y/N)", "Website? (Y/N)", "Booking path today", "Stylists", "Language (GU/EN/Both)", "Signals (see score)", "Score", "Stage", "First contact", "Last touch", "Next step", "Next date", "Plan", "Yearly value ₹", "Notes"]
    hdr(s, 1, cols)
    stages = '"New,Audited,Contacted,Replied,Demo sent,Meeting,Proposal,Won,Lost,Nurture"'
    d = DataValidation(type="list", formula1=stages); s.add_data_validation(d); d.add("O2:O500")
    d2 = DataValidation(type="list", formula1='"Starter,Growth,Pro,Custom,Maps setup"'); s.add_data_validation(d2); d2.add("T2:T500")
    d3 = DataValidation(type="list", formula1='"GU,EN,Both"'); s.add_data_validation(d3); d3.add("L2:L500")
    for i, w in enumerate([24, 16, 14, 16, 18, 10, 9, 14, 12, 22, 9, 12, 28, 7, 12, 12, 12, 24, 12, 13, 14, 40], start=1):
        s.column_dimensions[s.cell(1, i).column_letter].width = w
    s.freeze_panes = "B2"
    g = lt.create_sheet("Funnel")
    hdr(g, 1, ["Stage", "Count"])
    for i, st in enumerate(["New", "Audited", "Contacted", "Replied", "Demo sent", "Meeting", "Proposal", "Won", "Lost", "Nurture"], start=2):
        g.append([st, f'=COUNTIF(Leads!O2:O500,A{i})'])
    g.append(["Yearly value won (₹)", '=SUMIF(Leads!O2:O500,"Won",Leads!U2:U500)'])
    g.append(["Reply rate", '=IFERROR((B5+B6+B7+B8+B9)/(B4+B5+B6+B7+B8+B9),0)'])
    g.column_dimensions["A"].width = 26
    lt.save(OUT / "DWD_Salon_Lead_Tracker.xlsx")


def build():
    OUT.mkdir(exist_ok=True); html(); xlsx()


if __name__ == "__main__":
    build()

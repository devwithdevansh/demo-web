"""Illustrative UI screens (fictional salon 'Maison Aura') in the Noir Atelier palette, using the demo site's photos.
Renders PNGs to assets/screens/ via headless Edge."""
import subprocess
from lib import *

SD = ROOT / "assets" / "screens"
BASE = """
*{box-sizing:border-box;margin:0;padding:0}body{width:1280px;height:800px;overflow:hidden;font-family:Calibri,Arial,sans-serif;background:#0C0B0A;color:#F4EFE6;position:relative}
.serif{font-family:Cambria,Georgia,serif}.gold{color:#C9AB78}.btn{background:#C9AB78;color:#0C0B0A;font-weight:700;padding:12px 22px;letter-spacing:.08em;font-size:13px;text-transform:uppercase;display:inline-block}
.nav{position:absolute;top:0;left:0;right:0;height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 48px;z-index:3;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#d9d0c1}
.logo{font-family:Cambria,serif;font-style:italic;font-size:26px;color:#F4EFE6;text-transform:none;letter-spacing:0}
.tagc{position:absolute;right:18px;bottom:12px;font-size:11px;font-style:italic;color:#8d826f;z-index:5}
"""


def shot(name, html):
    h = SD / f"{name}.html"; h.write_text(f"<!doctype html><meta charset=utf-8><style>{BASE}</style>{html}<div class='tagc'>Illustrative concept</div>", encoding="utf-8")
    subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1280,800", "--virtual-time-budget=3000",
                    f"--screenshot={SD / (name + '.png')}", h.as_uri()], check=True, capture_output=True, timeout=60)
    h.unlink()


def home():
    shot("ui_home", f'''
<img src="{PH('portrait')}" style="position:absolute;right:0;top:0;width:55%;height:100%;object-fit:cover;object-position:50% 25%">
<div style="position:absolute;right:0;top:0;width:55%;height:100%;background:linear-gradient(90deg,#0C0B0A 0%,rgba(12,11,10,0) 45%)"></div>
<div class="nav"><span class="logo">Maison Aura</span><span>Services &nbsp;&nbsp; Stylists &nbsp;&nbsp; Gallery &nbsp;&nbsp; Contact</span><span class="btn" style="padding:10px 18px;font-size:11px">Book appointment</span></div>
<div style="position:absolute;left:48px;top:230px;width:560px"><div class="gold" style="font-size:12px;letter-spacing:.3em;text-transform:uppercase;margin-bottom:22px">Hair studio</div>
<div class="serif" style="font-size:78px;line-height:1;font-weight:400">Hair,<br><i class="gold">considered.</i></div>
<p style="margin:26px 0 30px;color:#cfc6b8;font-size:18px;max-width:430px">Cuts, colour and care, tailored to you.</p><span class="btn">Book your visit</span></div>
<div style="position:absolute;left:48px;bottom:42px;display:flex;gap:40px;font-size:13px;color:#cfc6b8"><div><b class="gold serif" style="font-size:20px">Cut &amp; Style</b><br>Consultation, cut, finish</div><div><b class="gold serif" style="font-size:20px">Colour</b><br>Tone, highlights, refresh</div><div><b class="gold serif" style="font-size:20px">Treatments</b><br>Care for hair and scalp</div></div>''')


def booking():
    st = [("Anaya", "Colour specialist", "stylist_pair", "30% 18%", False), ("Rohan", "Cuts and styling", "barber_elder", "50% 20%", True), ("Meera", "Styling and treatments", "stylist_mirror_smile", "45% 25%", False)]
    cards = "".join(f'''<div style="display:flex;gap:18px;align-items:center;padding:14px;border:1px solid {'#C9AB78' if sel else '#2a2622'};background:{'#1c1813' if sel else '#141210'}"><img src="{PH(img)}" style="width:62px;height:62px;border-radius:50%;object-fit:cover;object-position:{pos}"><div><div class="serif" style="font-size:22px">{n}</div><div style="color:#a99f90;font-size:14px">{r}</div></div>{'<div class="gold" style="margin-left:auto;font-size:13px;letter-spacing:.1em">SELECTED</div>' if sel else ''}</div>''' for n, r, img, pos, sel in st)
    slots = "".join(f'<span style="padding:10px 18px;border:1px solid {"#C9AB78" if s == "11:30" else "#2a2622"};background:{"#C9AB78" if s == "11:30" else "transparent"};color:{"#0C0B0A" if s == "11:30" else "#d9d0c1"};font-size:15px">{s}</span>' for s in ["10:00", "11:30", "13:00", "14:30", "16:00"])
    shot("ui_booking", f'''<div class="nav"><span class="logo">Maison Aura</span><span>Services &nbsp;&nbsp; Stylists &nbsp;&nbsp; Gallery &nbsp;&nbsp; Contact</span><span class="btn" style="padding:10px 18px;font-size:11px">Book appointment</span></div>
<div style="position:absolute;left:48px;top:110px;width:700px"><div class="serif" style="font-size:44px">Book your visit</div>
<div style="color:#a99f90;font-size:14px;margin:8px 0 22px;letter-spacing:.06em">1 Service ✓ &nbsp;·&nbsp; <span class="gold">2 Stylist</span> &nbsp;·&nbsp; 3 Time &nbsp;·&nbsp; 4 Confirm</div>
<div style="display:grid;gap:12px">{cards}</div><div style="display:flex;gap:10px;margin-top:22px">{slots}</div></div>
<div style="position:absolute;right:48px;top:110px;width:410px;border:1px solid #2a2622;background:#141210;padding:30px">
<div class="gold" style="font-size:12px;letter-spacing:.25em;text-transform:uppercase;margin-bottom:16px">Your booking</div>
<div style="line-height:2.2;font-size:17px"><span style="color:#a99f90">Service</span> &nbsp; Cut &amp; Style<br><span style="color:#a99f90">Stylist</span> &nbsp; Rohan<br><span style="color:#a99f90">Time</span> &nbsp; Sat, 11:30</div>
<div class="btn" style="width:100%;text-align:center;margin-top:26px">Confirm booking</div>
<div style="margin-top:22px;padding:14px;background:#10281a;border-radius:10px;font-size:13px;color:#cfe8d3"><b>Sample reminder</b><br>Hi Aanya, a reminder of your appointment with Rohan tomorrow at 11:30. Reply to reschedule.</div></div>''')


def dash():
    cols = [("Anaya", [(40, 90, "9:30 · Colour", "#C9AB78"), (250, 70, "13:00 · Toner", "#7a6a4a")]), ("Rohan", [(10, 60, "9:00 · Cut", "#7a6a4a"), (150, 90, "11:00 · Cut & Style", "#C9AB78"), (330, 60, "15:00 · Cut", "#7a6a4a")]), ("Meera", [(100, 80, "10:00 · Treatment", "#7a6a4a"), (260, 100, "14:00 · Styling", "#C9AB78")])]
    cs = "".join(f'''<div style="flex:1;position:relative;border-left:1px solid #2a2622;height:430px"><div class="serif" style="font-size:18px;margin:0 0 12px 12px;position:absolute;top:-34px">{n}</div>{"".join(f'<div style="position:absolute;left:10px;right:10px;top:{t}px;height:{h}px;background:{c};color:#0C0B0A;padding:8px 10px;font-size:14px;font-weight:700">{lbl}</div>' for t, h, lbl, c in bl)}</div>''' for n, bl in cols)
    side = "".join(f'<div style="padding:12px 24px;color:{"#C9AB78" if i == 0 else "#a99f90"};font-size:15px">{t}</div>' for i, t in enumerate(["Calendar", "Clients", "Team", "Reports", "Settings"]))
    shot("ui_dash", f'''<div style="position:absolute;left:0;top:0;bottom:0;width:230px;background:#141210;border-right:1px solid #2a2622;padding-top:26px"><div class="logo serif" style="font-style:italic;font-size:24px;padding:0 24px 30px">Maison Aura</div>{side}</div>
<div style="position:absolute;left:270px;top:40px;right:48px"><div style="display:flex;justify-content:space-between;align-items:end"><div class="serif" style="font-size:44px">Today</div><div style="color:#a99f90;font-size:14px">Saturday · 3 stylists · 9 appointments</div></div>
<div style="display:flex;margin-top:70px">{cs}</div></div>''')


def google():
    roads = "".join(f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:#1d1a16;transform:rotate({r}deg)"></div>' for x, y, w, h, r in [(40, 150, 620, 14, -8), (-20, 380, 760, 18, 6), (120, 560, 640, 12, -4), (230, -20, 14, 900, 4), (470, -20, 18, 900, -3), (60, 40, 600, 10, 12)])
    pins = "".join(f'<div style="position:absolute;left:{x}px;top:{y}px;width:18px;height:18px;border-radius:50%;background:#4a433a;border:2px solid #6a5f50"></div>' for x, y in [(120, 210), (330, 460), (540, 300), (200, 620), (580, 600), (90, 440)])
    btn = lambda t: f'<div style="flex:1;text-align:center;padding:12px 0;border:1px solid #cdbfae;border-radius:10px;font-size:14px;color:#0C0B0A;background:#fff">{t}</div>'
    svc = "".join(f'<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #e8dfd0;font-size:15px"><span>{a}</span><b>{b}</b></div>' for a, b in [("Haircut and styling", "from ₹300"), ("Hair colour", "from ₹1,200"), ("Facial and cleanup", "from ₹600"), ("Bridal booking", "on request")])
    shot("ui_google", f'''<div style="position:absolute;left:0;top:0;bottom:0;width:640px;background:#141210;overflow:hidden">{roads}{pins}
<div style="position:absolute;left:300px;top:250px;width:46px;height:46px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#C9AB78;border:3px solid #0C0B0A"></div>
<div style="position:absolute;left:236px;top:310px;background:#0C0B0A;border:1px solid #C9AB78;color:#F4EFE6;padding:6px 12px;font-size:15px;white-space:nowrap">Maison Aura Hair Studio</div>
<div style="position:absolute;left:24px;top:24px;right:24px;background:#F4EFE6;color:#0C0B0A;border-radius:28px;padding:13px 22px;font-size:17px">salon near me</div></div>
<div style="position:absolute;left:640px;top:0;right:0;bottom:0;background:#F4EFE6;color:#4A433A;padding:34px 40px">
<div class="serif" style="font-size:34px;color:#0C0B0A">Maison Aura Hair Studio</div>
<div style="margin:8px 0 4px;font-size:16px"><b style="color:#0C0B0A">4.8</b> <span style="color:#A9895A">★★★★★</span> (128 sample reviews)</div>
<div style="font-size:15px;margin-bottom:18px">Hair salon · <span style="color:#2f4a1f;font-weight:700">Open</span> · Closes 8 pm · Near the main road</div>
<div style="display:flex;gap:10px;margin-bottom:22px">{btn('Call')}{btn('Directions')}{btn('Website')}{btn('WhatsApp')}</div>
<div class="serif" style="font-size:20px;color:#0C0B0A;margin-bottom:6px">Services and prices</div>{svc}
<div style="margin-top:20px;font-size:14px;line-height:1.7"><b style="color:#0C0B0A">Address</b> · Sample address, Gujarat<br><b style="color:#0C0B0A">Booking</b> · Book on WhatsApp or on the website<br><b style="color:#0C0B0A">Languages</b> · ગુજરાતી · English</div></div>''')


def expense():
    cats = [("Salaries", 48000, "#C9AB78"), ("Rent", 30000, "#A9895A"), ("Products", 18500, "#7a6a4a"), ("Utilities", 6250, "#5a5249"), ("Other", 6000, "#4a433a"), ("Marketing", 4000, "#3a352f")]
    mx = 48000
    bars = "".join(f'<div style="display:flex;align-items:center;gap:14px;margin:11px 0;font-size:15px"><div style="width:96px;color:#cfc6b8">{n}</div><div style="flex:1;background:#1c1813;height:20px"><div style="width:{v / mx * 100:.0f}%;height:20px;background:{c}"></div></div><div style="width:90px;text-align:right">₹{v:,}</div></div>' for n, v, c in cats)
    rows = "".join(f'<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2622;font-size:14px"><span style="color:#a99f90;width:60px">{d}</span><span style="flex:1">{a}</span><span style="color:#cfc6b8;width:110px">{b}</span><b>₹{c:,}</b></div>' for d, a, b, c in [("Oct 28", "Product purchase", "Supplier A", 4200), ("Oct 27", "Salary advance", "Stylist", 3000), ("Oct 25", "Electricity", "Utility", 2150), ("Oct 24", "Rent", "Landlord", 30000)])
    tile = lambda lab, val, col: f'<div style="flex:1;border:1px solid #2a2622;background:#141210;padding:18px 20px"><div style="color:#a99f90;font-size:13px;letter-spacing:.1em;text-transform:uppercase">{lab}</div><div class="serif" style="font-size:34px;margin-top:6px;color:{col}">{val}</div></div>'
    side = "".join(f'<div style="padding:12px 24px;color:{"#C9AB78" if t == "Expenses" else "#a99f90"};font-size:15px">{t}</div>' for t in ["Calendar", "Clients", "Expenses", "Team", "Reports", "Settings"])
    shot("ui_expense", f'''<div style="position:absolute;left:0;top:0;bottom:0;width:230px;background:#141210;border-right:1px solid #2a2622;padding-top:26px"><div class="logo serif" style="font-style:italic;font-size:24px;padding:0 24px 30px">Maison Aura</div>{side}</div>
<div style="position:absolute;left:270px;top:36px;right:48px"><div style="display:flex;justify-content:space-between;align-items:end"><div class="serif" style="font-size:42px">October, at a glance</div><span class="btn" style="padding:10px 18px;font-size:12px">+ Add expense</span></div>
<div style="display:flex;gap:14px;margin:22px 0">{tile('Income (sample)', '₹1,86,400', '#F4EFE6')}{tile('Expenses', '₹1,12,750', '#F4EFE6')}{tile('Profit snapshot', '₹73,650', '#C9AB78')}</div>
<div style="display:flex;gap:30px"><div style="flex:1.2"><div style="color:#a99f90;font-size:13px;letter-spacing:.1em;text-transform:uppercase">Where the money went</div>{bars}</div>
<div style="flex:1"><div style="color:#a99f90;font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px">Recent entries</div>{rows}</div></div></div>''')


def build():
    SD.mkdir(parents=True, exist_ok=True); home(); booking(); dash(); google(); expense()


if __name__ == "__main__":
    build()

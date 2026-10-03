import sys, fitz
from PIL import Image
from lib import OUT
name, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 4
dpi = int(sys.argv[5]) if len(sys.argv) > 5 else 40
d = fitz.open(OUT / f"{name}.pdf")
ims = []
for i in range(a - 1, min(b, d.page_count)):
    pm = d[i].get_pixmap(dpi=dpi); ims.append(Image.frombytes("RGB", (pm.width, pm.height), pm.samples))
w = max(i.width for i in ims); h = max(i.height for i in ims); rows = (len(ims) + cols - 1) // cols
s = Image.new("RGB", (w * cols, h * rows), "white")
for k, im in enumerate(ims): s.paste(im, ((k % cols) * w, (k // cols) * h))
s.save(OUT / f"_sh_{name}_{a}_{b}.png"); print(s.size, d.page_count)

import sys, fitz
from lib import OUT
name = sys.argv[1]
d = fitz.open(OUT / f"{name}.pdf")
print(name, "pages:", len(d))
for i, p in enumerate(d):
    p.get_pixmap(dpi=55).save(OUT / f"_{name}_{i+1}.png")

"""Contact-sheet helper: python sheet.py NAME  ->  out/_sheet_NAME.png (3 columns)."""
import sys, glob
from PIL import Image
from lib import OUT
name = sys.argv[1]
fs = sorted(glob.glob(str(OUT / f"_{name}_*.png")), key=lambda f: int(f.rsplit("_", 1)[1].split(".")[0]))
ims = [Image.open(f) for f in fs]
w, h = ims[0].size
cols = 3
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (w * cols, h * rows), "white")
for i, im in enumerate(ims):
    sheet.paste(im, ((i % cols) * w, (i // cols) * h))
sheet.save(OUT / f"_sheet_{name}.png")

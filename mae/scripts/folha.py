import sys, glob
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(d + '/q_*.jpg')); W, H = Image.open(fs[0]).size; cols = 10
rows = (len(fs) + cols - 1) // cols; sh = Image.new('RGB', (cols * W, rows * H), 'black'); g = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    sh.paste(Image.open(f), ((i % cols) * W, (i // cols) * H)); g.text(((i % cols) * W + 4, (i // cols) * H + 4), str(i - 1), fill='yellow')
sh.save(out, quality=85)

import os, io, urllib.request
from collections import defaultdict
from PIL import Image, ImageDraw, ImageFont
B = "https://vvlzverpxojrecxysmhm.supabase.co/storage/v1/object/public/videos/"
F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
os.makedirs("out", exist_ok=True)
grupos = defaultdict(list)
for l in open("capasatuais/lista.txt"):
    l = l.strip()
    if l: grupos[l.split("/")[0]].append(l)
for canal, itens in grupos.items():
    itens.sort()
    W, H = 640, 360
    cols = 3; rows = (len(itens) + 2) // 3
    G = Image.new("RGB", (W * cols, (H + 28) * rows), (20, 20, 20)); d = ImageDraw.Draw(G)
    for i, p in enumerate(itens):
        x, y = (i % cols) * W, (i // cols) * (H + 28)
        try:
            im = Image.open(io.BytesIO(urllib.request.urlopen(B + p, timeout=30).read())).convert("RGB").resize((W - 6, H - 6))
            G.paste(im, (x + 3, y + 3))
        except Exception as e:
            d.text((x + 10, y + 10), str(e)[:60], font=F, fill=(255, 80, 80))
        d.text((x + 6, y + H + 4), p.split("/")[-1], font=F, fill=(255, 220, 60))
    G.save(f"out/atual-{canal}.jpg", quality=80)

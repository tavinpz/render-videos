import json, subprocess, sys, os, urllib.request, io
from PIL import Image, ImageDraw, ImageFont
os.makedirs("out", exist_ok=True)
F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)
F2 = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
resumo = []
for linha in open("refcapas/lista.txt"):
    h = linha.strip()
    if not h or h.startswith("#"): continue
    url = f"https://www.youtube.com/{h}/videos"
    try:
        r = subprocess.run(["yt-dlp", "--flat-playlist", "-J", "--playlist-end", "120", url], capture_output=True, text=True, timeout=240)
        d = json.loads(r.stdout or "null")
        if not d: raise Exception(r.stderr[-400:])
    except Exception as e:
        resumo.append({"handle": h, "erro": str(e)[:200]}); continue
    ents = [e for e in d.get("entries", []) if e and e.get("view_count")]
    ents.sort(key=lambda e: -e["view_count"])
    top = ents[:12]
    W, TH = 480, 270
    G = Image.new("RGB", (W * 4, (TH + 46) * 3 + 40), (15, 15, 15)); dr = ImageDraw.Draw(G)
    subs = d.get("channel_follower_count")
    dr.text((10, 10), f"{d.get('channel') or h}  {h}  inscritos={subs}  (top 12 por views dos {len(ents)} últimos longos)", font=F, fill=(255, 220, 60))
    for i, e in enumerate(top):
        x, y = (i % 4) * W, 40 + (i // 4) * (TH + 46)
        try:
            raw = urllib.request.urlopen(f"https://i.ytimg.com/vi/{e['id']}/hqdefault.jpg", timeout=20).read()
            im = Image.open(io.BytesIO(raw)).convert("RGB")
            w0, h0 = im.size; c = im.crop((0, (h0 - w0 * 9 // 16) // 2, w0, (h0 - w0 * 9 // 16) // 2 + w0 * 9 // 16)).resize((W - 6, TH - 6))
            G.paste(c, (x + 3, y + 3))
        except Exception: pass
        dr.text((x + 4, y + TH + 2), (e.get("title") or "")[:52], font=F2, fill=(240, 240, 240))
        dr.text((x + 4, y + TH + 22), f"{e['view_count']:,} views".replace(",", "."), font=F2, fill=(160, 200, 255))
    nome = h.strip("@").replace("/", "_")
    G.save(f"out/{nome}.jpg", quality=82)
    resumo.append({"handle": h, "canal": d.get("channel"), "inscritos": subs, "n": len(ents),
                   "top": [{"t": e.get("title"), "v": e["view_count"], "id": e["id"]} for e in top]})
json.dump(resumo, open("out/resumo.json", "w"), ensure_ascii=False, indent=1)

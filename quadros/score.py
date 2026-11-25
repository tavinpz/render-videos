# Acha os melhores quadros do rosto para capa: olhos abertos, boca fechada ou sorriso,
# cabeça reta, rosto nítido. Gera folha com os 24 melhores (com tempo) e os quadros em alta.
import sys, os, json, subprocess, csv, math
import numpy as np, cv2
import mediapipe as mp
from PIL import Image, ImageDraw, ImageFont

FM = mp.solutions.face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True, min_detection_confidence=.5)
def d(a, b): return math.dist(a, b)
def avaliar(rgb):
    h, w = rgb.shape[:2]
    r = FM.process(rgb)
    if not r.multi_face_landmarks: return None
    L = [(p.x * w, p.y * h) for p in r.multi_face_landmarks[0].landmark]
    fw = d(L[234], L[454])
    olho = lambda a, b, c, e: d(L[a], L[b]) / max(1, d(L[c], L[e]))
    ear = (olho(159, 145, 33, 133) + olho(386, 374, 362, 263)) / 2
    boca_ab = d(L[13], L[14]) / fw
    boca_lg = d(L[61], L[291]) / fw
    sorriso = ((L[61][1] + L[291][1]) / 2 < (L[13][1] + L[14][1]) / 2 - fw * .005)
    mid = ((L[33][0] + L[263][0]) / 2)
    yaw = abs(L[1][0] - mid) / fw
    roll = abs(math.degrees(math.atan2(L[263][1] - L[33][1], L[263][0] - L[33][0])))
    x0, x1 = int(max(0, L[234][0])), int(min(w, L[454][0])); y0, y1 = int(max(0, L[10][1])), int(min(h, L[152][1]))
    crop = cv2.cvtColor(rgb[y0:y1, x0:x1], cv2.COLOR_RGB2GRAY)
    nit = cv2.Laplacian(crop, cv2.CV_64F).var() if crop.size else 0
    s = 0
    s += 2.0 * min(1, max(0, (ear - .18) / .12))          # olho aberto
    s += 2.0 * (1 - min(1, boca_ab / .06))                # boca fechada
    if boca_ab > .03 and boca_lg > .42: s += 1.6          # sorriso aberto vale
    s += 1.5 * (1 - min(1, yaw / .12))                    # de frente
    s += 1.0 * (1 - min(1, roll / 12))                    # cabeça reta
    s += 1.5 * min(1, math.log1p(nit) / 6.5)              # nitidez
    s += 1.0 * min(1, fw / (w * .22))                     # rosto grande
    return dict(s=round(s, 3), ear=round(ear, 3), boca=round(boca_ab, 3), yaw=round(yaw, 3), nit=round(nit, 1))

def quadros(fontes, fps=2):
    """fontes: lista de (arquivo, t0). Gera (t, rgb 960px)"""
    for arq, t0 in fontes:
        p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", arq, "-vf", f"fps={fps},scale=960:-2", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
        pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation", "-of", "json", arq], capture_output=True, text=True)
        st = json.loads(pr.stdout)["streams"][0]; W, H = st["width"], st["height"]
        rot = 0
        for sd in st.get("side_data_list", []) or []: rot = abs(int(sd.get("rotation", 0)))
        if rot in (90, 270): W, H = H, W
        h = int(round(H * 960 / W / 2) * 2); n = 0
        while True:
            b = p.stdout.read(960 * h * 3)
            if len(b) < 960 * h * 3: break
            yield t0 + n / fps, np.frombuffer(b, np.uint8).reshape(h, 960, 3); n += 1

def rodar(nome, fontes, alta, saida):
    os.makedirs(saida, exist_ok=True)
    res = []
    for t, rgb in quadros(fontes):
        a = avaliar(rgb)
        if a: res.append((a["s"], t, a))
    res.sort(key=lambda x: -x[0])
    esc = []
    for s, t, a in res:
        if all(abs(t - e[1]) > 4 for e in esc): esc.append((s, t, a))
        if len(esc) >= 24: break
    esc.sort(key=lambda x: x[1])
    json.dump([{"t": round(t, 2), **a} for s, t, a in esc], open(f"{saida}/{nome}.json", "w"), indent=1)
    # quadros em alta + folha
    F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
    G = Image.new("RGB", (480 * 6, 300 * 4), (12, 12, 12)); dr = ImageDraw.Draw(G)
    for i, (s, t, a) in enumerate(esc):
        out = f"{saida}/{nome}_{i + 1:02d}_{t:.1f}.jpg"
        arq, tl = alta(t)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{tl:.2f}", "-i", arq, "-frames:v", "1", "-q:v", "2", "-vf", "scale=1920:-2", out])
        try:
            im = Image.open(out).convert("RGB"); im.thumbnail((480, 270))
            G.paste(im, ((i % 6) * 480, (i // 6) * 300))
        except Exception: pass
        dr.text(((i % 6) * 480 + 6, (i // 6) * 300 + 272), f"{i + 1:02d}  {t:.1f}s  nota {s:.1f}", font=F, fill=(255, 210, 60))
    G.save(f"{saida}/{nome}_folha.jpg", quality=86)

if __name__ == "__main__":
    nome, pasta, saida = sys.argv[1], sys.argv[2], sys.argv[3]
    rows = [r for r in csv.reader(open(f"{pasta}/segs.csv")) if r]
    fontes = [(f"{pasta}/{r[0]}", float(r[1])) for r in rows]
    def alta(t):
        for r in rows:
            if float(r[1]) <= t < float(r[2]): return f"{pasta}/{r[0]}", t - float(r[1])
        return f"{pasta}/{rows[-1][0]}", 0
    rodar(nome, fontes, alta, saida)

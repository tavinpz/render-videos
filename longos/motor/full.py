#!/usr/bin/env python3
"""Motor dos longos do @gusttacosta (16:9). Recriado em 21/11/2026 (doc 36).

uso: python3 full.py SPEC.json        -> renderiza pedaços que faltam (retoma pelos .ok)
     python3 full.py SPEC.json final  -> concat + loudnorm

Padrão 21/11: colorido com a grade dos Reels + nitidez, vinheta e grão finos;
legenda só nas partes importantes, no espaço vazio ao lado do rosto
(Inter Tight 800 CAIXA ALTA + Playfair Italic na ênfase, sombra suave, sem tarja);
sem SFX. Janelas na grade de quadros (k/30), pedaços de ~9 s, -frames:v exato.
"""
import json, os, subprocess, sys, time
from pathlib import Path

FPS = 30
W, H = 1920, 1080
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]  # editor-videos
ACAB = ROOT / ".claude/skills/gusttacosta-edit/assets/acabamento"
GRADE = ("format=rgba,colorchannelmixer=1.136839:-0.059166:-0.046273:-0.040000:"
         "-0.031978:1.060829:0.002548:-0.040000:0.005515:-0.116816:1.142701:-0.040000:"
         "0:0:0:1")  # fabrica.GRADE_CSS: brightness(0.955) contrast(1.08) saturate(1.12) hue-rotate(-2deg)
FONT_SANS = HERE / "fonts/inter800.ttf"
FONT_SERIF = HERE / "fonts/pfi.ttf"
PIECE = 9.0


def q(t):
    return round(t * FPS)


def run(a):
    r = subprocess.run(a, capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr[-3000:])


def _track(d, xy, t, f, sp, fill):
    x, y = xy
    for ch in t:
        d.text((x, y), ch, font=f, fill=fill, anchor="ls"); x += f.getlength(ch) + sp


def _tw(t, f, sp):
    return sum(f.getlength(c) for c in t) + sp * (len(t) - 1)


def _shadow(im, blur=16, op=0.42, dy=4):
    from PIL import Image, ImageFilter
    a = im.split()[3].point(lambda v: int(v * op))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); sh.putalpha(a)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    b = Image.new("RGBA", im.size, (0, 0, 0, 0)); b.alpha_composite(sh, (0, dy)); b.alpha_composite(im)
    return b


def caption_png(lines, out, x0=104, yc=520, maxw=560):
    """v2 (22/11): caixa alta pequena e espaçada (Inter Tight 800, 40 px, tracking 7%)
    + ênfase grande em Playfair Italic (108 px). Espaço entre linhas, sombra suave."""
    from PIL import Image, ImageDraw, ImageFont
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    rows = []
    for t, k in lines:
        if k == "s":
            sz = 40
            while True:
                f = ImageFont.truetype(str(FONT_SANS), sz); sp = sz * 0.07
                if _tw(t.upper(), f, sp) <= maxw or sz < 26:
                    break
                sz -= 2
            rows.append((t.upper(), f, sp, k, int(sz * 0.74)))
        else:
            sz = 108
            while True:
                f = ImageFont.truetype(str(FONT_SERIF), sz)
                if f.getlength(t) <= maxw or sz < 50:
                    break
                sz -= 4
            rows.append((t, f, 0, k, int(sz * 0.72)))
    gaps = []
    for r1, r2 in zip(rows, rows[1:]):
        if r1[3] == "s" and r2[3] == "i":
            gaps.append(30)
        elif r1[3] == "i" and r2[3] == "s":
            gaps.append(38)  # o itálico tem descendente (g, p)
        else:
            gaps.append(16 if r1[3] == "s" else 14)
    tot = sum(r[4] for r in rows) + sum(gaps); y = yc - tot // 2
    for i, (t, f, sp, k, h) in enumerate(rows):
        y += h
        if k == "s":
            _track(d, (x0, y), t, f, sp, (255, 255, 255, 240))
        else:
            d.text((x0 - 4, y), t, font=f, fill=(255, 255, 255, 255), anchor="ls")
        if i < len(gaps):
            y += gaps[i]
    _shadow(im).save(out)


def chapter_png(n, titulo, out, x0=104, y0=112):
    from PIL import Image, ImageDraw, ImageFont
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    fn = ImageFont.truetype(str(FONT_SERIF), 52); fs = ImageFont.truetype(str(FONT_SANS), 24)
    num = f"{n:02d}"
    d.text((x0, y0), num, font=fn, fill=(255, 255, 255, 255), anchor="ls")
    _track(d, (x0 + fn.getlength(num) + 20, y0 - 4), titulo.upper(), fs, 24 * 0.16, (255, 255, 255, 225))
    _shadow(im, blur=12, op=0.4, dy=3).save(out)


def overlays(spec):
    """Legendas + rótulos de capítulo, todos em tempo do BRUTO."""
    ov = [dict(id=f"cap_{c['id']}", ini=c["ini"], fim=c["fim"], sobe=14) for c in spec["legendas"]]
    for n, ch in enumerate(spec.get("capitulos", []), 1):
        a = spec["janelas"][ch["janela"] - 1][0] + 0.35
        ov.append(dict(id=f"chap_{n:02d}", ini=a, fim=a + ch.get("dur", 3.6), sobe=0))
    return ov


def make_pngs(spec, work):
    for c in spec["legendas"]:
        png = work / f"cap_{c['id']}.png"
        if not png.exists():
            caption_png(c["linhas"], png)
    for n, ch in enumerate(spec.get("capitulos", []), 1):
        png = work / f"chap_{n:02d}.png"
        if not png.exists():
            chapter_png(n, ch["titulo"], png)


def plan(spec):
    """Lista de pedaços: (idx, src_ini_frame, nframes, out_ini_frame)."""
    pieces, out_f = [], 0
    for wi, (a, b) in enumerate(spec["janelas"]):
        fa, fb = q(a), q(b)
        f = fa
        while f < fb:
            n = min(q(PIECE), fb - f)
            if fb - (f + n) < q(2):  # sem rabicho curto
                n = fb - f
            pieces.append(dict(i=len(pieces), win=wi, src=f, n=n, out=out_f))
            f += n
            out_f += n
    if spec.get("cartao"):
        pieces.append(dict(i=len(pieces), card=True, n=q(spec["cartao"]["dur"]), out=out_f))
    return pieces


def fonte(spec, t0, t1, work, tag):
    """Entrada do ffmpeg para o trecho [t0,t1] do bruto: o bruto inteiro (Mac) ou
    os blocos de ~12 s cortados sem recomprimir (GitHub). Devolve (args, offset)."""
    sd = spec.get("segdir")
    if not sd or not Path(sd, "segs.csv").exists():
        return ["-ss", f"{t0:.4f}", "-i", spec["bruto"]], 0
    rows = segs(spec)
    use = [r for r in rows if r[2] > t0 - 0.2 and r[1] < t1 + 0.2]
    lst = work / f"src_{tag}.txt"
    lst.write_text("".join(f"file '{Path(sd, r[0]).resolve()}'\n" for r in use))
    return ["-ss", f"{t0 - use[0][1]:.4f}", "-f", "concat", "-safe", "0", "-i", str(lst)], use[0][1]


def segs(spec):
    rows = []
    for ln in Path(spec["segdir"], "segs.csv").read_text().splitlines():
        n, a, b = ln.split(",")[:3]
        rows.append((n, float(a), float(b)))
    return rows


def render_card(spec, p, work):
    out, ok = work / f"p{p['i']:03d}.mp4", work / f"p{p['i']:03d}.ok"
    if ok.exists():
        return False
    png = work / "cap_cartao.png"
    if not png.exists():
        card_png(spec["cartao"]["linhas"], png)
    d = p["n"] / FPS
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=black:s={W}x{H}:r={FPS}:d={d}",
         "-loop", "1", "-i", str(png), "-filter_complex",
         "[1:v]format=rgba,fade=t=in:st=0.2:d=0.6:alpha=1[t];[0:v][t]overlay=0:0:shortest=1,format=yuv420p[vo]",
         "-map", "[vo]", "-frames:v", str(p["n"]), "-c:v", "libx264", "-preset", "veryfast",
         "-crf", str(spec.get("crf", 18)), "-r", str(FPS), str(out)])
    ok.write_text("ok")
    return True


def card_png(lines, out):
    from PIL import Image, ImageDraw, ImageFont
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    hs = [(t.upper() if k == "s" else t, ImageFont.truetype(str(FONT_SANS if k == "s" else FONT_SERIF), 80 if k == "s" else 96), k) for t, k in lines]
    tot = sum(f.size for _, f, _ in hs) + 10 * (len(hs) - 1); y = H // 2 - tot // 2
    for t, f, k in hs:
        d.text((W // 2, y + f.size), t, font=f, fill=(255, 255, 255, 255), anchor="ms"); y += f.size + 10
    im.save(out)


def render_piece(spec, p, work):
    if p.get("card"):
        return render_card(spec, p, work)
    out = work / f"p{p['i']:03d}.mp4"
    ok = work / f"p{p['i']:03d}.ok"
    if ok.exists():
        return False
    t0, t1 = p["src"] / FPS, (p["src"] + p["n"]) / FPS
    caps = [c for c in overlays(spec) if c["ini"] < t1 and c["fim"] > t0]
    src, _ = fonte(spec, t0, t1, work, f"{p['i']:03d}")
    a = ["ffmpeg", "-v", "error", "-y"] + src + [
         "-loop", "1", "-i", str(ACAB / "vinheta.png"),
         "-stream_loop", "-1", "-i", str(ACAB / "grao.mkv")]
    for c in caps:
        a += ["-loop", "1", "-i", str(work / f"{c['id']}.png")]
    fc = [f"[0:v]fps={FPS},scale={W}:{H}:flags=lanczos,{GRADE},format=gbrp,"
          f"unsharp=5:5:0.45:5:5:0,setpts=PTS-STARTPTS[v0]",
          f"[1:v]format=gbrap,transpose=1,scale={W}:{H},colorchannelmixer=aa=0.85[vin]",
          "[v0][vin]overlay=0:0:format=gbrp:shortest=1[v1]",
          f"[2:v]format=gbrp,transpose=1,scale={W}:{H},setpts=N/{FPS}/TB[gr]",
          "[v1][gr]blend=all_mode=overlay:all_opacity=0.6:shortest=1[v2]"]
    cur = "[v2]"
    for k, c in enumerate(caps):
        s, e = c["ini"] - t0, c["fim"] - t0
        ch = f"[{3+k}:v]format=rgba"
        if s >= 0:
            ch += f",fade=t=in:st={s:.4f}:d=0.3:alpha=1"
        ch += f",fade=t=out:st={max(0.0, e - 0.25):.4f}:d=0.25:alpha=1[o{k}]"
        fc.append(ch)
        if c["sobe"] and s >= 0:
            y = f"'{c['sobe']}*pow(max(0,1-(t-{s:.4f})/0.45),3)'"
        else:
            y = "0"
        fc.append(f"{cur}[o{k}]overlay=x=0:y={y}:eval=frame:enable='between(t,{max(0,s):.4f},{e:.4f})'[c{k}]")
        cur = f"[c{k}]"
    fc.append(f"{cur}format=yuv420p[vo]")
    a += ["-filter_complex", ";".join(fc), "-map", "[vo]", "-frames:v", str(p["n"]),
          "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", str(spec.get("crf", 18)),
          "-r", str(FPS), str(out)]
    run(a)
    ok.write_text("ok")
    return True


def render_audio(spec, work):
    out = work / "audio.wav"
    if out.exists():
        return
    parts = []
    for wi, (a, b) in enumerate(spec["janelas"]):
        s, e = q(a) / FPS, q(b) / FPS
        d = e - s
        parts.append(f"[0:a]atrim={s:.5f}:{e:.5f},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:d=0.012,afade=t=out:st={d-0.012:.5f}:d=0.012[a{wi}]")
    n = len(spec["janelas"])
    pad = f",apad=pad_dur={spec['cartao']['dur']}" if spec.get("cartao") else ""
    fc = ";".join(parts) + ";" + "".join(f"[a{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1{pad}[ao]"
    run(["ffmpeg", "-v", "error", "-y", "-vn", "-i", spec["bruto"], "-filter_complex", fc,
         "-map", "[ao]", "-ar", "48000", "-ac", "2", str(out)])


def main():
    global ACAB
    spec = json.load(open(sys.argv[1]))
    if spec.get("acab"):
        ACAB = Path(spec["acab"])
    work = Path(spec["work"])
    pieces = plan(spec)
    modo = sys.argv[2] if len(sys.argv) > 2 else ""
    if modo == "n":
        print(len(pieces)); return
    work.mkdir(parents=True, exist_ok=True)
    make_pngs(spec, work)
    if modo == "audio":
        render_audio(spec, work); print("audio ok"); return
    if modo in ("parte", "segs"):
        k, N = int(sys.argv[3]), int(sys.argv[4])
        per = -(-len(pieces) // N)
        meus = pieces[k * per:(k + 1) * per]
        if modo == "segs":
            rows = segs(spec); need = set()
            for p in meus:
                if p.get("card"):
                    continue
                t0, t1 = p["src"] / FPS, (p["src"] + p["n"]) / FPS
                need |= {r[0] for r in rows if r[2] > t0 - 0.2 and r[1] < t1 + 0.2}
            print(" ".join(sorted(need))); return
        for p in meus:
            render_piece(spec, p, work); print("feito", p["i"], flush=True)
        return
    if modo == "n":
        print(len(pieces)); return
    if modo == "final":
        if not (work / "audio.wav").exists():
            render_audio(spec, work)
        lst = work / "lista.txt"
        lst.write_text("".join(f"file 'p{p['i']:03d}.mp4'\n" for p in pieces))
        run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
             "-i", str(work / "audio.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy",
             "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k",
             "-ar", "48000", "-shortest", "-movflags", "+faststart", spec["saida"]])
        print("FINAL", spec["saida"])
        return
    budget = float(os.environ.get("BUDGET", "150"))
    t = time.time()
    for p in pieces:
        if time.time() - t > budget:
            break
        if render_piece(spec, p, work):
            print("feito", p["i"], round(time.time() - t, 1))
    falta = [p["i"] for p in pieces if not (work / f"p{p['i']:03d}.ok").exists()]
    print("total", len(pieces), "faltam", len(falta))


if __name__ == "__main__":
    main()

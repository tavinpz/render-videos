# Mãe Mandou: legenda palavra por palavra (ASS, queimada com ffmpeg/libass), fora do render 3D.
# Uso: python3 ferramentas/mm_legenda.py <ep> "<palavras-chave separadas por |>" "<texto do CTA>"
# Cor por quem fala: mãe rosa, pai azul, Davi verde, narrador branco; palavra-chave amarela. Contorno preto grosso.
# Posição: centro em y 480 (ou o "leg" do plano). CTA na faixa y 600–870 durante a última fala.
import json, sys, re
ep, chaves, cta = sys.argv[1], [k.strip().lower() for k in sys.argv[2].split('|') if k.strip()], sys.argv[3]
T = json.load(open(f'mae/src/eps/{ep}_tempos.json')); E = json.load(open(f'public/mm/{ep}/eventos.json'))
COR = {'n': '&H00FFFFFF', 'm': '&H00B07FFF', 'v': '&H00FFB45A', 'c': '&H0077E86A'}  # ASS = &HAABBGGRR
AMARELO = '&H0036D8FF'
def ts(t): t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f'{h}:{m:02d}:{s:05.2f}'
def ylegenda(t):
    for p in E['planos']:
        if p['a'] <= t < p['b']: return p.get('leg', 480)
    return 480
def limpa(w): return re.sub(r'[^\wÀ-ú]', '', w.lower())
cab = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: L,Baloo 2 ExtraBold,104,&H00FFFFFF,&H00FFFFFF,&H00141018,&H64000000,0,0,0,0,100,100,0,0,1,9,3,5,110,110,0,1
Style: C,Baloo 2 ExtraBold,78,&H00141018,&H00141018,&H00FFFFFF,&H00000000,0,0,0,0,100,100,0,0,3,18,0,5,110,110,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = []
falas = T['falas']
for fi, f in enumerate(falas):
    pal = f['pal']; i = 0; grupos = []
    while i < len(pal):
        g = [pal[i]]
        # palavra curta (até 3 letras) vai junto com a seguinte, no máximo 2 por vez
        if len(limpa(pal[i][0])) <= 3 and i + 1 < len(pal): g.append(pal[i + 1])
        grupos.append(g); i += len(g)
    for gi, g in enumerate(grupos):
        a = g[0][1] - 0.03; b = grupos[gi + 1][0][1] - 0.03 if gi + 1 < len(grupos) else min(f['b'] + 0.12, falas[fi + 1]['a'] - 0.03 if fi + 1 < len(falas) else T['total'])
        txt = []
        for w, _, _ in g:
            lw = limpa(w); chave = any(lw == k or (len(k.split()) > 1 and k.startswith(lw)) for k in chaves) or lw in chaves
            cor = AMARELO if chave else COR[f['q']]
            txt.append(f'{{\\c{cor}}}' + w.upper().strip('"“”,.;:…'))
        y = ylegenda((a + b) / 2)
        ev.append(f'Dialogue: 0,{ts(a)},{ts(b)},L,,0,0,0,,{{\\an5\\pos(540,{y})\\fscx112\\fscy112\\t(0,70,\\fscx100\\fscy100)}}' + ' '.join(txt))
# CTA: caixa branca com a palavra, durante a última fala
u = falas[-1]
ev.append(f'Dialogue: 1,{ts(u["a"] + 0.2)},{ts(T["total"])},C,,0,0,0,,{{\\an5\\pos(540,740)\\fscx80\\fscy80\\t(0,120,\\fscx100\\fscy100)}}{cta}')
open(f'public/mm/{ep}/leg.ass', 'w').write(cab + '\n'.join(ev) + '\n')
print(ep, len(ev), 'eventos de legenda')

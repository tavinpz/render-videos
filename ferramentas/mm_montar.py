# Mãe Mandou: junta as falas (Chatterbox) numa linha do tempo sem respiro e grava os tempos.
# Uso: python3 ferramentas/mm_montar.py <ep> <pasta_voz> [<pasta_regravadas> ...]
# Saídas: public/mm/<ep>/voz.wav (48 kHz) e mae/src/eps/<ep>_tempos.json (falas com a/b e palavras com tempo).
import json, sys, os, subprocess, re
import numpy as np, soundfile as sf
ep, base, extras = sys.argv[1], sys.argv[2], sys.argv[3:]
SR = 48000
rot = json.load(open(f'public/mm/{ep}/roteiro.json'))['falas']
# mapa id da fala -> arquivo (as regravadas valem por cima)
arq = {}
for pasta in [base] + extras:
    rel = json.load(open(f'{pasta}/relatorio.json'))['falas']
    for f in rel: arq[f['c']] = f'{pasta}/f{f["i"]:02d}.wav'
VEL = {'n': 1.07, 'm': 1.03, 'c': 1.03, 'v': 1.03}   # narrador mais ágil (até ~7 %), personagens quase intocados
GAP = {'n': 0.10, 'm': 0.08, 'c': 0.08, 'v': 0.08}

def carrega(p, vel):
    tmp = '/tmp/_f.wav'
    af = (f'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.02,areverse,'
          f'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.05,areverse,atempo={vel},aresample={SR}')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', p, '-af', af, '-ac', '1', tmp], check=True)
    a, _ = sf.read(tmp, dtype='float32'); return a

def palavras(txt, a, b):
    ws = txt.split(); pesos = [len(re.sub(r'[^\wÀ-ú]', '', w)) + 1.5 for w in ws]; tot = sum(pesos); out = []; t = a
    for w, p in zip(ws, pesos):
        d = (b - a) * p / tot; out.append([w, round(t, 3), round(t + d, 3)]); t += d
    return out

t = 0.0; pedacos = []; falas = []
for i, f in enumerate(rot):
    a = carrega(arq[f['c']], VEL[f['q']])
    ini = t; t += len(a) / SR
    falas.append({'i': i, 'q': f['q'], 'a': round(ini, 3), 'b': round(t, 3), 'txt': f['txt'], 'pal': palavras(f['txt'], ini, t)})
    pedacos.append(a); g = GAP[f['q']] + (0.18 if f['txt'].rstrip().endswith(('…', '...')) else 0)
    if i + 1 < len(rot): pedacos.append(np.zeros(int(g * SR), np.float32)); t += g
fim = 0.35; pedacos.append(np.zeros(int(fim * SR), np.float32)); total = round(t + fim, 3)
voz = np.concatenate(pedacos)
os.makedirs(f'public/mm/{ep}', exist_ok=True)
sf.write(f'public/mm/{ep}/voz.wav', voz, SR)
json.dump({'total': total, 'falas': falas}, open(f'mae/src/eps/{ep}_tempos.json', 'w'), ensure_ascii=False, indent=1)
pal = sum(len(f['txt'].split()) for f in rot)
print(f'{ep}: {total:.1f} s, {pal} palavras, {pal / total:.2f} palavras/s')

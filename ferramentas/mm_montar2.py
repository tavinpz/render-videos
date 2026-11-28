# Mãe Mandou v2: linha do tempo de filme. Falas podem se atropelar (gap negativo) e uma fala "sob" continua por baixo
# da seguinte ("sobre": índice da fala que ela cobre), que começa "delay" s depois do início dela.
# Uso: python3 ferramentas/mm_montar2.py <pasta_public> <ep> <pasta_voz> [extras...]
# Saídas: <pasta>/falas/NN.wav (cada fala tratada, 48 kHz), <pasta>/plano_audio.json e mae/src/eps/<ep>_tempos.json
import json, sys, os, subprocess, re
import numpy as np, soundfile as sf
pasta, ep, base, extras = sys.argv[1].rstrip('/'), sys.argv[2], sys.argv[3], sys.argv[4:]
SR = 48000
rot = json.load(open(f'{pasta}/roteiro.json'))['falas']; tl = json.load(open(f'{pasta}/timeline.json'))
arq = {}
for p in [base] + extras:
    for f in json.load(open(f'{p}/relatorio.json'))['falas']: arq[f['c']] = f'{p}/f{f["i"]:02d}.wav'
VEL = {'n': 1.07}
os.makedirs(f'{pasta}/falas', exist_ok=True)
def carrega(p, vel):
    af = (f'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.02,areverse,'
          f'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.05,areverse,atempo={vel},aresample={SR}')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', p, '-af', af, '-ac', '1', '/tmp/_f.wav'], check=True)
    a, _ = sf.read('/tmp/_f.wav', dtype='float32'); return a
def palavras(txt, a, b):
    ws = txt.split(); pesos = [len(re.sub(r'[^\wÀ-ú]', '', w)) + 1.5 for w in ws]; tot = sum(pesos); out = []; t = a
    for w, p in zip(ws, pesos): d = (b - a) * p / tot; out.append([w, round(t, 3), round(t + d, 3)]); t += d
    return out
falas, t_fim, plano = [], 0.0, []
for i, f in enumerate(rot):
    spec = tl['falas'][i]; a = carrega(arq[f['c']], VEL.get(f['q'], 1.0)); d = len(a) / SR
    sf.write(f'{pasta}/falas/{i:02d}.wav', a, SR)
    if 'sobre' in spec: ini = falas[spec['sobre']]['a'] + spec.get('delay', 0.4)
    else:
        ref = falas[-1] if falas else None
        # depois de uma fala "sob", a próxima conta a partir do fim da fala que ela cobriu
        if ref and tl['falas'][i - 1].get('sob'): ref = falas[-2]
        ini = (ref['b'] if ref else 0.0) + spec.get('gap', 0.0)
        if 'sobre' in tl['falas'][i - 1] if i else False: ini = max(ini, falas[-1]['b'] + spec.get('gap', 0.0))
    ini = max(0.0, ini)
    fala = {'i': i, 'q': f['q'], 'a': round(ini, 3), 'b': round(ini + d, 3), 'txt': f['txt'], 'pal': palavras(f['txt'], ini, ini + d)}
    falas.append(fala); plano.append({**fala, **spec}); t_fim = max(t_fim, ini + d)
# fala "sob": termina (fade) quando a fala que a cobre acaba
for i, s in enumerate(plano):
    if s.get('sob'):
        cob = next(j for j, x in enumerate(plano) if x.get('sobre') == i)
        s['corta'] = plano[cob]['b']
total = round(t_fim + 0.5, 3)
json.dump({'total': total, 'falas': plano}, open(f'{pasta}/plano_audio.json', 'w'), ensure_ascii=False, indent=1)
leg = [f for f, s in zip(falas, plano) if s.get('leg', True)]
json.dump({'total': total, 'falas': falas}, open(f'mae/src/eps/{ep}_tempos.json', 'w'), ensure_ascii=False, indent=1)
print(ep, 'total', total, 's')
for s in plano: print(s['i'], s['q'], s['a'], s['b'], ('SOB ate ' + str(s.get('corta'))) if s.get('sob') else '', s['txt'][:40])

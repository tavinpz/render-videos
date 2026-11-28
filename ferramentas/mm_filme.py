# Mãe Mandou v2: mixagem de filme (grátis, tudo em código).
# Camadas: narrador seco por cima; personagem com sala própria (reverb por cena); fala "sob" abaixa e abafa quando o
# narrador entra; beep "PIIII" por cima da sílaba; ambiente contínuo por cena; foley por evento do vídeo; trilha por
# clima com corte seco no silêncio dramático; tapa-buraco; −14 LUFS.
# Uso: python3 ferramentas/mm_filme.py <pasta_public> <pasta_trilhas> <mapa_musica.json>
import json, sys, subprocess
import numpy as np, soundfile as sf
from scipy import signal
P, MUS, MAPA = sys.argv[1].rstrip('/'), sys.argv[2].rstrip('/'), json.load(open(sys.argv[3]))
SR = 48000
PL = json.load(open(f'{P}/plano_audio.json')); TL = json.load(open(f'{P}/timeline.json')); EV = json.load(open(f'{P}/eventos.json'))
TOT = EV['total']; N = int(TOT * SR) + SR
rng = np.random.default_rng(11)
def z(): return np.zeros((N, 2), np.float32)
VOZ, AMB, FOL, MUSI = z(), z(), z(), z()
def poe(buf, a, t, g=1.0, pan=0.0):
    if a.ndim == 1: a = np.stack([a * np.sqrt((1 - pan) / 2) * 1.414, a * np.sqrt((1 + pan) / 2) * 1.414], 1)
    i = int(max(0, t) * SR); a = a[:max(0, N - i)] * g; buf[i:i + len(a)] += a.astype(np.float32)
def ruido(d): return rng.standard_normal(int(d * SR))
def filt(x, tipo, f, o=2): return signal.sosfilt(signal.butter(o, f, tipo, fs=SR, output='sos'), x, axis=0)
def dec(d, k): t = np.arange(int(d * SR)) / SR; return t, np.exp(-t * k)
def ir(dur, k, brilho):
    t = np.arange(int(dur * SR)) / SR; x = rng.standard_normal(len(t)) * np.exp(-t * k); x = filt(x, 'lowpass', brilho)
    early = np.zeros_like(x)
    for d, g in [(0.011, 0.5), (0.017, 0.4), (0.023, 0.33), (0.031, 0.25)]: early[int(d * SR)] += g
    x = x + early * 3; return x / np.sqrt(np.sum(x ** 2))
SALA = {'maternidade': (ir(0.7, 7, 6500), 0.22), 'raiox': (ir(0.45, 11, 4000), 0.18), 'quarto': (ir(0.4, 12, 4500), 0.15), 'tribunal': (ir(1.6, 3.5, 5000), 0.3)}
def reverb(x, cena):
    h, m = SALA.get(cena, SALA['quarto']); w = signal.fftconvolve(x, h)[:len(x) + int(0.4 * SR)]
    return np.pad(x, (0, len(w) - len(x))) * (1 - m * 0.4) + w * m
def cena_de(t):
    falas = PL['falas']
    for nome, a, b in TL['cena']:
        ta = falas[int(a)]['a'] if a < len(falas) else TOT; tb = falas[int(b)]['a'] if b < len(falas) else TOT + 1
        if ta - 0.05 <= t < tb - 0.05: return nome
    return TL['cena'][-1][0]

# ---------------- vozes ----------------
for f in PL['falas']:
    a, sr = sf.read(f'{P}/falas/{f["i"]:02d}.wav', dtype='float32'); a = a.astype(np.float64)
    g = f.get('voz', 1.0)
    if f['q'] == 'n':   # narrador: seco, próximo, com presença
        a = a + filt(a, 'highpass', 2500) * 0.25; a = np.tanh(a * 1.3) / 1.3
    else:
        if f.get('drive'): k = 1 + 3 * f['drive']; a = np.tanh(a * k) / np.tanh(k) * 0.9
        a = a + filt(a, 'bandpass', [1800, 4200]) * 0.2
        a = reverb(a, cena_de(f['a']))
    n = len(a); env = np.ones(n)
    if f.get('beep'):   # PIIII por cima do final da fala
        i0 = int(f['beep'] * (f['b'] - f['a']) * SR); env[i0:] = 0.0
        tb = np.arange(n - i0) / SR; bp = (np.sin(2 * np.pi * 1000 * tb) * 0.8 + 0.2 * signal.square(2 * np.pi * 1000 * tb)) * 0.33
        bp *= np.minimum(1, tb * 200) * np.minimum(1, (tb[-1] - tb + 1e-3) * 60); poe(VOZ, bp, f['a'] + i0 / SR, 1.0)
    if f.get('sob'):    # abaixa e abafa quando o narrador entra; some quando ele termina
        cob = next(x for x in PL['falas'] if x.get('sobre') == f['i'])
        i0 = int((cob['a'] - f['a'] + 0.05) * SR); r = int(0.45 * SR); i1 = int((f['corta'] - f['a']) * SR)
        lp = filt(a, 'lowpass', 1300)
        k = np.zeros(n); k[i0:] = 1; k[i0:i0 + r] = np.linspace(0, 1, max(0, min(r, n - i0)))[:len(k[i0:i0 + r])]
        a = a * (1 - k) + lp * k * 10 ** (-12 / 20)
        if i1 < n: env[i1:] = 0; env[max(0, i1 - int(0.3 * SR)):i1] = np.linspace(1, 0, min(int(0.3 * SR), i1))
    a = a[:n] * env[:n] if len(env) >= len(a[:n]) else a
    poe(VOZ, a * g, f['a'], 1.0, 0.0 if f['q'] == 'n' else rng.uniform(-0.12, 0.12))

# ---------------- ambiente por cena (nunca some) ----------------
def bip(f=1000, d=0.07): t = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * f * t) * np.minimum(1, t * 400) * np.minimum(1, (d - t) * 400)
def choro_bebe(d=1.2):
    t = np.arange(int(d * SR)) / SR; f0 = 480 + 90 * np.sin(2 * np.pi * 2.2 * t) + 40 * np.sin(2 * np.pi * 7 * t)
    ph = 2 * np.pi * np.cumsum(f0) / SR; x = sum(np.sin(k * ph) / k for k in range(1, 7))
    x = filt(x, 'bandpass', [600, 3200]) * (0.5 + 0.5 * np.sin(np.pi * t / d)) * (0.6 + 0.4 * (np.sin(2 * np.pi * 3.1 * t) > 0)); return x
def grilos(d):
    out = np.zeros(int(d * SR))
    for k in range(int(d * 3)):
        i = rng.integers(0, len(out) - 6000); t = np.arange(4800) / SR; c = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 30 * t) > 0) * np.hanning(4800); out[i:i + 4800] += c * rng.uniform(0.2, 0.6)
    return out
for p in EV['planos']:
    a, b = p['a'], p['b'] + 0.02; d = b - a; cena = p['set']
    tom = filt(ruido(d), 'lowpass', 2200) * 0.5 + filt(ruido(d), 'lowpass', 300) * 0.6
    poe(AMB, tom, a, 0.05)
    if cena == 'maternidade':
        t = a + 0.2
        while t < b: poe(AMB, bip(), t, 0.05, 0.4); t += 0.85
        if rng.random() < 0.6: poe(AMB, reverb(choro_bebe(min(1.6, d)), 'maternidade'), a + 0.3, 0.018, -0.6)
    elif cena == 'raiox':
        tt = np.arange(int(d * SR)) / SR; poe(AMB, (np.sin(2 * np.pi * 100 * tt) + 0.3 * signal.sawtooth(2 * np.pi * 120 * tt)) * 0.5, a, 0.03)
    elif cena == 'quarto':
        poe(AMB, grilos(d), a, 0.05, 0.5)
        t = a
        while t < b: poe(AMB, filt(ruido(0.02), 'highpass', 3000) * np.exp(-np.arange(int(0.02 * SR)) / SR * 300), t, 0.08, -0.3); t += 1.0

# ---------------- foley ----------------
def whoosh(d=0.35, f0=500, f1=3500):
    n = int(d * SR); t = np.arange(n) / SR; k = t / d; x = ruido(d); y = np.zeros(n); bs = 480
    for i in range(0, n, bs):
        fc = f0 + (f1 - f0) * np.sin(k[min(n - 1, i)] * np.pi); y[i:i + bs] = filt(x[i:i + bs + 200], 'bandpass', [fc * 0.6, fc * 1.5])[:len(y[i:i + bs])]
    return y * np.sin(k * np.pi) ** 2
def chinelada():   # estalo seco de borracha + corpo + eco de azulejo
    t, e = dec(0.25, 40); est = filt(ruido(0.25), 'bandpass', [1200, 5500]) * np.exp(-t * 90)
    corpo = np.sin(2 * np.pi * (180 + 200 * np.exp(-t * 60)) * t) * np.exp(-t * 35) * 0.7
    return reverb((est * 1.4 + corpo) * np.minimum(1, t * 3000), 'maternidade')
def impacto(): t, e = dec(0.7, 8); return reverb(np.sin(2 * np.pi * (45 + 80 * np.exp(-t * 25)) * t) * e + filt(ruido(0.7), 'lowpass', 1800) * np.exp(-t * 25) * 0.5, 'quarto')
def brilho(d=0.9):
    out = np.zeros(int(d * SR))
    for j, f in enumerate([1568, 1976, 2349, 2637, 3136, 3951]):
        t, e = dec(d - j * 0.06, 5); s = np.sin(2 * np.pi * f * t) * e * 0.3; i = int(j * 0.06 * SR); out[i:i + len(s)] += s
    return reverb(out, 'tribunal')
def coral(d=2.0):   # "aaah" de coral: dentes de serra desafinados por 3 formantes
    t = np.arange(int(d * SR)) / SR; x = np.zeros_like(t)
    for f in (220, 277.2, 329.6, 440, 554.4):
        for dt in (-0.6, 0, 0.7): x += signal.sawtooth(2 * np.pi * (f + dt) * t + rng.uniform(0, 6))
    y = sum(filt(x, 'bandpass', [fc * 0.85, fc * 1.15]) * g for fc, g in ((800, 1.0), (1150, 0.6), (2900, 0.25)))
    return reverb(y * np.minimum(1, t * 3) * np.minimum(1, (d - t) * 2) * 0.05, 'tribunal')
def riser(d=1.2):
    n = int(d * SR); t = np.arange(n) / SR; f = 200 * (8 ** (t / d)); return (filt(ruido(d), 'bandpass', [300, 6000]) * 0.4 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3) * (t / d) ** 2
def tecido(): return filt(ruido(0.25), 'bandpass', [800, 3000]) * np.hanning(int(0.25 * SR)) * 0.6
ant = None
for p in EV['planos']:
    a = p['a']
    if p['i'] > 0: poe(FOL, whoosh(0.32 if p['set'] == ant else 0.5), a - 0.2, 0.16 if p['set'] == ant else 0.3, rng.uniform(-0.5, 0.5))
    ant = p['set']
    if p['flash']: poe(FOL, brilho(), a, 0.35)
    for k in p['kicks']: poe(FOL, impacto(), k, 0.45)
    for f in p['fx']:
        if f['k'] == 'burst': poe(FOL, chinelada(), f['t'], 0.8, rng.uniform(-0.3, 0.3))
        elif f['k'] == 'stars': poe(FOL, brilho(0.7), f['t'], 0.3)
        elif f['k'] == 'puff': poe(FOL, filt(ruido(0.4), 'bandpass', [300, 1800]) * np.hanning(int(0.4 * SR)), f['t'], 0.3)
    if p['shake']: poe(FOL, tecido(), a + 0.15, 0.25)
for e in MAPA.get('extras', []):
    t = PL['falas'][e['fala']]['a'] + e.get('off', 0.0)
    som = {'coral': lambda: coral(e.get('d', 2.0)), 'riser': lambda: riser(e.get('d', 1.2)), 'chinelada': chinelada, 'impacto': impacto, 'brilho': brilho}[e['k']]()
    poe(FOL, som, t, e.get('g', 0.5))

# ---------------- trilha por clima ----------------
cache = {}
def trilha(nome):
    if nome in cache: return cache[nome]
    m, s = sf.read(f'{MUS}/{nome}.wav', dtype='float32')
    if m.ndim == 1: m = np.stack([m, m], 1)
    if s != SR: m = signal.resample_poly(m, SR, s, axis=0).astype(np.float32)
    cache[nome] = m; return m
for j, tr in enumerate(MAPA['trechos']):
    t0 = PL['falas'][tr['de']]['a'] + tr.get('off', 0.0) if tr['de'] < len(PL['falas']) else TOT
    prox = MAPA['trechos'][j + 1] if j + 1 < len(MAPA['trechos']) else None
    t1 = (PL['falas'][prox['de']]['a'] + prox.get('off', 0.0)) if prox and prox['de'] < len(PL['falas']) else TOT
    if tr['nome'] == 'silencio': continue
    m = trilha(tr['nome']); n = int((t1 - t0) * SR)
    seg = np.concatenate([m] * (n // len(m) + 1))[:n].copy()
    fi = int(tr.get('fade_in', 0.05) * SR); fo = int(tr.get('fade_out', 0.08) * SR)
    seg[:fi] *= np.linspace(0, 1, fi)[:, None]; seg[-fo:] *= np.linspace(1, 0, fo)[:, None]
    poe(MUSI, seg, t0, tr.get('g', 1.0))
# ducking pela voz
vm = VOZ.mean(1); w = int(0.05 * SR)
rms = np.sqrt(np.maximum(signal.fftconvolve(vm ** 2, np.ones(w) / w, 'same'), 0))
fala = signal.sosfiltfilt(signal.butter(1, 6, 'lowpass', fs=SR, output='sos'), (rms > 0.01).astype(np.float32)).clip(0, 1)
MUSI *= (10 ** (-7 * fala / 20))[:, None]
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
ativo = fala > 0.5
ref = db(VOZ[ativo]) if ativo.any() else -20
MUSI *= 10 ** ((ref - 11 - db(MUSI[ativo])) / 20) if ativo.any() else 1
AMB *= 10 ** ((ref - 22 - db(AMB)) / 20)
FOL *= 10 ** ((ref - 6 - db(FOL[np.abs(FOL).sum(1) > 1e-4])) / 20)
mix = VOZ + MUSI + AMB + FOL
mix = mix[:int(TOT * SR)]
mix /= max(1.0, np.abs(mix).max() / 0.98)
sf.write(f'{P}/mix_pre.wav', mix, SR)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{P}/mix_pre.wav', '-af', 'acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-14:TP=-1.2:LRA=5', '-ar', str(SR), f'{P}/mix.wav'], check=True)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{P}/mix.wav', '-c:a', 'aac', '-b:a', '192k', f'{P}/mix.m4a'], check=True)
print('mix ok', round(TOT, 2), 's')

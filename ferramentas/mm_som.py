# Mãe Mandou: trilha (MIDI tocado no FluidSynth, gerado no Actions) + efeitos sintetizados + voz, sem buraco.
# Uso: python3 ferramentas/mm_som.py <ep> <pasta_trilhas> "<trechos>"
#   trechos: "0:cotidiano,7:tensao,21:reflexao" (índice do plano onde a trilha troca)
# Lê public/mm/<ep>/voz.wav e eventos.json. Grava public/mm/<ep>/mix.m4a (−14 LUFS) e mix.wav.
import json, sys, subprocess
import numpy as np, soundfile as sf
from scipy import signal
ep, mus, trechos = sys.argv[1], sys.argv[2].rstrip('/'), sys.argv[3]
SR = 48000; P = f'public/mm/{ep}'
E = json.load(open(f'{P}/eventos.json')); TOT = E['total']; N = int(TOT * SR)
voz, sr = sf.read(f'{P}/voz.wav', dtype='float32'); assert sr == SR
voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]
rng = np.random.default_rng(7)
L = np.zeros(N, np.float32); R = np.zeros(N, np.float32)

def poe(a, t, g=1.0, pan=0.0):
    i = max(0, int(t * SR)); a = a[:max(0, N - i)].astype(np.float32) * g
    L[i:i + len(a)] += a * np.sqrt((1 - pan) / 2) * 1.414; R[i:i + len(a)] += a * np.sqrt((1 + pan) / 2) * 1.414
def ruido(d): return rng.standard_normal(int(d * SR))
def filt(x, tipo, f, o=2): return signal.sosfilt(signal.butter(o, f, tipo, fs=SR, output='sos'), x)
def dec(d, k): t = np.arange(int(d * SR)) / SR; return t, np.exp(-t * k)
IR = filt(rng.standard_normal(int(0.8 * SR)) * np.exp(-np.arange(int(0.8 * SR)) / SR * 8), 'lowpass', 5000); IR /= np.abs(IR).sum() ** 0.5 * 6
def sala(x, m=0.2): w = signal.fftconvolve(x, IR); return np.pad(x, (0, len(w) - len(x))) * (1 - m * 0.3) + w * m

# ---------------- biblioteca de efeitos ----------------
def whoosh(d=0.35, f0=500, f1=3500):
    n = int(d * SR); t = np.arange(n) / SR; k = t / d; x = ruido(d); y = np.zeros(n); b = 480
    for i in range(0, n, b):
        f = f0 + (f1 - f0) * np.sin(k[min(n - 1, i)] * np.pi); y[i:i + b] = filt(x[i:i + b + 200], 'bandpass', [f * 0.6, f * 1.5])[:len(y[i:i + b])]
    return y * np.sin(k * np.pi) ** 2
def impacto(forte=1.0):
    t, e = dec(0.6, 9); corpo = np.sin(2 * np.pi * (48 + 90 * np.exp(-t * 30)) * t) * e
    est = filt(ruido(0.6), 'lowpass', 2500) * np.exp(-t * 28) * 0.6
    return sala((corpo + est) * forte, 0.25)
def pop():
    t, e = dec(0.18, 28); return sala(np.sin(2 * np.pi * (300 + 900 * np.exp(-t * 40)) * t) * e * np.minimum(1, t * 800), 0.2)
def brilho(d=0.8):
    out = np.zeros(int(d * SR))
    for j, f in enumerate([1568, 1976, 2349, 2637, 3136]):
        t, e = dec(d - j * 0.07, 6); s = np.sin(2 * np.pi * f * t) * e * 0.35; i = int(j * 0.07 * SR); out[i:i + len(s)] += s
    return sala(out, 0.35)
def puff():
    t, e = dec(0.5, 9); return sala(filt(ruido(0.5), 'bandpass', [300, 1800]) * (1 - np.exp(-t * 60)) * e * 0.9, 0.25)
def cresce(d=0.55, f0=180, f1=620):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 * (f1 / f0) ** (t / d); ph = 2 * np.pi * np.cumsum(f) / SR
    return sala((np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.15 * signal.sawtooth(ph)) * np.sin(np.pi * t / d) ** 0.6 * 0.5, 0.25)
def boing():
    n = int(0.45 * SR); t = np.arange(n) / SR; f = 220 + 160 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 6)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * 0.5
def buzina():
    t = np.arange(int(0.55 * SR)) / SR; s = signal.square(2 * np.pi * 350 * t) * 0.3 + signal.square(2 * np.pi * 440 * t) * 0.3
    return sala(filt(s, 'lowpass', 2200) * np.minimum(1, t * 40) * np.minimum(1, (0.55 - t) * 30), 0.2)
def motor(d=2.0):
    t = np.arange(int(d * SR)) / SR; s = signal.sawtooth(2 * np.pi * (55 + 8 * np.sin(t * 3)) * t) * 0.4 + filt(ruido(d), 'lowpass', 400) * 0.6
    return filt(s, 'lowpass', 900) * np.minimum(1, t * 4) * np.minimum(1, (d - t) * 3)
def jato(d=2.2): return whoosh(d, 200, 1400) * 1.4
def trovao():
    t, e = dec(2.5, 1.6); return filt(ruido(2.5), 'lowpass', 220) * e * (1 + 0.6 * np.sin(t * 11)) * 2.2
def chuva(d, k):
    x = filt(ruido(d), 'bandpass', [900, 8000]) * 0.35 + filt(ruido(d), 'lowpass', 500) * 0.25
    n = len(x); x *= np.minimum(1, np.arange(n) / (0.25 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.25 * SR)); return x * k
def granizo(d):
    out = np.zeros(int(d * SR))
    for _ in range(int(d * 60)):
        i = rng.integers(0, len(out) - 2000); t, e = dec(0.03, 160); out[i:i + len(t)] += filt(ruido(0.03), 'highpass', 2500) * e * rng.uniform(0.2, 0.7)
    return out
def agua(d):
    x = filt(ruido(d), 'lowpass', 700) * (0.6 + 0.4 * np.sin(np.arange(int(d * SR)) / SR * 2.2)); return x * 0.6

# ---------------- efeitos pelos eventos ----------------
ant = None
for p in E['planos']:
    a, b = p['a'], p['b']
    if p['i'] > 0: poe(whoosh(0.3 if p['set'] == ant else 0.45), a - 0.18, 0.22 if p['set'] == ant else 0.35, rng.uniform(-0.5, 0.5))
    ant = p['set']
    if p['flash']: poe(brilho(), a, 0.28)
    for k in p['kicks']: poe(impacto(0.9), k, 0.55)
    for f in p['fx']:
        if f['k'] == 'puff': poe(puff(), f['t'], 0.5); poe(pop(), f['t'], 0.35)
        elif f['k'] == 'stars': poe(brilho(0.6), f['t'], 0.3)
        elif f['k'] == 'burst': poe(impacto(0.7), f['t'], 0.4); poe(brilho(0.5), f['t'], 0.2)
    for g in p['grow']:
        if g['para'] > g['de']: poe(cresce(0.5, 160, 520 if g['para'] < 5 else 380), g['t'] - 0.05, 0.5)
        else: poe(cresce(0.4, 600, 200), g['t'], 0.4)
    for t0 in p['rise']: poe(cresce(1.4, 90, 300), t0, 0.55)
    if p['hop']: poe(boing(), a + 0.1, 0.18)
    if 'onibus' in p['props']: poe(buzina(), a + 0.25, 0.4); poe(motor(b - a), a, 0.35)
    if 'carro' in p['props'] and not p['enchente']: poe(motor(b - a), a, 0.3)
    if 'aviao' in p['props']: poe(jato(b - a + 0.3), a - 0.1, 0.5)
    if p['chuva'] > 0: poe(chuva(b - a + 0.3, 0.25 + 0.5 * p['chuva']), a - 0.1, 0.6)
    if p['granizo']: poe(granizo(b - a), a, 0.5)
    if p['enchente']: poe(agua(b - a), a, 0.6)
    if p['luz'] == 'storm' and p['flash']: poe(trovao(), a + 0.05, 0.6)
    if p['arco']: poe(brilho(1.4), a + 0.3, 0.35)
fx = np.stack([L, R], 1)

# ---------------- trilha por trechos, em laço, com ducking pela voz ----------------
def trilha(nome):
    m, s = sf.read(f'{mus}/{nome}.wav', dtype='float32')
    if m.ndim == 1: m = np.stack([m, m], 1)
    if s != SR: m = signal.resample_poly(m, SR, s, axis=0).astype(np.float32)
    out = np.zeros((N + SR, 2), np.float32); i = 0; xf = int(0.6 * SR)
    while i < N:
        seg = m.copy(); seg[:xf] *= np.linspace(0, 1, xf)[:, None]; seg[-xf:] *= np.linspace(1, 0, xf)[:, None]
        k = min(len(seg), len(out) - i); out[i:i + k] += seg[:k]; i += len(seg) - xf
    return out[:N]
pl = E['planos']; marcas = []
for x in trechos.split(','):
    k, nome = x.split(':'); marcas.append((pl[int(k)]['a'] if int(k) < len(pl) else TOT, nome))
mus_mix = np.zeros((N, 2), np.float32); cache = {}
for j, (t0, nome) in enumerate(marcas):
    t1 = marcas[j + 1][0] if j + 1 < len(marcas) else TOT
    if nome not in cache: cache[nome] = trilha(nome)
    i0, i1 = int(max(0, t0 - 0.3) * SR), int(min(TOT, t1 + 0.3) * SR); g = np.ones(i1 - i0, np.float32); r = int(0.3 * SR)
    if j > 0: g[:r] = np.linspace(0, 1, r)
    if j + 1 < len(marcas): g[-r:] = np.linspace(1, 0, r)
    mus_mix[i0:i1] += cache[nome][i0:i1] * g[:, None]
# envelope da voz (rms 50 ms) -> trilha desce ~9 dB na fala, volta em 250 ms (nunca some)
rms = np.sqrt(np.maximum(signal.fftconvolve(voz ** 2, np.ones(int(0.05 * SR)) / int(0.05 * SR), "same"), 0))
fala = (rms > 0.01).astype(np.float32)
sm = signal.sosfiltfilt(signal.butter(1, 6, 'lowpass', fs=SR, output='sos'), fala)
duck = 10 ** ((-7 * sm.clip(0, 1)) / 20)
mus_mix *= duck[:, None]

def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
v2 = np.stack([voz, voz], 1)
alvo_mus = rms_db(v2) - 12 - rms_db(mus_mix[fala > 0.5]) if (fala > 0.5).any() else 0
mus_mix *= 10 ** (alvo_mus / 20)
fx *= 10 ** ((rms_db(v2) - 10 - rms_db(fx[np.abs(fx).sum(1) > 1e-4])) / 20) if (np.abs(fx).sum(1) > 1e-4).any() else 1
mix = v2 + mus_mix + fx
# tapa-buraco: onde o som cai mais de 7 dB abaixo do nível da fala, entra um acorde suave (com fade) por baixo
w = int(0.05 * SR); nw = N // w
rr = np.sqrt((mix[:nw * w].mean(1).reshape(nw, w) ** 2).mean(1) + 1e-12); db = 20 * np.log10(rr + 1e-9); ref = np.percentile(db, 80)
baixo = db < ref - 7; t = np.arange(N) / SR
pad = sum(np.sin(2 * np.pi * f * t) for f in (261.6, 329.6, 392.0, 523.3)) / 4
pad = filt(pad, 'lowpass', 1800).astype(np.float32)
mask = np.zeros(N, np.float32)
for i in range(6, nw - 6):
    if baixo[i]: mask[max(0, (i - 2) * w):(i + 3) * w] = 1
mask = signal.sosfiltfilt(signal.butter(1, 8, 'lowpass', fs=SR, output='sos'), mask).clip(0, 1).astype(np.float32)
alvo = 10 ** ((ref - 5) / 20) / (np.sqrt(np.mean(pad ** 2)) + 1e-9)
mix += (pad * mask * alvo)[:, None]
mix /= max(1.0, np.abs(mix).max() / 0.98)
sf.write(f'{P}/mix_pre.wav', mix, SR)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{P}/mix_pre.wav', '-af', 'acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-14:TP=-1.2:LRA=5', '-ar', str(SR), f'{P}/mix.wav'], check=True)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{P}/mix.wav', '-c:a', 'aac', '-b:a', '192k', f'{P}/mix.m4a'], check=True)
print(ep, 'mix ok', round(TOT, 2), 's')

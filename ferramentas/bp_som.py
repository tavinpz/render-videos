# Efeitos e mixagem do Brasileiro Padrão. Tudo sintetizado em camadas (ruído filtrado + corpo + reverb), sincronizado
# pelos mesmos quadros do src/bp/Video.tsx. Uso: python3 ferramentas/bp_som.py public/bp/t2 <pasta_das_trilhas>
# Saídas: mix.m4a (voz + trilha com ducking + efeitos) e fx.wav (só efeitos, para conferência).
import json, sys, subprocess
import numpy as np, soundfile as sf
from scipy import signal
pasta, mus = sys.argv[1].rstrip('/'), sys.argv[2].rstrip('/'); SR = 48000
T = json.load(open(f'{pasta}/tempos.json')); tot = T['total']; F = {f['c']: f for f in T['falas']}; N = int(tot * SR)
fr = lambda c, k=0: round((F[c]['t'] + F[c]['d'] * k) * 30)
def pal(c, w): i = F[c]['txt'].lower().find(w.lower()); return fr(c, max(0, i) / len(F[c]['txt']))
rng = np.random.default_rng(5); L = np.zeros(N, np.float32); R = np.zeros(N, np.float32)
def poe(a, quadro, g=1.0, pan=0.0, seg=None):
    i = int((quadro / 30 if seg is None else seg) * SR); i = max(0, i); a = a[:max(0, N - i)].astype(np.float32) * g
    L[i:i + len(a)] += a * np.sqrt((1 - pan) / 2) * 1.414; R[i:i + len(a)] += a * np.sqrt((1 + pan) / 2) * 1.414
def ruido(d): return rng.standard_normal(int(d * SR))
def filt(x, tipo, f, ordem=2): return signal.sosfilt(signal.butter(ordem, f, tipo, fs=SR, output='sos'), x)
def env(n, a, r, curva=1.0):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, min(n - na, int(r * SR))); e[:na] = np.linspace(0, 1, na); e[n - nr:] = np.linspace(1, 0, nr) ** curva; return e
def dec(d, k): t = np.arange(int(d * SR)) / SR; return t, np.exp(-t * k)
IR = (lambda t, e: rng.standard_normal(len(t)) * e)(*dec(0.9, 7)); IR = filt(IR, 'lowpass', 5000); IR /= np.abs(IR).sum() ** 0.5 * 6
def sala(x, m=0.25): w = signal.fftconvolve(x, IR); return np.pad(x, (0, len(w) - len(x))) * (1 - m * 0.3) + w * m
# ---- biblioteca ----
def passo(forte=1.0):
    t, e = dec(0.16, 34); corpo = np.sin(2 * np.pi * (95 + 60 * np.exp(-t * 50)) * t) * e
    sola = filt(ruido(0.16), 'bandpass', [900, 3200]) * np.exp(-t * 60) * 0.5; arr = filt(ruido(0.16), 'bandpass', [2500, 6000]) * np.exp(-((t - 0.05) / 0.03) ** 2) * 0.12
    return sala((corpo * 0.9 + sola + arr) * forte, 0.12)
def chicote(d=0.5, f0=400, f1=4200):
    n = int(d * SR); t = np.arange(n) / SR; x = ruido(d); k = t / d; fc = f0 + (f1 - f0) * np.sin(k * np.pi)
    y = np.zeros(n); b = 512
    for i in range(0, n, b): seg = x[i:i + b + 256]; f = fc[min(n - 1, i)]; y[i:i + b] = filt(seg, 'bandpass', [f * 0.6, f * 1.5])[:len(y[i:i + b])]
    return sala(y * np.sin(k * np.pi) ** 2, 0.15)
def blip(f=660, d=0.11):
    t, e = dec(d, 30); return sala((np.sin(2 * np.pi * (f + 260 * np.exp(-t * 70)) * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * e * np.minimum(1, t * 900), 0.18)
def toque(): t, e = dec(0.04, 120); return filt(ruido(0.04), 'bandpass', [1800, 5200]) * e
def papelao():
    t, e = dec(0.35, 13); corpo = np.sin(2 * np.pi * 150 * t) * np.exp(-t * 26) + np.sin(2 * np.pi * 240 * t) * np.exp(-t * 34) * 0.5
    return sala(corpo * 0.8 + filt(ruido(0.35), 'bandpass', [400, 2600]) * e * 0.45, 0.2)
def caneta(d=0.32):
    n = int(d * SR); t = np.arange(n) / SR; am = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 34 * t + np.cumsum(rng.standard_normal(n)) * 0.002))
    return filt(ruido(d), 'bandpass', [2600, 7500]) * am * env(n, 0.02, 0.08) * 0.6
def carimbo():
    t, e = dec(0.6, 8); grave = np.sin(2 * np.pi * (58 + 70 * np.exp(-t * 40)) * t) * np.exp(-t * 11); mad = np.sin(2 * np.pi * 310 * t) * np.exp(-t * 45) * 0.4
    return sala(grave + mad + filt(ruido(0.6), 'highpass', 1500) * np.exp(-t * 90) * 0.35, 0.3)
def sino(f=1568, d=1.6):
    t = np.arange(int(d * SR)) / SR; return sala(sum(np.sin(2 * np.pi * f * m * t) * a * np.exp(-t * k) for m, a, k in [(1, .6, 3.2), (2.0, .25, 4.5), (2.76, .18, 6), (5.4, .08, 9)]) * np.minimum(1, t * 600), 0.35)
def brilho():
    out = np.zeros(int(1.2 * SR))
    for i, f in enumerate([2093, 2637, 3136, 3951, 4186]): s = sino(f, 0.6) * 0.35; j = int(i * 0.055 * SR); out[j:j + len(s)] += s[:len(out) - j]
    return out
def vibra(d=0.52):
    n = int(d * SR); t = np.arange(n) / SR; motor = np.sign(np.sin(2 * np.pi * 172 * t)) * 0.35 + np.sin(2 * np.pi * 86 * t) * 0.5
    motor = filt(motor, 'lowpass', 900); bate = filt(ruido(d), 'bandpass', [700, 2800]) * (np.sin(2 * np.pi * 43 * t) > 0.75) * 0.5
    return sala((motor + bate) * env(n, 0.015, 0.05), 0.12)
def carrilhao():
    out = np.zeros(int(1.6 * SR))
    for i, f in enumerate([1318.5, 1760.0]):
        t, e = dec(1.1, 5.5); s = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t * 18)) * e * np.minimum(1, t * 800); j = int(i * 0.13 * SR); out[j:j + len(s)] += s[:len(out) - j]
    return sala(out, 0.3)
def moeda():
    f = rng.uniform(3400, 5200); t, e = dec(0.3, 16); return (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.48 * t)) * e * np.minimum(1, t * 2000)
def baque(d=1.1):
    t, e = dec(d, 4.5); return sala(np.sin(2 * np.pi * (40 + 70 * np.exp(-t * 20)) * t) * e + filt(ruido(d), 'lowpass', 300) * np.exp(-t * 9) * 0.4, 0.3)
def sobe(d=0.9):
    n = int(d * SR); t = np.arange(n) / SR; return filt(ruido(d), 'bandpass', [600, 6000]) * (t / d) ** 2.5 * 0.7 + np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / d) ** 2) / SR) * (t / d) ** 2 * 0.25
def tique(f=2200): t, e = dec(0.05, 90); return (np.sin(2 * np.pi * f * t) * 0.5 + filt(ruido(0.05), 'bandpass', [1500, 4500]) * 0.6) * e
def ambiente(d, dentro):
    n = int(d * SR); t = np.arange(n) / SR; base = filt(np.cumsum(ruido(d)) / 60, 'bandpass', [60, 420 if dentro else 900]); base /= np.abs(base).max() + 1e-9
    x = base * (0.5 + 0.3 * np.sin(2 * np.pi * 0.11 * t + 1))
    if not dentro:
        gr = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 31 * t) > 0) * (np.sin(2 * np.pi * 1.7 * t) > 0.3) * 0.09
        x = x + filt(gr, 'bandpass', [3800, 4900])
    return x * env(n, 0.25, 0.25)
def carro(d=2.6):
    n = int(d * SR); t = np.arange(n) / SR; k = t / d; x = filt(ruido(d), 'bandpass', [90, 1400]) + np.sin(2 * np.pi * np.cumsum(120 - 40 * k) / SR) * 0.25
    return x * np.exp(-((k - 0.5) / 0.2) ** 2), np.linspace(0.8, -0.8, n)
# ---- cenas (mesmos quadros do Video.tsx) ----
q = {'lado': fr('chega', 0.5), 'neide1': fr('neide1') - 5, 'entrega': fr('entrega') - 4, 'mesa': fr('mesa') - 5, 'saldo': fr('saldo') - 5, 'neide2': fr('neide2') - 4, 'deixa': fr('deixa') - 5, 'relogio': fr('vibra') - 8, 'vibra': fr('vibra') + 24, 'pix': fr('pix') - 4, 'eita': fr('eita') - 5, 'fim': int(tot * 30)}
tPix = pal('pix', 'cinquenta')
for a, b, dentro, g in [(0, q['neide1'], False, 0.5), (q['neide1'], q['mesa'], False, 0.3), (q['mesa'], q['saldo'], True, 0.3), (q['neide2'], q['relogio'], True, 0.25), (q['vibra'], q['pix'], True, 0.45), (q['eita'], q['fim'], True, 0.35)]:
    poe(ambiente((b - a) / 30 + 0.2, dentro), a, g * 0.5)
c, pn = carro(); i0 = int(1.0 * SR); c = c[:N - i0] * 0.3; L[i0:i0 + len(c)] += c * (1 - pn[:len(c)]) / 2 * 1.4; R[i0:i0 + len(c)] += c * (1 + pn[:len(c)]) / 2 * 1.4
k = 0
while (qd := 4 + k * np.pi / 0.42) < q['lado'] - 2: poe(passo(0.5), qd, 0.35, pan=-0.3 + 0.5 * qd / q['lado']); k += 1
k = 1
while (qd := q['lado'] + k * np.pi / 0.36 - 3) < q['neide1'] - 3: poe(passo(1.0), qd, 0.6, pan=-0.15 + 0.1 * (k % 2)); k += 1
poe(blip(520), 10, 0.3, pan=-0.5)
poe(chicote(0.45), q['neide1'] - 9, 0.5); poe(toque(), q['neide1'] + 8, 0.2, pan=0.3)
for j in range(3): poe(filt(ruido(0.12), 'bandpass', [1500, 6000]) * np.exp(-np.arange(int(0.12 * SR)) / SR * 40) * 0.3, q['neide1'] + 14 + j * 9, 0.35, pan=0.4)   # sacolas
poe(papelao(), q['entrega'] + 10, 0.55); poe(papelao(), q['entrega'] + 24, 0.3, pan=0.1)
m19 = pal('mesa', 'dezenove'); mn = pal('mesa', 'nenhuma')
poe(chicote(0.3, 300, 2000), m19 - 7, 0.25); poe(carimbo(), m19 + 3, 0.8, pan=0.35); poe(caneta(), mn + 2, 0.55, pan=-0.1); poe(blip(700), mn + 9, 0.3, pan=-0.3)
for j in range(4): poe(tique(1500 if j % 2 else 1900), q['mesa'] + 6 + j * 15, 0.12, pan=0.5)
poe(chicote(0.35, 500, 3000), q['saldo'] - 6, 0.35); poe(blip(880, 0.09), pal('saldo', 'trinta'), 0.35)
for j in range(4): poe(toque(), q['saldo'] + 5 + 10 + j * 4, 0.16, pan=0.2)
poe(blip(440), q['neide2'] + 2, 0.18)
poe(chicote(0.3, 400, 2600), fr('deixa') - 4, 0.3, pan=0.3); poe(brilho(), fr('deixa') + 12, 0.4, pan=0.3); poe(blip(600), fr('deixa') + 3, 0.28, pan=0.4)
dr = q['vibra'] - q['relogio']; poe(sobe(dr / 30), q['relogio'], 0.4)
for j in range(14): poe(tique(1800 + j * 60), q['relogio'] + 2 + dr * (1 - (1 - j / 14) ** 1.6), 0.22, pan=np.sin(j) * 0.4)
poe(baque(0.8), q['vibra'] - 1, 0.5)
for a in (4, 26, 48): poe(vibra(0.52), q['vibra'] + a, 0.85, pan=0.35)
poe(carrilhao(), q['pix'] + 5, 0.5); poe(chicote(0.4, 500, 3500), q['pix'] - 6, 0.35)
for j in range(24): poe(tique(1400 + j * 110), tPix + j * 1.05, 0.2, pan=np.sin(j * 1.7) * 0.3)
for j in range(16): poe(moeda(), tPix + 5 + j * 1.7 + rng.uniform(0, 1), 0.13, pan=rng.uniform(-0.8, 0.8))
poe(baque(1.2), tPix + 24, 0.75); poe(sino(1046, 1.4), tPix + 24, 0.22)
poe(sobe(0.3), q['eita'] + 9 - 9, 0.35); poe(baque(1.0), q['eita'] + 9, 0.8); poe(chicote(0.35, 300, 2400), q['eita'] + 7, 0.4)
fx = np.stack([L, R], 1); fx = np.tanh(fx * 1.2) / 1.2
# ---- trilha com ducking pela voz ----
voz, _ = sf.read(f'{pasta}/voz.wav', dtype='float32'); voz = voz[:N]; voz = np.pad(voz, (0, N - len(voz)))
def trilha(nome, a, b, ganho, fade=0.5):
    x, sr = sf.read(f'{mus}/{nome}.wav', dtype='float32'); assert sr == SR; n = int((b - a) / 30 * SR)
    while len(x) < n: x = np.concatenate([x, x])
    x = x[:n].copy(); e = env(n, 0.3, fade)[:, None]; out = np.zeros((N, 2), np.float32); i = int(a / 30 * SR); n = min(n, N - i); out[i:i + n] = (x * e * ganho)[:n]; return out
m = trilha('cotidiano', 0, q['relogio'] + 6, 0.55, 0.35) + trilha('tensao', q['vibra'] - 2, tPix + 26, 0.6, 0.12)
ev = np.sqrt(signal.sosfilt(signal.butter(1, 6, 'lowpass', fs=SR, output='sos'), voz ** 2).clip(0)); duck = 1 - 0.62 * np.clip(ev / 0.05, 0, 1)
duck = signal.sosfilt(signal.butter(1, 4, 'lowpass', fs=SR, output='sos'), duck); m *= duck[:, None]
mix = np.stack([voz, voz], 1) * 1.0 + m + fx * 0.36
mix *= np.minimum(1, (tot - np.arange(N) / SR) / 0.7)[:, None]; pico = np.abs(mix).max(); mix = mix / max(1.0, pico / 0.95)
sf.write(f'{pasta}/fx.wav', fx, SR, subtype='PCM_16'); sf.write('/tmp/bp_mix.wav', mix, SR, subtype='PCM_16')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', '/tmp/bp_mix.wav', '-af', 'loudnorm=I=-15:TP=-1.5:LRA=9', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', f'{pasta}/mix.m4a'], check=True)
print('ok pico', round(float(pico), 2), 'dur', round(tot, 2))

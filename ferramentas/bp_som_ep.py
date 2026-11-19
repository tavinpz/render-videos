# Efeitos, trilhas e mixagem do Brasileiro Padrão, guiados pelos planos do tempos.json (mesmos quadros do src/bp/Video.tsx).
# Uso: python3 ferramentas/bp_som_ep.py public/bp/v01 <pasta_das_trilhas>  -> mix.m4a e fx.wav
import json, sys, subprocess
import numpy as np, soundfile as sf
from scipy import signal
pasta, mus = sys.argv[1].rstrip('/'), sys.argv[2].rstrip('/'); SR = 48000
T = json.load(open(f'{pasta}/tempos.json')); tot = T['total']; N = int(tot * SR); TOTQ = int(np.ceil(tot * 30))
rng = np.random.default_rng(5); L = np.zeros(N, np.float32); R = np.zeros(N, np.float32)
def poe(a, quadro, g=1.0, pan=0.0):
    i = max(0, int(quadro / 30 * SR)); a = a[:max(0, N - i)].astype(np.float32) * g
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
# ---- extras ----
def toca_tel(d=1.1):
    n = int(d * SR); t = np.arange(n) / SR; x = (np.sin(2 * np.pi * 1320 * t) + np.sin(2 * np.pi * 1660 * t)) * (np.sin(2 * np.pi * 22 * t) > 0) * 0.4; return sala(x * env(n, 0.01, 0.05), 0.15)
def ocupado():
    out = np.zeros(int(1.5 * SR))
    for i in range(3): t = np.arange(int(0.25 * SR)) / SR; s_ = np.sin(2 * np.pi * 425 * t) * env(len(t), 0.01, 0.02) * 0.5; j = int(i * 0.5 * SR); out[j:j + len(s_)] += s_
    return out
def erro():
    t, e = dec(0.5, 5); return sala((np.sign(np.sin(2 * np.pi * 155 * t)) * 0.3 + np.sin(2 * np.pi * 110 * t) * 0.5) * e, 0.2)
def falha(d=0.9):
    n = int(d * SR); x = filt(ruido(d), 'bandpass', [1200, 5000]) * (rng.random(n // 1200 + 1).repeat(1200)[:n] > 0.55) * 0.5; return x * env(n, 0.01, 0.1)
def sirene(d=1.6):
    n = int(d * SR); t = np.arange(n) / SR; f = 700 + 500 * np.abs(np.sin(2 * np.pi * 1.6 * t)); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4; return sala(filt(x, 'lowpass', 2400) * env(n, 0.05, 0.4), 0.3)
def harpa():
    out = np.zeros(int(1.6 * SR))
    for i, f in enumerate([523, 659, 784, 988, 1175, 1568, 1976, 2349]): s_ = sino(f, 0.9) * 0.3; j = int(i * 0.045 * SR); out[j:j + len(s_)] += s_[:len(out) - j]
    return out
def chapa(d):
    n = int(d * SR); t = np.arange(n) / SR; return filt(ruido(d), 'highpass', 3500) * (0.5 + 0.5 * rng.random(n // 300 + 1).repeat(300)[:n]) * env(n, 0.2, 0.3) * 0.25
def mar(d):
    n = int(d * SR); t = np.arange(n) / SR; return filt(ruido(d), 'bandpass', [200, 1800]) * (0.35 + 0.65 * np.sin(2 * np.pi * 0.28 * t) ** 2) * env(n, 0.3, 0.4) * 0.5
def bolhas():
    out = np.zeros(int(1.6 * SR))
    for i in range(14): t, e = dec(0.09, 40); f0 = rng.uniform(300, 900); s_ = np.sin(2 * np.pi * (f0 + 900 * t / 0.09) * t) * e * 0.5; j = int(rng.uniform(0, 1.4) * SR); out[j:j + len(s_)] += s_[:len(out) - j]
    return out
def cai(d=1.0):
    n = int(d * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(1400 - 1000 * (t / d)) / SR) * env(n, 0.02, 0.2) * 0.35
def teclado(d):
    out = np.zeros(int(d * SR)); k = 0.0
    while k < d - 0.1: s_ = toque() * rng.uniform(0.4, 1); j = int(k * SR); out[j:j + len(s_)] += s_[:len(out) - j]; k += rng.uniform(0.09, 0.4)
    return out
# ---- planos (igual ao Video.tsx) ----
P = []
for fa in T['falas']:
    if 's' in fa or not P: P.append({'ini': round(fa['t'] * 30) - 5 if P else 0, 's': fa.get('s', {'t': 'texto'}), 'falas': []})
    P[-1]['falas'].append(fa)
for i, p in enumerate(P): p['fim'] = P[i + 1]['ini'] if i + 1 < len(P) else TOTQ
def pal(p, w, d=10):
    if w:
        for fa in p['falas']:
            i = fa['txt'].lower().find(w.lower())
            if i >= 0: return round((fa['t'] + fa['d'] * (i / len(fa['txt']))) * 30)
    return p['ini'] + d
FORA = {'chegada', 'aereo', 'visita'}
for i, p in enumerate(P):
    s, a, b, t = p['s'], p['ini'], p['fim'], p['s']['t']; d = (b - a) / 30; lado = 0.25 if i % 2 else -0.25; fundo = s.get('fundo', '')
    fora = t in FORA or (t in ('ots', 'close') and fundo.startswith('rua'))
    if t in ('close', 'ots', 'mesa', 'duplo') or fora: poe(ambiente(d + 0.2, not fora), a, 0.16 if not fora else 0.24)
    if fundo == 'delegacia': poe(teclado(d), a, 0.12, pan=0.5)
    if t == 'cel':
        tela = s['tela']; tp = pal(p, s.get('pal'), 12); poe(chicote(0.4, 500, 3200), a - 4, 0.3, pan=lado)
        if tela == 'pix':
            poe(carrilhao(), a + 6, 0.5)
            if not s.get('parado'):
                for j in range(24): poe(tique(1400 + j * 110), tp + j * 1.05, 0.2, pan=np.sin(j * 1.7) * 0.3)
                for j in range(16): poe(moeda(), tp + 5 + j * 1.7 + rng.uniform(0, 1), 0.13, pan=rng.uniform(-0.8, 0.8))
                poe(baque(1.2), tp + 24, 0.7); poe(sino(1046, 1.4), tp + 24, 0.22)
            else: poe(blip(700), pal(p, 'zeros'), 0.3, pan=0.4)
        elif tela == 'saldo':
            poe(blip(880, 0.09), tp, 0.35)
            for j in range(4): poe(toque(), a + 10 + j * 4, 0.16, pan=0.2)
        elif tela == 'botoes':
            if s.get('aperta'): poe(toque(), tp, 0.6); poe(blip(520, 0.14), tp + 1, 0.5); poe(sino(1318, 1.2), tp + 3, 0.25)
            else: poe(blip(700), a + 20, 0.3, pan=0.4)
            if s.get('placa'): poe(carimbo(), tp - 4, 0.5, pan=0.3)
        elif tela == 'ligacao':
            k = 4
            while a + k < b - 20: poe(toca_tel(1.0), a + k, 0.4); poe(vibra(0.5), a + k, 0.4, pan=0.2); k += 48
        elif tela == 'chave': poe(blip(600), a + 8, 0.25); poe(erro(), tp, 0.35)
        elif tela == 'chave2':
            for j in range(3): poe(blip(760 - j * 60, 0.08), a + 8 + j * 12, 0.3, pan=-0.2)
            poe(erro(), a + 50, 0.45)
        elif tela == 'travado': poe(falha(1.0), a + 4, 0.4); poe(erro(), a + 14, 0.5); poe(falha(0.5), a + 60, 0.25)
        elif tela == 'devolvido':
            poe(sino(1568, 1.6), a + 6, 0.3)
            for j in range(22): poe(tique(3200 - j * 90), tp + j * 1.2, 0.18, pan=np.sin(j * 1.7) * 0.3)
            poe(baque(0.9), tp + 28, 0.45)
    elif t == 'close':
        if s.get('zoom') == 'susto': poe(sobe(0.3), a, 0.35); poe(baque(1.0), a + 9, 0.75); poe(chicote(0.35, 300, 2400), a + 7, 0.4)
        elif s.get('zoom') == 'entra': poe(sobe(min(1.2, d * 0.5)), a + 2, 0.18)
        if s.get('pose') == 'joia': poe(chicote(0.3, 400, 2600), a + 2, 0.25, pan=0.3); poe(brilho(), a + 14, 0.38, pan=0.3)
        if s.get('bal'): poe(blip(600), a + 8, 0.28, pan=0.4)
        if s.get('placa'): poe(carimbo(), pal(p, s.get('pal'), 20), 0.5, pan=0.3)
        if s.get('luzes'): poe(sirene(min(2.4, d)), a + 2, 0.22)
        if s.get('novo'): poe(brilho(), a + 6, 0.35, pan=0.3)
    elif t == 'ots':
        if i and P[i - 1]['s']['t'] not in ('ots', 'close'): poe(chicote(0.45), a - 6, 0.4)
        if s.get('pose') == 'entrega': poe(papelao(), a + 10, 0.55); poe(papelao(), a + 24, 0.3, pan=0.1)
        if s.get('frente') == 'neide':
            for j in range(3): poe(filt(ruido(0.12), 'bandpass', [1500, 6000]) * np.exp(-np.arange(int(0.12 * SR)) / SR * 40) * 0.3, a + 12 + j * 9, 0.3, pan=0.4)
        if s.get('frente') == 'delegado': poe(sirene(1.2), a, 0.2)
    elif t == 'chegada':
        m = a + round((b - a) * 0.48); c, pn = carro(); i0 = int((a / 30 + 1.0) * SR); c = c[:max(0, N - i0)] * 0.3; L[i0:i0 + len(c)] += c * (1 - pn[:len(c)]) / 2 * 1.4; R[i0:i0 + len(c)] += c * (1 + pn[:len(c)]) / 2 * 1.4
        k = 0
        while (q := a + 4 + k * np.pi / 0.42) < m - 2: poe(passo(0.5), q, 0.33, pan=-0.3 + 0.5 * (q - a) / (m - a)); k += 1
        k = 1
        while (q := m + k * np.pi / 0.36 - 3) < b - 3: poe(passo(1.0), q, 0.55, pan=-0.15 + 0.1 * (k % 2)); k += 1
    elif t == 'aereo': poe(sirene(2.0), a + 2, 0.4); poe(chicote(0.9, 200, 1500), a + 30, 0.35); poe(baque(0.6), a + 50, 0.3)
    elif t == 'mesa':
        if s['modo'] == 'vibra':
            poe(baque(0.8), a - 1, 0.45)
            for q in (4, 26, 48): poe(vibra(0.52), a + q, 0.85, pan=0.35)
        elif s['modo'] == 'boletos':
            for w in s['pal']: poe(papelao(), pal(p, w), 0.4, pan=rng.uniform(-0.4, 0.4)); poe(chicote(0.25, 600, 3000), pal(p, w) - 6, 0.2)
        else:
            m19 = pal(p, s['carimbo']); mn = pal(p, s['check']); poe(chicote(0.3, 300, 2000), m19 - 7, 0.25); poe(carimbo(), m19 + 3, 0.8, pan=0.35); poe(caneta(), mn + 2, 0.55, pan=-0.1); poe(blip(700), mn + 9, 0.3, pan=-0.3)
    elif t == 'relogio':
        dr = b - a; poe(sobe(dr / 30), a, 0.38)
        for j in range(14): poe(tique(1800 + j * 60), a + 2 + dr * (1 - (1 - j / 14) ** 1.6), 0.22, pan=np.sin(j) * 0.4)
        poe(blip(520), a + 4, 0.25)
    elif t == 'visita':
        for j, q in enumerate(s['quem']): tq = pal(p, s['pal'][j]) - 3 if s.get('pal') else a + 12; poe(chicote(0.3, 300, 1800), tq - 4, 0.25); poe(blip(440 + 90 * j), tq + 4, 0.36, pan=-0.5 + 0.5 * j)
        if s.get('relogio'):
            k = 10
            while a + k < b: poe(tique(2400), a + k, 0.1); k += 5
    elif t == 'texto': poe(chicote(0.3, 300, 2400), a - 3, 0.35); poe(baque(1.1), a + 4, 0.8); poe(carimbo(), a + 5, 0.4); poe(blip(600), a + 16, 0.25) if s.get('sub') else None
    elif t == 'extrato':
        n = len(s['linhas']); poe(chicote(0.35, 400, 2600), a - 4, 0.28)
        for j in range(n): poe(tique(1900 - j * 120), a + 12 + j * max(10, (b - a) * 0.55 / n), 0.3); poe(moeda(), a + 13 + j * max(10, (b - a) * 0.55 / n), 0.1)
        poe(baque(1.0), a + round((b - a) * 0.62), 0.6); poe(erro(), a + round((b - a) * 0.62) + 2, 0.3)
    elif t == 'cartao':
        poe(chicote(0.5, 300, 2200), a - 2, 0.35); poe(papelao(), a + 10, 0.35); poe(carimbo(), a + 10, 0.45, pan=-0.4)
        for j in range(len(s['linhas'])):
            tq = min(round(p['falas'][j]['t'] * 30) if j < len(p['falas']) else 10 ** 9, a + 30 + j * 60); poe(caneta(0.22), tq + 2, 0.35, pan=-0.3); poe(blip(820, 0.07), tq + 6, 0.2, pan=-0.3)
    elif t == 'duplo':
        poe(chicote(0.3, 500, 2800), a - 4, 0.22, pan=0.4 if s['fala'] == 'g' else -0.4)
        if s.get('chave'): poe(blip(700), pal(p, 'chave'), 0.3, pan=0.4)
        if s.get('desliga'): poe(toque(), a + 34, 0.6); poe(ocupado(), a + 38, 0.4)
    elif t == 'sonho':
        it = s['item']; poe(harpa(), a - 2, 0.3)
        if it == 'carro': c, pn = carro(min(2.6, d)); poe(c, a + 4, 0.35); poe(blip(880), a + 10, 0.3, pan=0.4)
        if it == 'churrasco': poe(chapa(d), a, 0.5, pan=0.1)
        if it in ('praia', 'barco'): poe(mar(d + 0.3), a, 0.5)
        if it == 'audio': poe(blip(660), a + 8, 0.35, pan=0.3)
        if s.get('afunda'): poe(cai(1.1), a + 20, 0.4); poe(bolhas(), a + 50, 0.5); poe(carimbo(), a + 66, 0.6, pan=0.4)
    elif t == 'fim':
        poe(chicote(0.4, 300, 2400), a - 3, 0.3); poe(baque(0.9), a + 5, 0.5)
        for w in ('cinquenta', 'setenta', 'conta aqui', 'inscreve'):
            q = pal(p, w, -1)
            if q > a: poe(blip(640), q, 0.3)
fx = np.stack([L, R], 1); fx = np.tanh(fx * 1.2) / 1.2
# ---- trilhas por trecho (campo m), com ducking pela voz ----
voz, _ = sf.read(f'{pasta}/voz.wav', dtype='float32'); voz = np.pad(voz[:N], (0, max(0, N - len(voz))))
GAN = {'cotidiano': 0.5, 'tensao': 0.55, 'sonho': 0.5, 'reflexao': 0.62}; marcas = [(round(fa['t'] * 30) - 5, fa['m']) for fa in T['falas'] if 'm' in fa] + [(TOTQ, '')]
m = np.zeros((N, 2), np.float32)
for (a, nome), (b, _) in zip(marcas, marcas[1:]):
    if not nome: continue
    x, sr = sf.read(f'{mus}/{nome}.wav', dtype='float32'); assert sr == SR; n = min(int((b - a) / 30 * SR) + int(0.25 * SR), N - int(max(0, a) / 30 * SR)); base = x[:len(x) - int(1.5 * SR)]
    while len(x) < n: x = np.concatenate([x, base])
    i = int(max(0, a) / 30 * SR); m[i:i + n] += x[:n] * env(n, 0.35, 0.5)[:, None] * GAN[nome]
ev = np.sqrt(signal.sosfilt(signal.butter(1, 6, 'lowpass', fs=SR, output='sos'), voz ** 2).clip(0)); duck = 1 - 0.62 * np.clip(ev / 0.05, 0, 1)
duck = signal.sosfilt(signal.butter(1, 4, 'lowpass', fs=SR, output='sos'), duck); m *= duck[:, None]
mix = np.stack([voz, voz], 1) + m + fx * 0.36
mix *= np.minimum(1, (tot - np.arange(N) / SR) / 0.7)[:, None]; pico = np.abs(mix).max(); mix = mix / max(1.0, pico / 0.95)
sf.write(f'{pasta}/fx.wav', fx, SR, subtype='PCM_16'); sf.write('/tmp/bp_mix.wav', mix, SR, subtype='PCM_16')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', '/tmp/bp_mix.wav', '-af', 'loudnorm=I=-15:TP=-1.5:LRA=9', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', f'{pasta}/mix.m4a'], check=True)
print('ok pico', round(float(pico), 2), 'dur', round(tot, 2), 'planos', len(P))

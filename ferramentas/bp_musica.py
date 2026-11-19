# Trilhas do Brasileiro Padrão escritas em MIDI e tocadas com instrumentos amostrados (FluidSynth + FluidR3_GM, licença MIT).
# Uso: python3 ferramentas/bp_musica.py <saida>   -> cotidiano.wav (choro leve, 64 s) e tensao.wav (pizzicato, 32 s)
import sys, subprocess, random
from pathlib import Path
import mido
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True); SF = '/usr/share/sounds/sf2/FluidR3_GM.sf2'; TPB = 480
def salva(nome, bpm, trilhas, compassos):
    mid = mido.MidiFile(ticks_per_beat=TPB)
    for canal, prog, notas, extra in trilhas:
        ev = []
        for (t, n, d, v) in notas:
            ev.append((int(t * TPB), 1, n, v)); ev.append((int((t + d) * TPB), 0, n, 0))
        ev.sort(key=lambda e: (e[0], e[1])); tr = mido.MidiTrack(); mid.tracks.append(tr)
        if canal == 0: tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(bpm), time=0))
        if canal != 9: tr.append(mido.Message('program_change', channel=canal, program=prog, time=0))
        for cc, val in extra.items(): tr.append(mido.Message('control_change', channel=canal, control=cc, value=val, time=0))
        ult = 0
        for (tk, on, n, v) in ev:
            tr.append(mido.Message('note_on' if on else 'note_off', channel=canal, note=n, velocity=v, time=tk - ult)); ult = tk
    mid.save(str(out / f'{nome}.mid'))
    subprocess.run(['fluidsynth', '-ni', '-g', '0.9', '-R', '1', '-C', '0', '-r', '48000', '-F', str(out / f'{nome}_cru.wav'), SF, str(out / f'{nome}.mid')], check=True, stdout=subprocess.DEVNULL)
    dur = compassos * 4 * 60 / bpm
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(out / f'{nome}_cru.wav'), '-t', f'{dur + 1.5:.2f}', '-af', 'highpass=f=45,loudnorm=I=-20:TP=-2', '-ar', '48000', '-ac', '2', str(out / f'{nome}.wav')], check=True)
    (out / f'{nome}_cru.wav').unlink(); (out / f'{nome}.mid').unlink()
rnd = random.Random(11)
# ---------- cotidiano: choro/samba leve, 96 bpm, 16 compassos (2 voltas de 8) ----------
ACs = [('Am7', 45, [57, 60, 64, 67]), ('D9', 50, [54, 57, 60, 64]), ('Gmaj7', 43, [55, 59, 62, 66]), ('Cmaj7', 48, [55, 59, 60, 64]),
       ('F#m7b5', 42, [57, 60, 64, 66]), ('B7', 47, [57, 59, 63, 66]), ('Em7', 40, [55, 59, 62, 64]), ('E7', 40, [56, 59, 62, 64])]
viol, baixo, perc, flauta = [], [], [], []
RIT = [0, 0.75, 1.5, 2.5, 3.25]  # levada sincopada
MEL = {0: [(0.5, 76, .5), (1, 79, .5), (1.5, 76, .25), (2, 72, 1.2)], 2: [(0.5, 74, .5), (1, 78, .5), (1.5, 74, .25), (2, 71, 1.2)],
       4: [(0.5, 76, .5), (1, 72, .5), (1.5, 69, .5), (2.5, 72, .5), (3, 76, .7)], 6: [(0, 79, .5), (0.75, 76, .5), (1.5, 71, .5), (2, 76, 1.5)]}
for c in range(16):
    nome, bx, ac = ACs[c % 8]; t0 = c * 4
    for k, r in enumerate(RIT):
        for j, n in enumerate(ac): viol.append((t0 + r + j * 0.012, n, 0.42 if k % 2 else 0.6, rnd.randint(50, 66) - (8 if k % 2 else 0)))
    for r, n, d in [(0, bx, 1.4), (1.5, bx + 7, 0.45), (2, bx, 1.2), (3.5, bx + (7 if c % 2 else 5), 0.45)]: baixo.append((t0 + r, n - 12 if n > 47 else n, d, rnd.randint(74, 88)))
    for s in range(16):
        t = t0 + s * 0.25; perc.append((t, 82, 0.1, 44 if s % 4 == 0 else (30 if s % 2 == 0 else 22) + rnd.randint(0, 6)))   # ganzá
        if s in (0, 3, 6, 10, 12): perc.append((t, 54, 0.1, 40 + rnd.randint(0, 10)))                                   # pandeiro
        if s in (4, 12): perc.append((t, 37, 0.1, 46))                                                                   # aro
        if s in (0, 7, 10): perc.append((t, 64 if s else 63, 0.2, 38))                                                   # surdo/conga leve
    if c >= 8 and (c % 8) in MEL:
        for r, n, d in MEL[c % 8]: flauta.append((t0 + r, n, d, 62))
salva('cotidiano', 96, [(0, 24, viol, {91: 40, 7: 96}), (1, 32, baixo, {7: 104}), (9, 0, perc, {7: 84}), (2, 73, flauta, {91: 60, 7: 70})], 16)
# ---------- tensão: pizzicato + contrabaixo + bloco de madeira, 112 bpm, 15 compassos ----------
piz, grave, bl = [], [], []
OST = [57, 60, 64, 60, 57, 60, 65, 60]
for c in range(15):
    t0 = c * 4; sobe = (c // 4) % 2
    for s, n in enumerate(OST): piz.append((t0 + s * 0.5, n + (1 if sobe and s in (2, 6) else 0), 0.3, 58 + (10 if s % 4 == 0 else 0) + c))
    grave.append((t0, 33 if c % 4 < 3 else 32, 3.6, 70))
    for s in range(8): bl.append((t0 + s * 0.5, 76 if s % 2 == 0 else 77, 0.1, 40 if s % 2 == 0 else 28))
    if c % 4 == 3: bl.append((t0 + 3.5, 47, 0.4, 70)); bl.append((t0 + 3.75, 45, 0.4, 76))
salva('tensao', 112, [(0, 45, piz, {91: 50, 7: 100}), (1, 43, grave, {7: 78}), (9, 0, bl, {7: 80})], 15)
# ---------- sonho: samba animado, 118 bpm, 16 compassos ----------
cav, bx2, pc2, met = [], [], [], []
AS = [('C6', 48, [60, 64, 67, 69]), ('A7', 45, [61, 64, 67, 69]), ('Dm7', 50, [62, 65, 69, 72]), ('G7', 43, [59, 62, 65, 67])]
for c in range(16):
    nome, b0, ac = AS[c % 4]; t0 = c * 4
    for r in [0, 0.5, 1.25, 1.75, 2.5, 3.0, 3.5]:
        for j, n in enumerate(ac): cav.append((t0 + r + j * 0.008, n + 12, 0.2, rnd.randint(54, 70)))
    for r, n, d in [(0, b0, 0.9), (1.5, b0 + 7, 0.4), (2, b0 + 12, 0.9), (3.5, b0 + 7, 0.4)]: bx2.append((t0 + r, n - 12 if n > 50 else n, d, 90))
    for s_ in range(16):
        t = t0 + s_ * 0.25; pc2.append((t, 82, 0.1, 50 if s_ % 4 == 0 else 30 + rnd.randint(0, 8)))
        if s_ in (0, 3, 6, 8, 11, 14): pc2.append((t, 54, 0.1, 52))
        if s_ in (0, 6, 8, 14): pc2.append((t, 36, 0.2, 70))
        if s_ in (4, 10, 12): pc2.append((t, 62 if s_ != 10 else 63, 0.15, 56))
    if c % 4 == 3:
        for r, n in [(2, 67), (2.5, 71), (3, 74), (3.5, 79)]: met.append((t0 + r, n, 0.3, 80))
    if c % 4 == 0 and c:
        for n in (72, 76, 79): met.append((t0, n, 0.5, 84))
salva('sonho', 118, [(0, 25, cav, {91: 30, 7: 92}), (1, 32, bx2, {7: 104}), (9, 0, pc2, {7: 92}), (2, 61, met, {91: 50, 7: 76})], 16)
# ---------- reflexão: piano elétrico e cordas, 72 bpm, 12 compassos ----------
ep, cd, bx3 = [], [], []
AR = [('Fmaj7', 41, [57, 60, 64, 65]), ('G6', 43, [59, 62, 64, 67]), ('Em7', 40, [59, 62, 64, 67]), ('Am7', 45, [57, 60, 64, 67])]
for c in range(12):
    nome, b0, ac = AR[c % 4]; t0 = c * 4
    for j, n in enumerate(ac): ep.append((t0 + j * 0.5, n, 2.6 - j * 0.4, 52 - j * 3)); cd.append((t0, n + 12, 3.8, 34))
    ep.append((t0 + 2.5, ac[2] + 12, 1.2, 46)); ep.append((t0 + 3.25, ac[1] + 12, 0.7, 40)); bx3.append((t0, b0, 3.6, 70))
salva('reflexao', 72, [(0, 4, ep, {91: 70, 7: 96}), (1, 48, cd, {91: 80, 7: 62}), (2, 32, bx3, {7: 84})], 12)
print('ok', [p.name for p in out.iterdir()])

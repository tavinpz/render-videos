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
print('ok', [p.name for p in out.iterdir()])

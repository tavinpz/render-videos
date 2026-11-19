# Monta a faixa de voz do Brasileiro Padrão a partir de um arquivo por fala (f00.wav, f01.wav...).
# Uso: python3 ferramentas/bp_montar.py public/bp/t2 <pasta_das_falas>   -> voz.wav (48k), tempos.json (falas + envelope por quadro)
import json, sys, subprocess, wave
import numpy as np, soundfile as sf
pasta, dirf = sys.argv[1].rstrip('/'), sys.argv[2].rstrip('/'); SR = 48000
# tratamento por personagem: narrador encorpado e seco; Valdir mais grave e perto; Dona Neide mais clara
CAD = {'n': 'highpass=f=70,equalizer=f=160:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.2:g=1.5,acompressor=threshold=-22dB:ratio=3:attack=6:release=90:makeup=3',
       'v': 'highpass=f=65,equalizer=f=140:t=q:w=1:g=3,equalizer=f=2600:t=q:w=1.2:g=1,acompressor=threshold=-22dB:ratio=3.5:attack=6:release=90:makeup=3,aecho=0.8:0.25:18:0.12',
       'g': 'highpass=f=160,lowpass=f=3600,equalizer=f=1800:t=q:w=1:g=4,acompressor=threshold=-24dB:ratio=5:attack=4:release=60:makeup=4',
       'e': 'highpass=f=100,equalizer=f=3400:t=q:w=1.2:g=1.5,acompressor=threshold=-22dB:ratio=3:attack=6:release=90:makeup=3,aecho=0.8:0.25:22:0.08',
       'l': 'highpass=f=60,equalizer=f=130:t=q:w=1:g=3,acompressor=threshold=-22dB:ratio=3.5:attack=6:release=90:makeup=3,aecho=0.8:0.3:30:0.14',
       'd': 'highpass=f=110,equalizer=f=3800:t=q:w=1.2:g=2,acompressor=threshold=-22dB:ratio=3:attack=6:release=90:makeup=3,aecho=0.8:0.25:22:0.1'}
falas = json.load(open(f'{pasta}/roteiro.json'))['falas']; t = 0.7; partes = [np.zeros(int(SR * t), np.float32)]; saida = []
for i, f in enumerate(falas):
    tmp = f'/tmp/m_{i}.wav'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{dirf}/f{i:02d}.wav', '-af', CAD[f['q']] + ',loudnorm=I=-17:TP=-2:LRA=7', '-ar', str(SR), '-ac', '1', tmp], check=True)
    a, _ = sf.read(tmp, dtype='float32'); idx = np.where(np.abs(a) > 0.012)[0]; a = a[max(0, idx[0] - 500):min(len(a), idx[-1] + 2600)]
    a[:240] *= np.linspace(0, 1, 240); a[-1200:] *= np.linspace(1, 0, 1200)
    saida.append({'c': f['c'], 'q': f['q'], 't': round(t, 3), 'd': round(len(a) / SR, 3), 'txt': f['txt'], **{k: f[k] for k in ('s', 'hud', 'm') if k in f}}); partes.append(a); t += len(a) / SR
    pausa = 0.5 + f.get('p', 0); partes.append(np.zeros(int(SR * pausa), np.float32)); t += pausa
cauda = falas[-1].get('fim', 1.4); partes.append(np.zeros(int(SR * cauda), np.float32)); t += cauda
x = np.clip(np.concatenate(partes), -1, 1); sf.write(f'{pasta}/voz.wav', x, SR, subtype='PCM_16')
n = int(np.ceil(t * 30)); env = [float(np.sqrt(np.mean(x[int(i / 30 * SR):int((i + 1) / 30 * SR)] ** 2))) for i in range(n)]
m = np.percentile([e for e in env if e > 0.005] or [1], 92); env = [round(min(1.0, e / m), 2) for e in env]
json.dump({'total': round(t, 3), 'falas': saida, 'env': env}, open(f'{pasta}/tempos.json', 'w'), ensure_ascii=False)
print('total', round(t, 2), 's =', f'{int(t // 60)}:{int(t % 60):02d}')

# Acabamento do Mãe Mandou (sem re-render): zoom seco nas falas sem corte (mais eventos), loop (os últimos 0,45 s
# repetem o 1º quadro), som novo e legenda queimada. Uso: python3 ferramentas/mm_final.py <ep> <video_limpo.mp4> <saida.mp4>
import json, sys, subprocess
ep, src, out = sys.argv[1:4]
T = json.load(open(f'mae/src/eps/{ep}_tempos.json')); E = json.load(open(f'public/mm/{ep}/eventos.json'))
TOT = T['total']; LOOP = 0.45
cortes = [p['a'] for p in E['planos']]
def perto(t, d=0.35): return any(abs(t - c) < d for c in cortes)
viradas = []
for f in T['falas']:
    if not perto(f['a']): viradas.append(f['a'] - 0.03)
    if f['b'] - f['a'] > 2.2:
        m = (f['a'] + f['b']) / 2
        if not perto(m): viradas.append(m)
for p in E['planos']:
    t = p['a'] + 0.6
    while t < p['b'] - 0.45:
        if not any(abs(t - v) < 0.5 for v in viradas): viradas.append(t)
        t += 1.05
viradas = sorted(v for v in viradas if 0.3 < v < TOT - LOOP - 0.2)
# o estado do zoom volta a 1 em todo corte, e alterna nas viradas
blocos, z, t0 = [], False, 0.0
marcas = sorted([(c, 'c') for c in cortes] + [(v, 'v') for v in viradas])
for t, k in marcas:
    if k == 'c':
        if z: blocos.append((t0, t)); z = False
    else:
        if z: blocos.append((t0, t)); z = False
        else: t0, z = t, True
if z: blocos.append((t0, TOT - LOOP))
expr = '1+0.12*(' + '+'.join(f'between(it,{a:.3f},{b - 0.001:.3f})' for a, b in blocos) + ')' if blocos else '1'
vf = (f"[0:v]split[a][b];[a]trim=0:{TOT - LOOP:.3f},setpts=PTS-STARTPTS[m];[b]trim=0:{LOOP},setpts=PTS-STARTPTS[h];[m][h]concat=n=2:v=1[c];"
      f"[c]zoompan=z='{expr}':x='iw/2-iw/zoom/2':y='ih*0.62-ih*0.62/zoom':d=1:s=1080x1920:fps=30,"
      f"ass=public/mm/{ep}/leg.ass:fontsdir=mae/fontes[v]")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-i', f'public/mm/{ep}/mix.m4a', '-filter_complex', vf, '-map', '[v]', '-map', '1:a',
                '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-t', f'{TOT:.3f}', '-movflags', '+faststart', out], check=True)
print(out, len(viradas), 'viradas,', len(blocos), 'blocos de zoom')

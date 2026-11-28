# tempos estimados (antes da voz chegar): 3,2 palavras/s, 0,08 s entre falas
import json, sys
for ep in sys.argv[1:]:
    r = json.load(open(f'public/mm/{ep}/roteiro.json'))['falas']; t = 0.05; out = []
    for i, f in enumerate(r):
        d = max(0.7, len(f['txt'].split()) / 3.2); out.append({'i': i, 'q': f['q'], 'a': round(t, 3), 'b': round(t + d, 3), 'txt': f['txt']}); t += d + 0.08
    json.dump({'total': round(t + 0.4, 3), 'falas': out}, open(f'mae/src/eps/{ep}_tempos.json', 'w'), ensure_ascii=False, indent=1)
    print(ep, round(t, 1))

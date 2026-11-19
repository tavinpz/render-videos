# Voz do Brasileiro Padrão no GitHub Actions: Chatterbox Multilingual (MIT, roda local em CPU), com clonagem de timbre
# a partir de referências sintéticas (public/bp/refs). Gera N tomadas por fala, transcreve cada uma (faster-whisper)
# e fica com a que bate melhor com o texto. Uso: python3 ferramentas/bp_voz.py public/bp/t2 <fatia> <fatias> <saida>
import json, sys, os, re, shutil, unicodedata, difflib, time
from pathlib import Path
import numpy as np, torch, soundfile as sf
pasta, K, NK, saida = sys.argv[1].rstrip('/'), int(sys.argv[2]), int(sys.argv[3]), Path(sys.argv[4]); saida.mkdir(parents=True, exist_ok=True)
TOMADAS = int(os.environ.get('TOMADAS', '3')); torch.set_num_threads(os.cpu_count() or 4)
from huggingface_hub import snapshot_download
from chatterbox.mtl_tts import ChatterboxMultilingualTTS, REPO_ID
info = {}
def carrega():
    geral = Path(snapshot_download(REPO_ID, allow_patterns=["ve.pt", "t3_mtl23ls_v3.safetensors", "s3gen.pt", "grapheme_mtl_merged_expanded_v1.json", "conds.pt", "Cangjie5_TC.json"]))
    try:  # finetune dedicado de português do Brasil por cima dos arquivos gerais
        br = Path(snapshot_download("ResembleAI/Chatterbox-Multilingual-pt-br")); arqs = sorted(p.name for p in br.iterdir()); info['pt_br_arquivos'] = arqs
        junto = Path('/tmp/cb_ptbr'); shutil.rmtree(junto, ignore_errors=True); junto.mkdir()
        for p in geral.iterdir(): os.symlink(p.resolve(), junto / p.name)
        for p in br.iterdir():
            if p.is_file() or p.is_symlink():
                (junto / p.name).unlink(missing_ok=True); os.symlink(p.resolve(), junto / p.name)
        print('LEIAME PT-BR\n' + (br / 'README.md').read_text()[:3500], flush=True)
        if os.environ.get('S3GEN', 'pack') == 'pack' and (br / 's3gen_v3.pt').exists():  # vocoder que acompanha o finetune
            (junto / 's3gen.pt').unlink(missing_ok=True); os.symlink((br / 's3gen_v3.pt').resolve(), junto / 's3gen.pt'); info['s3gen'] = 'pack v3'
        t3 = [a for a in arqs if a.endswith('.safetensors') and 't3' in a.lower()] or [a for a in arqs if a.endswith('.safetensors')]
        m = ChatterboxMultilingualTTS.from_local(junto, 'cpu', t3_model=t3[0]); info['modelo'] = 'pt-br:' + t3[0]; return m
    except Exception as e:
        info['pt_br_erro'] = repr(e)[:300]
        m = ChatterboxMultilingualTTS.from_local(geral, 'cpu', t3_model='t3_mtl23ls_v3.safetensors'); info['modelo'] = 'geral-v3'; return m
m = carrega(); print('MODELO', info, flush=True)
from faster_whisper import WhisperModel
asr = WhisperModel('small', device='cpu', compute_type='int8')
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', s)).strip()
NUM = {'vinte e uma e doze': '21 12', 'tres e quarenta': '3 40', 'dezenove': '19', 'trinta e sete': '37', 'doze': '12', 'cinquenta': '50', 'seis': '6'}
def chave(s):
    s = norm(s)
    for a, b in NUM.items(): s = s.replace(a, b)
    return s.replace('milhoes', 'milhao').replace(':', ' ')
falas = json.load(open(f'{pasta}/roteiro.json'))['falas']; rel = []
for i, f in enumerate(falas):
    if i % NK != K: continue
    ref = f"public/bp/refs/{f['q']}.flac"; melhor = None
    for t in range(TOMADAS):
        torch.manual_seed(1000 * i + 17 * t + 3); t0 = time.time()
        w = m.generate(f['txt'], language_id='pt', audio_prompt_path=ref, exaggeration=f.get('ex', 0.5), cfg_weight=f.get('cfg', 0.45), temperature=0.75 if t == 0 else 0.85)
        a = w.squeeze().cpu().numpy().astype(np.float32); tmp = f'/tmp/t_{i}_{t}.wav'; sf.write(tmp, a, m.sr)
        segs, _ = asr.transcribe(tmp, language='pt', beam_size=3); ouv = ' '.join(s.text for s in segs)
        sim = difflib.SequenceMatcher(None, chave(f['txt']), chave(ouv)).ratio(); dur = len(a) / m.sr
        esp = max(0.7, len(f['txt']) / 15.5); pen = max(0, abs(dur - esp) / esp - 0.45) * 0.5
        nota = sim - pen; print(f"{i} t{t} sim={sim:.2f} dur={dur:.1f}s esp={esp:.1f}s nota={nota:.2f} gen={time.time()-t0:.0f}s | {ouv.strip()}", flush=True)
        if melhor is None or nota > melhor['nota']: melhor = {'i': i, 'c': f['c'], 'q': f['q'], 'tomada': t, 'sim': round(sim, 3), 'dur': round(dur, 2), 'nota': round(nota, 3), 'ouvido': ouv.strip(), 'arq': tmp}
        if sim > 0.97 and pen == 0: break
    shutil.copy(melhor.pop('arq'), saida / f'f{i:02d}.wav'); rel.append(melhor)
json.dump({'info': info, 'sr': m.sr, 'falas': rel}, open(saida / f'rel_{K}.json', 'w'), ensure_ascii=False, indent=1)

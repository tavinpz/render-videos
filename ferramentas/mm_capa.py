# Capa do Short: um quadro forte do vídeo limpo + o título em 2-3 linhas (Baloo 2 ExtraBold, contorno grosso).
# Uso: python3 ferramentas/mm_capa.py <video_limpo.mp4> <segundo> "<linha1|linha2|linha3>" <saida.jpg> [palavra_amarela]
import sys, subprocess
from PIL import Image, ImageDraw, ImageFont
vid, seg, linhas, out = sys.argv[1], sys.argv[2], sys.argv[3].split('|'), sys.argv[4]
amarela = sys.argv[5].upper() if len(sys.argv) > 5 else ''
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', seg, '-i', vid, '-frames:v', '1', '/tmp/_capa.png'], check=True)
im = Image.open('/tmp/_capa.png').convert('RGB').resize((1080, 1920))
g = ImageDraw.Draw(im); F = ImageFont.truetype('mae/fontes/Baloo2-ExtraBold.ttf', 112)
y = 330
for ln in linhas:
    ln = ln.upper(); sz = 112; F = ImageFont.truetype('mae/fontes/Baloo2-ExtraBold.ttf', sz)
    while g.textlength(ln, font=F) > 940: sz -= 4; F = ImageFont.truetype('mae/fontes/Baloo2-ExtraBold.ttf', sz)
    w = g.textlength(ln, font=F); x = (1080 - w) / 2
    cor = (255, 216, 54) if amarela and amarela in ln else (255, 255, 255)
    g.text((x, y), ln, font=F, fill=cor, stroke_width=12, stroke_fill=(20, 16, 24)); y += 128
im.save(out, quality=90)
print(out)

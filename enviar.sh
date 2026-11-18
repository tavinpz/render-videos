#!/bin/bash
# uso: ./enviar.sh <id> [maquinas]  — copia data.json + áudio + artes do atlas-motion e dispara o render no GitHub
set -e
ID=$1; N=${2:-20}; A=/home/claude/estudio-longo/atlas-motion; R=/home/claude/render-videos
cd $R
mkdir -p public/l/$ID fila
cp $A/public/l/$ID/data.json public/l/$ID/
ffmpeg -y -loglevel error -i $A/public/l/$ID/mix.wav -c:a aac -b:a 256k public/l/$ID/mix.m4a
rm -rf public/arte && cp -r $A/public/arte public/arte
cp $A/src/arte/* src/arte/
printf "$N\n# 1ª linha = número de máquinas. Mude e dê push para renderizar de novo. ($(date +%FT%T))\n" > fila/$ID.txt
git add -A && git commit -qm "render $ID ($N máquinas)" && git push -q origin main
echo "disparado $ID"

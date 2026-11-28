#!/bin/bash
# gera a legenda do episódio com as palavras-chave e o CTA certos, e tira o CTA nos 0,45 s do loop
e=$1
case $e in
 e06) K='casa|tem|hambúrguer|boneco|videogame|praia|clebinho|legal'; C='COMENTA: TINHA EM CASA';;
 e07) K='já|vou|metro|três|quarenta|vó|teto|telhado'; C='COMENTA: QUANTOS JÁ VOU?';;
 e08) K='chuva|garoa|temporal|granizo|choro|engole|arco-íris'; C='COMENTA: CHUVA';;
esac
python3 ferramentas/mm_legenda.py $e "$K" "$C" && python3 - $e <<'P'
import json, sys
e=sys.argv[1]; p=f'public/mm/{e}/leg.ass'; s=open(p).read().rstrip('\n').split('\n')
T=json.load(open(f'mae/src/eps/{e}_tempos.json'))['total']
def ts(t): h=int(t//3600); m=int(t%3600//60); x=t%60; return f'{h}:{m:02d}:{x:05.2f}'
s[-1]=s[-1].replace(ts(T), ts(T-0.45)); open(p,'w').write('\n'.join(s)+'\n')
P

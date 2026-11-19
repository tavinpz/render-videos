import { continueRender, delayRender, staticFile } from 'remotion';

// As fontes do teste aprovado, embutidas para o vídeo sair igual em qualquer máquina (fila do render-videos incluída).
// Archivo Black e Comic Relief: licença OFL. Liberation Mono: licença OFL.
const FONTES: [string, string][] = [
  ['Arial Black', 'bunker/fontes/ArchivoBlack-Regular.ttf'],
  ['Comic Sans MS', 'bunker/fontes/ComicRelief-Bold.ttf'],
  ['Courier New', 'bunker/fontes/LiberationMono-Bold.ttf'],
];
if (typeof document !== 'undefined') {
  const h = delayRender('fontes do bunker');
  Promise.all(FONTES.map(([nome, arq]) => new FontFace(nome, `url(${staticFile(arq)})`, { weight: '100 900' }).load().then((f) => (document as any).fonts.add(f))))
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
}

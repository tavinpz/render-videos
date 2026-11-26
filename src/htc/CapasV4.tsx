// Hard to Copy capas v4 (26/11): molde do Tradeoff Layer ("Why No One Can Copy ASML?" 2 mi): fundo claro, NOME da empresa
// gigante e reto (texto, não logotipo), 1 objeto grande e claro, 1 marca de tensão (X, ?, cadeado). Um padrão só para o canal.
import React from 'react';
import { Raios, K, TINTA, Chip, Fabrica, Grana, Cadeado, Cadeira, Canhao, Estouro, Feixe, Saleiro, Xis, Interroga } from './Capas';
import { Espelho } from './Thumbs';
import '@fontsource/anton/400.css';

const AN = 'Anton, Impact, sans-serif';
const Nome: React.FC<{ t: string; y?: number; s?: number; c?: string }> = ({ t, y = 190, s = 200, c = K.azulP }) => (
  <text x={60} y={y} fontFamily={AN} fontSize={s} fill={c} stroke={TINTA} strokeWidth={s * 0.07} paintOrder="stroke" strokeLinejoin="round" letterSpacing={2}>{t}</text>
);
const Sub: React.FC<{ t: string; y?: number; s?: number }> = ({ t, y = 290, s = 74 }) => (
  <g><text x={64} y={y} fontFamily={AN} fontSize={s} fill={TINTA}>{t}</text></g>
);
const Fundo: React.FC = () => <Raios cx={900} cy={430} c1="#FFF4DC" c2="#FFE3A8" />;

const V: Record<string, () => React.ReactElement> = {
  '1': () => (<><Fundo /><Espelho cx={960} cy={300} k={1.35} /><Xis x={760} y={520} k={0.9} />
    <Nome t="ZEISS" /><Sub t="THE MIRROR ASML" /><Sub t="CAN'T MAKE" y={370} /></>),
  '2': () => (<><Fundo /><Fabrica x={1000} y={360} k={0.95} /><Grana x={800} y={560} k={0.85} />
    <Nome t="TSMC" /><Sub t="$265 BILLION" /><Sub t="TO COPY ITSELF" y={370} /></>),
  '3': () => (<><Fundo /><Cadeira x={860} y={380} k={1.0} /><Chip x={1140} y={400} k={0.85} /><Cadeado x={1150} y={540} k={0.6} /><Interroga x={860} y={250} s={240} />
    <Nome t="NVIDIA" /><Sub t="LOST ITS FOUNDER." /><Sub t="NOT THIS." y={370} /></>),
  '4': () => (<><Fundo /><Canhao x={820} y={390} k={1.05} /><Feixe x1={960} y1={360} x2={1170} y2={290} /><Estouro x={1160} y={290} k={0.8} />
    <Nome t="TRUMPF" /><Sub t="THE LASER ASML" /><Sub t="CAN'T BUILD" y={370} /></>),
  '5': () => (<><Fundo /><Saleiro x={930} y={440} k={1.0} /><Chip x={1160} y={450} k={0.85} t="AI" />
    <Nome t="AJINOMOTO" s={150} /><Sub t="THE SEASONING COMPANY" /><Sub t="INSIDE EVERY AI CHIP" y={370} /></>),
};
export const HTCV4: React.FC<{ v: string }> = ({ v }) => <svg viewBox="0 0 1280 720" width={1280} height={720}>{(V[v] || V['1'])()}</svg>;

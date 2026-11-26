// Hard to Copy capas v4 (26/11): molde do Tradeoff Layer ("Why No One Can Copy ASML?" 2 mi): fundo claro, NOME da empresa
// gigante e reto (texto, não logotipo), 1 objeto grande e claro, 1 marca de tensão (X, ?, cadeado). Um padrão só para o canal.
import React from 'react';
import { Raios, K, TINTA, Chip, Fabrica, Grana, Cadeado, Cadeira, Canhao, Estouro, Feixe, Saleiro, Xis, Interroga, Etiqueta, Globo, Camadas } from './Capas';
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
  '1b': () => (<><Fundo /><Espelho cx={960} cy={300} k={1.35} />
    <Nome t="0.1 mm" c={K.verm} /><Sub t="THE BIGGEST BUMP" /><Sub t="ON A MIRROR THIS SIZE" y={370} /></>),
  '1c': () => (<><Fundo /><Espelho cx={1000} cy={300} k={1.2} /><Grana x={760} y={560} k={0.8} /><Xis x={760} y={560} k={0.8} />
    <Nome t="NOT FOR SALE" s={150} /><Sub t="NOT EVEN TO ASML" /></>),
  '2b': () => (<><Fundo /><Chip x={1050} y={340} k={1.1} t="2nm" /><Cadeado x={1050} y={520} k={0.75} />
    <Nome t="TAIWAN ONLY" s={150} /><Sub t="WHY TSMC'S BEST CHIPS" /><Sub t="NEVER LEAVE" y={370} /></>),
  '2c': () => (<><Fundo /><Fabrica x={1000} y={380} k={0.9} /><Interroga x={760} y={420} s={300} />
    <Nome t="$265B" c={K.verm} /><Sub t="AND STILL" /><Sub t="CAN'T COPY ITSELF" y={370} /></>),
  '3b': () => (<><Fundo /><Chip x={1050} y={340} k={1.1} /><Cadeado x={1060} y={520} k={0.75} />
    <Nome t="NOBODY" /><Sub t="LEAVES NVIDIA." /><Sub t="HERE'S WHY" y={370} /></>),
  '3c': () => (<><Fundo /><Chip x={1050} y={430} k={1.1} /><Etiqueta x={800} y={540} t="$0" />
    <Nome t="FREE" c={K.verm} /><Sub t="IS THE TRAP" /></>),
  '4b': () => (<><Fundo /><Canhao x={820} y={390} k={1.05} /><Feixe x1={960} y1={360} x2={1170} y2={290} /><Estouro x={1160} y={290} k={0.8} />
    <Nome t="50,000" c={K.verm} /><Sub t="LASER SHOTS" /><Sub t="EVERY SECOND" y={370} /></>),
  '4c': () => (<><Fundo /><Globo x={1000} y={420} k={1.1} />
    <Nome t="ONLY 1" c={K.verm} /><Sub t="COMPANY ON EARTH" /><Sub t="MAKES THIS LASER" y={370} /></>),
  '5b': () => (<><Fundo /><Camadas x={1000} y={440} k={1.2} /><Chip x={1000} y={300} k={0.7} t="AI" />
    <Nome t="95%" c={K.verm} /><Sub t="OF AI CHIPS NEED" /><Sub t="ONE FOOD COMPANY" y={370} /></>),
  '5c': () => (<><Fundo /><Saleiro x={930} y={440} k={1.0} /><Interroga x={1160} y={420} s={300} />
    <Nome t="NVIDIA" /><Sub t="NEEDS A SEASONING" /><Sub t="COMPANY?" y={370} /></>),
};
export const HTCV4: React.FC<{ v: string }> = ({ v }) => <svg viewBox="0 0 1280 720" width={1280} height={720}>{(V[v] || V['1'])()}</svg>;

import React from 'react';
import '@fontsource/inter/900.css';

// Hard to Copy: capas 1280×720 do hc002 em diante (HTCThumb com v = "02a", "03b"...).
// Padrão tirado das capas que mais renderam no nicho (Tradeoff Layer, conferido de novo em 18/11/2026): fundo claro e saturado,
// traço preto grosso, 1 a 3 palavras gigantes com contorno e sombra, um objeto concreto e um sinal simples (X, "?", seta, rachadura).
// Sem logotipo e sem rosto. Cada capa de um mesmo vídeo usa composição diferente das outras.
export const W = 1280, H = 720, TINTA = '#101418', F = '"Inter", sans-serif';
export const K = { ceu: '#2F7BE8', ceu2: '#7DB8FF', creme: '#FFF4DC', creme2: '#FFE3A8', verm: '#F0392B', amar: '#FFD23F', menta: '#39D98A', branco: '#FFFFFF', azulP: '#1B4FB8', noite: '#13264F', noite2: '#1F3F82', verde: '#1FA868', verde2: '#39D98A', roxo: '#6B3FD9', roxo2: '#9A78FF', laranja: '#FF8A2A', cinza: '#B9C4D2', cinzaE: '#5B6B7E' };
const S = { stroke: TINTA, strokeWidth: 9, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export const Pal: React.FC<{ x: number; y: number; t: string; s?: number; c?: string; rot?: number; anc?: 'start' | 'middle' | 'end' }> = ({ x, y, t, s = 170, c = K.branco, rot = -4, anc = 'start' }) => (
  <g transform={`rotate(${rot} ${x} ${y})`} fontFamily={F} fontWeight={900} fontSize={s} letterSpacing={-s * 0.03} textAnchor={anc} fontStyle="italic">
    <text x={x + s * 0.05} y={y + s * 0.06} fill={TINTA} stroke={TINTA} strokeWidth={s * 0.17} strokeLinejoin="round">{t}</text>
    <text x={x} y={y} fill={c} stroke={TINTA} strokeWidth={s * 0.15} strokeLinejoin="round" paintOrder="stroke">{t}</text>
  </g>
);
export const Raios: React.FC<{ cx: number; cy: number; c1: string; c2: string }> = ({ cx, cy, c1, c2 }) => (
  <g><rect width={W} height={H} fill={c1} />{Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2, b = a + Math.PI / 12; return <path key={i} d={`M ${cx},${cy} L ${cx + Math.cos(a) * 1800},${cy + Math.sin(a) * 1800} L ${cx + Math.cos(b) * 1800},${cy + Math.sin(b) * 1800} Z`} fill={c2} opacity={0.55} />; })}</g>
);
const G: React.FC<{ x: number; y: number; k?: number; rot?: number; children: React.ReactNode }> = ({ x, y, k = 1, rot = 0, children }) => <g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} {...S}>{children}</g>;
export const Xis: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (<g transform={`translate(${x},${y}) scale(${k})`}><path d="M -90,-90 L 90,90 M 90,-90 L -90,90" stroke={TINTA} strokeWidth={62} strokeLinecap="round" /><path d="M -90,-90 L 90,90 M 90,-90 L -90,90" stroke={K.verm} strokeWidth={42} strokeLinecap="round" /></g>);
export const Interroga: React.FC<{ x: number; y: number; s?: number; c?: string; rot?: number }> = ({ x, y, s = 300, c = K.amar, rot = 8 }) => (<g transform={`rotate(${rot} ${x} ${y})`} fontFamily={F} fontWeight={900} fontSize={s} textAnchor="middle"><text x={x + 8} y={y + 10} fill={TINTA} stroke={TINTA} strokeWidth={s * 0.16} strokeLinejoin="round">?</text><text x={x} y={y} fill={c} stroke={TINTA} strokeWidth={s * 0.1} strokeLinejoin="round" paintOrder="stroke">?</text></g>);
// chip quadrado com pinos e um "miolo" colorido
export const Chip: React.FC<{ x: number; y: number; k?: number; rot?: number; c?: string; t?: string }> = ({ x, y, k = 1, rot = 0, c = K.menta, t }) => (
  <G x={x} y={y} k={k} rot={rot}>
    {Array.from({ length: 6 }, (_, i) => <g key={i} strokeWidth={8}><rect x={-112 + i * 38} y={-150} width={18} height={40} fill={K.amar} /><rect x={-112 + i * 38} y={110} width={18} height={40} fill={K.amar} /><rect x={-150} y={-112 + i * 38} width={40} height={18} fill={K.amar} /><rect x={110} y={-112 + i * 38} width={40} height={18} fill={K.amar} /></g>)}
    <rect x={-120} y={-120} width={240} height={240} rx={18} fill="#2B3442" /><rect x={-78} y={-78} width={156} height={156} rx={10} fill={c} />
    <path d="M -60,-40 Q -20,-70 30,-62" fill="none" stroke={K.branco} strokeWidth={12} opacity={0.8} />
    {t && <text x={0} y={22} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill={TINTA} stroke="none">{t}</text>}
  </G>
);
// fábrica: galpão com telhado dente de serra e chaminés
export const Fabrica: React.FC<{ x: number; y: number; k?: number; c?: string }> = ({ x, y, k = 1, c = K.cinza }) => (
  <G x={x} y={y} k={k}>
    <rect x={150} y={-250} width={44} height={170} fill={K.cinzaE} /><rect x={220} y={-210} width={44} height={130} fill={K.cinzaE} />
    <path d="M -260,150 L -260,-60 L -130,-150 L -130,-60 L 0,-150 L 0,-60 L 130,-150 L 130,-60 L 290,-60 L 290,150 Z" fill={c} />
    {[-210, -80, 50, 180].map((wx) => <rect key={wx} x={wx} y={10} width={70} height={56} fill={K.amar} strokeWidth={7} />)}
    <rect x={-40} y={86} width={90} height={64} fill={K.cinzaE} strokeWidth={7} />
  </G>
);
// avião de carga visto de lado
export const Aviao: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = -12 }) => (
  <G x={x} y={y} k={k} rot={rot}>
    <path d="M -30,10 L -140,110 L -80,110 L 60,20 Z" fill={K.cinza} /><path d="M -150,-20 L -200,-110 L -150,-110 L -90,-26 Z" fill={K.verm} />
    <path d="M -220,-10 Q -220,-44 -150,-44 L 150,-44 Q 240,-30 250,0 Q 240,34 150,40 L -150,40 Q -220,34 -220,-10 Z" fill={K.branco} />
    <path d="M 160,-30 Q 215,-22 228,-4 L 170,-4 Z" fill="#3BA7FF" strokeWidth={6} />
    {[-110, -50, 10, 70].map((wx) => <circle key={wx} cx={wx} cy={-8} r={11} fill="#3BA7FF" strokeWidth={5} />)}
    <path d="M 10,24 L -90,150 L -20,150 L 110,30 Z" fill={K.cinza} />
  </G>
);
// maço de dinheiro com cifrão
export const Grana: React.FC<{ x: number; y: number; k?: number; rot?: number; n?: number }> = ({ x, y, k = 1, rot = -8, n = 4 }) => (
  <G x={x} y={y} k={k} rot={rot}>
    {Array.from({ length: n }, (_, i) => <rect key={i} x={-190 + i * 8} y={40 - i * 46} width={380} height={56} rx={8} fill={i % 2 ? '#2FBF71' : '#39D98A'} />)}
    <circle cx={0} cy={40 - (n - 1) * 46 + 28} r={34} fill={K.creme} strokeWidth={7} /><text x={0} y={40 - (n - 1) * 46 + 48} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={54} fill={TINTA} stroke="none">$</text>
  </G>
);
// lâmina de silício (disco quadriculado)
export const Lamina: React.FC<{ x: number; y: number; k?: number; rot?: number }> = ({ x, y, k = 1, rot = 0 }) => (
  <G x={x} y={y} k={k} rot={rot}>
    <ellipse cx={0} cy={0} rx={200} ry={200} fill="#8FD3FF" />
    <clipPath id={`lam${x}${y}`}><ellipse cx={0} cy={0} rx={186} ry={186} /></clipPath>
    <g clipPath={`url(#lam${x}${y})`} strokeWidth={5}>{Array.from({ length: 9 }, (_, i) => <g key={i}><line x1={-200} y1={-160 + i * 40} x2={200} y2={-160 + i * 40} /><line x1={-160 + i * 40} y1={-200} x2={-160 + i * 40} y2={200} /></g>)}<path d="M -200,-60 L 40,-200 L 110,-200 L -200,-10 Z" fill={K.branco} opacity={0.55} stroke="none" /></g>
  </G>
);
// planta (blueprint) riscada com X vermelho
export const PlantaX: React.FC<{ x: number; y: number; k?: number; rot?: number; children?: React.ReactNode }> = ({ x, y, k = 1, rot = -7, children }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} strokeLinejoin="round">
    <rect x={-210} y={-150} width={420} height={300} rx={10} fill={K.azulP} stroke={TINTA} strokeWidth={9} />
    {Array.from({ length: 7 }, (_, i) => <line key={'v' + i} x1={-210 + (i + 1) * 52.5} y1={-150} x2={-210 + (i + 1) * 52.5} y2={150} stroke={K.branco} strokeWidth={2} opacity={0.3} />)}
    {Array.from({ length: 5 }, (_, i) => <line key={'h' + i} x1={-210} y1={-150 + (i + 1) * 50} x2={210} y2={-150 + (i + 1) * 50} stroke={K.branco} strokeWidth={2} opacity={0.3} />)}
    <g fill="none" stroke={K.branco} strokeWidth={6} strokeDasharray="14 10">{children}</g>
    <Xis x={0} y={0} k={1.25} />
  </g>
);

const C02a: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={900} cy={430} c1={K.ceu} c2={K.ceu2} />
    <rect x={0} y={600} width={W} height={120} fill="#E9B872" stroke={TINTA} strokeWidth={9} />
    <Fabrica x={930} y={450} k={1.12} c={K.branco} />
    <PlantaX x={290} y={520} k={0.9}><path d="M -150,90 L -150,-10 L -90,-60 L -90,-10 L -30,-60 L -30,-10 L 30,-60 L 30,-10 L 150,-10 L 150,90 Z" /></PlantaX>
    <Pal x={40} y={200} t="$265 BILLION" s={150} c={K.amar} />
    <Pal x={56} y={318} t="STILL BEHIND" s={104} />
  </svg>
);
const C02b: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={640} cy={760} c1={K.creme} c2={K.creme2} />
    <path d="M -40,720 Q 640,470 1320,720 Z" fill="#3BA7FF" stroke={TINTA} strokeWidth={9} />
    <path d="M 170,560 Q 640,120 1110,560" fill="none" stroke={TINTA} strokeWidth={12} strokeDasharray="6 30" strokeLinecap="round" />
    <g stroke={TINTA} strokeWidth={9}><circle cx={170} cy={572} r={26} fill={K.menta} /><circle cx={1110} cy={572} r={26} fill={K.verm} /></g>
    <Lamina x={640} y={440} k={0.62} rot={-10} />
    <Aviao x={650} y={300} k={1.0} rot={4} />
    <Pal x={640} y={150} t="11,000 KM" s={150} c={K.verm} rot={-2} anc="middle" />
    <Pal x={640} y={690} t="TO FINISH ONE CHIP" s={76} rot={0} anc="middle" />
  </svg>
);
const C02c: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Raios cx={380} cy={420} c1={K.verde} c2={K.verde2} />
    <Chip x={330} y={440} k={1.25} rot={-8} c={K.amar} />
    <g transform="translate(330,440) rotate(-8)"><text x={0} y={28} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={84} fill={TINTA}>2nm</text></g>
    <g transform="translate(980,520)" stroke={TINTA} strokeWidth={9} strokeLinejoin="round"><rect x={-190} y={-40} width={380} height={170} rx={14} fill={K.branco} /><path d="M -130,-40 L -130,-130 Q 0,-250 130,-130 L 130,-40" fill="none" strokeWidth={40} /><path d="M -130,-40 L -130,-130 Q 0,-250 130,-130 L 130,-40" fill="none" stroke={K.cinza} strokeWidth={22} /><circle cx={0} cy={30} r={26} fill={TINTA} /><rect x={-10} y={30} width={20} height={56} fill={TINTA} /></g>
    <Pal x={560} y={175} t="NEVER LEAVES" s={84} rot={-3} />
    <Pal x={660} y={300} t="TAIWAN" s={140} c={K.amar} rot={-3} />
  </svg>
);

export const CAPAS: Record<string, React.FC> = { '02a': C02a, '02b': C02b, '02c': C02c };

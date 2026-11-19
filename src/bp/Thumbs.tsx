// Brasileiro Padrão · capas do #01 (1280x720). v = a | b | c.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import '@fontsource/nunito/900.css'; import '@fontsource/jetbrains-mono/700.css';
import { C, NUN, MONO, T, Valdir, Celular } from './pecas';

const Titulo: React.FC<{ x: number; y: number; txt: string; tam: number; cor?: string; rot?: number; anc?: 'start' | 'middle' | 'end' }> = ({ x, y, txt, tam, cor = '#fff', rot = -3, anc = 'start' }) => (
  <text x={x} y={y} textAnchor={anc} fontFamily={NUN} fontWeight={900} fontSize={tam} fill={cor} stroke={C.tinta} strokeWidth={tam * 0.16} paintOrder="stroke" strokeLinejoin="round" transform={`rotate(${rot} ${x} ${y})`}>{txt}</text>);
const Etiqueta: React.FC<{ x: number; y: number; txt: string; tam: number; fundo: string; cor?: string; rot?: number }> = ({ x, y, txt, tam, fundo, cor = '#fff', rot = -4 }) => { const w = txt.length * tam * 0.62 + 50; return (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}><rect x={-w / 2 + 8} y={-tam * 0.8 + 9} width={w} height={tam * 1.55} rx={14} fill={C.tinta} /><rect x={-w / 2} y={-tam * 0.8} width={w} height={tam * 1.55} rx={14} fill={fundo} stroke={C.tinta} strokeWidth={7} /><text y={tam * 0.32} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={tam} fill={cor}>{txt}</text></g>); };
const Raios: React.FC<{ cx: number; cy: number; cor: string }> = ({ cx, cy, cor }) => <>{Array.from({ length: 16 }).map((_, i) => <path key={i} d="M0 0 L70 -1500 L-70 -1500 Z" fill={cor} opacity={0.13} transform={`translate(${cx} ${cy}) rotate(${i * 22.5 + 8})`} />)}</>;

export const BPThumb: React.FC<{ v: 'a' | 'b' | 'c' }> = ({ v }) => (
  <AbsoluteFill>
    <svg viewBox="0 0 1280 720" width={1280} height={720}>
      <defs><filter id="tr" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={4} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={4} /></filter>
        <radialGradient id="luz"><stop offset="0" stopColor="#7FF0DD" stopOpacity={0.7} /><stop offset="1" stopColor="#7FF0DD" stopOpacity={0} /></radialGradient></defs>
      {v === 'a' && <g filter="url(#tr)"><rect width={1280} height={720} fill="#16233F" /><circle cx={880} cy={380} r={520} fill="url(#luz)" /><Raios cx={880} cy={380} cor="#BFF3EA" />
        <g transform="translate(310 1040) scale(1.32)"><Valdir x={0} y={0} s={1} expr="susto" pose="neutro" f={10} olhar={[0.9, 0]} luz="#7FF0DD" /></g>
        <g transform="translate(900 400) rotate(8) scale(0.78)"><Celular><text x={0} y={-300} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={60} fill={C.tinta}>03:12</text>
          <rect x={-182} y={-230} width={364} height={360} rx={26} fill="#fff" stroke={C.tinta} strokeWidth={6} /><circle cx={0} cy={-160} r={44} fill={C.teal} stroke={C.tinta} strokeWidth={5} /><path d="M-18 -160 l13 14 l26 -28" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          <text x={0} y={-66} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={44} fill={C.tinta}>Pix recebido</text><text x={0} y={10} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={31} fill={C.verde}>R$ 50.000.000,00</text><text x={0} y={70} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={24} fill={C.cinza}>agora mesmo</text></Celular></g>
        <Titulo x={640} y={130} txt="R$ 50 MILHÕES" tam={130} cor="#4ADE80" anc="middle" rot={-2} /><Etiqueta x={1020} y={640} txt="POR ENGANO!" tam={70} fundo={C.verm} /></g>}
      {v === 'b' && <g filter="url(#tr)"><rect width={640} height={720} fill="#4A4F63" /><rect x={640} width={640} height={720} fill="#1F8A5B" /><Raios cx={960} cy={360} cor="#fff" />
        <Etiqueta x={320} y={100} txt="03:11" tam={60} fundo="#111" cor={C.verm} rot={-3} /><Etiqueta x={960} y={100} txt="03:12" tam={60} fundo="#111" cor="#4ADE80" rot={3} />
        <Titulo x={240} y={300} txt="R$ 37,12" tam={96} anc="middle" rot={-3} /><Titulo x={1040} y={270} txt="R$ 50" tam={130} cor={C.amarelo} anc="middle" rot={2} /><Titulo x={1040} y={380} txt="MILHÕES" tam={92} cor={C.amarelo} anc="middle" rot={2} />
        <path d="M640 0 V720" stroke={C.tinta} strokeWidth={14} />
        <g transform="translate(640 1010) scale(1.08)"><Valdir x={0} y={0} s={1} expr="susto" pose="celular" f={10} olhar={[0.6, -0.2]} /></g>
        <Etiqueta x={250} y={620} txt="PIX ERRADO" tam={64} fundo={C.verm} rot={-4} /></g>}
      {v === 'c' && <g filter="url(#tr)"><rect width={640} height={720} fill="#B93A2A" /><rect x={640} width={640} height={720} fill="#2456B8" /><Raios cx={640} cy={420} cor="#fff" />
        <Titulo x={640} y={130} txt="DEVOLVER OU FICAR?" tam={100} anc="middle" rot={-2} />
        <g transform="translate(640 1130) scale(1.5)"><Valdir x={0} y={0} s={1} expr="susto" pose="neutro" f={10} /></g>
        {[['DEVOLVER', C.verde, 230, -5], ['FICAR', C.amarelo, 1050, 5]].map(([t, c, x, r], i) => <g key={i} transform={`translate(${x} 430) rotate(${r})`}><rect x={-178} y={-74} width={370} height={160} rx={34} fill={C.tinta} /><rect x={-185} y={-85} width={370} height={160} rx={34} fill={c as string} {...T} strokeWidth={9} /><text y={22} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={i ? 84 : 66} fill={i ? C.tinta : '#fff'}>{t}</text></g>)}
        <Etiqueta x={1010} y={640} txt="R$ 50 MILHÕES" tam={58} fundo="#111" cor="#4ADE80" rot={-3} /></g>}
    </svg>
  </AbsoluteFill>);

// Sobrou pro Valdir · identidade do canal. tipo = logo (800x800) | banner (2560x1440, área segura central 1546x423).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import '@fontsource/nunito/900.css'; import '@fontsource/nunito/800.css'; import '@fontsource/permanent-marker/400.css'; import '@fontsource/jetbrains-mono/700.css';
import { C, NUN, MARK, MONO, T, Valdir, Caixa } from './pecas';

const Raios: React.FC<{ cx: number; cy: number; n?: number; o?: number }> = ({ cx, cy, n = 18, o = 0.16 }) => <>{Array.from({ length: n }).map((_, i) => <path key={i} d="M0 0 L120 -3000 L-120 -3000 Z" fill="#fff" opacity={o} transform={`translate(${cx} ${cy}) rotate(${i * (360 / n) + 6})`} />)}</>;
const Letreiro: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g transform="rotate(-3)"><rect x={-262} y={-150} width={540} height={124} rx={18} fill={C.tinta} /><rect x={-270} y={-160} width={540} height={124} rx={18} fill={C.verm} stroke={C.tinta} strokeWidth={9} /><text x={0} y={-66} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={104} fill="#fff" letterSpacing={2}>SOBROU</text></g>
    <text x={60} y={150} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={230} fill={C.amarelo} stroke={C.tinta} strokeWidth={34} paintOrder="stroke" strokeLinejoin="round" letterSpacing={2}>VALDIR</text>
    <text x={330} y={-52} fontFamily={MARK} fontSize={110} fill={C.creme} stroke={C.tinta} strokeWidth={16} paintOrder="stroke" strokeLinejoin="round" transform="rotate(-5 330 -52)">pro</text>
  </g>);

export const BPMarca: React.FC<{ tipo: 'logo' | 'banner' }> = ({ tipo }) => (
  <AbsoluteFill>
    {tipo === 'logo' ? (
      <svg viewBox="0 0 800 800" width={800} height={800}>
        <defs><filter id="tr" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={7} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={5} /></filter></defs>
        <rect width={800} height={800} fill={C.verde} /><Raios cx={400} cy={430} />
        <g filter="url(#tr)"><g transform="translate(400 1150) scale(1.72)"><Valdir x={0} y={0} s={1} expr="confiante" pose="neutro" f={30} /></g>
          <g transform="translate(612 548) rotate(10)"><rect x={-20} y={-118} width={44} height={86} rx={22} fill={C.pele} {...T} strokeWidth={9} /><rect x={-58} y={-50} width={116} height={98} rx={34} fill={C.pele} {...T} strokeWidth={9} /><path d="M-58 -14 H34 M-58 16 H30" {...T} strokeWidth={7} /></g></g>
      </svg>
    ) : (
      <svg viewBox="0 0 2560 1440" width={2560} height={1440}>
        <defs><filter id="tr" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={7} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={6} /></filter></defs>
        <rect width={2560} height={1440} fill={C.verde} /><Raios cx={1280} cy={760} n={24} o={0.12} />
        {/* fora da área segura: só textura e objetos soltos (aparecem na TV) */}
        <g filter="url(#tr)" opacity={0.95}>
          {/* área segura: x 507–2053, y 508–931 */}
          <g transform="translate(700 1010) scale(0.86)"><Valdir x={0} y={0} s={1} expr="confiante" pose="joia" k={1} f={30} /></g>
          <rect x={0} y={932} width={2560} height={508} fill={C.verde} />
          {[[260, 300, -12], [2300, 1160, 10], [420, 1180, 8], [2180, 260, -8]].map(([x, y, r], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(1.5)`}>{i % 2 ? <Caixa x={0} y={0} /> : <g><rect x={-90} y={-150} width={180} height={300} rx={26} fill="#1B1B22" {...T} /><rect x={-76} y={-136} width={152} height={272} rx={14} fill="#EAF8F5" /><circle cx={0} cy={-50} r={30} fill={C.teal} /><path d="M-13 -50 l9 10 l18 -20" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" /><rect x={-54} y={0} width={108} height={16} rx={8} fill="#9AD9CF" /></g>}</g>)}
          <Letreiro x={1290} y={680} s={0.8} />
          <g transform="translate(1340 884) rotate(-1)"><rect x={-262} y={-36} width={540} height={74} rx={14} fill={C.tinta} /><rect x={-270} y={-44} width={540} height={74} rx={14} fill={C.creme} stroke={C.tinta} strokeWidth={7} /><text y={8} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={36} fill={C.tinta}>história nova toda semana</text></g>
          <g transform="translate(1872 812) rotate(4) scale(0.78)"><rect x={-212} y={-40} width={440} height={84} rx={14} fill={C.tinta} /><rect x={-220} y={-48} width={440} height={84} rx={14} fill="#111" stroke={C.tinta} strokeWidth={7} /><text y={12} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={40} fill="#4ADE80">saldo: R$ 37,12</text></g>
        </g>
      </svg>
    )}
  </AbsoluteFill>);

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Defs, MONO, P, TIT } from './lib';
import DE from './alemanha.json';

// Hard to Copy: thumbnails 1280×720 (props.v = a | b | c). Uma imagem forte + 2 a 3 palavras gigantes.
const W = 1280, H = 720;
const Base: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: P.fundo }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs /><rect width={W} height={H} fill="url(#foco)" /><rect width={W} height={H} fill="url(#pontos)" />
      {children}
    </svg>
  </AbsoluteFill>
);
const G: React.FC<any> = ({ s = 150, c = P.osso, children, ...r }) => <text fontFamily={TIT} fontWeight={700} fontSize={s} fill={c} letterSpacing={-s * 0.035} {...r}>{children}</text>;
const Espelho: React.FC<{ cx: number; cy: number; k?: number }> = ({ cx, cy, k = 1 }) => (
  <g transform={`translate(${cx},${cy}) scale(${k})`}>
    <ellipse cx={0} cy={0} rx={250} ry={84} fill={P.menta} opacity={0.22} filter="url(#halo)" />
    <ellipse cx={0} cy={0} rx={230} ry={76} fill="#12251D" stroke={P.menta} strokeWidth={9} />
    <path d="M -150,-10 Q 0,36 150,-10" fill="none" stroke={P.osso} strokeWidth={5} opacity={0.7} />
    <ellipse cx={-70} cy={-22} rx={70} ry={14} fill={P.osso} opacity={0.22} />
  </g>
);

const A: React.FC = () => (
  <Base>
    <G x={56} y={190} s={150}>ASML</G>
    <G x={56} y={345} s={150} c={P.verm}>CAN'T MAKE</G>
    <G x={56} y={500} s={150}>THIS</G>
    <path d="M 420,450 C 560,440 640,470 720,520" fill="none" stroke={P.ambar} strokeWidth={10} strokeLinecap="round" markerEnd="url(#setaA)" />
    <Espelho cx={950} cy={560} k={1.15} />
    <text x={56} y={650} fontFamily={MONO} fontWeight={700} fontSize={34} fill={P.menta} letterSpacing={4}>ONE COMPANY ON EARTH CAN</text>
  </Base>
);

const B: React.FC = () => {
  const esc = 0.62, ox = 60, oy = 50;
  return (
    <Base>
      <g transform={`translate(${ox},${oy}) scale(${esc})`}><path d={DE.d} fill={P.menta} fillOpacity={0.12} stroke={P.menta} strokeWidth={8 / esc} strokeLinejoin="round" /></g>
      <line x1={ox + 180} y1={oy + 330} x2={ox + 520} y2={oy + 330} stroke={P.osso} strokeWidth={4} strokeDasharray="3 13" strokeLinecap="round" />
      <circle cx={ox + 300} cy={oy + 330} r={15} fill={P.ambar} />
      <G x={640} y={300} s={250} c={P.menta}>0.1<tspan fontSize={130} dx={12}>mm</tspan></G>
      <G x={646} y={430} s={92}>TALLEST BUMP</G>
      <G x={646} y={535} s={92} c={P.ambar}>IN A COUNTRY</G>
      <text x={648} y={620} fontFamily={MONO} fontWeight={700} fontSize={32} fill={P.cinza} letterSpacing={4}>NOBODY CAN COPY IT</text>
    </Base>
  );
};

const C: React.FC = () => (
  <Base>
    <G x={56} y={170} s={128}>BLUEPRINTS</G>
    <path d="M 900,84 l 34,38 l 62,-76" fill="none" stroke={P.menta} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
    <G x={56} y={310} s={128}>BILLIONS</G>
    <path d="M 716,224 l 34,38 l 62,-76" fill="none" stroke={P.menta} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
    <G x={56} y={470} s={150} c={P.verm}>THIS MIRROR</G>
    <path d="M 1060,372 l 84,84 M 1144,372 l -84,84" stroke={P.verm} strokeWidth={24} strokeLinecap="round" />
    <Espelho cx={330} cy={598} k={0.92} />
    <text x={620} y={612} fontFamily={MONO} fontWeight={700} fontSize={34} fill={P.ambar} letterSpacing={4}>WHY NO ONE CAN COPY IT</text>
  </Base>
);

export const HTCThumb: React.FC<{ v: string }> = ({ v }) => (v === 'b' ? <B /> : v === 'c' ? <C /> : <A />);

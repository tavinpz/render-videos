// Brasileiro Padrão · peças de desenho (SVG): personagens em 4 vistas, objetos e helpers.
import React from 'react';
import { interpolate, Easing } from 'remotion';

export const C = { papel: '#F4EAD5', tinta: '#2B2118', noite: '#141E36', noite2: '#243253', azul: '#A9CBEA', azulS: '#86AED3', pele: '#C98E62', peleS: '#A9714A', verde: '#2FA36B', amarelo: '#F5C83A', verm: '#E2513B', teal: '#1FA79A', creme: '#FFF8E8', cinza: '#8A8F9C', lilas: '#B79AE0', lilasS: '#9478C4', madeira: '#B98455', madeiraS: '#9A6A40', peleN: '#E3B48F', peleNS: '#C9966F', cabelo: '#5B5550', grisalho: '#D9D5CF' };
export const NUN = 'Nunito, sans-serif', MONO = '"JetBrains Mono", monospace', MARK = '"Permanent Marker", cursive';
export const cl = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
export const suave = Easing.inOut(Easing.cubic), sai = Easing.out(Easing.cubic);
export const vai = (f: number, a: number, b: number, de: number, para: number, e = suave) => interpolate(f, [a, b], [de, para], { ...cl, easing: e });
export const entra = (f: number, de: number, dur = 10) => interpolate(f, [de, de + dur], [0, 1], { ...cl, easing: sai });
// entrada com mola (passa um pouco e assenta)
export const pula = (f: number, de: number, dur = 16) => { const x = (f - de) / dur; if (x <= 0) return 0; if (x >= 1) return 1; return 1 - Math.exp(-6 * x) * Math.cos(x * 9); };
export const brl = (v: number) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const T = { stroke: C.tinta, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const T5 = { ...T, strokeWidth: 5 };

const Braco: React.FC<{ d: string; cor?: string }> = ({ d, cor = C.azul }) => <><path d={d} fill="none" stroke={C.tinta} strokeWidth={48} strokeLinecap="round" /><path d={d} fill="none" stroke={cor} strokeWidth={34} strokeLinecap="round" /></>;

// ---------- Valdir de frente ----------
export type Expr = 'neutro' | 'susto' | 'confiante' | 'sorriso';
export type Pose = 'neutro' | 'celular' | 'joia' | 'entrega';
export const Valdir: React.FC<{ x: number; y: number; s?: number; expr?: Expr; pose?: Pose; boca?: number; f: number; olhar?: [number, number]; luz?: string; k?: number }> = ({ x, y, s = 1, expr = 'neutro', pose = 'neutro', boca = 0, f, olhar = [0, 0], luz, k = 1 }) => {
  const pisca = expr !== 'susto' && f % 104 < 4;
  const resp = Math.sin(f / 17) * 3, fala = boca * 5;
  const ro = expr === 'susto' ? 31 : 23, pu = expr === 'susto' ? 7 : 10;
  const sob = expr === 'susto' ? -28 : expr === 'confiante' ? 6 : expr === 'sorriso' ? -6 : 0;
  const ab = Math.max(0, boca) * 30 + (expr === 'susto' ? 14 : 0);
  const sorri = expr === 'sorriso' || expr === 'confiante';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M-150 0 L-128 ${-250 + resp} Q-120 -300 -60 -306 L60 -306 Q120 -300 128 ${-250 + resp} L150 0 Z`} fill={C.azul} {...T} />
      <path d={`M-150 0 L-128 ${-250 + resp} Q-124 -280 -100 -296 Q-92 -150 -96 0 Z`} fill={C.azulS} opacity={0.55} />
      <path d="M-34 -304 L0 -262 L34 -304" fill={C.creme} {...T} />
      <path d="M0 -268 L-17 -238 L0 -128 L17 -238 Z" fill="#7B2D3B" {...T} />
      <rect x={52} y={-222} width={74} height={40} rx={6} fill={C.creme} {...T5} />
      <text x={89} y={-194} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={19} fill={C.tinta}>VALDIR</text>
      {pose !== 'entrega' && <><Braco d={`M-128 ${-240 + resp} Q-176 -130 -146 -40`} /><circle cx={-146} cy={-30} r={24} fill={C.pele} {...T} /></>}
      <g transform={`translate(0 ${-470 + resp * 1.4 - fala}) rotate(${Math.sin(f / 23) * 1.5 + boca * 1.5})`}>
        <rect x={-34} y={130} width={68} height={50} fill={C.peleS} {...T} />
        <ellipse cx={-128} cy={12} rx={22} ry={30} fill={C.pele} {...T} /><ellipse cx={128} cy={12} rx={22} ry={30} fill={C.pele} {...T} />
        <path d="M-126 -40 Q-130 -168 0 -170 Q130 -168 126 -40 L122 70 Q112 150 0 152 Q-112 150 -122 70 Z" fill={C.pele} {...T} />
        <path d="M126 -40 L122 70 Q112 150 0 152 Q80 120 86 20 Q90 -60 126 -40 Z" fill={C.peleS} opacity={0.45} />
        <path d="M-128 -30 Q-150 -84 -112 -112 Q-104 -70 -116 -20 Z" fill={C.cabelo} {...T} /><path d="M128 -30 Q150 -84 112 -112 Q104 -70 116 -20 Z" fill={C.cabelo} {...T} />
        <path d="M-46 -150 Q0 -164 30 -152" fill="none" stroke="#fff" strokeOpacity={0.4} strokeWidth={10} strokeLinecap="round" />
        {[-50, 50].map((ox) => pisca ? <path key={ox} d={`M${ox - 22} -8 Q${ox} 6 ${ox + 22} -8`} fill="none" {...T} /> : (
          <g key={ox}><circle cx={ox} cy={-10} r={ro} fill="#fff" {...T} strokeWidth={6} /><circle cx={ox + olhar[0] * 9} cy={-8 + olhar[1] * 8} r={pu} fill={C.tinta} /><circle cx={ox + olhar[0] * 9 + 3} cy={-12 + olhar[1] * 8} r={pu * 0.3} fill="#fff" />
            {expr === 'confiante' && <path d={`M${ox - ro - 3} -12 Q${ox} ${-ro - 16} ${ox + ro + 3} -12 L${ox + ro + 3} ${-ro - 14} L${ox - ro - 3} ${-ro - 14} Z`} fill={C.pele} stroke={C.tinta} strokeWidth={6} strokeLinejoin="round" />}</g>))}
        <path d={`M-82 ${-52 + sob} Q-50 ${-70 + sob} -22 ${-50 + sob + (expr === 'confiante' ? 6 : 0)}`} fill="none" stroke={C.tinta} strokeWidth={13} strokeLinecap="round" />
        <path d={`M82 ${-52 + sob} Q50 ${-70 + sob} 22 ${-50 + sob + (expr === 'confiante' ? -10 : 0)}`} fill="none" stroke={C.tinta} strokeWidth={13} strokeLinecap="round" />
        <path d="M-8 4 Q-22 40 0 46 Q22 40 8 4" fill={C.peleS} {...T} strokeWidth={6} />
        {sorri && ab < 6 ? <path d="M-34 88 Q0 112 38 84" fill="none" {...T} strokeWidth={6} /> : <><ellipse cx={0} cy={92 + ab * 0.35} rx={28 + (sorri ? 8 : 0)} ry={6 + ab * 0.55} fill="#5A1F1F" {...T} strokeWidth={6} />{ab > 12 && <ellipse cx={0} cy={98 + ab * 0.6} rx={15} ry={ab * 0.22} fill="#D9705F" />}</>}
        <path d="M0 52 Q-40 44 -78 76 Q-52 94 0 80 Q52 94 78 76 Q40 44 0 52 Z" fill="#3A322C" {...T} strokeWidth={6} />
        {luz && <path d="M-126 -40 Q-130 -168 0 -170 Q130 -168 126 -40 L122 70 Q112 150 0 152 Q-112 150 -122 70 Z" fill={luz} opacity={0.3 * k} />}
      </g>
      {pose === 'neutro' && <><Braco d={`M128 ${-240 + resp} Q176 -130 146 -40`} /><circle cx={146} cy={-30} r={24} fill={C.pele} {...T} /></>}
      {pose === 'celular' && <><Braco d="M128 -240 Q230 -200 196 -330" />
        <g transform={`translate(196 -372) rotate(${-8 + Math.sin(f / 1.7) * (expr === 'susto' ? 2.5 : 0)})`}><rect x={-34} y={-58} width={68} height={116} rx={12} fill={C.tinta} /><rect x={-27} y={-50} width={54} height={96} rx={6} fill="#BFF3EA" /></g><circle cx={196} cy={-326} r={25} fill={C.pele} {...T} /></>}
      {pose === 'joia' && (() => { const kk = pula(k * 100, 0, 100); const hy = -40 - kk * 310, hx = 146 + kk * 86; return <>
        <Braco d={`M128 -240 Q${200 + kk * 50} ${-150 - kk * 70} ${hx} ${hy + 20}`} />
        <g transform={`translate(${hx} ${hy}) rotate(${(1 - kk) * 40})`}><rect x={-12} y={-72} width={26} height={52} rx={13} fill={C.pele} {...T} /><rect x={-34} y={-30} width={68} height={58} rx={20} fill={C.pele} {...T} /><path d="M-34 -8 H20 M-34 10 H18" {...T5} /></g></>; })()}
      {pose === 'entrega' && (() => { const yy = -120 - k * 120; return <>
        <Braco d={`M-128 -240 Q-190 ${-150 - k * 40} -92 ${yy + 40}`} /><Braco d={`M128 -240 Q190 ${-150 - k * 40} 92 ${yy + 40}`} />
        <Caixa x={0} y={yy} s={1.1} rot={Math.sin(f / 9) * 1.5} /><circle cx={-98} cy={yy + 30} r={25} fill={C.pele} {...T} /><circle cx={98} cy={yy + 30} r={25} fill={C.pele} {...T} /></>; })()}
    </g>);
};

// ---------- Valdir visto de cima (olhando para -y quando rot = 0) ----------
export const ValdirTopo: React.FC<{ x: number; y: number; s?: number; rot?: number; f: number; modo?: 'andando' | 'sentado' | 'dormindo' }> = ({ x, y, s = 1, rot = 0, f, modo = 'sentado' }) => {
  const p = Math.sin(f * 0.42), resp = Math.sin(f / 18) * 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={10} cy={18} rx={170} ry={92} fill="#000" opacity={0.22} />
      {modo === 'andando' && <><ellipse cx={-52} cy={-30 + p * 44} rx={30} ry={52} fill="#2E3350" {...T} /><ellipse cx={52} cy={-30 - p * 44} rx={30} ry={52} fill="#2E3350" {...T} /></>}
      {modo === 'andando' && <><ellipse cx={-150} cy={-6 - p * 40} rx={26} ry={40} fill={C.pele} {...T} /><ellipse cx={150} cy={-6 + p * 40} rx={26} ry={40} fill={C.pele} {...T} /></>}
      {modo === 'dormindo' && <><path d="M-150 0 Q-190 -150 -40 -168" fill="none" stroke={C.tinta} strokeWidth={62} strokeLinecap="round" /><path d="M-150 0 Q-190 -150 -40 -168" fill="none" stroke={C.azul} strokeWidth={48} strokeLinecap="round" />
        <path d="M150 0 Q190 -150 40 -150" fill="none" stroke={C.tinta} strokeWidth={62} strokeLinecap="round" /><path d="M150 0 Q190 -150 40 -150" fill="none" stroke={C.azul} strokeWidth={48} strokeLinecap="round" /><circle cx={-34} cy={-170} r={28} fill={C.pele} {...T} /><circle cx={36} cy={-152} r={28} fill={C.pele} {...T} /></>}
      <ellipse cx={0} cy={0} rx={160 + resp} ry={78 + resp} fill={C.azul} {...T} /><path d="M-160 0 Q-150 60 0 78 Q150 60 160 0 Q100 40 0 44 Q-100 40 -160 0 Z" fill={C.azulS} opacity={0.6} />
      <g transform={`translate(0 ${modo === 'dormindo' ? -92 + resp : -14}) rotate(${modo === 'dormindo' ? 14 : p * (modo === 'andando' ? 3 : 0)})`}>
        <ellipse cx={-82} cy={0} rx={15} ry={22} fill={C.pele} {...T} /><ellipse cx={82} cy={0} rx={15} ry={22} fill={C.pele} {...T} />
        <circle r={82} fill={C.pele} {...T} />
        <path d="M-80 -14 Q-92 40 -50 68 Q0 96 50 68 Q92 40 80 -14 Q70 30 40 46 Q0 60 -40 46 Q-70 30 -80 -14 Z" fill={C.cabelo} {...T} strokeWidth={6} />
        <ellipse cx={-18} cy={-22} rx={30} ry={18} fill="#fff" opacity={0.28} />
        <path d="M-12 -80 Q0 -104 12 -80" fill={C.peleS} {...T} strokeWidth={6} />
        <path d="M-40 -74 Q0 -96 40 -74" fill="none" stroke="#3A322C" strokeWidth={16} strokeLinecap="round" />
      </g>
    </g>);
};

// ---------- Valdir de lado, andando para a direita ----------
export const ValdirLado: React.FC<{ x: number; y: number; s?: number; f: number; passo?: number }> = ({ x, y, s = 1, f, passo = 1 }) => {
  const ph = f * 0.36 * passo, a = Math.sin(ph) * 30 * passo, sobe = Math.abs(Math.cos(ph)) * 10 * passo;
  const Perna: React.FC<{ ang: number; tras?: boolean }> = ({ ang, tras }) => { const joelho = Math.max(0, -Math.sin(ph + (tras ? Math.PI : 0)) ) * 38 * passo; return (
    <g transform={`translate(0 -250) rotate(${ang})`}><path d={`M0 0 L${joelho * 0.5} 120 L${-joelho * 0.3} 236`} fill="none" stroke={C.tinta} strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" /><path d={`M0 0 L${joelho * 0.5} 120 L${-joelho * 0.3} 236`} fill="none" stroke={tras ? '#262B45' : '#2E3350'} strokeWidth={48} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${-joelho * 0.3 - 26} 236 h74 q22 0 22 20 h-96 Z`} fill="#1B1B22" {...T} strokeWidth={6} /></g>); };
  return (
    <g transform={`translate(${x} ${y - sobe}) scale(${s})`}>
      <ellipse cx={0} cy={sobe + 10} rx={120 - sobe * 2} ry={16} fill="#000" opacity={0.25} />
      <Perna ang={-a} tras />
      <g transform={`translate(0 -470) rotate(${a * 0.9})`}><Braco d="M0 0 Q-10 100 16 190" cor={C.azulS} /><circle cx={18} cy={200} r={23} fill={C.peleS} {...T} /></g>
      <Perna ang={a} />
      <path d="M-74 -250 Q-92 -420 -62 -500 Q0 -540 62 -500 Q96 -400 78 -250 Z" fill={C.azul} {...T} /><path d="M-74 -250 Q-92 -420 -62 -500 Q-40 -380 -44 -250 Z" fill={C.azulS} opacity={0.6} />
      <path d="M56 -500 L74 -440 L62 -380" fill="none" stroke="#7B2D3B" strokeWidth={16} strokeLinecap="round" />
      <g transform={`translate(8 ${-620 + Math.sin(ph * 2) * 3}) rotate(${Math.sin(ph) * 2})`}>
        <rect x={-30} y={96} width={56} height={40} fill={C.peleS} {...T} />
        <path d="M-110 -10 Q-112 -128 6 -130 Q104 -128 108 -30 L132 14 Q136 30 112 30 L112 70 Q108 124 20 124 Q-104 124 -110 40 Z" fill={C.pele} {...T} />
        <path d="M-108 -30 Q-120 40 -70 92 Q-30 70 -34 -4 Q-70 -24 -108 -30 Z" fill={C.cabelo} {...T} strokeWidth={6} />
        <ellipse cx={-22} cy={14} rx={18} ry={26} fill={C.pele} {...T} />
        <circle cx={62} cy={-18} r={20} fill="#fff" {...T} strokeWidth={6} /><circle cx={70} cy={-16} r={9} fill={C.tinta} />
        <path d="M34 -54 Q62 -70 90 -50" fill="none" stroke={C.tinta} strokeWidth={12} strokeLinecap="round" />
        <path d="M72 44 Q120 34 142 60 Q110 78 70 66 Z" fill="#3A322C" {...T} strokeWidth={6} />
        <path d="M84 84 Q98 90 110 82" fill="none" {...T} strokeWidth={6} />
        <path d="M-30 -116 Q10 -128 50 -112" fill="none" stroke="#fff" strokeOpacity={0.4} strokeWidth={9} strokeLinecap="round" />
      </g>
      <g transform={`translate(0 -470) rotate(${-a * 0.9})`}><Braco d="M0 0 Q14 100 -10 190" /><circle cx={-12} cy={200} r={24} fill={C.pele} {...T} />
        <g transform={`translate(-12 222) rotate(${a * 0.9})`}><path d="M-22 0 Q0 -26 22 0" fill="none" {...T} strokeWidth={6} /><rect x={-56} y={0} width={112} height={84} rx={12} fill={C.verm} {...T} /><rect x={-56} y={20} width={112} height={14} fill="#B93A2A" /></g></g>
    </g>);
};

// ---------- costas (primeiro plano, fora de foco) ----------
export const ValdirCostas: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f / 19) * 4}) scale(${s})`}>
    <path d="M-330 420 Q-340 150 -130 110 L130 110 Q340 150 330 420 Z" fill="#6E93B8" {...T} strokeWidth={9} />
    <rect x={-50} y={40} width={100} height={90} fill="#8C5E3E" {...T} strokeWidth={9} />
    <ellipse cx={-176} cy={-60} rx={28} ry={40} fill="#9C6B48" {...T} strokeWidth={9} /><ellipse cx={176} cy={-60} rx={28} ry={40} fill="#9C6B48" {...T} strokeWidth={9} />
    <path d="M-170 -100 Q-176 -270 0 -274 Q176 -270 170 -100 L164 10 Q150 90 0 92 Q-150 90 -164 10 Z" fill="#9C6B48" {...T} strokeWidth={9} />
    <path d="M-172 -120 Q-176 20 -150 60 Q0 104 150 60 Q176 20 172 -120 Q150 -40 0 -34 Q-150 -40 -172 -120 Z" fill="#46413D" {...T} strokeWidth={8} />
  </g>);
export const NeideCostas: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f / 21) * 4}) scale(${s})`}>
    <path d="M-300 420 Q-310 170 -120 120 L120 120 Q310 170 300 420 Z" fill="#7F66AE" {...T} strokeWidth={9} />
    <path d="M-170 -60 Q-190 -260 0 -262 Q190 -260 170 -60 Q170 80 0 100 Q-170 80 -170 -60 Z" fill="#B8B3AC" {...T} strokeWidth={9} />
    <circle cx={0} cy={-290} r={84} fill="#C4BFB8" {...T} strokeWidth={9} /><path d="M-50 -310 Q0 -350 50 -310 M-40 -270 Q0 -300 40 -270" fill="none" {...T} strokeWidth={6} opacity={0.5} />
  </g>);

// ---------- Dona Neide de frente ----------
export const Neide: React.FC<{ x: number; y: number; s?: number; boca?: number; f: number; expr?: 'feliz' | 'bronca'; sacolas?: boolean; olhar?: [number, number] }> = ({ x, y, s = 1, boca = 0, f, expr = 'feliz', sacolas = true, olhar = [0, 0] }) => {
  const resp = Math.sin(f / 15 + 1) * 3, ab = boca * 26, pisca = (f + 37) % 88 < 4, br = expr === 'bronca';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {sacolas && [-1, 1].map((d) => <g key={d} transform={`translate(${d * 196} ${-150 + resp}) rotate(${Math.sin(f / 12 + d) * 3})`}><path d="M-36 -46 Q0 -100 36 -46" fill="none" {...T} strokeWidth={6} /><path d="M-62 -46 H62 L74 120 H-74 Z" fill={d < 0 ? '#F2E3BE' : C.verde} {...T} />{d < 0 && <><circle cx={-20} cy={-52} r={22} fill={C.verm} {...T5} /><path d="M10 -50 q14 -40 34 -30" fill="none" stroke={C.verde} strokeWidth={12} strokeLinecap="round" /></>}</g>)}
      <path d={`M-140 0 L-118 ${-236 + resp} Q-110 -286 -56 -292 L56 -292 Q110 -286 118 ${-236 + resp} L140 0 Z`} fill={C.lilas} {...T} />
      <path d={`M-140 0 L-118 ${-236 + resp} Q-112 -270 -90 -284 Q-84 -140 -88 0 Z`} fill={C.lilasS} opacity={0.6} />
      {[[-60, -200], [40, -230], [-10, -130], [70, -110], [-80, -60], [20, -40]].map(([a, b], i) => <g key={i}><circle cx={a} cy={b} r={11} fill={C.creme} /><circle cx={a} cy={b} r={4} fill={C.amarelo} /></g>)}
      <path d="M-40 -290 Q0 -250 40 -290" fill={C.peleN} {...T} />
      <Braco d={`M-118 ${-230 + resp} Q-190 -180 -196 -190`} cor={C.lilas} /><Braco d={`M118 ${-230 + resp} Q190 -180 196 -190`} cor={C.lilas} />
      <g transform={`translate(0 ${-440 + resp * 1.4 - boca * 4}) rotate(${Math.sin(f / 20) * 2 + (br ? 5 : 0)})`}>
        <circle cx={0} cy={-190} r={66} fill={C.grisalho} {...T} />
        <path d="M-130 -20 Q-160 -150 -40 -176 Q0 -190 40 -176 Q160 -150 130 -20 Q150 30 118 60 L-118 60 Q-150 30 -130 -20 Z" fill={C.grisalho} {...T} />
        <path d="M-108 -30 Q-110 -134 0 -136 Q110 -134 108 -30 L104 60 Q96 132 0 134 Q-96 132 -104 60 Z" fill={C.peleN} {...T} />
        <path d="M108 -30 L104 60 Q96 132 0 134 Q70 106 76 20 Q80 -44 108 -30 Z" fill={C.peleNS} opacity={0.5} />
        <path d="M-108 -40 Q-60 -150 0 -110 Q60 -150 108 -40 Q60 -96 0 -84 Q-60 -96 -108 -40 Z" fill={C.grisalho} {...T} strokeWidth={6} />
        <circle cx={-112} cy={56} r={11} fill="#fff" {...T5} /><circle cx={112} cy={56} r={11} fill="#fff" {...T5} />
        {[-44, 44].map((ox) => <g key={ox}>{pisca ? <path d={`M${ox - 18} 0 Q${ox} 12 ${ox + 18} 0`} fill="none" {...T} strokeWidth={6} /> : <><circle cx={ox} cy={-2} r={17} fill="#fff" {...T5} /><circle cx={ox + olhar[0] * 7} cy={-1 + olhar[1] * 6} r={8} fill={C.tinta} /></>}
          <circle cx={ox} cy={-2} r={34} fill="#fff" fillOpacity={0.12} stroke={C.verm} strokeWidth={7} /></g>)}
        <path d="M-10 -2 H10" stroke={C.verm} strokeWidth={7} />
        <path d={`M-70 ${-48 + (br ? -12 : 0)} Q-44 ${-62 + (br ? -6 : 0)} -20 ${-46 + (br ? 8 : 0)} M70 ${-48 + (br ? -12 : 0)} Q44 ${-62 + (br ? -6 : 0)} 20 ${-46 + (br ? 8 : 0)}`} fill="none" stroke={C.cabelo} strokeWidth={8} strokeLinecap="round" />
        <path d="M-6 16 Q-14 40 0 44 Q14 40 6 16" fill={C.peleNS} {...T} strokeWidth={5} />
        {ab < 5 ? <path d={br ? 'M-26 82 Q0 74 26 82' : 'M-30 76 Q0 100 30 76'} fill="none" stroke="#B5384A" strokeWidth={9} strokeLinecap="round" /> : <ellipse cx={0} cy={82 + ab * 0.3} rx={24} ry={5 + ab * 0.5} fill="#5A1F1F" stroke="#B5384A" strokeWidth={8} />}
        <circle cx={-66} cy={50} r={16} fill="#E88A8A" opacity={0.45} /><circle cx={66} cy={50} r={16} fill="#E88A8A" opacity={0.45} />
      </g>
    </g>);
};

// ---------- objetos ----------
export const Caixa: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}><rect x={-110} y={-80} width={220} height={160} rx={8} fill="#D9A877" {...T} /><rect x={-16} y={-80} width={32} height={160} fill="#C08B55" /><path d="M-110 -30 H110" stroke="#B4703A" strokeWidth={5} opacity={0.5} />
    <rect x={24} y={-10} width={72} height={52} rx={4} fill={C.creme} {...T5} /><text x={60} y={12} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={15} fill={C.tinta}>APTO</text><text x={60} y={34} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={C.verm}>42</text></g>);
export const Celular: React.FC<{ children?: React.ReactNode; brilho?: number }> = ({ children, brilho = 1 }) => (
  <g><rect x={-208} y={-408} width={440} height={840} rx={56} fill="#000" opacity={0.3} /><rect x={-220} y={-420} width={440} height={840} rx={56} fill="#1B1B22" {...T} /><rect x={-196} y={-390} width={392} height={780} rx={34} fill="#0E3B3A" /><rect x={-196} y={-390} width={392} height={780} rx={34} fill="#EAF8F5" opacity={brilho} /><rect x={-50} y={-408} width={100} height={12} rx={6} fill="#444" />{children}</g>);
export const Placa: React.FC<{ x: number; y: number; txt: string; k: number; cor?: string; tam?: number; fundo?: string; rot?: number; fonte?: string }> = ({ x, y, txt, k, cor = C.tinta, tam = 44, fundo = C.creme, rot = -2, fonte = MONO }) => {
  const w = txt.length * tam * (fonte === MONO ? 0.62 : 0.6) + 60;
  return <g transform={`translate(${x} ${y}) rotate(${rot + (1 - k) * 6}) scale(${Math.max(0.001, k)})`} opacity={k > 0.02 ? 1 : 0}><rect x={-w / 2 + 7} y={-tam * 0.85 + 8} width={w} height={tam * 1.7} rx={12} fill={C.tinta} opacity={0.9} /><rect x={-w / 2} y={-tam * 0.85} width={w} height={tam * 1.7} rx={12} fill={fundo} stroke={C.tinta} strokeWidth={6} /><text x={0} y={tam * 0.34} textAnchor="middle" fontFamily={fonte} fontWeight={fonte === MONO ? 700 : 900} fontSize={tam} fill={cor}>{txt}</text></g>;
};
export const Extrato: React.FC<{ valor: number; k: number; pulso?: number }> = ({ valor, k, pulso = 0 }) => (
  <g transform={`translate(${1920 - 56 - 470 + (1 - k) * 600} 44) rotate(1.2) translate(235 66) scale(${1 + pulso * 0.12}) translate(-235 -66)`}>
    <rect x={8} y={9} width={470} height={132} rx={14} fill={C.tinta} /><rect width={470} height={132} rx={14} fill={valor > 1e6 ? '#EAFBF0' : C.creme} stroke={C.tinta} strokeWidth={6} />
    <circle cx={58} cy={66} r={34} fill={C.pele} stroke={C.tinta} strokeWidth={5} /><path d="M58 70 Q36 66 24 82 Q42 92 58 84 Q74 92 92 82 Q80 66 58 70 Z" fill="#3A322C" /><circle cx={46} cy={56} r={5} fill={C.tinta} /><circle cx={70} cy={56} r={5} fill={C.tinta} />
    <text x={112} y={52} fontFamily={NUN} fontWeight={900} fontSize={24} fill={C.cinza} letterSpacing={2}>SALDO DO VALDIR</text>
    <text x={112} y={104} fontFamily={MONO} fontWeight={700} fontSize={valor > 1e6 ? 35 : 44} fill={valor > 1e6 ? C.verde : C.tinta}>{brl(valor)}</text>
  </g>);

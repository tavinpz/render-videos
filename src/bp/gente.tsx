// Brasileiro Padrão · personagens secundários (golpista, gerente, delegado), de frente e de costas, e acessórios do sonho.
import React from 'react';
import { C, NUN, T } from './pecas';

export type TipoGente = 'golpista' | 'gerente' | 'delegado';
const PELE: Record<TipoGente, [string, string]> = { golpista: ['#8C5A3C', '#734628'], gerente: ['#E0B08A', '#C4906A'], delegado: ['#B77B55', '#99623F'] };
const Braco: React.FC<{ d: string; cor: string }> = ({ d, cor }) => <><path d={d} fill="none" stroke={C.tinta} strokeWidth={48} strokeLinecap="round" /><path d={d} fill="none" stroke={cor} strokeWidth={34} strokeLinecap="round" /></>;

export const Gente: React.FC<{ tipo: TipoGente; x: number; y: number; s?: number; boca?: number; f: number; expr?: 'neutro' | 'sorriso' | 'bronca' | 'susto'; olhar?: [number, number]; fone?: boolean }> = ({ tipo, x, y, s = 1, boca = 0, f, expr = 'neutro', olhar = [0, 0], fone }) => {
  const [pele, peleS] = PELE[tipo]; const resp = Math.sin(f / 16 + tipo.length) * 3, ab = boca * 28 + (expr === 'susto' ? 16 : 0), pisca = (f + tipo.length * 31) % 96 < 4 && expr !== 'susto';
  const roupa = tipo === 'golpista' ? '#7A5BD0' : tipo === 'gerente' ? '#5C6B8A' : '#D8D2C4', roupaS = tipo === 'golpista' ? '#5F43B0' : tipo === 'gerente' ? '#47546F' : '#B9B2A2';
  const sob = expr === 'susto' ? -22 : expr === 'bronca' ? 8 : expr === 'sorriso' ? -4 : 0; const ro = expr === 'susto' ? 26 : 19;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M-150 0 L-128 ${-250 + resp} Q-120 -300 -60 -306 L60 -306 Q120 -300 128 ${-250 + resp} L150 0 Z`} fill={roupa} {...T} />
      <path d={`M-150 0 L-128 ${-250 + resp} Q-124 -280 -100 -296 Q-92 -150 -96 0 Z`} fill={roupaS} opacity={0.6} />
      {tipo === 'gerente' && <><path d="M-40 -304 L0 -200 L40 -304 Z" fill={C.creme} {...T} /><path d="M-60 -306 L-10 -150 L-40 -120 Z M60 -306 L10 -150 L40 -120 Z" fill={roupaS} {...T} strokeWidth={6} /><path d="M-26 -292 Q0 -262 26 -292 L14 -236 L-14 -236 Z" fill={C.verm} {...T} strokeWidth={6} /><rect x={58} y={-214} width={64} height={34} rx={5} fill={C.creme} {...T} strokeWidth={5} /><text x={90} y={-190} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={16} fill={C.tinta}>BANCO</text></>}
      {tipo === 'golpista' && <><path d="M-24 -300 L-24 -210 M24 -300 L24 -210" {...T} strokeWidth={5} /><circle cx={-24} cy={-204} r={8} fill={C.creme} stroke={C.tinta} strokeWidth={4} /><circle cx={24} cy={-204} r={8} fill={C.creme} stroke={C.tinta} strokeWidth={4} /><path d="M-70 -110 H70 V-50 H-70 Z" fill={roupaS} {...T} strokeWidth={5} /></>}
      {tipo === 'delegado' && <><path d="M-34 -304 L0 -262 L34 -304" fill={C.creme} {...T} /><path d="M-92 -300 L-76 0 L76 0 L92 -300 L40 -306 L0 -230 L-40 -306 Z" fill="#23262E" {...T} /><path d="M36 -214 l18 -11 l18 11 v22 q-18 20 -36 0 Z" fill={C.amarelo} {...T} strokeWidth={5} /><rect x={-70} y={-200} width={56} height={16} rx={4} fill="#3A3F4B" /></>}
      <Braco d={`M-128 ${-240 + resp} Q-176 -130 -146 -40`} cor={roupa} /><circle cx={-146} cy={-30} r={24} fill={pele} {...T} />
      {tipo === 'golpista' && <path d="M-150 -330 Q-170 -640 0 -650 Q170 -640 150 -330 L118 -276 L-118 -276 Z" fill={roupa} {...T} />}
      <g transform={`translate(0 ${-456 + resp * 1.4 - boca * 4}) rotate(${Math.sin(f / 21 + 2) * 1.6})`}>
        <rect x={-30} y={120} width={60} height={46} fill={peleS} {...T} />
        {tipo === 'gerente' && <path d="M-136 60 Q-166 -150 0 -168 Q166 -150 136 60 Q150 120 110 130 L-110 130 Q-150 120 -136 60 Z" fill="#5A3A2A" {...T} />}
        <ellipse cx={-116} cy={10} rx={18} ry={26} fill={pele} {...T} /><ellipse cx={116} cy={10} rx={18} ry={26} fill={pele} {...T} />
        <path d="M-112 -36 Q-116 -150 0 -152 Q116 -150 112 -36 L108 62 Q100 138 0 140 Q-100 138 -108 62 Z" fill={pele} {...T} />
        <path d="M112 -36 L108 62 Q100 138 0 140 Q72 110 78 16 Q82 -52 112 -36 Z" fill={peleS} opacity={0.45} />
        {tipo === 'gerente' && <><path d="M-114 -30 Q-110 -160 0 -160 Q114 -160 114 -30 Q70 -110 -20 -112 Q-80 -100 -114 -30 Z" fill="#5A3A2A" {...T} strokeWidth={6} /><circle cx={-118} cy={52} r={10} fill={C.amarelo} {...T} strokeWidth={4} /><circle cx={118} cy={52} r={10} fill={C.amarelo} {...T} strokeWidth={4} /></>}
        {tipo === 'delegado' && <><path d="M-114 -40 Q-118 -158 0 -160 Q118 -158 114 -40 Q100 -104 0 -108 Q-100 -104 -114 -40 Z" fill="#BDB8B0" {...T} strokeWidth={6} /><path d="M-70 96 Q0 150 70 96 Q40 124 0 126 Q-40 124 -70 96 Z" fill="#8E877E" opacity={0.6} /></>}
        {tipo === 'golpista' && <path d="M-118 -30 Q-124 -168 0 -170 Q124 -168 118 -30 Q90 -120 0 -124 Q-90 -120 -118 -30 Z" fill={roupaS} {...T} strokeWidth={6} />}
        {tipo === 'golpista' ? <><rect x={-88} y={-34} width={76} height={44} rx={14} fill={C.tinta} /><rect x={12} y={-34} width={76} height={44} rx={14} fill={C.tinta} /><path d="M-12 -18 H12" {...T} /><path d="M-76 -24 l20 0 M24 -24 l20 0" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.5} /></>
          : [-46, 46].map((ox) => <g key={ox}>{pisca ? <path d={`M${ox - 20} -6 Q${ox} 6 ${ox + 20} -6`} fill="none" {...T} strokeWidth={6} /> : <><circle cx={ox} cy={-8} r={ro} fill="#fff" {...T} strokeWidth={6} /><circle cx={ox + olhar[0] * 8} cy={-6 + olhar[1] * 7} r={9} fill={C.tinta} /></>}
            {tipo === 'delegado' && <rect x={ox - 34} y={-38} width={68} height={56} rx={12} fill="#fff" fillOpacity={0.1} stroke={C.tinta} strokeWidth={7} />}</g>)}
        {tipo === 'delegado' && <path d="M-12 -12 H12" {...T} />}
        {tipo !== 'golpista' && <path d={`M-76 ${-46 + sob} Q-46 ${-62 + sob} -18 ${-44 + sob + (expr === 'bronca' ? 8 : 0)} M76 ${-46 + sob} Q46 ${-62 + sob} 18 ${-44 + sob + (expr === 'bronca' ? 8 : 0)}`} fill="none" stroke={tipo === 'delegado' ? '#8E877E' : '#3A2A20'} strokeWidth={tipo === 'gerente' ? 8 : 12} strokeLinecap="round" />}
        <path d="M-7 8 Q-18 38 0 42 Q18 38 7 8" fill={peleS} {...T} strokeWidth={5} />
        {ab > 5 ? <><ellipse cx={0} cy={84 + ab * 0.3} rx={26} ry={5 + ab * 0.5} fill="#5A1F1F" {...T} strokeWidth={tipo === 'gerente' ? 8 : 6} stroke={tipo === 'gerente' ? '#B5384A' : C.tinta} />{tipo === 'golpista' && <rect x={-18} y={80} width={36} height={8} rx={3} fill="#fff" />}</>
          : expr === 'sorriso' ? <path d="M-36 74 Q0 108 40 70 Q0 86 -36 74 Z" fill="#fff" {...T} strokeWidth={6} /> : <path d={expr === 'bronca' ? 'M-26 86 Q0 76 26 86' : 'M-26 82 Q0 92 26 82'} fill="none" stroke={tipo === 'gerente' ? '#B5384A' : C.tinta} strokeWidth={tipo === 'gerente' ? 9 : 7} strokeLinecap="round" />}
      </g>
      {fone ? <><Braco d="M128 -240 Q236 -250 150 -420" cor={roupa} /><g transform="translate(138 -452) rotate(-12)"><rect x={-26} y={-50} width={52} height={100} rx={10} fill={C.tinta} /></g><circle cx={148} cy={-410} r={25} fill={pele} {...T} /></>
        : <><Braco d={`M128 ${-240 + resp} Q176 -130 146 -40`} cor={roupa} /><circle cx={146} cy={-30} r={24} fill={pele} {...T} /></>}
    </g>);
};
export const Costas: React.FC<{ tipo: 'gerente' | 'delegado'; x: number; y: number; s?: number; f: number }> = ({ tipo, x, y, s = 1, f }) => (
  <g transform={`translate(${x} ${y + Math.sin(f / 20) * 4}) scale(${s})`}>
    <path d="M-320 420 Q-330 160 -126 116 L126 116 Q330 160 320 420 Z" fill={tipo === 'gerente' ? '#47546F' : '#1E2129'} {...T} strokeWidth={9} />
    <rect x={-46} y={44} width={92} height={86} fill={tipo === 'gerente' ? '#C4906A' : '#8E5C3C'} {...T} strokeWidth={9} />
    <path d="M-168 -100 Q-174 -268 0 -272 Q174 -268 168 -100 L162 10 Q148 90 0 92 Q-148 90 -162 10 Z" fill={tipo === 'gerente' ? '#4A2F22' : '#A9A49C'} {...T} strokeWidth={9} />
    {tipo === 'gerente' ? <path d="M-170 -60 Q-190 110 -120 120 L120 120 Q190 110 170 -60 Z" fill="#4A2F22" {...T} strokeWidth={9} /> : <><ellipse cx={-172} cy={-50} rx={26} ry={38} fill="#8E5C3C" {...T} strokeWidth={9} /><ellipse cx={172} cy={-50} rx={26} ry={38} fill="#8E5C3C" {...T} strokeWidth={9} /><path d="M-160 0 Q0 60 160 0 L156 40 Q140 92 0 92 Q-140 92 -156 40 Z" fill="#8E5C3C" {...T} strokeWidth={8} /></>}
  </g>);
// óculos escuros / quepe para o Valdir do sonho (mesmo x, y, s do <Valdir>)
export const Acessorio: React.FC<{ x: number; y: number; s: number; tipo: 'oculos' | 'quepe' | 'avental' }> = ({ x, y, s, tipo }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {tipo === 'oculos' && <g transform="translate(0 -470)"><rect x={-96} y={-36} width={84} height={52} rx={16} fill={C.tinta} /><rect x={12} y={-36} width={84} height={52} rx={16} fill={C.tinta} /><path d="M-12 -18 H12 M-96 -20 L-126 -30 M96 -20 L126 -30" {...T} /><path d="M-84 -26 l22 0 M24 -26 l22 0" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.5} /></g>}
    {tipo === 'quepe' && <g transform="translate(0 -620)"><path d="M-130 0 Q-136 -90 0 -96 Q136 -90 130 0 Z" fill="#fff" {...T} /><path d="M-150 0 H150 Q150 34 100 30 H-100 Q-150 34 -150 0 Z" fill="#1D2A52" {...T} /><path d="M-16 -50 l16 -14 l16 14 l-16 22 Z" fill={C.amarelo} {...T} strokeWidth={5} /></g>}
    {tipo === 'avental' && <><path d="M-70 -300 L-90 0 H90 L70 -300 Z" fill="#fff" {...T} /><text x={0} y={-150} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={30} fill={C.verm}>CHEF</text></>}
  </g>);

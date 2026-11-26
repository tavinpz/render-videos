// Capas v2 (26/11) de Last State Standing e Quanto Você Dura?, modeladas nos canais que mais rendem em cada nicho.
// LSS = Grid Atlas ("If the US Power Grid Failed..." 1,7 mi): EUA à noite visto do espaço, "WHO ___ FIRST?" com 1 palavra vermelha, objeto na borda.
// QVD = Gran Quizás ("Tú en el año 1500" 1,5 mi): foto da época em tela cheia, "VOCÊ EM 1904" gigante amarelo/branco.
import React from 'react';
import { AbsoluteFill, Img, staticFile, random } from 'remotion';
import { geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import topo from '../longo/estados-simples.json';
import '@fontsource/anton/400.css';
import { HTCV4 } from '../htc/CapasV4';

const AB: Record<string, string> = { Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD', Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY' };
const PATH = geoPath(null as any);
const EST = ((feature(topo as any, (topo as any).objects.states) as any).features as any[])
  .filter((f) => AB[f.properties.name])
  .map((f) => ({ ab: AB[f.properties.name], d: PATH(f) || '', c: PATH.centroid(f) as [number, number], b: PATH.bounds(f) as [[number, number], [number, number]] }));
// "cidades": pontos de luz espalhados dentro do retângulo de cada estado (mais densos no leste)
const LUZES = EST.flatMap((e, i) => {
  const [[x0, y0], [x1, y1]] = e.b; const area = (x1 - x0) * (y1 - y0);
  const n = Math.min(70, Math.max(8, Math.round(area / 140) + (e.c[0] > 600 ? 25 : 0)));
  return Array.from({ length: n }, (_, k) => {
    const r1 = random(`${e.ab}x${k}`), r2 = random(`${e.ab}y${k}`);
    // concentra perto do centro
    const x = e.c[0] + (r1 - 0.5) * (x1 - x0) * 0.75, y = e.c[1] + (r2 - 0.5) * (y1 - y0) * 0.75;
    return { ab: e.ab, x, y, r: 0.6 + random(`${e.ab}r${k}`) * (random(`${e.ab}g${k}`) > 0.92 ? 3.2 : 1.4) };
  });
});

const AN = 'Anton, Impact, sans-serif';
const Titulo: React.FC<{ partes: [string, boolean][]; y?: number; s?: number; x?: number; anchor?: 'start' | 'middle' }> = ({ partes, y = 150, s = 150, x = 60, anchor = 'start' }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={AN} fontSize={s} letterSpacing={1} stroke="#000" strokeWidth={s * 0.08} paintOrder="stroke" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.7))' }}>
    {partes.map(([t, red], i) => <tspan key={i} fill={red ? '#ff2b1c' : '#fff'}>{t}</tspan>)}
  </text>
);

const MapaNoite: React.FC<{ quente?: string[]; apagado?: string[]; tr: string }> = ({ quente = [], apagado = [], tr }) => (
  <g transform={tr}>
    <defs>
      <filter id="brilhoL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
      <filter id="brilhoR" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
    </defs>
    {EST.map((e) => <path key={e.ab} d={e.d} fill={apagado.includes(e.ab) ? '#05080d' : '#0d1a2c'} stroke="#26406a" strokeWidth={0.9} />)}
    <g filter="url(#brilhoL)">{LUZES.filter((l) => !apagado.includes(l.ab)).map((l, i) => <circle key={i} cx={l.x} cy={l.y} r={l.r * 2.2} fill="#ffb347" opacity={0.75} />)}</g>
    {LUZES.filter((l) => !apagado.includes(l.ab)).map((l, i) => <circle key={i} cx={l.x} cy={l.y} r={l.r * 0.8} fill="#fff1c4" />)}
    {EST.filter((e) => quente.includes(e.ab)).map((e) => <path key={e.ab} d={e.d} fill="#ff2b1c" opacity={0.55} filter="url(#brilhoR)" />)}
    {EST.filter((e) => quente.includes(e.ab)).map((e) => <path key={e.ab} d={e.d} fill="#ff2b1c" fillOpacity={0.35} stroke="#ff5a3c" strokeWidth={2.4} />)}
  </g>
);
const Espaco: React.FC = () => (
  <>
    <defs>
      <radialGradient id="terra" cx="0.5" cy="1.25" r="1.1"><stop offset="0.72" stopColor="#0a1629" /><stop offset="0.86" stopColor="#123a6b" /><stop offset="0.9" stopColor="#4d8fd6" stopOpacity="0.6" /><stop offset="0.93" stopColor="#020409" /></radialGradient>
    </defs>
    <rect width={1280} height={720} fill="#020409" />
    {Array.from({ length: 90 }, (_, i) => <circle key={i} cx={random(`s${i}`) * 1280} cy={random(`t${i}`) * 260} r={random(`u${i}`) * 1.4} fill="#fff" opacity={0.6} />)}
    <rect width={1280} height={720} fill="url(#terra)" />
  </>
);
// objetos de borda
const Bico: React.FC = () => (
  <g transform="translate(1110 250) rotate(18)">
    <rect x={-40} y={-260} width={80} height={140} rx={14} fill="#2a2d31" />
    <path d="M-50 -130 h100 l20 190 q0 40 -40 40 h-60 q-40 0 -40 -40 Z" fill="#3a3e44" stroke="#15171a" strokeWidth={6} />
    <path d="M-10 90 h30 v120 l60 40 v26 h-90 Z" fill="#b8bec6" stroke="#5a6068" strokeWidth={5} />
    <path d="M10 60 q50 40 0 70" fill="none" stroke="#15171a" strokeWidth={14} />
    <path d="M60 286 c10 18 10 30 0 34 c-10 -4 -10 -16 0 -34 Z" fill="#ffb21f" transform="translate(0 10) scale(1.6) translate(-22 -175)" />
  </g>
);
const Casa: React.FC = () => (
  <g transform="translate(1040 470) scale(0.9)">
    <path d="M-150 -40 L0 -170 L150 -40 V140 H-150 Z" fill="#e9eef5" stroke="#0b0f14" strokeWidth={8} />
    <path d="M-185 -30 L0 -200 L185 -30" fill="none" stroke="#ff2b1c" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={-40} y={40} width={80} height={100} fill="#1b2433" /><rect x={-120} y={-10} width={60} height={50} fill="#ffd36a" /><rect x={60} y={-10} width={60} height={50} fill="#ffd36a" />
    <g transform="translate(120 70) rotate(14)"><rect x={0} y={-40} width={190} height={84} rx={10} fill="#ffd21f" stroke="#000" strokeWidth={6} /><circle cx={22} cy={0} r={10} fill="#000" />
      <text x={110} y={22} textAnchor="middle" fontFamily={AN} fontSize={58} fill="#000">$$$</text></g>
  </g>
);
const Termo: React.FC = () => (
  <g transform="translate(1150 400)">
    <rect x={-44} y={-300} width={88} height={500} rx={44} fill="#dfe6ee" stroke="#0b0f14" strokeWidth={8} />
    <rect x={-20} y={-260} width={40} height={430} rx={20} fill="#ff2b1c" />
    <circle cx={0} cy={230} r={86} fill="#ff2b1c" stroke="#0b0f14" strokeWidth={8} />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={46} y={-250 + i * 46} width={i % 2 ? 22 : 40} height={6} fill="#0b0f14" />)}
    <circle cx={0} cy={230} r={120} fill="#ff5a1c" opacity={0.35} />
  </g>
);

const LSS: Record<string, () => React.ReactElement> = {
  '1': () => (<>
    <Espaco />
    <MapaNoite tr="translate(90 215) scale(0.98)" quente={['MS', 'AR', 'LA', 'AL', 'WV']} />
    <Bico />
    <Titulo partes={[['WHO RUNS ', false], ['DRY', true], [' FIRST?', false]]} s={128} y={150} />
    <text x={70} y={690} fontFamily={AN} fontSize={46} fill="#ffd21f" stroke="#000" strokeWidth={6} paintOrder="stroke">IF GAS HIT $10</text>
  </>),
  '2': () => (<>
    <Espaco />
    <MapaNoite tr="translate(70 215) scale(0.98)" apagado={EST.map((e) => e.ab).filter((a) => !['MI', 'MD', 'PA', 'MO', 'KS', 'IA', 'NE', 'IL', 'OH'].includes(a))} />
    <Casa />
    <Titulo partes={[['ONLY ', false], ['9', true], [' STATES LEFT', false]]} s={128} y={150} />
    <text x={70} y={690} fontFamily={AN} fontSize={46} fill="#ffd21f" stroke="#000" strokeWidth={6} paintOrder="stroke">WHERE A HOUSE STILL FITS</text>
  </>),
  '3': () => (<>
    <Espaco />
    <rect width={1280} height={720} fill="#ff3a10" opacity={0.08} />
    <MapaNoite tr="translate(70 215) scale(0.98)" quente={['AK', 'WA', 'MT', 'VT']} />
    <Termo />
    <Titulo partes={[['WHO ', false], ['MELTS', true], [' FIRST?', false]]} s={140} y={150} />
    <text x={70} y={690} fontFamily={AN} fontSize={46} fill="#ffd21f" stroke="#000" strokeWidth={6} paintOrder="stroke">122°F FOR A WEEK</text>
  </>),
};


// variações B (o #1 em destaque) e C (o número gigante)
const Rotulo: React.FC<{ x: number; y: number; pos: string; nome: string; sub: string }> = ({ x, y, pos, nome, sub }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={150} height={130} fill="#ff2b1c" stroke="#000" strokeWidth={6} /><text x={75} y={105} textAnchor="middle" fontFamily={AN} fontSize={110} fill="#fff">{pos}</text>
    <rect x={150} y={0} width={nome.length * 46 + 50} height={130} fill="#fff" stroke="#000" strokeWidth={6} /><text x={175} y={100} fontFamily={AN} fontSize={92} fill="#111">{nome}</text>
    <text x={4} y={180} fontFamily={AN} fontSize={44} fill="#ffd21f" stroke="#000" strokeWidth={6} paintOrder="stroke">{sub}</text>
  </g>
);
const LSSX: Record<string, () => React.ReactElement> = {
  '1b': () => (<><Espaco /><MapaNoite tr="translate(-420 -300) scale(1.75)" quente={['MS']} />
    <Titulo partes={[['FIRST TO ', false], ['BREAK', true]]} s={130} y={150} /><Rotulo x={60} y={420} pos="#1" nome="MISSISSIPPI" sub="IF GAS HIT $10 A GALLON" /></>),
  '1c': () => (<><Espaco /><MapaNoite tr="translate(330 260) scale(0.9)" quente={['MS', 'AR', 'LA', 'AL', 'WV']} />
    <g transform="translate(60 120)"><rect width={420} height={300} fill="#ffd21f" stroke="#000" strokeWidth={10} transform="rotate(-4)" />
      <text x={200} y={230} textAnchor="middle" fontFamily={AN} fontSize={250} fill="#111" transform="rotate(-4)">$10</text></g>
    <Titulo partes={[['GAS', false]]} s={110} y={560} x={70} /><Titulo partes={[['WHO BREAKS?', true]]} s={90} y={670} x={70} /></>),
  '2b': () => (<><Espaco /><MapaNoite tr="translate(-1100 40) scale(2.1)" quente={['NY']} />
    <Titulo partes={[['HARDEST', true], [' TO BUY', false]]} s={130} y={150} /><Rotulo x={60} y={420} pos="#50" nome="NEW YORK" sub="A HOUSE IN EVERY STATE, RANKED" /></>),
  '2c': () => (<><Espaco /><MapaNoite tr="translate(330 260) scale(0.9)" apagado={EST.map((e) => e.ab).filter((a) => !['MI', 'MD', 'PA', 'MO', 'KS', 'IA', 'NE', 'IL', 'OH'].includes(a))} />
    <text x={70} y={330} fontFamily={AN} fontSize={260} fill="#fff" stroke="#000" strokeWidth={14} paintOrder="stroke">48</text>
    <text x={300} y={300} fontFamily={AN} fontSize={130} fill="#ffd21f" stroke="#000" strokeWidth={10} paintOrder="stroke">→</text>
    <text x={70} y={600} fontFamily={AN} fontSize={260} fill="#ff2b1c" stroke="#000" strokeWidth={14} paintOrder="stroke">9</text>
    <text x={210} y={560} fontFamily={AN} fontSize={56} fill="#fff" stroke="#000" strokeWidth={6} paintOrder="stroke">STATES LEFT</text></>),
  '3b': () => (<><Espaco /><rect width={1280} height={720} fill="#ff3a10" opacity={0.08} /><MapaNoite tr="translate(80 -250) scale(1.6)" quente={['AK']} />
    <Titulo partes={[['FIRST TO ', false], ['MELT', true]]} s={130} y={150} /><Rotulo x={560} y={300} pos="#1" nome="ALASKA" sub="122°F FOR A WEEK · ALMOST NO AC" /></>),
  '3c': () => (<><Espaco /><rect width={1280} height={720} fill="#ff3a10" opacity={0.12} /><MapaNoite tr="translate(330 260) scale(0.9)" quente={['AK', 'WA', 'MT', 'VT']} />
    <text x={60} y={330} fontFamily={AN} fontSize={250} fill="#ff2b1c" stroke="#000" strokeWidth={14} paintOrder="stroke">122°F</text>
    <Titulo partes={[['IN EVERY STATE', false]]} s={80} y={450} x={70} /><Titulo partes={[['WHO BREAKS?', true]]} s={90} y={640} x={70} /></>),
};

const QV: Record<string, { foto: string; ano: string; sub: string; x?: string }> = {
  '1': { foto: 'bonde_virado_revolta_da_vacina_jpg.jpg', ano: '1904', sub: 'REVOLTA DA VACINA' },
  '2': { foto: 'canudos_village_jpg.jpg', ano: '1897', sub: 'CANUDOS' },
  '3': { foto: 'rua_direita_vincenzo_pastore_jpg.jpg', ano: '1918', sub: 'GRIPE ESPANHOLA' },
};
const QVD: React.FC<{ n: string }> = ({ n }) => {
  const q = QV[n];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Img src={staticFile(`arte/qvd/${q.foto}`)} style={{ width: 1280, height: 720, objectFit: 'cover', filter: 'sepia(0.55) contrast(1.25) brightness(0.8) saturate(1.3)' }} />
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="esc" x1="0" y1="0" x2="1" y2="0"><stop offset="0.3" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.78" /></linearGradient>
          <radialGradient id="vq" cx="0.4" cy="0.5" r="0.85"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.7" /></radialGradient>
        </defs>
        <rect width={1280} height={720} fill="#4a2a08" opacity={0.25} style={{ mixBlendMode: 'multiply' }} />
        <rect width={1280} height={720} fill="url(#esc)" /><rect width={1280} height={720} fill="url(#vq)" />
        <text x={1230} y={250} textAnchor="end" fontFamily={AN} fontSize={130} fill="#fff" stroke="#000" strokeWidth={10} paintOrder="stroke">VOCÊ EM</text>
        <text x={1236} y={460} textAnchor="end" fontFamily={AN} fontSize={230} fill="#ffd21f" stroke="#000" strokeWidth={14} paintOrder="stroke">{q.ano}</text>
        <g transform="translate(1230 545)"><rect x={-470} y={-50} width={470} height={78} fill="#e21b12" /><text x={-235} y={12} textAnchor="middle" fontFamily={AN} fontSize={50} fill="#fff">QUANTO VOCÊ DURA?</text></g>
        <text x={40} y={690} fontFamily={AN} fontSize={40} fill="#fff" opacity={0.92} stroke="#000" strokeWidth={6} paintOrder="stroke">{q.sub}</text>
      </svg>
    </AbsoluteFill>
  );
};


const QVX: Record<string, { foto: string; l1: string; l2: string; tag: string }> = {
  '1b': { foto: 'bonde_revolta_da_vacina_jpg.jpg', l1: 'VACINA', l2: 'À FORÇA?', tag: 'RIO, 1904' },
  '1c': { foto: 'guerra_vaccino_obrigateza_jpg.jpg', l1: 'VOCÊ FOGE', l2: 'OU LUTA?', tag: 'REVOLTA DA VACINA' },
  '2b': { foto: '40th_infantry_batallion_canudos_1897_jpg.jpg', l1: 'FICAR', l2: 'OU FUGIR?', tag: 'CANUDOS, 1897' },
  '2c': { foto: 'canudos_rebels_jpg.jpg', l1: '25 MIL PESSOAS.', l2: 'NENHUMA CASA FICOU.', tag: 'SERTÃO, 1897' },
  '3b': { foto: 'largo_da_s_vincenzo_pastore_jpg.jpg', l1: 'TRABALHAR', l2: 'OU FICAR EM CASA?', tag: 'SÃO PAULO, 1918' },
  '3c': { foto: 'prociss_o_na_rua_direita_vincenzo_pastor.jpg', l1: '5.331 MORTOS', l2: 'EM 2 MESES', tag: 'GRIPE ESPANHOLA' },
};
const QVD2: React.FC<{ k: string }> = ({ k }) => {
  const q = QVX[k];
  const f2 = Math.min(150, 1150 / (q.l2.length * 0.5));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Img src={staticFile(`arte/qvd/${q.foto}`)} style={{ width: 1280, height: 720, objectFit: 'cover', filter: 'sepia(0.55) contrast(1.25) brightness(0.75) saturate(1.3)' }} />
      <svg viewBox="0 0 1280 720" width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="esc2" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.85" /></linearGradient></defs>
        <rect width={1280} height={720} fill="url(#esc2)" />
        <g transform="translate(40 40)"><rect width={q.tag.length * 26 + 50} height={70} fill="#e21b12" /><text x={25} y={52} fontFamily={AN} fontSize={48} fill="#fff">{q.tag}</text></g>
        <text x={640} y={520} textAnchor="middle" fontFamily={AN} fontSize={Math.min(150, 1150 / (q.l1.length * 0.5))} fill="#fff" stroke="#000" strokeWidth={12} paintOrder="stroke">{q.l1}</text>
        <text x={640} y={680} textAnchor="middle" fontFamily={AN} fontSize={f2} fill="#ffd21f" stroke="#000" strokeWidth={12} paintOrder="stroke">{q.l2}</text>
      </svg>
    </AbsoluteFill>
  );
};

export const CapasV2: React.FC<{ c: string; v: string }> = ({ c, v }) => {
  if (c === 'qvd') return v.length > 1 ? <QVD2 k={v} /> : <QVD n={v} />;
  if (c === 'htc') return <AbsoluteFill><HTCV4 v={v} /></AbsoluteFill>;
  return (
    <AbsoluteFill style={{ background: '#020409' }}>
      <svg viewBox="0 0 1280 720" width={1280} height={720}>{(LSS[v] || LSSX[v] || LSS['1'])()}</svg>
    </AbsoluteFill>
  );
};

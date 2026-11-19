// Brasileiro Padrão · cenários e câmera (extraídos do teste 2).
import React from 'react';
import { random } from 'remotion';
import { C, NUN, MONO, MARK, T } from './pecas';

export const SANGRA = { x: -900, y: -700, width: 3720, height: 2480 };
export const Cam: React.FC<{ z: number; cx: number; cy: number; rot?: number; f: number; mao?: number; children: React.ReactNode }> = ({ z, cx, cy, rot = 0, f, mao = 1, children }) => (
  <g transform={`translate(${960 + Math.sin(f / 37) * 5 * mao} ${540 + Math.cos(f / 29) * 4 * mao}) rotate(${rot + Math.sin(f / 53) * 0.25 * mao}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>);
export const Bokeh: React.FC<{ f: number; n?: number; sem?: string }> = ({ f, n = 16, sem = 'b' }) => <>{Array.from({ length: n }).map((_, i) => { const r = 26 + random(sem + i) * 60; return <circle key={i} cx={-200 + random(sem + 'x' + i) * 2300 + Math.sin(f / 60 + i) * 8} cy={60 + random(sem + 'y' + i) * 620} r={r} fill={[C.amarelo, '#FFB45E', '#9FD6FF', C.verm][i % 4]} opacity={0.1 + random(sem + 'o' + i) * 0.16} />; })}</>;

// ---------- cenários ----------
export const RuaDeCima: React.FC<{ f: number }> = ({ f }) => { const carro = 2300 - f * 13; return (<g>
  <rect {...SANGRA} fill="#262C40" />
  <rect x={-900} y={-700} width={3720} height={1340} fill="#2C4A3C" />
  <rect x={-900} y={640} width={3720} height={130} fill="#5A6079" /><path d="M-900 770 H2820" stroke="#8D93A8" strokeWidth={10} />{Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M${-900 + i * 124} 640 v130`} stroke="#4A506A" strokeWidth={4} />)}
  {Array.from({ length: 16 }).map((_, i) => <rect key={i} x={-900 + i * 240} y={916} width={130} height={14} rx={7} fill="#E9E4D0" opacity={0.75} />)}
  <rect x={380} y={40} width={960} height={540} rx={10} fill="#3F4B70" {...T} /><rect x={420} y={80} width={880} height={460} rx={6} fill="#4A5780" stroke={C.tinta} strokeWidth={4} />
  <circle cx={560} cy={210} r={64} fill="#6C7AA6" {...T} /><circle cx={560} cy={210} r={36} fill="#55638F" stroke={C.tinta} strokeWidth={4} />
  {[[760, 150], [900, 150], [1040, 150], [820, 400], [1100, 420]].map(([a, b], i) => <g key={i}><rect x={a} y={b} width={96} height={64} rx={6} fill="#8A93AD" {...T} strokeWidth={5} /><circle cx={a + 48} cy={b + 32} r={20} fill="#5E6784" stroke={C.tinta} strokeWidth={4} /></g>)}
  {[[150, 250], [230, 470], [1560, 160], [1760, 330], [-80, 420], [2060, 220]].map(([a, b], i) => <g key={i}><circle cx={a + 14} cy={b + 16} r={92} fill="#000" opacity={0.25} /><circle cx={a} cy={b} r={88} fill="#2F7A55" {...T} /><circle cx={a - 22} cy={b - 24} r={40} fill="#3F9468" /></g>)}
  <rect x={1392} y={420} width={270} height={222} rx={8} fill="#000" opacity={0.3} transform="translate(14 14)" /><rect x={1392} y={420} width={270} height={222} rx={8} fill={C.verm} {...T} /><path d="M1392 531 H1662" stroke="#B93A2A" strokeWidth={6} />
  <text x={1527} y={500} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={34} fill={C.creme} letterSpacing={3}>PORTARIA</text>
  <rect x={1340} y={586} width={52} height={14} fill={C.tinta} /><rect x={1040} y={612} width={352} height={18} rx={9} fill={C.amarelo} {...T} strokeWidth={5} />
  {[300, 1000, 1760].map((a, i) => <g key={i}><circle cx={a} cy={690} r={230} fill="url(#poca)" /><circle cx={a} cy={650} r={13} fill="#FFF3C4" stroke={C.tinta} strokeWidth={4} /></g>)}
  <g transform={`translate(${carro} 850)`}><path d="M-150 -60 L-560 -150 L-560 150 L-150 60 Z" fill="#FFF3C4" opacity={0.16} /><rect x={-150} y={-66} width={300} height={132} rx={40} fill="#000" opacity={0.3} transform="translate(10 12)" /><rect x={-150} y={-66} width={300} height={132} rx={40} fill="#C9463A" {...T} /><rect x={-70} y={-52} width={150} height={104} rx={22} fill="#7E241C" stroke={C.tinta} strokeWidth={5} /><rect x={-96} y={-46} width={34} height={92} rx={10} fill="#BFE3F2" stroke={C.tinta} strokeWidth={4} /></g>
</g>); };
export const RuaDeLado: React.FC<{ f: number; cx: number }> = ({ f, cx }) => (<g>
  <rect x={cx - 1400} y={-400} width={2800} height={1900} fill="url(#ceuN)" />
  {Array.from({ length: 26 }).map((_, i) => <circle key={i} cx={cx * 0.92 - 1000 + i * 83} cy={40 + random('st' + i) * 380} r={2 + (i % 3)} fill="#fff" opacity={0.3 + 0.4 * Math.abs(Math.sin(f / 20 + i))} />)}
  <g transform={`translate(${cx * 0.9} 0)`}><circle cx={520} cy={150} r={64} fill="#FFF3C4" /><circle cx={494} cy={132} r={58} fill={C.noite} /></g>
  <g transform={`translate(${cx * 0.72} 0)`}>{[[-700, 260, 520], [-380, 340, 360], [20, 220, 600], [300, 380, 420], [740, 260, 540], [1060, 300, 380]].map(([a, w, h], i) => <g key={i}><rect x={a} y={760 - h} width={w} height={h} fill="#0F1830" />{Array.from({ length: 18 }).map((_, j) => <rect key={j} x={a + 28 + (j % 3) * (w - 56) / 3} y={760 - h + 34 + Math.floor(j / 3) * 78} width={34} height={44} fill={(i * 7 + j * 5) % 5 === 0 ? C.amarelo : '#1B2747'} />)}</g>)}</g>
  <rect x={cx - 1400} y={470} width={2800} height={340} fill="#D9C7A6" {...T} /><rect x={cx - 1400} y={450} width={2800} height={34} fill="#B9A482" {...T} strokeWidth={5} />
  {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={i * 190 - 600} y={300} width={14} height={160} fill={C.tinta} opacity={0.85} />)}<rect x={cx - 1400} y={300} width={2800} height={12} fill={C.tinta} opacity={0.85} />
  <g transform="translate(1180 560)"><rect x={8} y={9} width={560} height={150} rx={10} fill={C.tinta} opacity={0.5} /><rect width={560} height={150} rx={10} fill="#2E4A3E" {...T} /><text x={280} y={62} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={34} fill={C.amarelo} letterSpacing={6}>EDIFÍCIO</text><text x={280} y={122} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={60} fill={C.creme} letterSpacing={4}>JATOBÁ</text></g>
  {[300, 700, 980, 1900, 2140].map((a, i) => <g key={i}><circle cx={a} cy={800} r={70} fill="#2F7A55" {...T} /><circle cx={a + 70} cy={820} r={52} fill="#3F9468" {...T} /></g>)}
  <g transform="translate(2420 330)"><rect x={-30} y={-30} width={500} height={40} rx={8} fill={C.verm} {...T} /><rect x={0} y={0} width={440} height={560} fill={C.creme} {...T} /><rect x={36} y={90} width={200} height={170} rx={8} fill="#FFE9A8" {...T} /><rect x={280} y={110} width={120} height={450} rx={6} fill={C.madeira} {...T} /><circle cx={300} cy={340} r={9} fill={C.amarelo} stroke={C.tinta} strokeWidth={4} /><text x={220} y={56} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={34} fill={C.tinta} letterSpacing={4}>PORTARIA</text><circle cx={136} cy={175} r={150} fill="url(#poca)" /></g>
  <rect x={cx - 1400} y={880} width={2800} height={500} fill="#4B526B" /><path d={`M${cx - 1400} 884 H${cx + 1400}`} {...T} />{Array.from({ length: 40 }).map((_, i) => <path key={i} d={`M${i * 150 - 900} 884 l-40 420`} stroke="#3C425A" strokeWidth={4} />)}
</g>);
export const Dentro: React.FC<{ f: number; hora?: number; noite?: number }> = ({ f, hora = 21.2, noite = 0 }) => (<g>
  <rect {...SANGRA} fill="#E8D9B8" /><rect x={-900} y={-700} width={3720} height={1000} fill="url(#parede)" />
  <rect x={60} y={90} width={560} height={400} rx={10} fill={C.noite} {...T} /><Bokeh f={f} n={5} sem="jd" /><rect x={60} y={90} width={560} height={400} rx={10} fill="none" {...T} /><path d="M340 90 V490 M60 290 H620" {...T} />
  <g transform="translate(1250 110)"><rect x={8} y={9} width={520} height={330} rx={10} fill={C.tinta} opacity={0.3} /><rect width={520} height={330} rx={10} fill={C.creme} {...T} />{Array.from({ length: 18 }).map((_, i) => <g key={i} transform={`translate(${48 + (i % 6) * 84} ${54 + Math.floor(i / 6) * 96}) rotate(${Math.sin(f / 30 + i) * 2})`}><path d="M0 0 v38" {...T} strokeWidth={5} /><circle cx={0} cy={48} r={12} fill={i % 4 === 0 ? C.verm : C.amarelo} stroke={C.tinta} strokeWidth={4} /></g>)}</g>
  <g transform="translate(820 250)"><circle r={86} fill="#000" opacity={0.2} cx={6} cy={8} /><circle r={84} fill="#fff" {...T} />{Array.from({ length: 12 }).map((_, i) => <path key={i} d="M0 -72 v10" stroke={C.tinta} strokeWidth={5} transform={`rotate(${i * 30})`} />)}<path d="M0 0 V-40" {...T} strokeWidth={8} transform={`rotate(${(hora % 12) * 30})`} /><path d="M0 0 V-62" {...T} strokeWidth={5} transform={`rotate(${(hora % 1) * 360})`} /><circle r={7} fill={C.verm} /></g>
  <g transform="translate(700 560)"><rect x={0} y={0} width={1130} height={22} fill={C.madeiraS} {...T} />{[[40, 150, 120, '#D9A877'], [210, 110, 90, '#E3B98A'], [350, 170, 150, '#D9A877'], [560, 120, 100, '#CFA06B'], [720, 160, 130, '#E3B98A'], [920, 130, 110, '#D9A877']].map(([a, w, h, c], i) => <g key={i}><rect x={a as number} y={-(h as number)} width={w as number} height={h as number} rx={6} fill={c as string} {...T} /><rect x={(a as number) + (w as number) / 2 - 12} y={-(h as number)} width={24} height={h as number} fill="#B4703A" opacity={0.6} /></g>)}</g>
  <rect {...SANGRA} fill={C.noite} opacity={noite * 0.55} />
</g>);
export const MesaDeCima: React.FC<{ f: number; noite?: number; vapor?: boolean; children?: React.ReactNode }> = ({ f, noite = 0, vapor = true, children }) => (<g>
  <rect {...SANGRA} fill={C.madeira} />{Array.from({ length: 34 }).map((_, i) => <path key={i} d={`M-900 ${-700 + i * 74 + random('g' + i) * 30} q900 ${-30 + random('h' + i) * 60} 1860 0 t1860 0`} fill="none" stroke={C.madeiraS} strokeWidth={5 + random('w' + i) * 6} opacity={0.45} />)}
  {/* caneca */}
  <g transform="translate(1500 250)"><circle cx={12} cy={14} r={132} fill="#000" opacity={0.25} /><circle r={128} fill={C.creme} {...T} /><circle r={92} fill="#fff" {...T} /><circle r={74} fill="#5A3A22" stroke={C.tinta} strokeWidth={5} /><path d="M-40 -20 Q0 -50 40 -16" fill="none" stroke="#8A6240" strokeWidth={9} strokeLinecap="round" /><rect x={84} y={-22} width={86} height={44} rx={22} fill="#fff" {...T} />
    {vapor && [0, 1, 2].map((i) => { const k = ((f + i * 20) % 60) / 60; return <path key={i} d="M0 0 q24 -26 0 -52 q-24 -26 0 -52" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={(1 - k) * 0.5} transform={`translate(${-40 + i * 40} ${-k * 50}) scale(${0.8 + k * 0.5})`} />; })}</g>
  {/* chaves */}
  <g transform="translate(330 250) rotate(-20)"><circle r={56} fill="none" stroke="#9AA0AD" strokeWidth={12} /><circle r={56} fill="none" stroke={C.tinta} strokeWidth={3} />{[0, 40, -36].map((a, i) => <g key={i} transform={`rotate(${a + 90}) translate(56 0)`}><rect x={0} y={-12} width={130} height={24} rx={8} fill={C.amarelo} {...T} strokeWidth={5} /><circle cx={150} cy={0} r={30} fill={C.amarelo} {...T} strokeWidth={5} /></g>)}<rect x={-120} y={30} width={100} height={60} rx={10} fill={C.verm} {...T} strokeWidth={5} transform="rotate(30)" /></g>
  {children}
  <rect {...SANGRA} fill={C.noite} opacity={noite * 0.72} />
  {noite > 0 && <circle cx={1180} cy={560} r={620} fill="url(#abajur)" opacity={noite} />}
</g>);
export const Caderno: React.FC<{ f: number; kCheck: number }> = ({ f, kCheck }) => (
  <g transform="translate(820 560) rotate(-4)"><rect x={-388} y={-268} width={800} height={560} rx={12} fill="#000" opacity={0.28} /><rect x={-400} y={-280} width={800} height={560} rx={12} fill="#3B4B8C" {...T} /><rect x={-384} y={-264} width={768} height={528} rx={6} fill={C.creme} stroke={C.tinta} strokeWidth={4} /><path d="M0 -264 V264" stroke={C.tinta} strokeWidth={5} />
    {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M-360 ${-200 + i * 54} H-24 M24 ${-200 + i * 54} H360`} stroke="#C9BFA6" strokeWidth={4} />)}
    <text x={-360} y={-216} fontFamily={NUN} fontWeight={900} fontSize={26} fill={C.cinza} letterSpacing={3}>ENCOMENDAS</text><text x={24} y={-216} fontFamily={NUN} fontWeight={900} fontSize={26} fill={C.cinza} letterSpacing={3}>ENTREGUE</text>
    {['APTO 12', 'APTO 31', 'APTO 07', 'APTO 55', 'APTO 23', 'APTO 42'].map((a, i) => <g key={i}><text x={-350} y={-160 + i * 54} fontFamily={MARK} fontSize={34} fill="#2A3A7A">{a}</text>
      <path d={`M60 ${-178 + i * 54} l20 22 l44 -50`} fill="none" stroke={C.verde} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={120} strokeDashoffset={i < 5 ? 0 : 120 * (1 - kCheck)} /></g>)}
  </g>);


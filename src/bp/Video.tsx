// Brasileiro Padrão · vídeo guiado por public/<pasta>/tempos.json. Cada plano tem câmera própria (de cima, de lado,
// por cima do ombro, close, celular inclinado), com paralaxe, primeiro plano fora de foco e cortes sincronizados com a fala.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, random } from 'remotion';
import '@fontsource/nunito/800.css'; import '@fontsource/nunito/900.css'; import '@fontsource/jetbrains-mono/700.css'; import '@fontsource/permanent-marker/400.css';
import { C, NUN, MONO, MARK, T, cl, sai, suave, vai, entra, pula, brl, Valdir, ValdirTopo, ValdirLado, ValdirCostas, Neide, NeideCostas, Caixa, Celular, Placa, Extrato } from './pecas';

type Fala = { c: string; q: string; t: number; d: number; txt: string };
export type BPTempos = { total: number; falas: Fala[]; env: number[] };
const SANGRA = { x: -900, y: -700, width: 3720, height: 2480 };
const Cam: React.FC<{ z: number; cx: number; cy: number; rot?: number; f: number; mao?: number; children: React.ReactNode }> = ({ z, cx, cy, rot = 0, f, mao = 1, children }) => (
  <g transform={`translate(${960 + Math.sin(f / 37) * 5 * mao} ${540 + Math.cos(f / 29) * 4 * mao}) rotate(${rot + Math.sin(f / 53) * 0.25 * mao}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>);
const Bokeh: React.FC<{ f: number; n?: number; sem?: string }> = ({ f, n = 16, sem = 'b' }) => <>{Array.from({ length: n }).map((_, i) => { const r = 26 + random(sem + i) * 60; return <circle key={i} cx={-200 + random(sem + 'x' + i) * 2300 + Math.sin(f / 60 + i) * 8} cy={60 + random(sem + 'y' + i) * 620} r={r} fill={[C.amarelo, '#FFB45E', '#9FD6FF', C.verm][i % 4]} opacity={0.1 + random(sem + 'o' + i) * 0.16} />; })}</>;

// ---------- cenários ----------
const RuaDeCima: React.FC<{ f: number }> = ({ f }) => { const carro = 2300 - f * 13; return (<g>
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
const RuaDeLado: React.FC<{ f: number; cx: number }> = ({ f, cx }) => (<g>
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
const Dentro: React.FC<{ f: number; hora?: number; noite?: number }> = ({ f, hora = 21.2, noite = 0 }) => (<g>
  <rect {...SANGRA} fill="#E8D9B8" /><rect x={-900} y={-700} width={3720} height={1000} fill="url(#parede)" />
  <rect x={60} y={90} width={560} height={400} rx={10} fill={C.noite} {...T} /><Bokeh f={f} n={5} sem="jd" /><rect x={60} y={90} width={560} height={400} rx={10} fill="none" {...T} /><path d="M340 90 V490 M60 290 H620" {...T} />
  <g transform="translate(1250 110)"><rect x={8} y={9} width={520} height={330} rx={10} fill={C.tinta} opacity={0.3} /><rect width={520} height={330} rx={10} fill={C.creme} {...T} />{Array.from({ length: 18 }).map((_, i) => <g key={i} transform={`translate(${48 + (i % 6) * 84} ${54 + Math.floor(i / 6) * 96}) rotate(${Math.sin(f / 30 + i) * 2})`}><path d="M0 0 v38" {...T} strokeWidth={5} /><circle cx={0} cy={48} r={12} fill={i % 4 === 0 ? C.verm : C.amarelo} stroke={C.tinta} strokeWidth={4} /></g>)}</g>
  <g transform="translate(820 250)"><circle r={86} fill="#000" opacity={0.2} cx={6} cy={8} /><circle r={84} fill="#fff" {...T} />{Array.from({ length: 12 }).map((_, i) => <path key={i} d="M0 -72 v10" stroke={C.tinta} strokeWidth={5} transform={`rotate(${i * 30})`} />)}<path d="M0 0 V-40" {...T} strokeWidth={8} transform={`rotate(${(hora % 12) * 30})`} /><path d="M0 0 V-62" {...T} strokeWidth={5} transform={`rotate(${(hora % 1) * 360})`} /><circle r={7} fill={C.verm} /></g>
  <g transform="translate(700 560)"><rect x={0} y={0} width={1130} height={22} fill={C.madeiraS} {...T} />{[[40, 150, 120, '#D9A877'], [210, 110, 90, '#E3B98A'], [350, 170, 150, '#D9A877'], [560, 120, 100, '#CFA06B'], [720, 160, 130, '#E3B98A'], [920, 130, 110, '#D9A877']].map(([a, w, h, c], i) => <g key={i}><rect x={a as number} y={-(h as number)} width={w as number} height={h as number} rx={6} fill={c as string} {...T} /><rect x={(a as number) + (w as number) / 2 - 12} y={-(h as number)} width={24} height={h as number} fill="#B4703A" opacity={0.6} /></g>)}</g>
  <rect {...SANGRA} fill={C.noite} opacity={noite * 0.55} />
</g>);
const MesaDeCima: React.FC<{ f: number; noite?: number; vapor?: boolean; children?: React.ReactNode }> = ({ f, noite = 0, vapor = true, children }) => (<g>
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
const Caderno: React.FC<{ f: number; kCheck: number }> = ({ f, kCheck }) => (
  <g transform="translate(820 560) rotate(-4)"><rect x={-388} y={-268} width={800} height={560} rx={12} fill="#000" opacity={0.28} /><rect x={-400} y={-280} width={800} height={560} rx={12} fill="#3B4B8C" {...T} /><rect x={-384} y={-264} width={768} height={528} rx={6} fill={C.creme} stroke={C.tinta} strokeWidth={4} /><path d="M0 -264 V264" stroke={C.tinta} strokeWidth={5} />
    {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M-360 ${-200 + i * 54} H-24 M24 ${-200 + i * 54} H360`} stroke="#C9BFA6" strokeWidth={4} />)}
    <text x={-360} y={-216} fontFamily={NUN} fontWeight={900} fontSize={26} fill={C.cinza} letterSpacing={3}>ENCOMENDAS</text><text x={24} y={-216} fontFamily={NUN} fontWeight={900} fontSize={26} fill={C.cinza} letterSpacing={3}>ENTREGUE</text>
    {['APTO 12', 'APTO 31', 'APTO 07', 'APTO 55', 'APTO 23', 'APTO 42'].map((a, i) => <g key={i}><text x={-350} y={-160 + i * 54} fontFamily={MARK} fontSize={34} fill="#2A3A7A">{a}</text>
      <path d={`M60 ${-178 + i * 54} l20 22 l44 -50`} fill="none" stroke={C.verde} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={120} strokeDashoffset={i < 5 ? 0 : 120 * (1 - kCheck)} /></g>)}
  </g>);

// ---------- vídeo ----------
export const BPVideo: React.FC<{ tempos: BPTempos; pasta?: string }> = ({ tempos }) => {
  const f = useCurrentFrame(); const t = f / 30;
  const F = Object.fromEntries(tempos.falas.map((x) => [x.c, x])) as Record<string, Fala>;
  const fr = (c: string, frac = 0) => Math.round((F[c].t + F[c].d * frac) * 30);
  const pal = (c: string, w: string) => { const i = F[c].txt.toLowerCase().indexOf(w.toLowerCase()); return fr(c, Math.max(0, i) / F[c].txt.length); };
  const fala = tempos.falas.find((x) => t >= x.t - 0.03 && t <= x.t + x.d);
  const boca = (q: string) => (fala?.q === q ? Math.min(1, (tempos.env[f] ?? 0) * 0.75 + (tempos.env[f + 1] ?? 0) * 0.25) : 0);
  const planos: [string, number][] = [['aereo', 0], ['lado', fr('chega', 0.5)], ['neide1', fr('neide1') - 5], ['entrega', fr('entrega') - 4], ['mesa', fr('mesa') - 5], ['saldo', fr('saldo') - 5], ['neide2', fr('neide2') - 4], ['deixa', fr('deixa') - 5], ['relogio', fr('vibra') - 8], ['vibra', fr('vibra') + 24], ['pix', fr('pix') - 4], ['eita', fr('eita') - 5]];
  let ip = 0; planos.forEach(([, ini], i) => { if (f >= ini) ip = i; });
  const [plano, ini] = planos[ip]; const fim = ip + 1 < planos.length ? planos[ip + 1][1] : Math.ceil(tempos.total * 30); const lf = f - ini, dur = fim - ini;
  const p = (a: number, b: number, e = suave) => interpolate(lf, [0, dur], [a, b], { ...cl, easing: e });
  const semente = Math.floor(f / 6);
  // corte "chicote" entre o plano de lado e a Dona Neide
  const chic = plano === 'lado' && fim - f <= 5 ? -Math.pow((5 - (fim - f)) / 5, 2) * 1500 : plano === 'neide1' && lf < 6 ? Math.pow(1 - lf / 6, 2) * 1300 : 0;
  const tPix = pal('pix', 'cinquenta'); const hudK = entra(f, pal('saldo', 'trinta') + 2, 12);
  const saldo = f < tPix ? 37.12 : interpolate(f, [tPix, tPix + 26], [37.12, 50000037.12], { ...cl, easing: Easing.out(Easing.exp) });
  const hudPulso = f >= tPix ? Math.max(0, 1 - (f - tPix - 22) / 14) * (f > tPix + 20 ? 1 : 0.4 + 0.3 * Math.sin(f * 2.2)) : 0;
  return (
    <AbsoluteFill style={{ background: C.tinta }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <filter id="trem" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves={2} seed={semente} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" /></filter>
          <filter id="fora" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={7} /></filter>
          <filter id="chic" x="-30%" y="0" width="160%" height="100%"><feGaussianBlur stdDeviation={`${Math.min(60, Math.abs(chic) / 14)} 0`} /></filter>
          <filter id="grao"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={f % 7} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.09 0" /></filter>
          <radialGradient id="vinh" cx="50%" cy="50%" r="75%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.38} /></radialGradient>
          <radialGradient id="poca"><stop offset="0" stopColor="#FFE9A8" stopOpacity={0.5} /><stop offset="1" stopColor="#FFE9A8" stopOpacity={0} /></radialGradient>
          <radialGradient id="abajur"><stop offset="0" stopColor="#FFD98A" stopOpacity={0.5} /><stop offset="0.6" stopColor="#FFD98A" stopOpacity={0.12} /><stop offset="1" stopColor="#FFD98A" stopOpacity={0} /></radialGradient>
          <radialGradient id="tela"><stop offset="0" stopColor="#7FF0DD" stopOpacity={0.55} /><stop offset="1" stopColor="#7FF0DD" stopOpacity={0} /></radialGradient>
          <linearGradient id="ceuN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.noite} /><stop offset="1" stopColor="#33457A" /></linearGradient>
          <linearGradient id="parede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D8C7A2" /><stop offset="1" stopColor="#E8D9B8" /></linearGradient>
          <clipPath id="janela"><rect x={430} y={150} width={1060} height={690} rx={14} /></clipPath>
        </defs>
        <g filter={chic ? 'url(#chic)' : undefined} transform={`translate(${chic} 0)`}>
        <g filter="url(#trem)">
          {plano === 'aereo' && (() => { const vx = p(260, 1180, Easing.linear); return (
            <Cam f={f} z={p(0.9, 1.32)} cx={p(900, 1260)} cy={p(520, 640)} rot={p(-9, -2)}><RuaDeCima f={f} /><ValdirTopo x={vx} y={706} rot={90} s={0.72} f={f} modo="andando" /></Cam>); })()}
          {plano === 'lado' && (() => { const vx = p(900, 1840, Easing.linear); const cx = vx + 190; return (
            <Cam f={f} z={p(1.0, 1.1)} cx={cx} cy={600} mao={1.4}><RuaDeLado f={f} cx={cx} /><ValdirLado x={vx} y={884} s={0.88} f={f} />
              <g filter="url(#fora)" transform={`translate(${(cx - 1400) * -0.7} 0)`}>{[1300, 2500, 3700, 4900].map((a) => <path key={a} d={`M${a - 300} 1200 q130 -330 280 -130 q70 -260 280 130 Z`} fill="#0F2A20" />)}</g></Cam>); })()}
          {plano === 'neide1' && (
            <Cam f={f} z={p(1.03, 1.12)} cx={p(930, 990)} cy={540}><rect {...SANGRA} fill="url(#ceuN)" /><Bokeh f={f} sem="n1" /><rect x={-900} y={700} width={3720} height={900} fill="#39405A" />
              <Neide x={1130} y={1075} s={1.3} boca={boca('d')} f={f} olhar={[-0.5, 0]} />
              <rect x={-900} y={880} width={3720} height={800} fill={C.madeira} {...T} /><rect x={-900} y={880} width={3720} height={34} fill="#D9A877" {...T} strokeWidth={5} />
              <path d="M-900 -700 H2820 V1780 H-900 Z M150 60 H1790 V1500 H150 Z" fill="#3A3F52" fillRule="evenodd" /><rect x={150} y={60} width={1640} height={1440} fill="none" {...T} strokeWidth={12} /><rect x={150} y={60} width={1640} height={1440} fill="#FFE9A8" opacity={0.05} />
              <g filter="url(#fora)"><ValdirCostas x={p(420, 380)} y={790} s={1.55} f={f} /></g></Cam>)}
          {plano === 'entrega' && (() => { const k = pula(lf, 8, 22); return (
            <Cam f={f} z={p(1.02, 1.1)} cx={p(980, 940)} cy={520}><rect {...SANGRA} fill={C.creme} />{Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M-900 ${-200 + i * 120} H2820`} stroke="#EADFC6" strokeWidth={5} />)}
              <g clipPath="url(#janela)"><g transform="translate(0 -40)"><Dentro f={f} hora={21.25} /></g><Valdir x={960} y={1040} s={1.18} expr="sorriso" pose="entrega" k={k} boca={boca('v')} f={f} olhar={[0.5, -0.3]} /><rect x={430} y={150} width={1060} height={690} fill="#FFE9A8" opacity={0.08} /></g>
              <rect x={430} y={150} width={1060} height={690} rx={14} fill="none" {...T} strokeWidth={12} /><rect x={390} y={832} width={1140} height={44} rx={10} fill={C.madeira} {...T} />
              <path d="M330 150 H1590 L1650 40 H270 Z" fill={C.verm} {...T} />{Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${300 + i * 150} 40 L${350 + i * 140} 150`} stroke="#B93A2A" strokeWidth={8} />)}
              <g transform="translate(960 -60)"><rect x={-240} y={-50} width={480} height={96} rx={12} fill="#2E4A3E" {...T} /><text y={20} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={56} fill={C.creme} letterSpacing={8}>PORTARIA</text></g>
              <g filter="url(#fora)"><NeideCostas x={p(1560, 1600)} y={780} s={1.5} f={f} /></g></Cam>); })()}
          {plano === 'mesa' && (() => { const kc = vai(f, pal('mesa', 'nenhuma') + 2, pal('mesa', 'nenhuma') + 14, 0, 1, sai); const mx = 880 + kc * 64, my = 650 - (kc > 0 && kc < 1 ? Math.sin(kc * Math.PI) * -30 : 0) - kc * 50; return (
            <Cam f={f} z={p(1.1, 1.2)} cx={p(900, 960)} cy={p(600, 560)} rot={p(-7, -3)}><MesaDeCima f={f}><Caderno f={f} kCheck={kc} />
              <g transform="translate(1420 760) rotate(14)"><rect x={-106} y={-196} width={220} height={400} rx={30} fill="#000" opacity={0.28} /><rect x={-110} y={-200} width={220} height={400} rx={30} fill="#1B1B22" {...T} /><rect x={-96} y={-184} width={192} height={368} rx={18} fill="#2A2D38" /></g>
              <ValdirTopo x={860} y={1180} s={1.25} f={f} modo="sentado" />
              <path d={`M1030 1130 Q1130 900 ${mx + 30} ${my + 40}`} fill="none" stroke={C.tinta} strokeWidth={78} strokeLinecap="round" /><path d={`M1030 1130 Q1130 900 ${mx + 30} ${my + 40}`} fill="none" stroke={C.azul} strokeWidth={62} strokeLinecap="round" />
              <g transform={`translate(${mx} ${my})`}><rect x={-10} y={-130} width={20} height={150} rx={8} fill={C.verm} {...T} strokeWidth={5} transform="rotate(-28)" /><ellipse cx={34} cy={40} rx={46} ry={38} fill={C.pele} {...T} /></g>
            </MesaDeCima></Cam>); })()}
          {plano === 'saldo' && (() => { const k = vai(lf, 0, 18, 0, 1, sai); const ap = pal('saldo', 'trinta'); return (
            <g><rect {...SANGRA} fill={C.noite2} /><circle cx={960} cy={540} r={p(560, 700)} fill="url(#tela)" />{Array.from({ length: 12 }).map((_, i) => <path key={i} d="M0 -520 L30 -1200 L-30 -1200 Z" fill="#BFF3EA" opacity={0.05} transform={`translate(960 540) rotate(${i * 30 + f * 0.2})`} />)}
              <Cam f={f} z={p(1.02, 1.12)} cx={960} cy={540}><g transform={`translate(${960 + (1 - k) * 260} ${570 + (1 - k) * 160}) rotate(${-16 + k * 12}) skewX(${-14 + k * 14}) scale(${1.02 + k * 0.1} ${0.86 + k * 0.26})`}>
                <Celular>
                  <rect x={-196} y={-390} width={392} height={210} rx={34} fill={C.teal} /><rect x={-196} y={-230} width={392} height={50} fill={C.teal} />
                  <text x={-160} y={-310} fontFamily={NUN} fontWeight={900} fontSize={34} fill="#fff">Olá, Valdir</text><text x={-160} y={-262} fontFamily={NUN} fontWeight={800} fontSize={22} fill="#D6F5EF">conta corrente</text><circle cx={140} cy={-300} r={30} fill="#fff" opacity={0.25} />
                  <text x={-160} y={-120} fontFamily={NUN} fontWeight={800} fontSize={24} fill={C.cinza}>Saldo disponível</text>
                  <g transform={`translate(-160 -50) scale(${f >= ap ? 0.6 + 0.4 * pula(f, ap, 12) : 1})`}><text fontFamily={MONO} fontWeight={700} fontSize={62} fill={C.tinta}>{f >= ap ? 'R$ 37,12' : 'R$ ••••'}</text></g>
                  <path d="M-160 -10 H160" stroke="#CFE5E0" strokeWidth={4} />
                  {[['Padaria', '- 8,50'], ['Bilhete único', '- 5,00'], ['Mercado', '- 42,90'], ['Salário', '+ 1.830,00']].map(([a, b], i) => <g key={i} opacity={entra(lf, 10 + i * 4, 8)} transform={`translate(${(1 - entra(lf, 10 + i * 4, 8)) * 40} ${50 + i * 78})`}><circle cx={-134} cy={-8} r={24} fill={i === 3 ? '#CDEFD9' : '#F6D9D3'} /><text x={-96} y={0} fontFamily={NUN} fontWeight={800} fontSize={26} fill={C.tinta}>{a}</text><text x={164} y={0} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={24} fill={i === 3 ? C.verde : C.verm}>{b}</text></g>)}
                </Celular>
                <path d="M196 120 Q330 150 320 330 L420 520 L150 520 Q230 380 196 260 Z" fill={C.pele} {...T} /></g></Cam></g>); })()}
          {plano === 'neide2' && (
            <Cam f={f} z={p(1.05, 1.16)} cx={960} cy={500} rot={p(4, 2.5)}><rect {...SANGRA} fill="url(#ceuN)" /><Bokeh f={f} sem="n2" n={20} />
              <g transform={`translate(${Math.sin(lf / 3) * 14} 0) rotate(${Math.sin(lf / 3) * 2.5} 960 900)`}><Neide x={960} y={1560} s={2.05} boca={boca('d')} f={f} expr="bronca" sacolas={false} olhar={[-0.4, 0.2]} /></g>
</Cam>)}
          {plano === 'deixa' && (() => { const k = vai(lf, 3, 20, 0, 1, Easing.linear); return (
            <Cam f={f} z={p(1.12, 1.2)} cx={p(940, 980)} cy={p(540, 510)} rot={p(-3, -1.5)}><g transform="translate(0 40)"><Dentro f={f} hora={21.3} /></g>
              <g transform="translate(900 1330) scale(1 1.05)"><Valdir x={0} y={0} s={1.45} expr="confiante" pose="joia" k={k} boca={boca('v')} f={f} /></g>
              {[0, 1, 2, 3, 4].map((i) => { const kk = entra(lf, 14 + i, 10); return <path key={i} d="M0 -34 L8 -8 L34 0 L8 8 L0 34 L-8 8 L-34 0 L-8 -8 Z" fill={C.amarelo} stroke={C.tinta} strokeWidth={4} opacity={kk * (1 - entra(lf, 30 + i, 12))} transform={`translate(${1236 + Math.cos(i * 1.3) * 120 * kk} ${640 + Math.sin(i * 1.3) * 110 * kk - 40}) scale(${0.6 + (i % 2) * 0.5})`} />; })}</Cam>); })()}
          {plano === 'relogio' && (() => { const k = vai(lf, 2, dur - 3, 0, 1); const h = (21.2 + k * 6) % 24; const hh = Math.floor(h), mm = Math.floor((h % 1) * 60); return (
            <g><rect {...SANGRA} fill={C.noite} />{Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={(i * 397 + k * 1400) % 2100 - 90} cy={(i * 211) % 1080} r={2 + (i % 3)} fill="#fff" opacity={0.5} />)}
              <g transform={`translate(${300 + k * 1320} ${760 - Math.sin(k * Math.PI) * 560})`}><circle r={90} fill="#FFF3C4" /><circle cx={-34} cy={-22} r={80} fill={C.noite} /></g>
              <g transform={`translate(960 540) scale(${1 + Math.sin(k * Math.PI) * 0.08})`}><rect x={-388} y={-146} width={800} height={300} rx={30} fill="#000" opacity={0.4} /><rect x={-400} y={-160} width={800} height={300} rx={30} fill="#111" {...T} /><text y={72} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={220} fill={C.verm}>{String(hh).padStart(2, '0')}:{String(k >= 1 ? 12 : mm).padStart(2, '0')}</text></g></g>); })()}
          {plano === 'vibra' && (() => { const v = (lf > 4 && lf < 20) || (lf > 26 && lf < 42) || lf > 48; const jx = v ? Math.sin(f * 2.7) * 9 : 0; return (
            <Cam f={f} z={p(1.08, 1.5, sai)} cx={p(900, 1330, sai)} cy={p(600, 720, sai)} rot={p(-6, 5)}><MesaDeCima f={f} noite={1} vapor={false}><Caderno f={f} kCheck={1} /><ValdirTopo x={830} y={1130} s={1.25} f={f} modo="dormindo" rot={-6} />
              {[0, 1, 2].map((i) => { const k = ((f + i * 24) % 72) / 72; return <text key={i} x={1000 + k * 90} y={860 - k * 130} fontFamily={MARK} fontSize={44 + k * 34} fill={C.creme} opacity={(1 - k) * 0.9}>z</text>; })}</MesaDeCima>
              <g transform={`translate(${1420 + jx + lf * 0.5} 760) rotate(${14 + (v ? Math.sin(f * 3.3) * 3 : 0)})`}>{v && <circle r={360} fill="url(#tela)" />}
                {v && [0, 1, 2].map((i) => <rect key={i} x={-130 - i * 26} y={-220 - i * 26} width={260 + i * 52} height={440 + i * 52} rx={44 + i * 16} fill="none" stroke="#BFF3EA" strokeWidth={7} opacity={(0.8 - i * 0.25) * (0.5 + 0.5 * Math.sin(f * 1.6 - i))} />)}
                <rect x={-110} y={-200} width={220} height={400} rx={30} fill="#1B1B22" {...T} /><rect x={-96} y={-184} width={192} height={368} rx={18} fill={v ? '#EAF8F5' : '#2A2D38'} />
                {v && <><circle cx={0} cy={-70} r={34} fill={C.teal} /><path d="M-15 -70 l10 11 l21 -23" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /><rect x={-70} y={-10} width={140} height={18} rx={9} fill="#9AD9CF" /><rect x={-50} y={24} width={100} height={14} rx={7} fill="#CFE5E0" /></>}</g></Cam>); })()}
          {plano === 'pix' && (() => { const k = vai(lf, 0, 14, 0, 1, sai); const val = interpolate(f, [tPix, tPix + 26], [0, 50000000], { ...cl, easing: Easing.out(Easing.exp) }); return (
            <g><rect {...SANGRA} fill={C.noite} /><circle cx={960} cy={540} r={p(560, 760)} fill="url(#tela)" />{Array.from({ length: 14 }).map((_, i) => <path key={i} d="M0 -520 L34 -1300 L-34 -1300 Z" fill="#BFF3EA" opacity={0.07 + (f >= tPix ? 0.05 : 0)} transform={`translate(960 540) rotate(${i * 25.7 + f * 0.35})`} />)}
              <Cam f={f} z={p(1.0, 1.14)} cx={960} cy={540} mao={f >= tPix && f < tPix + 14 ? 6 : 1}><g transform={`translate(960 ${590 + (1 - k) * 500}) rotate(${10 - k * 13}) skewX(${12 - k * 12}) scale(${1.08} ${0.84 + k * 0.24})`}>
                <Celular><text x={0} y={-320} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={64} fill={C.tinta}>03:12</text>
                  <g transform={`translate(0 -90) scale(${pula(lf, 6, 16)})`}><rect x={-178} y={-150} width={372} height={330} rx={26} fill="#000" opacity={0.15} /><rect x={-186} y={-160} width={372} height={330} rx={26} fill="#fff" stroke={C.tinta} strokeWidth={6} />
                    <circle cx={0} cy={-100} r={38} fill={C.teal} stroke={C.tinta} strokeWidth={5} /><path d="M-16 -100 l11 12 l22 -24" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
                    <text x={0} y={-22} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={36} fill={C.tinta}>Pix recebido</text>
                    <text x={0} y={46} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={31} fill={C.verde}>{f >= tPix ? brl(val) : 'R$ ...'}</text>
                    <text x={0} y={96} textAnchor="middle" fontFamily={NUN} fontWeight={800} fontSize={20} fill={C.cinza}>de: BOI GORDO AGRO S.A.</text><text x={0} y={130} textAnchor="middle" fontFamily={NUN} fontWeight={800} fontSize={20} fill={C.cinza}>agora mesmo</text></g></Celular></g></Cam>
              {f >= tPix + 4 && Array.from({ length: 22 }).map((_, i) => { const a = random('m' + i) * 6.28, d = (f - tPix - 4) * (10 + random('v' + i) * 16), q = Math.min(1, (f - tPix - 4) / 30); return <g key={i} transform={`translate(${960 + Math.cos(a) * d} ${560 + Math.sin(a) * d + q * q * 300}) rotate(${f * 9 + i * 40})`} opacity={1 - q * 0.6}><ellipse rx={22} ry={22 * Math.abs(Math.cos(f / 4 + i))} fill={C.amarelo} stroke={C.tinta} strokeWidth={4} /></g>; })}</g>); })()}
          {plano === 'eita' && (() => { const z = lf < 9 ? 3.3 : interpolate(lf, [9, 19], [3.3, 1.28], { ...cl, easing: Easing.out(Easing.back(1.4)) }); const cy = lf < 9 ? 395 : interpolate(lf, [9, 19], [395, 470], cl); return (
            <Cam f={f} z={z + p(0, 0.08)} cx={920} cy={cy} rot={lf < 9 ? 0 : p(-2, 0)} mao={lf > 9 && lf < 20 ? 5 : 1}><g transform="translate(0 30)"><Dentro f={f} hora={3.2} noite={1} /></g><circle cx={1150} cy={560} r={520} fill="url(#tela)" opacity={0.6} />
              <Valdir x={900} y={1130} s={1.3} expr="susto" pose="celular" boca={boca('v')} f={f} olhar={[0.7, -0.2]} luz="#7FF0DD" /></Cam>); })()}
        </g></g>
        <rect width={1920} height={1080} filter="url(#grao)" opacity={0.9} style={{ mixBlendMode: 'multiply' }} />
        <rect width={1920} height={1080} fill="url(#vinh)" />
        {plano === 'aereo' && <Placa x={390} y={140} txt="21:12 · GUARULHOS, SP" k={pula(f, 10)} tam={44} fundo="#111" cor={C.amarelo} rot={-2} />}
        {plano === 'mesa' && <><g transform={`translate(1500 760) rotate(${-12 + (1 - pula(f, pal('mesa', 'dezenove'), 10)) * 20}) scale(${3 - 2 * Math.min(1, pula(f, pal('mesa', 'dezenove'), 10))})`} opacity={entra(f, pal('mesa', 'dezenove'), 3)}><circle r={170} fill="none" stroke={C.verm} strokeWidth={14} /><circle r={146} fill="none" stroke={C.verm} strokeWidth={5} /><text y={30} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={150} fill={C.verm}>19</text><text y={96} textAnchor="middle" fontFamily={NUN} fontWeight={900} fontSize={46} fill={C.verm} letterSpacing={6}>ANOS</text></g>
          <Placa x={640} y={960} txt="ENCOMENDAS PERDIDAS: 0" k={pula(f, pal('mesa', 'nenhuma') + 8)} tam={50} rot={-2} /></>}
        {plano === 'deixa' && <g transform={`translate(1380 360) rotate(3) scale(${pula(f, fr('deixa') + 3)})`}><path d="M-300 -110 H300 Q330 -110 330 -80 V80 Q330 110 300 110 H-120 L-250 190 L-200 110 H-300 Q-330 110 -330 80 V-80 Q-330 -110 -300 -110 Z" fill="#000" opacity={0.25} transform="translate(10 12)" /><path d="M-300 -110 H300 Q330 -110 330 -80 V80 Q330 110 300 110 H-120 L-250 190 L-200 110 H-300 Q-330 110 -330 80 V-80 Q-330 -110 -300 -110 Z" fill="#fff" {...T} /><text y={26} textAnchor="middle" fontFamily={MARK} fontSize={78} fill={C.tinta}>Deixa comigo.</text></g>}
        {plano === 'relogio' && <Placa x={960} y={880} txt="6 HORAS DEPOIS" k={pula(lf, 4)} tam={70} fundo={C.amarelo} fonte={NUN} rot={-2} />}
        {plano === 'pix' && <Placa x={960} y={985} txt="R$ 50.000.000,00" k={pula(f, tPix + 22)} cor={C.verde} tam={80} />}
        {hudK > 0 && plano !== 'relogio' && <Extrato valor={saldo} k={hudK} pulso={hudPulso} />}
        {f < 8 && <rect width={1920} height={1080} fill="#000" opacity={1 - f / 8} />}
      </svg>
    </AbsoluteFill>);
};

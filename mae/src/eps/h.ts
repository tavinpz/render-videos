// atalhos de câmera para os episódios (coordenadas relativas ao cenário)
import type { CamSpec } from "../motor/spec";
import type { V3 } from "../motor/base";
export const HEAD = { mae: 1.42, vo: 1.42, pai: 1.44, davi: 0.88, kid: 0.88 } as const;
const rad = (d: number) => (d * Math.PI) / 180;
/** close de rosto: cabeça em ~62 % da altura (deixa o topo livre para a legenda); az gira em volta (0 = de frente, câmera em -z) */
export const face = (x: number, z: number, hy: number, o: { d?: number; fov?: number; hf?: number; az?: number; fr?: number; roll?: number; push?: number; dy?: number } = {}): CamSpec => {
  // hf = fração da altura do quadro ocupada pela cabeça (~0,55 m com o coque); o fov sai daí
  const d = o.d ?? 2.8, hf = o.hf ?? 0.38, vh = 0.55 / hf, fov = (2 * Math.atan(vh / 2 / d) * 180) / Math.PI, az = rad(o.az ?? 0), fr = o.fr ?? 0.66;
  const p: V3 = [x + Math.sin(az) * d, hy + 0.05 + (o.dy ?? 0), z - Math.cos(az) * d], l: V3 = [x, hy + (fr - 0.5) * vh, z];
  return { p, l, fov, roll: o.roll ?? 0, ...(o.push ? { fov2: fov * o.push, dur: 0.5 } : {}) };
};
/** plano aberto: câmera a d metros, olhando para (x, y, z) */
export const wide = (x: number, y: number, z: number, o: { d?: number; fov?: number; az?: number; h?: number; roll?: number; p2d?: number; dur?: number } = {}): CamSpec => {
  const d = o.d ?? 6, az = rad(o.az ?? 0), h = o.h ?? 1.6;
  const p: V3 = [x + Math.sin(az) * d, h, z - Math.cos(az) * d];
  const out: CamSpec = { p, l: [x, y, z], fov: o.fov ?? 38, roll: o.roll ?? 0 };
  if (o.p2d) { out.p2 = [x + Math.sin(az) * o.p2d, h, z - Math.cos(az) * o.p2d]; out.dur = o.dur ?? 1.4; }
  return out;
};

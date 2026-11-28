import { FPS } from "./base";
import type { Ep, At } from "./spec";
// ---------------- tempo ----------------
export const timeOf = (ep: Ep, at: At) => {
  const [i, off, frac] = typeof at === "number" ? [at, 0, 0] : [at[0], at[1], at[2] ?? 0];
  const f = ep.tempos.falas[Math.min(i, ep.tempos.falas.length - 1)];
  if (i >= ep.tempos.falas.length) return ep.tempos.total;
  return f.a + (frac ? off * (f.b - f.a) : off);
};
export const shotFrames = (ep: Ep) => ep.shots.map((s, i) => {
  const a = i === 0 ? 0 : Math.round(timeOf(ep, s.at) * FPS);
  const b = i + 1 < ep.shots.length ? Math.round(timeOf(ep, ep.shots[i + 1].at) * FPS) : Math.round(ep.tempos.total * FPS);
  return { a, b };
});

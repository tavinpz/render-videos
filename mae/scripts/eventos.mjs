// grava public/mm/<ep>/eventos.json: planos (quadros), luz, chuva, cortes, tremidas, efeitos, objetos que se movem, crescimento
import { build } from "esbuild"; import fs from "fs";
const ep = process.argv[2];
await build({ entryPoints: ["src/planos_entry.ts"], bundle: true, platform: "node", format: "esm", outfile: "/tmp/planos.mjs", logLevel: "error", loader: { ".json": "json" } });
const { EPS, shotFrames, timeOf } = await import("/tmp/planos.mjs?" + Date.now());
const e = EPS[ep], fr = shotFrames(e), T = (a) => timeOf(e, a);
const planos = e.shots.map((s, i) => {
  const kicks = s.kick === true ? [fr[i].a / 30] : Array.isArray(s.kick) ? s.kick.map(T) : [];
  const grow = (s.acts ?? []).flatMap((a) => Array.isArray(a.s) ? a.s.slice(1).map(([k, v], j) => ({ t: T(k), de: a.s[j][1], para: v })) : []);
  const rise = (s.acts ?? []).filter((a) => a.rise).map((a) => T(a.rise[0])).concat((s.props ?? []).filter((p) => p.rise).map((p) => T(p.rise[0])));
  return { i, a: fr[i].a / 30, b: fr[i].b / 30, set: s.set, luz: s.light ?? "day", chuva: s.rain ?? 0, granizo: !!s.hail, enchente: s.flood !== undefined, arco: !!s.rainbow,
    flash: !!s.flash, kicks, fx: (s.fx ?? []).map((f) => ({ k: f.k, t: T(f.at) })), props: (s.props ?? []).filter((p) => p.drift || p.spin).map((p) => p.k), grow, rise,
    leg: s.leg ?? 480, hop: (s.acts ?? []).some((a) => a.hop), shake: (s.acts ?? []).some((a) => a.shake) };
});
fs.writeFileSync(process.argv[3] ?? `../public/mm/${ep}/eventos.json`, JSON.stringify({ total: e.tempos.total, planos }, null, 1));
console.log(ep, planos.length, "planos");

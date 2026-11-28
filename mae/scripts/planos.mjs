// imprime o quadro inicial/final de cada plano e grava /tmp/shots_<ep>.json (um quadro no meio de cada plano)
import { build } from "esbuild"; import fs from "fs";
const ep = process.argv[2];
await build({ entryPoints: ["src/planos_entry.ts"], bundle: true, platform: "node", format: "esm", outfile: "/tmp/planos.mjs", logLevel: "error", loader: { ".json": "json" } });
const { EPS, shotFrames } = await import("/tmp/planos.mjs?" + Date.now());
const e = EPS[ep], fr = shotFrames(e);
const mids = [0, ...fr.map((r) => Math.round((r.a + r.b) / 2))];
fr.forEach((r, i) => console.log(i, e.shots[i].set, r.a, r.b, ((r.b - r.a) / 30).toFixed(2) + "s"));
fs.writeFileSync(`/tmp/shots_${ep}.json`, JSON.stringify(mids));

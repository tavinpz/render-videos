// node scripts/stills.mjs <ep> <saida> <escala> f1,f2,... (ou "shots" = 1 quadro no meio de cada plano + o 1º)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path"; import fs from "fs";
const [ep, out, sc = "0.4", list = "shots"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const inputProps = { ep, ms: 0 };
const comp = await selectComposition({ serveUrl, id: `Mae-${ep}`, inputProps, browserExecutable: "/usr/bin/google-chrome", chromiumOptions: { gl: "angle" } });
let frames = list === "shots" ? JSON.parse(fs.readFileSync(`/tmp/shots_${ep}.json`)) : list.split(",").map(Number);
for (const f of frames) {
  const t0 = Date.now();
  await renderStill({ serveUrl, composition: comp, frame: f, output: `${out}/q_${String(f).padStart(5, "0")}.jpg`, imageFormat: "jpeg", jpegQuality: 85, scale: Number(sc), inputProps,
    browserExecutable: "/usr/bin/google-chrome", chromiumOptions: { gl: "angle" } });
  console.log(f, (Date.now() - t0) + "ms");
}

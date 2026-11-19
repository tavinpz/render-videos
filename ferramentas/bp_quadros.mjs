// Um quadro por plano (meio do plano), para conferir antes do render. Uso: node ferramentas/bp_quadros.mjs bp/v01 /tmp/saida [escala]
import { bundle } from '@remotion/bundler'; import { renderStill, selectComposition } from '@remotion/renderer'; import fs from 'fs'; import path from 'path';
const [pasta, out, esc = '0.25'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const T = JSON.parse(fs.readFileSync(`public/${pasta}/tempos.json`)); const total = Math.ceil(T.total * 30); const ini = [];
T.falas.forEach((f) => { if (f.s || !ini.length) ini.push(ini.length ? Math.round(f.t * 30) - 5 : 0); });
const quadros = ini.map((a, i) => Math.round(a + ((i + 1 < ini.length ? ini[i + 1] : total) - a) * 0.62));
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') }); const browserExecutable = process.env.CHROME || undefined;
const composition = await selectComposition({ serveUrl, id: 'BPVideo', inputProps: { pasta }, browserExecutable, chromiumOptions: { gl: 'swangle' } });
for (let i = 0; i < quadros.length; i++) { await renderStill({ composition, serveUrl, frame: quadros[i], output: `${out}/p${String(i).padStart(2, '0')}.jpg`, inputProps: { pasta }, scale: Number(esc), imageFormat: 'jpeg', jpegQuality: 80, browserExecutable, chromiumOptions: { gl: 'swangle' } }); }
console.log('ok', quadros.length);

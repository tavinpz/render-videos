import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
const [,, out, ...pares] = process.argv; const BX = '/usr/bin/google-chrome';
const serveUrl = await bundle({entryPoint: process.cwd() + '/src/index.ts', outDir: '/tmp/bundle-rv'});
for (const p of pares) { const [c, v] = p.split(':'); const ip = {c, v};
  const comp = await selectComposition({serveUrl, id: 'CapasV2', inputProps: ip, browserExecutable: BX});
  await renderStill({composition: comp, serveUrl, output: `${out}/${c}${v}.jpg`, imageFormat: 'jpeg', jpegQuality: 92, inputProps: ip, browserExecutable: BX}); }
console.log('ok');

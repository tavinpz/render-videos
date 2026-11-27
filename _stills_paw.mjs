import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
const ts = process.argv.slice(3).map(Number); const out = process.argv[2];
const b = await bundle({ entryPoint: path.resolve('src/index.ts') });
const comp = await selectComposition({ serveUrl: b, id: 'Paw3', inputProps: { pasta: (process.argv[2].includes('ep3')?'paw3/v003':process.argv[2].includes('ep2')?'paw3/v002':'paw3/v001') }, browserExecutable: '/usr/bin/google-chrome', chromiumOptions:{gl:'angle'} });
for (const t of ts) { const f = Math.min(comp.durationInFrames - 1, Math.round(t * 30));
  await renderStill({ composition: comp, serveUrl: b, output: `${out}/s_${String(t).padStart(5,'0')}.jpg`, frame: f, imageFormat: 'jpeg', jpegQuality: 80, scale: 0.5, inputProps: { pasta: (process.argv[2].includes('ep3')?'paw3/v003':process.argv[2].includes('ep2')?'paw3/v002':'paw3/v001') }, browserExecutable: '/usr/bin/google-chrome', chromiumOptions:{gl:'angle'} });
  console.log('ok', t); }

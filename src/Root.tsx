// Só as composições do motor Arte (os 3 canais longos), para renderizar no GitHub Actions.
import React from 'react';
import { Composition, staticFile } from 'remotion';
import { CapasV2 } from './arte/CapasV2';
import { Bunker01, BUNKER01_FRAMES } from './bunker/Video01';
import { BunkerEp } from './bunker/Serie';
import { Arte } from './arte/Arte';
import { ArteCapa } from './arte/Capa';
import { SNBVideo } from './snb/Video';
import { SNBThumb } from './snb/Thumbs';
import { TCVideo } from './tc/Video';
import { HTCQuadro } from './htc/Quadros';
import { HTCVideo } from './htc/Video';
import { BPVideo } from './bp/Video';
import { BPThumb } from './bp/Thumbs';
import { BPMarca } from './bp/Marca';
import { HTCThumb } from './htc/Thumbs';

export const Root: React.FC = () => (
  <>
    <Composition
      id="Arte"
      component={Arte as any}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ id: 'lss002a', semAudio: true }}
      calculateMetadata={async ({ props }: any) => {
        const dados = await fetch(staticFile(`l/${props.id}/data.json`)).then((r) => r.json());
        return { durationInFrames: props.n || dados.quadros, props: { ...props, dados } };
      }}
    />
    {/* Strong Not Big: vídeo guiado por public/<pasta>/tempos.json (props.n limita os quadros num teste curto) */}
    <Composition id="SNBVideo" component={SNBVideo as any} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{ pasta: 'snb/v01' }}
      calculateMetadata={async ({ props }: any) => { const tempos = await fetch(staticFile(`${props.pasta}/tempos.json`)).then((x) => x.json()); return { durationInFrames: props.n || Math.ceil(tempos.total * 30), props: { ...props, tempos } }; }} />
    {/* Bunker (alemão): vídeo 1, tempos fixos em public/bunker/v01/tempos.json (as props pasta/n da fila são ignoradas) */}
    {/* Bunker, episódios 2 em diante: guiado por public/<pasta>/tempos.json (falas com diretivas visuais) */}
    <Composition id="BunkerEp" component={BunkerEp as any} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{ pasta: 'bunker/v02' }}
      calculateMetadata={async ({ props }: any) => { const tempos = await fetch(staticFile(`${props.pasta}/tempos.json`)).then((x) => x.json()); return { durationInFrames: props.n || Math.ceil(tempos.total * 30), props: { ...props, tempos } }; }} />
    <Composition id="Bunker01" component={Bunker01 as any} width={1920} height={1080} fps={30} durationInFrames={BUNKER01_FRAMES} />
    <Composition id="CapasV2" component={CapasV2 as any} width={1280} height={720} fps={30} durationInFrames={1} defaultProps={{ c: 'lss', v: '1' }} />
    <Composition id="SNBThumb" component={SNBThumb as any} width={1280} height={720} fps={30} durationInFrames={1} defaultProps={{ v: 'a' }} />
    {/* Brasileiro Padrão: vídeo guiado por public/<pasta>/tempos.json */}
    <Composition id="BPVideo" component={BPVideo as any} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{ pasta: 'bp/v01' }}
      calculateMetadata={async ({ props }: any) => { const tempos = await fetch(staticFile(`${props.pasta}/tempos.json`)).then((x) => x.json()); return { durationInFrames: props.n || Math.ceil(tempos.total * 30), props: { ...props, tempos } }; }} />
    <Composition id="BPMarca" component={BPMarca as any} width={800} height={800} fps={30} durationInFrames={1} defaultProps={{ tipo: 'logo' }}
      calculateMetadata={({ props }: any) => (props.tipo === 'banner' ? { width: 2560, height: 1440 } : { width: 800, height: 800 })} />
    <Composition id="BPThumb" component={BPThumb as any} width={1280} height={720} fps={30} durationInFrames={1} defaultProps={{ v: 'a' }} />
    {/* Hard to Copy: quadros parados do padrão visual (props.q = 1 a 6) */}
    <Composition id="HTCVideo" component={HTCVideo as any} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{ pasta: 'htc/v01' }}
      calculateMetadata={async ({ props }: any) => { const tempos = await fetch(staticFile(`${props.pasta}/tempos.json`)).then((x) => x.json()); return { durationInFrames: props.n || Math.ceil(tempos.total * 30), props: { ...props, tempos } }; }} />
    <Composition id="HTCThumb" component={HTCThumb as any} width={1280} height={720} fps={30} durationInFrames={1} defaultProps={{ v: 'a' }} />
    <Composition id="HTCQuadro" component={HTCQuadro as any} width={1920} height={1080} fps={30} durationInFrames={1} defaultProps={{ q: 1 }} />
    <Composition id="ArteCapa" component={ArteCapa as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ canal: 'last-state-standing', v: { tipo: 'numero', txt: '$10' }, titulo: ['TESTE'] }} />
    {/* Two Childhoods: vídeo guiado por public/<pasta>/tempos.json */}
    <Composition id="TCVideo" component={TCVideo as any} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{ pasta: 'tc/v01' }}
      calculateMetadata={async ({ props }: any) => { const tempos = await fetch(staticFile(`${props.pasta}/tempos.json`)).then((x) => x.json()); return { durationInFrames: props.n || Math.ceil(tempos.total * 30), props: { ...props, tempos } }; }} />
  </>
);

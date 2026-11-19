// Só as composições do motor Arte (os 3 canais longos), para renderizar no GitHub Actions.
import React from 'react';
import { Composition, staticFile } from 'remotion';
import { Arte } from './arte/Arte';
import { ArteCapa } from './arte/Capa';
import { SNBVideo } from './snb/Video';
import { SNBThumb } from './snb/Thumbs';
import { TCVideo } from './tc/Video';
import { HTCQuadro } from './htc/Quadros';
import { HTCVideo } from './htc/Video';
import { BPVideo } from './bp/Video';
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
    <Composition id="SNBThumb" component={SNBThumb as any} width={1280} height={720} fps={30} durationInFrames={1} defaultProps={{ v: 'a' }} />
    {/* Brasileiro Padrão: vídeo guiado por public/<pasta>/tempos.json */}
    <Composition id="BPVideo" component={BPVideo as any} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{ pasta: 'bp/v01' }}
      calculateMetadata={async ({ props }: any) => { const tempos = await fetch(staticFile(`${props.pasta}/tempos.json`)).then((x) => x.json()); return { durationInFrames: props.n || Math.ceil(tempos.total * 30), props: { ...props, tempos } }; }} />
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

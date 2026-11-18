// Só as composições do motor Arte (os 3 canais longos), para renderizar no GitHub Actions.
import React from 'react';
import { Composition, staticFile } from 'remotion';
import { Arte } from './arte/Arte';
import { ArteCapa } from './arte/Capa';

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
    <Composition id="ArteCapa" component={ArteCapa as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ canal: 'last-state-standing', v: { tipo: 'numero', txt: '$10' }, titulo: ['TESTE'] }} />
  </>
);

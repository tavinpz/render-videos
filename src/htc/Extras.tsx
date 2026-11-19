import React from 'react';
import { D02 } from './D02';
// Diagramas feitos sob medida para cada vídeo (hc002 em diante). Cada arquivo D0N.tsx exporta o seu conjunto.
export const EXTRA: Record<string, React.FC<any>> = { ...D02 };

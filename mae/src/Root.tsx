import React from "react";
import { Composition } from "remotion";
import { MaeShort, totalFrames } from "./Mae";
import { EPS } from "./eps";
export const Root: React.FC = () => (
  <>
    {Object.keys(EPS).map((id) => (
      <Composition key={id} id={`Mae-${id}`} component={MaeShort as never} durationInFrames={totalFrames(id)} fps={30} width={1080} height={1920} defaultProps={{ ep: id }} />
    ))}
  </>
);

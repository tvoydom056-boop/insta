import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
import { CastSheet } from './CastSheet';

// Every episode gets two compositions: <Id> (the film) and <Id>Board (one frame per shot, at its key frame, for the
// storyboard). Cast renders the cast sheet.
//   npx remotion studio src/index.ts --port 3430

// An episode may set its own width/height (the black-and-white line style is 2.39:1); the rest use the studio size.
const size = (e: { width?: number; height?: number }) => ({ ...(e.width ? { width: e.width } : {}), ...(e.height ? { height: e.height } : {}) });

export const Root: React.FC = () => {
  const common = { width: STUDIO.width, height: STUDIO.height, fps: STUDIO.fps };
  return (
    <>
      {EPISODES.map((e) => (
        <React.Fragment key={e.id}>
          <Composition id={e.id} component={e.Main} durationInFrames={Math.max(1, e.total)} {...common} {...size(e)} />
          <Composition id={`${e.id}Board`} component={e.Board} durationInFrames={Math.max(1, e.shotCount)} {...common} {...size(e)} />
        </React.Fragment>
      ))}
      <Composition id="Cast" component={CastSheet} durationInFrames={1} {...common} />
    </>
  );
};

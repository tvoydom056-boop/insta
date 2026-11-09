import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { H, W } from '../../lines/kit';
import { M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13, M14, Shot } from './shots';

// «Три года в темноте»: чёрно-белый линейный стиль, жёсткие склейки по началу фраз, голос одним дублем.
const CUTS = [0, 126, 189, 279, 414, 528, 687, 854, 973, 1074, 1252, 1330, 1476, 1603, 1770];
const COMPS: Shot[] = [M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13, M14];
const SHOTS = COMPS.map((C, i) => ({ C, a: CUTS[i], b: CUTS[i + 1] }));
const TOTAL = CUTS[CUTS.length - 1];

const Main: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#fff' }}>
    {SHOTS.map((s) => (
      <Sequence key={s.a} from={s.a} durationInFrames={s.b - s.a}>
        <s.C len={s.b - s.a} />
      </Sequence>
    ))}
    <Audio src={staticFile('morganie/voice.wav')} />
  </AbsoluteFill>
);

const Board: React.FC = () => {
  const s = SHOTS[Math.min(useCurrentFrame(), SHOTS.length - 1)];
  const len = s.b - s.a;
  return (
    <AbsoluteFill style={{ backgroundColor: '#fff' }}>
      <Sequence from={-Math.round(len * 0.8)}>
        <s.C len={len} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const morganie = { id: 'Morganie', total: TOTAL, shotCount: SHOTS.length, width: W, height: H, Main, Board };

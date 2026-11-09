import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp } from '../../engine/anim';
import { H, S1, S10, S11, S12, S13, S2, S3, S4, S5, S6, S7, S8, S9, W } from './shots';

// «Принцип Питера»: вертикальный ЧБ на 30 с. Границы планов выставлены по словам голоса (faster-whisper, 30 fps), склейки жёсткие.
const SHOTS: { C: React.FC<{ len: number }>; a: number; b: number }[] = [
  { C: S1, a: 0, b: 109 },
  { C: S2, a: 109, b: 168 },
  { C: S3, a: 168, b: 249 },
  { C: S4, a: 249, b: 287 },
  { C: S5, a: 287, b: 384 },
  { C: S6, a: 384, b: 452 },
  { C: S7, a: 452, b: 520 },
  { C: S8, a: 520, b: 562 },
  { C: S9, a: 562, b: 630 },
  { C: S10, a: 630, b: 694 },
  { C: S11, a: 694, b: 740 },
  { C: S12, a: 740, b: 789 },
  { C: S13, a: 789, b: 858 },
];
const TOTAL = 858;
const FADE = 15; // белый уход начинается с концом последнего слова

const Main: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: '#fff' }}>
      {SHOTS.map((s) => (
        <Sequence key={s.a} from={s.a} durationInFrames={s.b - s.a}>
          <s.C len={s.b - s.a} />
        </Sequence>
      ))}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: clamp((f - (TOTAL - FADE)) / FADE) }} />
      <Audio src={staticFile('piter/voice.wav')} />
    </AbsoluteFill>
  );
};

// Раскадровка: по одному кадру на план, на 80 % его длины.
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

export const piterBw = { id: 'PiterBw', total: TOTAL, shotCount: SHOTS.length, width: W, height: H, Main, Board };

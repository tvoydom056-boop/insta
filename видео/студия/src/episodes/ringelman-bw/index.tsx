import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp } from '../../engine/anim';
import { H, W } from '../piter-bw/shots';
import { S1, S2, S3, S4, S5, S6, S7, S8 } from './shots';

// «Эффект Рингельмана»: вертикальный ЧБ на 30 с. Голос F5 (клон), границы планов по словам (best_words.json, 30 fps), склейки жёсткие.
const SHOTS: { C: React.FC<{ len: number }>; a: number; b: number }[] = [
  { C: S1, a: 0, b: 128 },
  { C: S2, a: 128, b: 247 },
  { C: S3, a: 247, b: 374 },
  { C: S4, a: 374, b: 431 },
  { C: S5, a: 431, b: 532 },
  { C: S6, a: 532, b: 690 },
  { C: S7, a: 690, b: 752 },
  { C: S8, a: 752, b: 840 },
];
const TOTAL = 840;

const Main: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: '#fff' }}>
      {SHOTS.map((s) => (
        <Sequence key={s.a} from={s.a} durationInFrames={s.b - s.a}>
          <s.C len={s.b - s.a} />
        </Sequence>
      ))}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: clamp((f - 818) / 22) }} />
      <Audio src={staticFile('ringelman/voice.wav')} />
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

export const ringelmanBw = { id: 'RingelmanBw', total: TOTAL, shotCount: SHOTS.length, width: W, height: H, Main, Board };

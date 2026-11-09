import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp } from '../../engine/anim';
import { H, W } from '../piter-bw/shots';
import * as S from './shots';
import { FADE, PLANS, TOTAL, VOICE_END } from './timing';

// «Прибавка» на 80–100 с: вертикальный ЧБ, 37 планов. Границы и моменты внутри планов лежат в timing.ts
// (генерирует скрипт по best_words.json, 30 fps), склейки жёсткие, голос F5 (клон).
const COMPONENTS: React.FC<{ len: number }>[] = [
  S.S1, S.S2, S.S3, S.S4, S.S5, S.S6, S.S7, S.S8, S.S9, S.S10, S.S11, S.SA, S.S12, S.S13, S.S14, S.S15, S.S16, S.SB, S.S17,
  S.S18, S.S19, S.S20, S.S21, S.S22, S.S23, S.S24, S.S25, S.S26, S.S27, S.S28, S.S29, S.SC, S.S30, S.S31, S.S32, S.S33, S.S34,
];
const SHOTS = PLANS.map(([a, b], i) => ({ C: COMPONENTS[i], a, b }));

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
      <Audio src={staticFile('pribavka80/voice.wav')} endAt={VOICE_END} />
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

export const pribavka80Bw = { id: 'Pribavka80Bw', total: TOTAL, shotCount: SHOTS.length, width: W, height: H, Main, Board };

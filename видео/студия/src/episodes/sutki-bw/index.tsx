import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp } from '../../engine/anim';
import { H, W } from '../../lines/kit';
import { L1, L2, L3 } from './shots';

// «Сутки без сна» в чёрно-белом линейном стиле: жёсткие склейки (как в референсе), без плашек и цвета. Голос тот же, что в цветной версии.
const SHOTS: { C: React.FC<{ len: number }>; a: number; b: number }[] = [
  { C: () => <L1 />, a: 0, b: 111 },
  { C: () => <L2 />, a: 111, b: 276 },
  { C: ({ len }) => <L3 len={len} />, a: 276, b: 450 },
];
const TOTAL = 450;

const Main: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: '#fff' }}>
      {SHOTS.map((s) => (
        <Sequence key={s.a} from={s.a} durationInFrames={s.b - s.a}>
          <s.C len={s.b - s.a} />
        </Sequence>
      ))}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: clamp((f - 420) / 30) }} />
      <Audio src={staticFile('sutki/voice.wav')} />
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

export const sutkiBw = { id: 'SutkiBw', total: TOTAL, shotCount: SHOTS.length, width: W, height: H, Main, Board };

import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { clamp } from '../../engine/anim';
import { PencilDefs } from '../../pencil/kit';
import { StoryShot } from '../sutki/shots';
import { P1, P2, P3 } from './shots';

// «Сутки без сна» карандашом: монтаж и голос цветной версии (sutki/index.tsx), растворения идут через чистый лист.
const SHOTS: { C: StoryShot; a: number; b: number; fadeIn: number; fadeOut: number }[] = [
  { C: P1, a: 0, b: 130, fadeIn: 18, fadeOut: 0 },
  { C: P2, a: 111, b: 290, fadeIn: 15, fadeOut: 0 },
  { C: P3, a: 276, b: 450, fadeIn: 15, fadeOut: 30 },
];
const TOTAL = 450;
const SHEET = '#F6F6F6';

const Layer: React.FC<{ C: StoryShot; t: number; len: number; f: number }> = ({ C, t, len, f }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <PencilDefs f={f} />
    </defs>
    <g filter="url(#pencil)">
      <C t={t} len={len} />
    </g>
  </svg>
);

const Main: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: SHEET }}>
      {SHOTS.filter((s) => f >= s.a && f < s.b).map((s) => {
        const o = (s.fadeIn ? clamp((f - s.a + 1) / s.fadeIn) : 1) * (s.fadeOut ? clamp((s.b - f - 1) / s.fadeOut) : 1);
        return (
          <AbsoluteFill key={s.a} style={{ opacity: o }}>
            <Layer C={s.C} t={f - s.a} len={s.b - s.a} f={f} />
          </AbsoluteFill>
        );
      })}
      <Audio src={staticFile('sutki/voice.wav')} />
    </AbsoluteFill>
  );
};

const Board: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS[Math.min(f, SHOTS.length - 1)];
  const len = s.b - s.a;
  return (
    <AbsoluteFill style={{ backgroundColor: SHEET }}>
      <Layer C={s.C} t={len * 0.8} len={len} f={f} />
    </AbsoluteFill>
  );
};

export const sutkiPencil = { id: 'SutkiPencil', total: TOTAL, shotCount: SHOTS.length, Main, Board };

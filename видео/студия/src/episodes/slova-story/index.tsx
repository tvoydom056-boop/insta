import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { clamp } from '../../engine/anim';
import { S1, S2, S3, S4, S5, S6, StoryShot } from './shots';

// Повествовательная версия: длинные планы, только растворения и уходы в чёрное, никаких вспышек и тряски, под голосом тишина.
// fadeIn: кадры появления (поверх предыдущего плана); fadeOut: уход в чёрное, 0 — план просто накрывается следующим.
const SHOTS: { C: StoryShot; a: number; b: number; fadeIn: number; fadeOut: number }[] = [
  { C: S1, a: 0, b: 150, fadeIn: 18, fadeOut: 15 },
  { C: S2, a: 150, b: 235, fadeIn: 0, fadeOut: 15 },
  { C: S3, a: 235, b: 425, fadeIn: 15, fadeOut: 0 },
  { C: S4, a: 410, b: 550, fadeIn: 15, fadeOut: 0 },
  { C: S5, a: 535, b: 720, fadeIn: 15, fadeOut: 0 },
  { C: S6, a: 705, b: 865, fadeIn: 15, fadeOut: 30 },
];
const TOTAL = 865;

const Layer: React.FC<{ C: StoryShot; t: number; len: number }> = ({ C, t, len }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <radialGradient id="notebookVig" cx="50%" cy="50%" r="72%">
        <stop offset="52%" stopColor="#1A1712" stopOpacity={0} />
        <stop offset="100%" stopColor="#1A1712" stopOpacity={0.72} />
      </radialGradient>
    </defs>
    <C t={t} len={len} />
  </svg>
);

const Film: React.FC<{ f: number }> = ({ f }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <radialGradient id="storyVig" cx="50%" cy="50%" r="78%">
        <stop offset="60%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.42} />
      </radialGradient>
      <filter id="storyGrain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 3) % 41} />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.04 0" />
      </filter>
    </defs>
    <rect width="1920" height="1080" fill="url(#storyVig)" />
    <rect width="1920" height="1080" filter="url(#storyGrain)" />
  </svg>
);

const Main: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {SHOTS.filter((s) => f >= s.a && f < s.b).map((s) => {
        const o = (s.fadeIn ? clamp((f - s.a + 1) / s.fadeIn) : 1) * (s.fadeOut ? clamp((s.b - f - 1) / s.fadeOut) : 1);
        return (
          <AbsoluteFill key={s.a} style={{ opacity: o }}>
            <Layer C={s.C} t={f - s.a} len={s.b - s.a} />
          </AbsoluteFill>
        );
      })}
      <Film f={f} />
      <Audio src={staticFile('slova-story/voice.wav')} />
    </AbsoluteFill>
  );
};

const Board: React.FC = () => {
  const s = SHOTS[Math.min(useCurrentFrame(), SHOTS.length - 1)];
  const len = s.b - s.a;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Layer C={s.C} t={len * 0.72} len={len} />
      <Film f={0} />
    </AbsoluteFill>
  );
};

export const slovaStory = { id: 'SlovaStory', total: TOTAL, shotCount: SHOTS.length, Main, Board };

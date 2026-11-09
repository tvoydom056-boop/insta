import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { clamp } from '../../engine/anim';
import { T1, T2, T3, StoryShot } from './shots';

// Тестовый ролик 15 с в повествовательном формате: растворения и уход в чёрное, без вспышек и тряски, под голосом тишина.
const SHOTS: { C: StoryShot; a: number; b: number; fadeIn: number; fadeOut: number }[] = [
  { C: T1, a: 0, b: 130, fadeIn: 18, fadeOut: 0 },
  { C: T2, a: 111, b: 290, fadeIn: 15, fadeOut: 0 },
  { C: T3, a: 276, b: 450, fadeIn: 15, fadeOut: 30 },
];
const TOTAL = 450;

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
      <radialGradient id="sutkiVig" cx="50%" cy="50%" r="78%">
        <stop offset="60%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.42} />
      </radialGradient>
      <filter id="sutkiGrain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 3) % 41} />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.04 0" />
      </filter>
    </defs>
    <rect width="1920" height="1080" fill="url(#sutkiVig)" />
    <rect width="1920" height="1080" filter="url(#sutkiGrain)" />
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
      <Audio src={staticFile('sutki/voice.wav')} />
    </AbsoluteFill>
  );
};

const Board: React.FC = () => {
  const s = SHOTS[Math.min(useCurrentFrame(), SHOTS.length - 1)];
  const len = s.b - s.a;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Layer C={s.C} t={len * 0.8} len={len} />
      <Film f={0} />
    </AbsoluteFill>
  );
};

export const sutki = { id: 'Sutki', total: TOTAL, shotCount: SHOTS.length, Main, Board };

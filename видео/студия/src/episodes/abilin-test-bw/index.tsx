import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { H, W } from '../piter-bw/shots';
import { Corporate, Paradox, Texas, Invitation, Worry, Agreement, Journey } from './shots';
import { AUDIO_END, STARTS, TOTAL } from './timing';

const SCENES = [Corporate, Paradox, Texas, Invitation, Worry, Agreement, Journey];
const SHOTS = SCENES.map((C, i) => ({ C, a: STARTS[i], b: STARTS[i + 1] ?? TOTAL }));

const Main: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#fff' }}>
    {SHOTS.map(({ C, a, b }) => (
      <Sequence key={a} from={a} durationInFrames={b - a}><C /></Sequence>
    ))}
    <Audio src={staticFile('abilin-test/voice.wav')} endAt={AUDIO_END} />
  </AbsoluteFill>
);

// Кадр на 80% плана, со строго локальным временем (без сдвига на номер плана).
const Board: React.FC = () => {
  const frame = useCurrentFrame();
  const { C, a, b } = SHOTS[Math.min(frame, SHOTS.length - 1)];
  const sample = Math.floor((b - a - 1) * 0.8);
  return <AbsoluteFill style={{ backgroundColor: '#fff' }}>
    <Sequence from={frame - sample}><C /></Sequence>
  </AbsoluteFill>;
};

export const abilinTestBw = { id: 'AbilinTestBw', total: TOTAL, shotCount: SHOTS.length, width: W, height: H, Main, Board };

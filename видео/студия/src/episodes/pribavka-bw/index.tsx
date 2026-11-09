import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { clamp } from '../../engine/anim';
import { H, W } from '../piter-bw/shots';
import { S1, S2, S3, S4, S5, S6, S7 } from './shots';

// «Прибавка, которую ты не заметишь»: вертикальный ЧБ. ТЕСТ ~16 с (фразы 1–7). Голос F5 (клон), границы планов по первому слову фразы
// (best_words.json, 30 fps), склейки жёсткие. Полный ролик: добавить сцены на фразы 8–15 и TOTAL = 950 + 14.
const SHOTS: { C: React.FC<{ len: number }>; a: number; b: number }[] = [
  { C: S1, a: 0, b: 92 },
  { C: S2, a: 92, b: 166 },
  { C: S3, a: 166, b: 213 },
  { C: S4, a: 213, b: 271 },
  { C: S5, a: 271, b: 312 },
  { C: S6, a: 312, b: 411 },
  { C: S7, a: 411, b: 494 },
];
const TOTAL = 494; // конец слова «получки» (кадр 479) + 15
const VOICE_END = 481; // тест обрывается до «Денег прибавили», голос обрезан здесь
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
      <Audio src={staticFile('pribavka/voice.wav')} endAt={VOICE_END} />
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

export const pribavkaBw = { id: 'PribavkaBw', total: TOTAL, shotCount: SHOTS.length, width: W, height: H, Main, Board };

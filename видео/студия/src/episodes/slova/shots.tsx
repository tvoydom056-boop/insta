import React from 'react';
import {
  DrawOn, Hero, Pose, poseAt, faceAt, kf, clamp, easeOut, rnd, camT, LOOKS, LEG_LEN,
  Kitchen, KITCHEN, stand, Study, STUDY, Desk, Rooftop, Schematic, SCH, Arrow, SchLabel, CountUp,
  Cat, Foreground, Sparkle, TitleCard, Dial, Glow, FloatLabel, FocusRings, ShotProps, FONT,
} from '../../engine';

// «Что, если все твои слова за жизнь прозвучат разом?» — 9 кадров на движке what-if-animation (MIT), текст по-русски.
// Каждый кадр — чистая функция своих часов t.

const PIP = LOOKS.pipHood;
const ORANGE = '#FF8A3D';
const spaced = (v: number) => Math.round(v).toLocaleString('ru-RU').replace(/[  ]/g, ' ');

const talkArms = (t: number) => ({
  armR: { a: 40 + 38 * Math.sin(t / 3), b: 30 + 22 * Math.sin(t / 2.3) },
  armL: { a: 28 + 26 * Math.sin(t / 3.7 + 1), b: 22 + 14 * Math.sin(t / 2.9) },
});

const WORDS = ['ну', 'короче', 'слушай', 'прикинь', 'а он', 'вообще', 'ага', 'щас', 'точно', 'ладно', 'типа', 'смотри'];

// ---------- S1: кухня, средний план: он болтает, слова вылетают ----------
const S1_STAND = stand(KITCHEN, 0.42, 0.4);
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const base: Partial<Pose> = { x: S1_STAND.x, y: S1_STAND.y, scale: S1_STAND.scale, yaw: 0.45, look: 0.6 };
  const pose = { ...poseAt(t, [{ f: 0, p: base }]), ...talkArms(t) };
  return (
    <g transform={camT(kf(t, [[0, 990], [len, 1010]]), 600, kf(t, [[0, 1.85], [len, 1.97]]))}>
      <Kitchen t={t + 40} id="k1" />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0} />
      {WORDS.slice(0, 6).map((w, i) => (
        <FloatLabel key={i} x={1150 + (i % 3) * 130} y={640 - (i % 2) * 90} t={t - 4 - i * 6} text={w} size={64} color={i % 2 ? '#FFE27A' : '#F6EFE3'} />
      ))}
      <Foreground blur={10}>
        <path d="M 1260 1000 Q 1300 760 1420 700 Q 1380 820 1400 1000 Z" fill="#0E1610" />
        <path d="M 1330 1000 Q 1420 800 1560 760 Q 1480 860 1470 1000 Z" fill="#0C130E" />
      </Foreground>
    </g>
  );
};

// ---------- S2: крыша на закате, широкий план и титр ----------
const ROOF_FEET = 840;
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: ROOF_FEET - LEG_LEN * 0.62, scale: 0.62, yaw: 0, armL: { a: 20, b: 6 }, armR: { a: 20, b: 6 } } },
    { f: 30, p: {} },
    { f: 38, p: { armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 } }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, kf(t, [[0, 520], [len, 545]]), kf(t, [[0, 1.0], [len, 1.07]]))}>
      <Rooftop t={t} sunX={960} sunY={690 - 40 * easeOut(clamp(t / 40))} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0.6} />
      <TitleCard t={t} lines={['ЧТО, ЕСЛИ ВСЕ ТВОИ СЛОВА ЗА ЖИЗНЬ', 'ПРОЗВУЧАТ РАЗОМ?']} accent="РАЗОМ" accentT={30} size={96} y={170} />
    </g>
  );
};

// ---------- S3: кабинет, «Считаем» ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 712, yaw: 0.4, look: 0.7, armL: { a: 14, b: -6 }, armR: { a: 50, b: 30 } } },
    { f: 12, p: { tilt: 3, glasses: 1 } },
    { f: 20, p: { tilt: -6, armR: { a: 100, b: 60 } }, ease: easeOut },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 990], [len, 960]]), 590, kf(t, [[0, 1.8], [len, 2.05]]))}>
      <Study t={t + 120} id="st3" />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [14, 'smug']]) }} rimId="rimR" shadow={0} />
      <Desk x0={560} x1={1360} y={700} lamp={false} />
      <FocusRings x={930} y={420} t={t - 12} />
      <Sparkle x={1010} y={380} t={t - 14} s={1.1} />
      <Foreground blur={10}>
        <path d="M 1500 1000 Q 1380 800 1430 600 Q 1470 800 1580 980 Z" fill="#0E1610" />
      </Foreground>
    </g>
  );
};

// ---------- S4: кухня, широкий: говорит без остановки ----------
const S4_STAND = stand(KITCHEN, 0.5, 0.4);
export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const base: Partial<Pose> = { x: S4_STAND.x, y: S4_STAND.y, scale: S4_STAND.scale, yaw: 0 };
  const pose = { ...poseAt(t, [{ f: 0, p: base }]), ...talkArms(t * 1.4) };
  const cat = KITCHEN.P(0.86, 1, 0.66);
  return (
    <g transform={camT(960, kf(t, [[0, 560], [len, 570]]), kf(t, [[0, 0.98], [len, 1.04]]))}>
      <Kitchen t={t + 70} id="k4" veil={0.36} />
      <Cat x={cat.x} y={cat.y} mood="alert" f={t} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'happy']]) }} rimId="rimR" shadow={0} />
      {Array.from({ length: 16 }, (_, i) => (
        <FloatLabel key={i} x={560 + rnd(4, i) * 800} y={380 + rnd(5, i) * 170} t={t - 2 - i * 3} text={WORDS[i % WORDS.length]} size={52} color={i % 2 ? '#FFE27A' : '#F6EFE3'} />
      ))}
    </g>
  );
};

// ---------- S5: схема, 16 000 слов в день ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.06]]))}>
    <Schematic t={t} id="s5" />
    <DrawOn d="M 700 330 Q 700 270 760 270 H 1160 Q 1220 270 1220 330 V 380 Q 1220 440 1160 440 H 880 L 800 510 L 820 440 H 760 Q 700 440 700 380 Z" t={t} dur={16} />
    <SchLabel x={960} y={250} t={t - 8} text="ЧЕЛОВЕК ГОВОРИТ" size={44} color={SCH.dim} />
    <CountUp x={960} y={690} t={t - 6} to={16000} dur={36} size={170} format={spaced} />
    <SchLabel x={960} y={790} t={t - 14} text="СЛОВ В ДЕНЬ" size={60} />
    <Dial x={1620} y={200} p={clamp(t / len)} readout="24 ч" />
  </g>
);

// ---------- S6: схема, 20 лет ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.06], [len, 1.0]]))}>
    <Schematic t={t} id="s6" />
    <SchLabel x={960} y={230} t={t} text="16 000 × 365 × 20 ЛЕТ" size={52} color={SCH.dim} />
    <Arrow x0={960} y0={270} x1={960} y1={410} t={t - 6} />
    <CountUp x={960} y={590} t={t - 8} to={117000000} dur={32} size={150} format={spaced} />
    <SchLabel x={960} y={700} t={t - 16} text="СЛОВ" size={64} />
    {Array.from({ length: 20 }, (_, i) => (
      <rect key={i} x={360 + (i % 10) * 120} y={820 + Math.floor(i / 10) * 70} width={86} height={50} rx={6} fill="none" stroke={SCH.line} strokeWidth={4} opacity={clamp((t - 4 - i * 1.6) / 4)} />
    ))}
  </g>
);

// ---------- S7: крыша, итоговое число над героем ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: ROOF_FEET - LEG_LEN * 0.55, scale: 0.55, yaw: 0, armL: { a: 20, b: 6 }, armR: { a: 20, b: 6 } } },
    { f: 20, p: { armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 } }, ease: easeOut },
  ]);
  const pulse = 1 + 0.04 * Math.sin(t / 3);
  return (
    <g transform={camT(960, 560, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <Rooftop t={t + 30} sunX={960} sunY={650} />
      <Glow x={960} y={300} r={700} o={0.5} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'shock']]) }} rimId="rimR" shadow={0.6} />
      <text x={960} y={250} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={150 * pulse} fill="#FFE27A" stroke="#1A1230" strokeWidth={14} paintOrder="stroke" style={{ filter: 'drop-shadow(0 0 26px rgba(255,138,61,0.6))' }}>
        117 000 000
      </text>
      <text x={960} y={330} textAnchor="middle" fontFamily={FONT.title} fontWeight={700} fontSize={60} fill="#F6EFE3" stroke="#1A1230" strokeWidth={8} paintOrder="stroke">
        слов за двадцать лет
      </text>
    </g>
  );
};

// ---------- S8: кабинет, широкий: стена книг ----------
const S8_STAND = stand(STUDY, 0.3, 0.45, 0.42);
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: S8_STAND.x, y: S8_STAND.y, scale: S8_STAND.scale, yaw: 0.5, look: 0.8, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 } } },
    { f: 14, p: { headTilt: -8, armR: { a: 150, b: 40 } }, ease: easeOut },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 900], [len, 1000]]), kf(t, [[0, 640], [len, 520]]), kf(t, [[0, 1.0], [len, 1.18]]))}>
      <Study t={t + 60} id="st8" night />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [12, 'shock']]) }} rimId="rimR" shadow={0.5} />
      <FloatLabel x={1130} y={400} t={t - 10} text="ВОЙНА И МИР" size={78} color="#FFE27A" />
      <Sparkle x={1180} y={360} t={t - 10} s={1.2} />
    </g>
  );
};

// ---------- S9: схема, 200+ томов ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.07]]))}>
    <Schematic t={t} id="s9" />
    {Array.from({ length: 10 }, (_, i) => {
      const y = 880 - i * 56;
      const on = clamp((t - 2 - i * 2) / 4);
      return <rect key={i} x={420 - (i % 3) * 14} y={y} width={300 + (i % 4) * 14} height={46} rx={6} fill={SCH.ground} stroke={SCH.line} strokeWidth={5} opacity={on} />;
    })}
    <CountUp x={1180} y={500} t={t - 4} to={200} dur={26} size={190} suffix="+" format={spaced} />
    <SchLabel x={1180} y={600} t={t - 12} text="ТОМОВ «ВОЙНЫ И МИРА»" size={54} />
    <Arrow x0={760} y0={760} x1={940} y1={620} t={t - 10} color={ORANGE} />
  </g>
);

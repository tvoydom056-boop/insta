import React from 'react';
import { Hero, Look, LOOKS, LEG_LEN, Pose, poseAt, faceAt, kf, clamp, easeOut, rnd, ShotProps } from '../../engine';
import {
  B, Book, Bubble, Calc, Ceiling, Clock, Cup, Door, DrawOn, Floor, Fridge, InkArrow, InkCount, InkDial, InkGrid, InkLabel, Lamp, Room, Shelf, Shot, Skyline,
  T, Table, Underline, Win, FLOORY, INK, PAPER, WORLD_FLOOR, pop,
} from '../../ink/kit';

// Ч/Б-версия «Слов»: герой на риге what-if-animation в линейном костюме, реквизит и инфографика — в ink/kit.tsx.

const LINES: [number, string][] = [
  [0, 'Что, если все твои слова за жизнь прозвучат разом?'],
  [108, 'Считаем.'],
  [151, 'Человек говорит около шестнадцати тысяч слов в день.'],
  [264, 'За двадцать лет — сто семнадцать миллионов.'],
  [363, 'Больше двухсот томов «Войны и мира».'],
];
const capAt = (f: number) => [...LINES].reverse().find(([a]) => f >= a)?.[1];

// линейные костюмы: белое тело с чёрным контуром; друг — в чёрной толстовке для контраста
const BW: Look = { ...LOOKS.pipHood, skin: '#FFFFFF', skinShade: '#FFFFFF', hand: '#FFFFFF', jacket: '#FFFFFF', jacketShade: '#EDEDED', accent: INK, limb: '#FFFFFF', line: INK, shoe: '#FFFFFF', face: INK, hair: INK };
const BWF: Look = { ...LOOKS.mo, skin: '#FFFFFF', skinShade: '#FFFFFF', hand: '#FFFFFF', jacket: INK, jacketShade: '#2A2A2A', accent: '#FFFFFF', limb: INK, line: INK, shoe: '#FFFFFF', face: INK, hair: INK };

const hy = (s: number) => WORLD_FLOOR - LEG_LEN * s; // y бёдер, чтобы ступни стояли на полу
const talkArms = (t: number) => ({
  armR: { a: 40 + 38 * Math.sin(t / 3), b: 30 + 22 * Math.sin(t / 2.3) },
  armL: { a: 28 + 26 * Math.sin(t / 3.7 + 1), b: 22 + 14 * Math.sin(t / 2.9) },
});
const H: React.FC<{ pose: Pose; look?: Look; shadow?: number }> = ({ pose, look = BW, shadow = 0 }) => <Hero look={look} pose={pose} rimId="noRim" shadow={shadow} />;
const WORDS = ['ну', 'короче', 'слушай', 'прикинь', 'а он', 'вообще', 'ага', 'щас', 'точно', 'ладно', 'типа', 'смотри'];

// ---------- S1: кухня, средний: он болтает, друг машет ----------
export const S1: React.FC<ShotProps> = ({ t, len, f }) => {
  const hero = { ...poseAt(t, [{ f: 0, p: { x: 900, y: hy(1.25), scale: 1.25, yaw: -0.4, look: -0.5 } }]), ...talkArms(t), ...faceAt(t, [[0, 'happy']]) };
  const friend = { ...poseAt(t, [{ f: 0, p: { x: 420, y: hy(1.15), scale: 1.15, yaw: 0.45, look: 0.6, armL: { a: 14, b: -6 } } }]), armR: { a: 150 + Math.sin(t / 3) * 28, b: 20 }, ...faceAt(t, [[0, 'happy']]) };
  return (
    <Shot t={t} f={f} cam={[kf(t, [[0, 940], [len, 980]]), 560, kf(t, [[0, 1.0], [len, 1.08]])]} caption={capAt(f)}>
      <Room>
        <Ceiling /><Floor /><Door x={80} /><Clock x={800} y={200} t={t * 2.5} /><Win x={1180} y={120} w={360} h={320} sky="sun" /><Fridge x={1640} />
      </Room>
      <H pose={friend} look={BWF} />
      <H pose={hero} />
      <Room>
        <Table x={560} top={560} w={700} panel />
        <Lamp x={650} y={560} /><Cup x={1100} y={560} f={t} />
        <B t={t} at={6} x={600} y={240} text="и вот я такой…" fs={32} />
        <B t={t} at={16} x={1090} y={290} text="а он мне…" fs={32} />
        <B t={t} at={28} x={760} y={150} text="короче!" fs={32} />
        <g opacity={pop(t, 4)}>
          <T x={650} y={380} size={100} rot={-6}>ТЫ</T>
          <path d="M700 402 Q750 430 790 418 M790 418 l-26 -12 M790 418 l-12 24" />
        </g>
      </Room>
    </Shot>
  );
};

// ---------- S2: крыша на закате, титр ----------
export const S2: React.FC<ShotProps> = ({ t, len, f }) => {
  const s = 0.85;
  const hero = { ...poseAt(t, [
    { f: 0, p: { x: 960, y: hy(s), scale: s, yaw: 0, armL: { a: 20, b: 6 }, armR: { a: 20, b: 6 } } },
    { f: 30, p: {} },
    { f: 38, p: { armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 } }, ease: easeOut },
  ]), ...faceAt(t, [[0, 'happy']]) };
  const sunY = 520 - 40 * easeOut(clamp(t / 40));
  return (
    <Shot t={t} f={f} cam={[960, 540, kf(t, [[0, 1.0], [len, 1.07]])]} caption={capAt(f)}>
      <Room>
        <g strokeWidth={3}>
          <circle cx={960} cy={sunY} r={120} fill={PAPER} />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i * Math.PI) / 12;
            return <path key={i} d={`M${960 + Math.cos(a) * 150} ${sunY + Math.sin(a) * 150} l${Math.cos(a) * 60} ${Math.sin(a) * 60}`} />;
          })}
        </g>
        <Skyline seed={5} />
        <path d="M0 330 Q960 450 1920 330" strokeWidth={2.4} />
        {Array.from({ length: 16 }, (_, i) => {
          const x = 60 + i * 120;
          const y = 330 + 120 * (1 - Math.pow((x - 960) / 960, 2)) * 0.95;
          return <circle key={i} cx={x} cy={y + 12} r={9} />;
        })}
        <path d={`M0 ${FLOORY} H1920 M0 ${FLOORY + 14} H1920`} strokeWidth={2.4} />
        <T x={960} y={118} size={62} o={pop(t, 2)}>ЧТО, ЕСЛИ ВСЕ ТВОИ СЛОВА ЗА ЖИЗНЬ</T>
        <T x={960} y={240} size={140} o={pop(t, 5)}>ПРОЗВУЧАТ РАЗОМ?</T>
        <Underline x0={1160} x1={1500} y={262} t={t - 28} />
      </Room>
      <H pose={hero} shadow={0.4} />
    </Shot>
  );
};

// ---------- S3: кабинет, «Считаем» ----------
export const S3: React.FC<ShotProps> = ({ t, len, f }) => {
  const hero = { ...poseAt(t, [
    { f: 0, p: { x: 620, y: hy(1.3), scale: 1.3, yaw: 0.4, look: 0.7, armL: { a: 14, b: -6 }, armR: { a: 50, b: 30 } } },
    { f: 12, p: { tilt: 3, glasses: 1 } },
    { f: 20, p: { tilt: -6, armR: { a: 100, b: 60 } }, ease: easeOut },
  ]), ...faceAt(t, [[0, 'neutral'], [14, 'smug']]) };
  const disp = t < 7 ? '0' : t < 15 ? '16 000' : t < 25 ? '16000×' : '×365';
  return (
    <Shot t={t} f={f} cam={[kf(t, [[0, 1000], [len, 960]]), 560, kf(t, [[0, 1.12], [len, 1.0]])]} caption={capAt(f)}>
      <Room>
        <Ceiling /><Floor />
        <Clock x={1500} y={190} r={64} t={t * 6} />
        <rect x={1180} y={130} width={170} height={130} fill={PAPER} />
        <path d="M1198 230 l30 -50 l24 30 l30 -40 l40 60" strokeWidth={2.4} />
      </Room>
      <H pose={hero} />
      <Room>
        <Table x={260} top={600} w={1100} panel />
        <Calc x={1020} y={250} w={250} display={disp} />
        <path d="M700 570 q30 -14 60 0 t60 0" strokeWidth={2.2} />
        <g opacity={pop(t, 10)}>
          <circle cx={740} cy={240} r={32} fill={PAPER} />
          <path d="M728 274 h24 M732 284 h16 M740 180 v-26 M690 200 l-20 -16 M790 200 l20 -16 M676 240 h-26 M804 240 h26" strokeWidth={2.4} />
        </g>
      </Room>
    </Shot>
  );
};

// ---------- S4: кухня, широкий: слова сыплются ----------
export const S4: React.FC<ShotProps> = ({ t, len, f }) => {
  const hero = { ...poseAt(t, [{ f: 0, p: { x: 900, y: hy(1.15), scale: 1.15, yaw: 0 } }]), ...talkArms(t * 1.4), ...faceAt(t, [[0, 'happy']]) };
  return (
    <Shot t={t} f={f} cam={[960, 560, kf(t, [[0, 0.98], [len, 1.05]])]} caption={capAt(f)}>
      <Room>
        <Ceiling /><Floor /><Door x={1600} /><Win x={200} y={120} w={340} h={310} sky="moon" /><Clock x={760} y={190} t={30 + t * 6} />
      </Room>
      <H pose={hero} />
      <Room>
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i * 2.4) % (Math.PI * 2);
          const bx = 900 + Math.cos(a) * (260 + (i % 3) * 120);
          const by = 300 + Math.sin(a) * 120 + (i % 2) * 40;
          return <B key={i} t={t} at={2 + i * 3} x={bx} y={by} text={WORDS[i % WORDS.length]} fs={30} drift={0.3} tail={i % 2 ? 1 : -1} />;
        })}
      </Room>
    </Shot>
  );
};

// ---------- S5: инфографика «16 000 слов в день» ----------
export const S5: React.FC<ShotProps> = ({ t, len, f }) => (
  <Shot t={t} f={f} cam={[960, 540, kf(t, [[0, 1.0], [len, 1.06]])]} caption={capAt(f)}>
    <Room>
      <InkGrid t={t} />
      <DrawOn d="M 700 190 Q 700 130 760 130 H1160 Q 1220 130 1220 190 V 240 Q 1220 300 1160 300 H 880 L 800 370 L 820 300 H 760 Q 700 300 700 240 Z" t={t} dur={16} />
      <InkLabel x={960} y={90} t={t - 6} text="ЧЕЛОВЕК ГОВОРИТ" size={52} />
      <InkCount x={960} y={560} t={t - 6} to={16000} dur={36} size={190} />
      <InkLabel x={960} y={660} t={t - 14} text="СЛОВ В ДЕНЬ" size={76} />
      <InkDial x={1660} y={150} p={t / len} readout="24 ч" />
    </Room>
  </Shot>
);

// ---------- S6: инфографика «20 лет» ----------
export const S6: React.FC<ShotProps> = ({ t, len, f }) => (
  <Shot t={t} f={f} cam={[960, 540, kf(t, [[0, 1.06], [len, 1.0]])]} caption={capAt(f)}>
    <Room>
      <InkGrid t={t} />
      <InkLabel x={960} y={120} t={t} text="16 000 × 365 × 20 ЛЕТ" size={64} />
      <InkArrow x0={960} y0={160} x1={960} y1={290} t={t - 6} />
      <InkCount x={960} y={470} t={t - 8} to={117000000} dur={32} size={170} />
      <InkLabel x={960} y={570} t={t - 16} text="СЛОВ" size={80} />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={360 + (i % 10) * 120} y={640 + Math.floor(i / 10) * 70} width={86} height={50} rx={6} opacity={clamp((t - 4 - i * 1.6) / 4)} />
      ))}
    </Room>
  </Shot>
);

// ---------- S7: итоговое число над героем в куче слов ----------
export const S7: React.FC<ShotProps> = ({ t, len, f }) => {
  const s = 0.8;
  const hero = { ...poseAt(t, [
    { f: 0, p: { x: 960, y: hy(s), scale: s, yaw: 0, armL: { a: 20, b: 6 }, armR: { a: 20, b: 6 } } },
    { f: 20, p: { armL: { a: 150, b: 10 }, armR: { a: 150, b: 10 } }, ease: easeOut },
  ]), ...faceAt(t, [[0, 'shock']]) };
  const pile = Math.floor(clamp(t / 40) * 34);
  return (
    <Shot t={t} f={f} cam={[960, 560, kf(t, [[0, 1.0], [len, 1.1]])]} caption={capAt(f)}>
      <Room>
        <Floor />
        <T x={960} y={250} size={180 + Math.sin(t / 3) * 6}>117 000 000</T>
        <Underline x0={420} x1={1500} y={292} t={t - 6} />
        <T x={960} y={366} size={60}>слов за двадцать лет</T>
      </Room>
      <H pose={hero} shadow={0.3} />
      <Room>
        {Array.from({ length: pile }, (_, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;
          const x = 560 + col * 100 + (row % 2) * 50 + (rnd(9, i) - 0.5) * 14;
          const y = FLOORY - 20 - row * 46 + (rnd(8, i) - 0.5) * 8;
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={52} ry={24} fill={PAPER} />
              <T x={x} y={y + 8} size={22}>бла</T>
            </g>
          );
        })}
      </Room>
    </Shot>
  );
};

// ---------- S8: стена книг ----------
export const S8: React.FC<ShotProps> = ({ t, len, f }) => {
  const s = 1.0;
  const hero = { ...poseAt(t, [
    { f: 0, p: { x: 520, y: hy(s), scale: s, yaw: 0.45, look: 0.8, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 } } },
    { f: 14, p: { headTilt: -8, armR: { a: 150, b: 40 } }, ease: easeOut },
  ]), ...faceAt(t, [[0, 'neutral'], [12, 'shock']]) };
  const p = pop(t, 12, 8);
  return (
    <Shot t={t} f={f} cam={[kf(t, [[0, 900], [len, 1000]]), kf(t, [[0, 640], [len, 520]]), kf(t, [[0, 1.0], [len, 1.18]])]} caption={capAt(f)}>
      <Room>
        <Floor />
        <Shelf x={200} y={100} w={1500} rows={3} rowH={172} seed={4} />
        <path d="M1740 90 V706 M1810 90 V706" strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M1740 ${140 + i * 68} H1810`} strokeWidth={3} />)}
      </Room>
      <H pose={hero} shadow={0.2} />
      <Room>
        <g opacity={p} transform={`translate(${960 - 150 * p} ${140 - 10 * p}) scale(${0.6 + 0.2 * p})`}>
          <Book x={200} y={0} w={380} h={470} />
          <T x={400} y={170} size={64}>ВОЙНА</T>
          <T x={400} y={250} size={52}>и</T>
          <T x={400} y={330} size={64}>МИР</T>
          <path d="M250 80 H530 M250 380 H530" strokeWidth={2.4} />
        </g>
      </Room>
    </Shot>
  );
};

// ---------- S9: инфографика «200+ томов» ----------
export const S9: React.FC<ShotProps> = ({ t, len, f }) => (
  <Shot t={t} f={f} cam={[960, 540, kf(t, [[0, 1.0], [len, 1.07]])]} caption={capAt(f)}>
    <Room>
      <InkGrid t={t} />
      {Array.from({ length: 10 }, (_, i) => {
        const y = 640 - i * 56;
        return <rect key={i} x={420 - (i % 3) * 14} y={y} width={300 + (i % 4) * 14} height={46} rx={6} opacity={clamp((t - 2 - i * 2) / 4)} fill={PAPER} />;
      })}
      <InkCount x={1180} y={330} t={t - 4} to={200} dur={26} size={200} suffix="+" />
      <InkLabel x={1180} y={430} t={t - 12} text="ТОМОВ «ВОЙНЫ И МИРА»" size={64} />
      <InkArrow x0={760} y0={560} x1={940} y1={450} t={t - 10} />
    </Room>
  </Shot>
);

void INK;
void Bubble;
void Hero;

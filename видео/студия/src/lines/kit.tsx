import React from 'react';
import { loadFont } from '@remotion/google-fonts/Neucha';
import { useCurrentFrame } from 'remotion';

// Чёрно-белая линейная графика: тонкий контур на белом, без заливок и цвета, фигурки-«колбаски».
// Набор перенесён из my-video/src/Test420/draw.tsx; кадр считает время по useCurrentFrame, поэтому каждый план идёт в своей <Sequence>.

export const W = 1920;
export const H = 804; // 2,39:1 как у референса
export const FLOOR = 690;
export const INK = '#1c1c1c';
export const PAPER = '#ffffff';

export const hand = loadFont('normal', { subsets: ['cyrillic', 'latin'] }).fontFamily;

export const rnd = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Белый лист: пылинки и чёрточки, линии дрожат (шум сменяется каждые 4 кадра). Всё внутри рисуется контуром. */
export const Paper: React.FC<{ children: React.ReactNode; specks?: number }> = ({ children, specks = 90 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 4) % 6;
  const r = rnd(11);
  const dots = Array.from({ length: specks }, () => ({ x: r() * W, y: r() * H, l: r() < 0.25 ? 4 + r() * 6 : 0, a: r() * 3 }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute' }}>
      <defs>
        <filter id="rough" x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.6" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={PAPER} />
      <g stroke={INK} strokeWidth={1.4} fill={INK} opacity={0.75}>
        {dots.map((d, i) =>
          d.l ? <path key={i} d={`M${d.x} ${d.y} l${d.l} ${-d.a}`} fill="none" /> : <circle key={i} cx={d.x} cy={d.y} r={0.9 + d.a * 0.4} stroke="none" />,
        )}
      </g>
      <g filter="url(#rough)" stroke={INK} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {children}
      </g>
    </svg>
  );
};

/** Рукописный текст. */
export const T: React.FC<{ x: number; y: number; size?: number; rot?: number; anchor?: 'start' | 'middle' | 'end'; o?: number; children: React.ReactNode }> = ({
  x, y, size = 60, rot = 0, anchor = 'middle', o = 1, children,
}) => (
  <text x={x} y={y} fontFamily={hand} fontSize={size} fill={INK} stroke="none" textAnchor={anchor} opacity={o} transform={`rotate(${rot} ${x} ${y})`}>
    {children}
  </text>
);

/** Колбаска-конечность: контур поверх белой заливки скрывает то, что за ней. */
const Limb: React.FC<{ d: string; r?: number }> = ({ d, r = 15 }) => (
  <>
    <path d={d} stroke={INK} strokeWidth={r * 2 + 6.4} />
    <path d={d} stroke={PAPER} strokeWidth={r * 2} />
  </>
);

type Pose = [number, number];
export type BlobProps = {
  x: number; y?: number; s?: number; flip?: boolean;
  mouth?: 'smile' | 'open' | 'o' | 'flat' | 'grin';
  eyes?: 'dots' | 'wide' | 'closed' | 'up';
  brow?: 'none' | 'angry' | 'sad' | 'raised';
  hair?: 'none' | 'tuft';
  la?: Pose; ra?: Pose; // кисть относительно плеча
  seed?: number; bob?: boolean;
};

export const Blob: React.FC<BlobProps> = ({
  x, y = FLOOR, s = 1, flip, mouth = 'smile', eyes = 'dots', brow = 'none', hair = 'none', la = [-34, 76], ra = [34, 76], seed = 0, bob,
}) => {
  const f = useCurrentFrame();
  const dy = bob ? Math.sin((f + seed * 9) / 7) * 3 : 0;
  const blink = (f + seed * 17) % 100 < 4;
  const arm = (sx: number, p: Pose, side: number) => `M${sx} -140 Q${sx + p[0] / 2 + side * 16} ${-140 + p[1] / 2 + 8} ${sx + p[0]} ${-140 + p[1]}`;
  let mouthEl: React.ReactNode;
  if (mouth === 'smile') mouthEl = <path d="M-18 -196 Q0 -174 18 -196" />;
  else if (mouth === 'grin') mouthEl = <path d="M-22 -198 Q0 -166 22 -198 Z" fill={PAPER} />;
  else if (mouth === 'open') mouthEl = <ellipse cx={0} cy={-188} rx={14} ry={16} fill={INK} />;
  else if (mouth === 'o') mouthEl = <circle cx={0} cy={-190} r={8} />;
  else mouthEl = <path d="M-14 -192 H14" />;
  const eyeEl = (ex: number) => {
    if (eyes === 'closed' || blink) return <path d={`M${ex - 8} -222 Q${ex} -216 ${ex + 8} -222`} />;
    if (eyes === 'wide') return <circle cx={ex} cy={-224} r={9} fill={PAPER} />;
    if (eyes === 'up') return <circle cx={ex + 3} cy={-228} r={4.5} fill={INK} />;
    return <circle cx={ex} cy={-222} r={4.8} fill={INK} />;
  };
  return (
    <g transform={`translate(${x} ${y + dy}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={-28} cy={4} rx={28} ry={11} fill={PAPER} />
      <ellipse cx={28} cy={4} rx={28} ry={11} fill={PAPER} />
      <path d="M-62 0 C-80 -70 -64 -135 -38 -160 L38 -160 C64 -135 80 -70 62 0 Q0 14 -62 0 Z" fill={PAPER} />
      <Limb d={arm(-50, la, -1)} />
      <Limb d={arm(50, ra, 1)} />
      <circle cx={0} cy={-215} r={58} fill={PAPER} />
      {hair === 'tuft' && <path d="M-18 -270 q-12 -22 6 -28 M0 -274 q2 -28 18 -22 M20 -268 q18 -16 24 -2" />}
      {brow === 'angry' && <path d="M-32 -240 L-10 -232 M32 -240 L10 -232" />}
      {brow === 'sad' && <path d="M-32 -232 L-10 -240 M32 -232 L10 -240" />}
      {brow === 'raised' && <path d="M-32 -242 Q-20 -250 -8 -242 M10 -236 Q20 -240 30 -236" />}
      {eyeEl(-20)}
      {eyeEl(20)}
      {mouthEl}
    </g>
  );
};

/** Линия земли в две черты, как у референса. */
export const Floor: React.FC<{ y?: number }> = ({ y = FLOOR + 16 }) => <path d={`M0 ${y} H${W} M0 ${y + 14} H${W}`} strokeWidth={2.4} />;

export const Clock: React.FC<{ x: number; y: number; r?: number; hour: number; min: number }> = ({ x, y, r = 56, hour, min }) => {
  const hx = (deg: number, len: number) => `L${x + Math.sin((deg * Math.PI) / 180) * len} ${y - Math.cos((deg * Math.PI) / 180) * len}`;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={PAPER} />
      <circle cx={x} cy={y} r={r - 7} strokeWidth={1.6} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <path key={i} d={`M${x + Math.sin(a) * (r - 14)} ${y - Math.cos(a) * (r - 14)} L${x + Math.sin(a) * (r - 8)} ${y - Math.cos(a) * (r - 8)}`} strokeWidth={2} />;
      })}
      <path d={`M${x} ${y} ${hx(min, r - 18)}`} />
      <path d={`M${x} ${y} ${hx(hour, r - 32)}`} strokeWidth={4.4} />
    </g>
  );
};

export const Cup: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M${x - 26} ${y - 46} V${y - 6} Q${x - 26} ${y} ${x - 18} ${y} H${x + 18} Q${x + 26} ${y} ${x + 26} ${y - 6} V${y - 46} Z`} fill={PAPER} />
    <path d={`M${x + 26} ${y - 38} Q${x + 48} ${y - 36} ${x + 26} ${y - 14}`} />
  </g>
);

export const Fridge: React.FC<{ x: number; h?: number }> = ({ x, h = 470 }) => {
  const y = FLOOR + 16 - h;
  return (
    <g>
      <rect x={x} y={y} width={190} height={h} fill={PAPER} />
      <path d={`M${x} ${y + h * 0.34} H${x + 190}`} />
      <path d={`M${x + 22} ${y + 28} v70 M${x + 22} ${y + h * 0.34 + 24} v90`} strokeWidth={6} />
    </g>
  );
};

/** Окно со шторой; sky: ночь с луной и звёздами. */
export const Win: React.FC<{ x: number; y: number; w?: number; h?: number; night?: boolean }> = ({ x, y, w = 360, h = 330, night }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={PAPER} />
    <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} strokeWidth={2} />
    <path d={`M${x + w / 2} ${y + 14} V${y + h - 14} M${x + 14} ${y + h / 2} H${x + w - 14}`} />
    {night && (
      <g>
        <path d={`M${x + w * 0.28} ${y + h * 0.18} a36 36 0 1 0 30 56 a30 30 0 0 1 -30 -56 Z`} fill={PAPER} />
        {[[0.7, 0.2], [0.78, 0.38], [0.56, 0.12], [0.86, 0.14]].map(([a, b], i) => (
          <path key={i} d={`M${x + w * a - 6} ${y + h * b} h12 M${x + w * a} ${y + h * b - 6} v12`} strokeWidth={2.2} />
        ))}
      </g>
    )}
    <path d={`M${x - 14} ${y + h + 14} H${x + w + 14}`} strokeWidth={5} />
  </g>
);

export const Table: React.FC<{ x: number; top: number; w: number }> = ({ x, top, w }) => (
  <g>
    <rect x={x} y={top} width={w} height={22} fill={PAPER} />
    <path d={`M${x + 30} ${top + 22} V${FLOOR + 16} M${x + w - 30} ${top + 22} V${FLOOR + 16}`} strokeWidth={4} />
  </g>
);

/** Облако одной линией, как на небе у референса. */
export const Cloud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path d="M0 0 H150 Q176 -2 170 -24 Q164 -46 138 -42 Q132 -76 96 -70 Q70 -64 66 -44 Q38 -52 22 -34 Q4 -14 0 0 Z" transform={`translate(${x} ${y}) scale(${s})`} fill={PAPER} strokeWidth={2.6} />
);

/** Дом с окнами-коробочками. */
export const Building: React.FC<{ x: number; y: number; w: number; h: number; cols: number; rows: number; seed?: number }> = ({ x, y, w, h, cols, rows, seed = 1 }) => {
  const r = rnd(seed);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={PAPER} strokeWidth={2.8} />
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, c) => (
          <rect key={`${row}${c}`} x={x + 24 + c * ((w - 48) / cols)} y={y + 28 + row * ((h - 56) / rows)} width={26} height={34} strokeWidth={2} fill={r() < 0.22 ? INK : PAPER} />
        )),
      )}
    </g>
  );
};

/** Человечек, нарисованный линией в тетради: p от 0 до 1. */
export const DoodleMan: React.FC<{ x: number; y: number; s: number; p: number }> = ({ x, y, s, p }) => {
  const parts = [
    'M0 -300 m-58 0 a58 58 0 1 0 116 0 a58 58 0 1 0 -116 0',
    'M-48 -246 C-70 -200 -66 -120 -52 -50 L52 -50 C66 -120 70 -200 48 -246',
    'M-50 -210 C-90 -170 -96 -110 -80 -80 M50 -210 C90 -170 96 -110 80 -80',
    'M-30 -50 L-30 0 M30 -50 L30 0',
    'M-20 -312 L-20 -304 M20 -312 L20 -304 M-14 -278 Q0 -270 14 -278',
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={4}>
      {parts.map((d, i) => (
        <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.max(0, Math.min(1, p * parts.length - i * 0.72))} />
      ))}
    </g>
  );
};

import React from 'react';
import { loadFont as loadOswald } from '@remotion/google-fonts/Oswald';
import { loadFont as loadSerif } from '@remotion/google-fonts/PTSerif';
import { clamp, lerp } from '../engine/anim';

// Плоская повествовательная графика: без контуров и свечения, приглушённая земляная палитра, фигуры в профиль.
// Всё считается от часов кадра t, движения медленные.

loadOswald('normal', { weights: ['500', '600'], subsets: ['cyrillic', 'latin'] });
loadSerif('normal', { weights: ['400', '700'], subsets: ['cyrillic', 'latin'] });

export const F = { head: 'Oswald', serif: 'PT Serif' };
export const P = {
  skin: '#EBD6B6', ink: '#2B2620', cream: '#F1E8D6', red: '#B5473A', ochre: '#C79A4E',
  hood: '#2C2E3A', hoodDark: '#23252F', jeans: '#3F5877', shoe: '#3B2F27', cord: '#C79A4E',
  paper: '#EEEADF', paperLine: '#D5D2C6', pen: '#3A3833',
};

/** Линейное движение камеры без разгона: кадр плывёт ровно. */
export const drift = (t: number, len: number, a: number, b: number) => lerp(a, b, clamp(t / len));
export const cam = (cx: number, cy: number, s: number) => `translate(960 540) scale(${s}) translate(${-cx} ${-cy})`;

const UP = 92;
type XY = [number, number];
const elbow = (s: XY, h: XY): { e: XY; hand: XY } => {
  const dx = h[0] - s[0];
  const dy = h[1] - s[1];
  const d = Math.hypot(dx, dy) || 1;
  const D = Math.min(d, 2 * UP - 1);
  const ux = dx / d;
  const uy = dy / d;
  const k = Math.sqrt(UP * UP - (D * D) / 4);
  return { e: [s[0] + (ux * D) / 2 - uy * k, s[1] + (uy * D) / 2 + ux * k], hand: [s[0] + ux * D, s[1] + uy * D] };
};

export type ManProps = {
  x: number; y: number; t: number; s?: number; dir?: 1 | -1;
  ring?: string; top?: string; topDark?: string; legs?: string; shoe?: string; hair?: string; cords?: boolean;
  armF?: XY; armB?: XY; // кисть относительно плеча
  mouth?: 'shut' | 'flat' | 'frown' | 'talk' | 'o';
  look?: number; sit?: boolean; seed?: number; shadow?: boolean; palm?: boolean;
};

export const Man: React.FC<ManProps> = ({
  x, y, t, s = 1, dir = 1, ring = P.hood, top = P.hood, topDark = P.hoodDark, legs = P.jeans, shoe = P.shoe, hair, cords = true,
  armF = [8, 176], armB = [-4, 178], mouth = 'shut', look = 0, sit = false, seed = 0, shadow = true, palm = false,
}) => {
  const hip = sit ? -176 : -240;
  const breathe = Math.sin((t + seed * 13) / 34) * 1.6;
  const sh: XY = [4, hip - 156 + breathe];
  const hy = hip - 238 + breathe;
  const nod = Math.sin((t + seed * 7) / 53) * 1.1;
  const blink = (t + seed * 29) % 131 < 4;
  const F1 = elbow(sh, [sh[0] + armF[0], sh[1] + armF[1]]);
  const B1 = elbow(sh, [sh[0] + armB[0], sh[1] + armB[1]]);
  const leg = (off: number, c: string) =>
    sit ? (
      <g>
        <path d={`M ${off} ${hip} L ${118 + off} ${hip} L ${118 + off} -24`} fill="none" stroke={c} strokeWidth={34} strokeLinejoin="round" />
        <rect x={100 + off} y={-26} width={68} height={26} rx={12} fill={shoe} />
      </g>
    ) : (
      <g>
        <path d={`M ${off} ${hip} L ${off * 1.5} -24`} fill="none" stroke={c} strokeWidth={34} />
        <rect x={off * 1.5 - 20} y={-26} width={68} height={26} rx={12} fill={shoe} />
      </g>
    );
  const armPath = (a: { e: XY; hand: XY }, sx: XY) => `M ${sx[0]} ${sx[1]} L ${a.e[0]} ${a.e[1]} L ${a.hand[0]} ${a.hand[1]}`;
  const ex = 18 + look * 7;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * dir} ${s})`}>
      {shadow ? <ellipse cx={sit ? 50 : 8} cy={2} rx={sit ? 130 : 86} ry={11} fill="#000" opacity={0.2} /> : null}
      <path d={armPath(B1, sh)} fill="none" stroke={topDark} strokeWidth={25} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={B1.hand[0]} cy={B1.hand[1]} r={15} fill={P.skin} />
      {leg(-9, '#32465F' === legs ? legs : shade(legs))}
      {leg(7, legs)}
      <path d={`M -30 ${hip - 176 + breathe} L 34 ${hip - 176 + breathe} L 46 ${hip + 8} L -44 ${hip + 8} Z`} fill={top} stroke={top} strokeWidth={12} strokeLinejoin="round" />
      <path d={`M -30 ${hip - 176 + breathe} L -6 ${hip - 176 + breathe} L -16 ${hip + 8} L -44 ${hip + 8} Z`} fill={topDark} stroke={topDark} strokeWidth={12} strokeLinejoin="round" />
      <g transform={`rotate(${nod} 6 ${hip - 176})`}>
        <ellipse cx={4} cy={hip - 176 + breathe} rx={44} ry={17} fill={ring} />
        <circle cx={6} cy={hy} r={55} fill={P.skin} />
        {hair ? <path d={`M -49 ${hy - 4} A 55 55 0 0 1 61 ${hy - 4} Q 20 ${hy - 40} -49 ${hy - 4} Z`} fill={hair} /> : (
          <path fillRule="evenodd" d={`M -70 ${hy} a 72 74 0 1 0 144 0 a 72 74 0 1 0 -144 0 Z M -36 ${hy + 2} a 50 54 0 1 0 100 0 a 50 54 0 1 0 -100 0 Z`} fill={ring} />
        )}
        {[ex, ex + 25].map((ox) => (
          <ellipse key={ox} cx={ox} cy={hy - 6} rx={6.5} ry={blink ? 0.9 : 6.5} fill={P.ink} />
        ))}
        <Mouth kind={mouth} x={ex + 12} y={hy + 26} t={t} />
      </g>
      {cords ? (
        <g stroke={P.cord} strokeWidth={4.5} strokeLinecap="round">
          <line x1={0} y1={hip - 166 + breathe} x2={-2} y2={hip - 120 + breathe} />
          <line x1={20} y1={hip - 166 + breathe} x2={22} y2={hip - 124 + breathe} />
        </g>
      ) : null}
      <path d={armPath(F1, sh)} fill="none" stroke={top} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
      {palm ? <rect x={F1.hand[0] - 30} y={F1.hand[1] - 15} width={60} height={30} rx={14} fill="#D8BE97" /> : <circle cx={F1.hand[0]} cy={F1.hand[1]} r={16} fill={P.skin} />}
    </g>
  );
};

const shade = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * 0.8).toString(16).padStart(2, '0');
  return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`;
};

const Mouth: React.FC<{ kind: string; x: number; y: number; t: number }> = ({ kind, x, y, t }) => {
  if (kind === 'talk') return <ellipse cx={x} cy={y} rx={9} ry={2.5 + Math.abs(Math.sin(t / 3.4)) * 5} fill={P.ink} />;
  if (kind === 'o') return <ellipse cx={x} cy={y} rx={7} ry={9} fill={P.ink} />;
  const d = kind === 'frown' ? `M ${x - 10} ${y + 2} Q ${x} ${y - 6} ${x + 10} ${y + 2}` : kind === 'flat' ? `M ${x - 9} ${y} L ${x + 9} ${y}` : `M ${x - 11} ${y} Q ${x} ${y + 3} ${x + 11} ${y}`;
  return <path d={d} fill="none" stroke={P.ink} strokeWidth={3.6} strokeLinecap="round" />;
};

export const Cat: React.FC<{ x: number; y: number; t: number; s?: number; c?: string; dark?: string }> = ({ x, y, t, s = 1, c = '#5B5C63', dark = '#44454C' }) => {
  const tail = Math.sin(t / 26) * 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={72} ry={8} fill="#000" opacity={0.2} />
      <path d={`M 44 -14 Q 96 ${-22 + tail} 94 ${-58 + tail}`} fill="none" stroke={dark} strokeWidth={13} strokeLinecap="round" />
      <ellipse cx={8} cy={-34} rx={56} ry={34} fill={c} />
      <circle cx={-46} cy={-58} r={28} fill={c} />
      <path d="M -68 -78 L -66 -106 L -46 -84 Z M -40 -84 L -22 -106 L -22 -76 Z" fill={c} />
      <circle cx={-56} cy={-60} r={3.2} fill={P.ochre} />
      <circle cx={-38} cy={-60} r={3.2} fill={P.ochre} />
    </g>
  );
};

/** Плашка внизу слева: плотный заголовок, тонкая красная черта, мелкая строка. Стоит вне камеры. */
export const Chip: React.FC<{ t: number; at: number; title: string; sub?: string }> = ({ t, at, title, sub }) => {
  const o = clamp((t - at) / 22);
  return (
    <g opacity={o} style={{ fontFamily: F.head }}>
      <defs>
        <linearGradient id="chipBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14110C" stopOpacity={0} />
          <stop offset="100%" stopColor="#14110C" stopOpacity={0.62} />
        </linearGradient>
      </defs>
      <rect x={0} y={780} width={1920} height={300} fill="url(#chipBack)" />
      <text x={110} y={930} fontSize={62} fontWeight={600} letterSpacing={1.5} fill={P.cream}>{title}</text>
      <rect x={112} y={950} width={210} height={3} fill={P.red} />
      {sub ? <text x={112} y={988} fontSize={24} fontWeight={500} letterSpacing={3.5} fill={P.ochre}>{sub}</text> : null}
    </g>
  );
};

/** Рисованный человечек в тетради: линия проявляется, а не выскакивает. */
export const LineMan: React.FC<{ x: number; y: number; s: number; p: number }> = ({ x, y, s, p }) => {
  const parts = [
    'M 0 -470 m -66 0 a 66 66 0 1 0 132 0 a 66 66 0 1 0 -132 0',
    'M -88 -470 A 88 92 0 0 1 88 -470 C 92 -410 60 -378 34 -366 M -88 -470 C -92 -410 -60 -378 -34 -366',
    'M -60 -358 L 60 -358 L 76 -160 L -76 -160 Z',
    'M 0 -358 L 0 -160 M -14 -340 L -12 -290 M 18 -340 L 20 -296',
    'M -60 -352 L -104 -176 M 60 -352 L 104 -176',
    'M -60 -160 L -60 -34 L -20 -34 L -14 -150 M 60 -160 L 60 -34 L 20 -34 L 14 -150',
    'M -74 -34 L -14 -34 L -14 -6 L -82 -6 Q -86 -24 -74 -34 Z M 74 -34 L 14 -34 L 14 -6 L 82 -6 Q 86 -24 74 -34 Z',
    'M -26 -462 L -26 -476 M 26 -462 L 26 -476 M -16 -436 Q 0 -428 16 -436',
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={P.pen} strokeWidth={4.6} strokeLinecap="round" strokeLinejoin="round">
      {parts.map((d, i) => {
        const local = clamp(p * parts.length - i * 0.72);
        return <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - local} />;
      })}
      <circle cx={-104} cy={-166} r={13} fill={P.paper} opacity={clamp(p * 2 - 1)} />
      <circle cx={104} cy={-166} r={13} fill={P.paper} opacity={clamp(p * 2 - 1)} />
    </g>
  );
};

import React from 'react';
import { clamp } from '../engine/anim';
import { F } from '../flat/kit';

// Карандашный двойник плоской графики (flat/kit): та же геометрия, но только контур без заливок.
// Сцена рисуется чёрным по белому, а фильтр PencilDefs превращает это в графит на бумаге.

export const INK = '#000';
export const SOFT = '#777'; // слабый нажим: швы, второстепенные линии
export const FAINT = '#B0B0B0'; // линейки тетради
export const PAPER = '#fff'; // белая заливка только закрывает то, что позади
export const LW = 3.4;

const OUTPUT_PAPER = '#F6F6F6';
const GRAPHITE = 0.17;
const inkAlpha = (k: number) => `0 0 0 0 ${GRAPHITE}  0 0 0 0 ${GRAPHITE}  0 0 0 0 ${GRAPHITE}  ${-0.2126 * k} ${-0.7152 * k} ${-0.0722 * k} ${0.9 * k} 0`;

/** Два прохода карандаша с разной дрожью и зерно графита. Дрожь меняется каждые 4 кадра. */
export const PencilDefs: React.FC<{ f: number }> = ({ f }) => {
  const s = (Math.floor(f / 4) % 7) + 1;
  return (
    <filter id="pencil" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={s} result="w1" />
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={s + 11} result="w2" />
      <feDisplacementMap in="SourceGraphic" in2="w1" scale={6} xChannelSelector="R" yChannelSelector="G" result="d1" />
      <feDisplacementMap in="SourceGraphic" in2="w2" scale={10} xChannelSelector="G" yChannelSelector="R" result="d2" />
      <feColorMatrix in="d1" type="matrix" values={inkAlpha(1.3)} result="m1" />
      <feColorMatrix in="d2" type="matrix" values={inkAlpha(0.7)} result="m2" />
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={5} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.4 0 0 0 -0.85" result="grain" />
      <feComposite in="m1" in2="grain" operator="in" result="p1" />
      <feComposite in="m2" in2="grain" operator="in" result="p2" />
      <feFlood floodColor={OUTPUT_PAPER} result="paper" />
      <feMerge>
        <feMergeNode in="paper" />
        <feMergeNode in="p2" />
        <feMergeNode in="p1" />
      </feMerge>
    </filter>
  );
};

/** Контур толстой линии: широкий штрих чернилами, сверху белый чуть уже. */
const Tube: React.FC<{ d: string; w: number; cap?: 'round' | 'butt' }> = ({ d, w, cap = 'round' }) => (
  <>
    <path d={d} fill="none" stroke={INK} strokeWidth={w + LW * 2} strokeLinecap={cap} strokeLinejoin="round" />
    <path d={d} fill="none" stroke={PAPER} strokeWidth={w} strokeLinecap={cap} strokeLinejoin="round" />
  </>
);

type Shape = { d: string; w?: number }; // w: толщина линии-трубки; без w это залитая фигура
const circle = (cx: number, cy: number, r: number) => `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;

/** Слитный силуэт: все части обводятся одним общим контуром, линий на стыках не остаётся. */
const Silhouette: React.FC<{ shapes: Shape[] }> = ({ shapes }) => (
  <>
    {[INK, PAPER].map((c, pass) =>
      shapes.map((p, i) => (
        <path key={`${pass}-${i}`} d={p.d} fill={p.w ? 'none' : c} stroke={c} strokeWidth={(p.w ?? 0) + (pass ? 0 : LW * 2)} strokeLinecap="round" strokeLinejoin="round" />
      )),
    )}
  </>
);

export type BlobManProps = { x: number; y: number; t: number; s?: number; mouth?: 'flat' | 'smile'; glance?: number; sit?: boolean; seed?: number; reveal?: number };

/** Голый человечек-силуэт: голова-шар сразу переходит в плечи, руки растут из контура, ноги разделены щелью. Смотрит вправо. */
export const BlobMan: React.FC<BlobManProps> = ({ x, y, t, s = 1, mouth = 'flat', glance = 0, sit = false, seed = 0, reveal = 1 }) => {
  const breathe = Math.sin((t + seed * 13) / 34) * 1.6;
  const nod = Math.sin((t + seed * 7) / 53) * 1.1;
  const blink = (t + seed * 29) % 131 < 4;
  const hip = sit ? -176 / s : -200; // при посадке таз всегда на высоте табурета
  const hy = hip - 257 + breathe;
  const top = `M -50 ${hip - 195} C -70 ${hip - 160} -87 ${hip - 100}`;
  const body = sit
    ? `${top} -87 ${hip - 30} Q -87 ${hip} -55 ${hip} L 96 ${hip} L 96 -30 Q 96 0 112 0 L 118 0 Q 124 -22 128 -44 Q 132 -22 138 0 L 142 0 Q 160 0 160 -30 L 160 ${hip - 30} Q 160 ${hip - 62} 128 ${hip - 62} L 87 ${hip - 62} C 87 ${hip - 110} 70 ${hip - 160} 50 ${hip - 195} Z`
    : `${top} -87 ${hip + 44} L -87 -34 Q -87 0 -55 0 L -18 0 Q -4 -30 0 -54 Q 4 -30 18 0 L 55 0 Q 87 0 87 -34 L 87 ${hip + 44} C 87 ${hip - 100} 70 ${hip - 160} 50 ${hip - 195} Z`;
  const arm = (d: number) => `M ${d * 46} ${-335 + breathe} Q ${d * 84} -262 ${d * 100} -170`;
  const shapes: Shape[] = [{ d: circle(0, hy, 90) }, { d: body }, ...(sit ? [] : [{ d: arm(-1), w: 42 }, { d: arm(1), w: 42 }])];
  const shoulder = hip - 150 + breathe;
  const my = hy + 28;
  const eyes = [6 + glance * 7, 54 + glance * 7];
  const brows = [[eyes[0] + 14, hy - 27, eyes[0] - 17, hy - 38], [eyes[1] + 12, hy - 20, eyes[1] - 19, hy - 30]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {reveal < 1 ? <clipPath id="blobReveal"><rect x={-260} y={-620} width={520} height={640 * reveal} /></clipPath> : null}
      <g clipPath={reveal < 1 ? 'url(#blobReveal)' : undefined}>
        <Silhouette shapes={shapes} />
        {sit ? (
          <>
            <Tube d={`M 20 ${shoulder} Q 60 ${hip - 50} 112 ${hip - 24}`} w={42} />
            <circle cx={20} cy={shoulder} r={21 + LW + 2} fill={PAPER} />
          </>
        ) : (
          [-1, 1].map((d) => <path key={d} d={`M ${d * 60} -240 Q ${d * 66} -205 ${d * 79} -165`} fill="none" stroke={INK} strokeWidth={LW} strokeLinecap="round" />)
        )}
        <g transform={`rotate(${nod} 0 ${hip - 195})`}>
          {eyes.map((ex) => <ellipse key={ex} cx={ex} cy={hy - 9} rx={6} ry={blink ? 0.9 : 6} fill={INK} />)}
          <g stroke={INK} strokeWidth={LW * 0.8} strokeLinecap="round">
            {brows.map(([x1, y1, x2, y2]) => <line key={x1} x1={x1} y1={y1} x2={x2} y2={y2} />)}
          </g>
          <path d={mouth === 'smile' ? `M 12 ${my - 3} Q 28 ${my + 12} 44 ${my - 3}` : `M 14 ${my} L 43 ${my + 1}`} fill="none" stroke={INK} strokeWidth={3.6} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

/** Плашка как в цветной версии, но графитом и без тёмной подложки. Белый ореол прячет линии сцены за текстом. */
export const PencilChip: React.FC<{ t: number; at: number; title: string; sub?: string }> = ({ t, at, title, sub }) => {
  const o = clamp((t - at) / 22);
  const title_ = { x: 110, y: 930, fontSize: 58, fontWeight: 600, letterSpacing: 1.5 };
  const sub_ = { x: 112, y: 988, fontSize: 24, fontWeight: 500, letterSpacing: 3.5 };
  return (
    <g opacity={o} style={{ fontFamily: F.head }}>
      <text {...title_} fill={PAPER} stroke={PAPER} strokeWidth={18} strokeLinejoin="round">{title}</text>
      <text {...title_} fill={INK}>{title}</text>
      <rect x={112} y={950} width={210} height={3} fill={INK} />
      {sub ? (
        <>
          <text {...sub_} fill={PAPER} stroke={PAPER} strokeWidth={12} strokeLinejoin="round">{sub}</text>
          <text {...sub_} fill={INK}>{sub}</text>
        </>
      ) : null}
    </g>
  );
};

/** Лучи вместо свечения: свет передан линиями, а не цветом. */
export const Rays: React.FC<{ cx: number; cy: number; r0: number; r1: number; n: number; from?: number; to?: number }> = ({ cx, cy, r0, r1, n, from = 0, to = 360 }) => (
  <g stroke={INK} strokeWidth={LW * 0.8} strokeLinecap="round">
    {Array.from({ length: n }, (_, i) => {
      const a = ((from + ((to - from) * i) / (n - (to - from === 360 ? 0 : 1))) * Math.PI) / 180;
      return <line key={i} x1={cx + r0 * Math.cos(a)} y1={cy + r0 * Math.sin(a)} x2={cx + r1 * Math.cos(a)} y2={cy + r1 * Math.sin(a)} />;
    })}
  </g>
);

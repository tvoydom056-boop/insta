import React from 'react';
import { backOut, camT, clamp, easeOut, FONT, rnd } from '../engine';

// Ч/Б-набор «рисованный минимализм»: линейный реквизит, дрожащая линия, леттербокс 2,39:1, субтитры в полосе,
// инфографика (счётчики, стрелки, циферблат) в чёрно-белом. Реквизит рисуется в холсте 1920×804 (пол на 706),
// в мир 1920×1080 он ставится со сдвигом VY (см. <Room>).

export const IW = 1920;
export const IH = 804;
export const VY = (1080 - IH) / 2; // 138: верхняя чёрная полоса
export const FLOORY = 706; // линия пола в холсте
export const WORLD_FLOOR = VY + FLOORY; // 844: куда ставить ступни героя
export const INK = '#141414';
export const PAPER = '#FFFFFF';

export const spaced = (v: number) => Math.round(v).toLocaleString('ru-RU').replace(/[  ]/g, ' ');

/** Рамка кадра: белая бумага, дрожащая линия, пылинки, камера, леттербокс, субтитр. */
export const Shot: React.FC<{ t: number; f: number; cam: [number, number, number]; caption?: string; children: React.ReactNode }> = ({ t, f, cam, caption, children }) => {
  const seed = Math.floor(f / 4) % 6;
  const dots = React.useMemo(() => Array.from({ length: 110 }, (_, i) => ({ x: rnd(3, i) * 1920, y: VY + rnd(4, i) * IH, l: rnd(5, i) < 0.22 ? 4 + rnd(6, i) * 6 : 0, a: rnd(7, i) * 3 })), []);
  void t;
  return (
    <g>
      <defs>
        <filter id="inkRough" filterUnits="userSpaceOnUse" x={-500} y={-400} width={2920} height={1880}>
          <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves={2} seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={5} />
        </filter>
        <filter id="noRim">
          <feMerge>
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x={-600} y={-600} width={3120} height={2280} fill={PAPER} />
      <g transform={camT(cam[0], cam[1], cam[2])}>
        <g stroke={INK} strokeWidth={1.6} fill={INK} opacity={0.7}>
          {dots.map((d, i) =>
            d.l ? <path key={i} d={`M${d.x} ${d.y} l${d.l} ${-d.a}`} fill="none" /> : <circle key={i} cx={d.x} cy={d.y} r={1 + d.a * 0.4} stroke="none" />,
          )}
        </g>
        <g filter="url(#inkRough)">{children}</g>
      </g>
      <rect x={-100} y={-100} width={2120} height={VY + 100} fill="#000" />
      <rect x={-100} y={1080 - VY} width={2120} height={VY + 100} fill="#000" />
      {caption ? (
        <text x={960} y={1080 - VY / 2 + 14} textAnchor="middle" fontFamily={FONT.title} fontWeight={600} fontSize={44} fill="#FFFFFF">
          {caption}
        </text>
      ) : null}
    </g>
  );
};

/** Линейная группа реквизита в координатах холста 1920×804. */
export const Room: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g transform={`translate(0 ${VY})`} stroke={INK} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
    {children}
  </g>
);

export const T: React.FC<{ x: number; y: number; size?: number; rot?: number; anchor?: 'start' | 'middle' | 'end'; o?: number; children: React.ReactNode }> = ({
  x, y, size = 60, rot = 0, anchor = 'middle', o = 1, children,
}) => (
  <text x={x} y={y} fontFamily={FONT.hand} fontSize={size} fill={INK} stroke="none" textAnchor={anchor} opacity={o} transform={`rotate(${rot} ${x} ${y})`}>
    {children}
  </text>
);

export const pop = (f: number, at: number, d = 5) => clamp((f - at) / d);

// ---------- реквизит ----------
export const Floor: React.FC = () => <path d={`M0 ${FLOORY} H${IW} M0 ${FLOORY + 14} H${IW}`} strokeWidth={2.4} />;
export const Ceiling: React.FC = () => (
  <g strokeWidth={2.6}>
    <path d="M0 52 H540 M600 52 H1180 M1250 52 H1920" />
    <path d="M0 76 H1920" />
  </g>
);

export const Door: React.FC<{ x: number; w?: number; h?: number }> = ({ x, w = 250, h = 380 }) => {
  const y = FLOORY - h;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={PAPER} />
      <rect x={x + 18} y={y + 18} width={w - 36} height={h - 18} />
      <path d={`M${x + 18} ${y + 70} h-12 M${x + 18} ${y + h - 90} h-12`} strokeWidth={6} />
      <circle cx={x + w - 50} cy={y + h / 2 + 20} r={14} />
    </g>
  );
};

export const Clock: React.FC<{ x: number; y: number; r?: number; t?: number }> = ({ x, y, r = 56, t = 0 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={PAPER} />
    <circle cx={x} cy={y} r={r - 7} strokeWidth={1.6} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return <path key={i} d={`M${x + Math.sin(a) * (r - 14)} ${y - Math.cos(a) * (r - 14)} L${x + Math.sin(a) * (r - 8)} ${y - Math.cos(a) * (r - 8)}`} strokeWidth={2} />;
    })}
    <path d={`M${x} ${y} L${x + Math.sin((t * Math.PI) / 180) * (r - 18)} ${y - Math.cos((t * Math.PI) / 180) * (r - 18)}`} />
    <path d={`M${x} ${y} L${x + Math.sin(((t / 12) * Math.PI) / 180) * (r - 32)} ${y - Math.cos(((t / 12) * Math.PI) / 180) * (r - 32)}`} strokeWidth={4.4} />
  </g>
);

export const Win: React.FC<{ x: number; y: number; w?: number; h?: number; sky?: 'none' | 'sun' | 'moon' }> = ({ x, y, w = 360, h = 330, sky = 'none' }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={PAPER} />
    <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} strokeWidth={2} />
    <path d={`M${x + w / 2} ${y + 14} V${y + h - 14} M${x + 14} ${y + h / 2} H${x + w - 14}`} />
    {sky === 'sun' && (
      <g strokeWidth={2.6}>
        <circle cx={x + w * 0.3} cy={y + h * 0.3} r={34} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i * Math.PI) / 5;
          const cx = x + w * 0.3;
          const cy = y + h * 0.3;
          return <path key={i} d={`M${cx + Math.cos(a) * 46} ${cy + Math.sin(a) * 46} l${Math.cos(a) * 18} ${Math.sin(a) * 18}`} />;
        })}
      </g>
    )}
    {sky === 'moon' && (
      <g>
        <path d={`M${x + w * 0.28} ${y + h * 0.18} a36 36 0 1 0 30 56 a30 30 0 0 1 -30 -56 Z`} fill={PAPER} />
        {[[0.7, 0.2], [0.78, 0.38], [0.56, 0.12], [0.86, 0.14]].map(([a, b], i) => (
          <path key={i} d={`M${x + w * a - 6} ${y + h * b} h12 M${x + w * a} ${y + h * b - 6} v12`} strokeWidth={2.2} />
        ))}
      </g>
    )}
    <path d={`M${x - 28} ${y - 10} Q${x + 22} ${y + h / 2} ${x - 28} ${y + h + 6} M${x + w + 28} ${y - 10} Q${x + w - 22} ${y + h / 2} ${x + w + 28} ${y + h + 6}`} strokeWidth={4} />
    <path d={`M${x - 14} ${y + h + 14} H${x + w + 14}`} strokeWidth={5} />
  </g>
);

export const Table: React.FC<{ x: number; top: number; w: number; panel?: boolean }> = ({ x, top, w, panel }) => (
  <g>
    {panel ? <rect x={x + 10} y={top} width={w - 20} height={FLOORY - top} fill={PAPER} /> : null}
    <rect x={x} y={top} width={w} height={22} fill={PAPER} />
    {panel ? (
      <path d={`M${x + 40} ${top + 60} H${x + w - 40} V${FLOORY - 40} H${x + 40} Z`} strokeWidth={2} />
    ) : (
      <>
        <path d={`M${x + 30} ${top + 22} V${FLOORY} M${x + w - 30} ${top + 22} V${FLOORY}`} strokeWidth={4} />
        <path d={`M${x + 30} ${top + 70} H${x + w - 30}`} strokeWidth={2} />
      </>
    )}
  </g>
);

export const Lamp: React.FC<{ x: number; y: number; on?: boolean }> = ({ x, y, on }) => (
  <g>
    <path d={`M${x - 36} ${y} H${x + 36} M${x} ${y} V${y - 70}`} />
    <path d={`M${x - 40} ${y - 70} L${x - 22} ${y - 128} H${x + 22} L${x + 40} ${y - 70} Z`} fill={PAPER} />
    {on && <path d={`M${x - 60} ${y - 40} l-26 8 M${x + 60} ${y - 40} l26 8 M${x} ${y - 146} v-26 M${x - 48} ${y - 134} l-18 -16 M${x + 48} ${y - 134} l18 -16`} strokeWidth={2.4} />}
  </g>
);

export const Cup: React.FC<{ x: number; y: number; f?: number }> = ({ x, y, f = 0 }) => (
  <g>
    <path d={`M${x - 26} ${y - 46} V${y - 6} Q${x - 26} ${y} ${x - 18} ${y} H${x + 18} Q${x + 26} ${y} ${x + 26} ${y - 6} V${y - 46} Z`} fill={PAPER} />
    <path d={`M${x + 26} ${y - 38} Q${x + 48} ${y - 36} ${x + 26} ${y - 14}`} />
    <path d={`M${x - 8} ${y - 58} q-8 -12 0 -22 q8 -10 0 -20 M${x + 8} ${y - 58} q-8 -12 0 -22 q8 -10 0 -20`} strokeWidth={2} transform={`translate(0 ${Math.sin(f / 5) * 3})`} />
  </g>
);

export const Fridge: React.FC<{ x: number; h?: number }> = ({ x, h = 470 }) => {
  const y = FLOORY - h;
  return (
    <g>
      <rect x={x} y={y} width={190} height={h} fill={PAPER} />
      <path d={`M${x} ${y + h * 0.34} H${x + 190}`} />
      <path d={`M${x + 22} ${y + 28} v70 M${x + 22} ${y + h * 0.34 + 24} v90`} strokeWidth={6} />
      <rect x={x + 90} y={y + h * 0.5} width={44} height={56} strokeWidth={2} />
      <circle cx={x + 150} cy={y + h * 0.62} r={10} />
    </g>
  );
};

export const Shelf: React.FC<{ x: number; y: number; w: number; rows: number; rowH?: number; seed?: number }> = ({ x, y, w, rows, rowH = 170, seed = 3 }) => {
  const out: React.ReactNode[] = [];
  let k = 0;
  for (let row = 0; row < rows; row++) {
    const base = y + (row + 1) * rowH;
    let cx = x + 14;
    while (cx < x + w - 50) {
      const bw = 20 + rnd(seed, k++) * 20;
      const bh = 100 + rnd(seed, k++) * (rowH - 120);
      const lean = rnd(seed, k++) < 0.08;
      out.push(
        <g key={`${row}-${k}`} transform={lean ? `rotate(7 ${cx + bw} ${base})` : undefined}>
          <rect x={cx} y={base - bh} width={bw} height={bh} fill={PAPER} />
          <path d={`M${cx} ${base - bh + 16} h${bw} M${cx} ${base - 16} h${bw}`} strokeWidth={1.8} />
          {rnd(seed, k++) < 0.4 && <path d={`M${cx + bw / 2} ${base - bh + 34} v${bh * 0.3}`} strokeWidth={1.8} />}
        </g>,
      );
      cx += bw + 3;
    }
    out.push(<path key={`b${row}`} d={`M${x} ${base} H${x + w}`} strokeWidth={5} />);
  }
  return (
    <g>
      <rect x={x - 10} y={y} width={w + 20} height={rows * rowH + 4} strokeWidth={4} />
      {out}
    </g>
  );
};

export const Bubble: React.FC<{ x: number; y: number; text: string; s?: number; o?: number; fs?: number; tail?: number }> = ({ x, y, text, s = 1, o = 1, fs = 34, tail = 1 }) => {
  const w = Math.max(70, text.length * fs * 0.5 + 46);
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse rx={w / 2} ry={fs * 0.95} fill={PAPER} />
      {tail !== 0 && <path d={`M${-w / 6} ${fs * 0.86} l${-14 * tail} 30 l34 -22`} fill={PAPER} />}
      <T x={0} y={fs * 0.34} size={fs}>{text}</T>
    </g>
  );
};

/** Пузырь, который выпрыгивает в момент at и плывёт вверх. t — часы кадра. */
export const B: React.FC<{ t: number; at: number; x: number; y: number; text: string; fs?: number; drift?: number; tail?: number }> = ({ t, at, x, y, text, fs = 34, drift = 0.5, tail = 1 }) => {
  const p = pop(t, at);
  if (p <= 0) return null;
  return <Bubble x={x} y={y - (t - at) * drift} text={text} s={0.6 + 0.4 * backOut(p)} o={p} fs={fs} tail={tail} />;
};

export const Calc: React.FC<{ x: number; y: number; w?: number; display: string }> = ({ x, y, w = 260, display }) => {
  const h = w * 1.35;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={PAPER} />
      <rect x={x + 18} y={y + 18} width={w - 36} height={h * 0.2} fill={PAPER} />
      <T x={x + w - 28} y={y + 18 + h * 0.15} size={h * 0.13} anchor="end">{display}</T>
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 4 }, (_, c) => <rect key={`${row}${c}`} x={x + 20 + c * ((w - 40) / 4)} y={y + h * 0.34 + row * (h * 0.15)} width={(w - 40) / 4 - 10} height={h * 0.15 - 12} rx={6} strokeWidth={2.4} />),
      )}
    </g>
  );
};

export const Book: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={PAPER} />
    <path d={`M${x + 16} ${y} V${y + h} M${x} ${y + h * 0.12} H${x + w} M${x} ${y + h * 0.88} H${x + w}`} strokeWidth={2} />
  </g>
);

/** Линия горизонта крыши: простые дома с окошками и гирлянда. */
export const Skyline: React.FC<{ seed?: number }> = ({ seed = 2 }) => {
  const out: React.ReactNode[] = [];
  let x = -20;
  let k = 0;
  while (x < IW) {
    const w = 90 + rnd(seed, k++) * 110;
    const h = 120 + rnd(seed, k++) * 260;
    out.push(<rect key={`b${k}`} x={x} y={FLOORY - 120 - h} width={w} height={h} fill={PAPER} strokeWidth={3} />);
    for (let r = 0; r < Math.floor(h / 56); r++) {
      for (let c = 0; c < Math.floor(w / 46); c++) {
        if (rnd(seed, k++) < 0.45) out.push(<rect key={`w${k}`} x={x + 14 + c * 42} y={FLOORY - 120 - h + 18 + r * 52} width={20} height={26} strokeWidth={2} />);
      }
    }
    x += w + 6;
  }
  return <g>{out}</g>;
};

// ---------- Ч/Б-инфографика ----------
export const InkGrid: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <g stroke="#C9C9C4" strokeWidth={1.4} transform={`translate(${(t * 0.4) % 40} 0)`}>
      {Array.from({ length: 52 }, (_, i) => <path key={`v${i}`} d={`M${i * 40 - 40} ${VY} V${VY + IH}`} />)}
      {Array.from({ length: 21 }, (_, i) => <path key={`h${i}`} d={`M-40 ${VY + i * 40} H${IW + 40}`} />)}
    </g>
    {[[60, VY + 50, 1, 1], [1860, VY + 50, -1, 1], [60, VY + IH - 50, 1, -1], [1860, VY + IH - 50, -1, -1]].map(([x, y, sx, sy], i) => (
      <path key={i} d={`M${x} ${y + sy * 40} L${x} ${y} L${x + sx * 40} ${y}`} stroke={INK} strokeWidth={3} fill="none" />
    ))}
  </g>
);

export const DrawOn: React.FC<{ d: string; t: number; dur?: number; width?: number; fill?: string }> = ({ d, t, dur = 10, width = 5, fill = 'none' }) => {
  const p = easeOut(clamp(t / dur));
  if (p <= 0) return null;
  return <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={INK} strokeWidth={width} fill={p >= 1 ? fill : 'none'} strokeLinecap="round" strokeLinejoin="round" />;
};

export const InkArrow: React.FC<{ x0: number; y0: number; x1: number; y1: number; t: number; dur?: number; bend?: number }> = ({ x0, y0, x1, y1, t, dur = 8, bend = 0.12 }) => {
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend;
  const my = (y0 + y1) / 2 + (x1 - x0) * bend;
  const p = easeOut(clamp(t / dur));
  const a = Math.atan2(y1 - my, x1 - mx);
  return (
    <g>
      <DrawOn d={`M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`} t={t} dur={dur} />
      {p >= 1 ? <path d={`M ${x1 - 24 * Math.cos(a - 0.45)} ${y1 - 24 * Math.sin(a - 0.45)} L ${x1} ${y1} L ${x1 - 24 * Math.cos(a + 0.45)} ${y1 - 24 * Math.sin(a + 0.45)}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
  );
};

export const InkLabel: React.FC<{ x: number; y: number; t: number; text: string; size?: number }> = ({ x, y, t, text, size = 50 }) => {
  if (t < 0) return null;
  const p = backOut(clamp(t / 7));
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <T x={0} y={0} size={size}>{text}</T>
    </g>
  );
};

/** Счётчик от 0 до to рукописными цифрами. */
export const InkCount: React.FC<{ x: number; y: number; t: number; to: number; dur?: number; size?: number; suffix?: string }> = ({ x, y, t, to, dur = 30, size = 160, suffix = '' }) => {
  if (t < 0) return null;
  const v = to * easeOut(clamp(t / dur));
  return <T x={x} y={y} size={size}>{spaced(v) + suffix}</T>;
};

/** Циферблат-таймер: круг, дуга прогресса, подпись. */
export const InkDial: React.FC<{ x: number; y: number; p: number; readout: string; r?: number }> = ({ x, y, p, readout, r = 80 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={PAPER} />
    <circle r={r - 14} strokeWidth={2} />
    <circle r={r - 7} strokeWidth={9} strokeDasharray={2 * Math.PI * (r - 7)} strokeDashoffset={2 * Math.PI * (r - 7) * (1 - clamp(p))} transform="rotate(-90)" />
    <rect x={-12} y={-r - 22} width={24} height={16} rx={4} fill={INK} stroke="none" />
    <T x={0} y={14} size={40}>{readout}</T>
  </g>
);

/** Волнистое «маркерное» подчёркивание под словом. */
export const Underline: React.FC<{ x0: number; x1: number; y: number; t: number }> = ({ x0, x1, y, t }) => (
  <DrawOn d={`M ${x0} ${y} q ${(x1 - x0) * 0.12} -14 ${(x1 - x0) * 0.25} 0 t ${(x1 - x0) * 0.25} 0 t ${(x1 - x0) * 0.25} 0 t ${(x1 - x0) * 0.25} 0`} t={t} dur={12} width={7} />
);

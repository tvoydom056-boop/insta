import React from 'react';
import { useCurrentFrame } from 'remotion';
import { backOut, clamp, easeInOut, easeOut, lerp } from '../../engine/anim';
import { BlobProps, Clock, Cloud, INK, PAPER, hand, rnd } from '../../lines/kit';

// «Принцип Питера»: вертикальный ЧБ 1080×1920. Подача с заголовком-плашкой на кадр, рисунок сложнее: сцены на всю высоту, толпы, линии дорисовываются, чёрная заливка вместо цвета.
export const W = 1080;
export const H = 1920;
export const G = 1570; // линия земли

/** Лист под вертикаль. hit: кадр удара, на нём сцена вздрагивает. */
export const Sheet: React.FC<{ children: React.ReactNode; hit?: number; seed?: number }> = ({ children, hit, seed = 3 }) => {
  const t = useCurrentFrame();
  const r = rnd(seed);
  const dots = Array.from({ length: 170 }, () => ({ x: r() * W, y: r() * H, l: r() < 0.25 ? 4 + r() * 7 : 0, a: r() * 3 }));
  const zoom = 1 + clamp(t / 120) * 0.025;
  const since = hit === undefined ? -1 : t - hit;
  const dy = since >= 0 && since < 8 ? Math.sin(since * 2.4) * (8 - since) * 2 : 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: 'absolute' }}>
      <defs>
        <filter id="v-rough" x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={Math.floor(t / 4) % 6} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={PAPER} />
      <g stroke={INK} strokeWidth={1.4} fill={INK} opacity={0.75}>
        {dots.map((d, i) => (d.l ? <path key={i} d={`M${d.x} ${d.y} l${d.l} ${-d.a}`} fill="none" /> : <circle key={i} cx={d.x} cy={d.y} r={0.9 + d.a * 0.4} stroke="none" />))}
      </g>
      <g filter="url(#v-rough)" stroke={INK} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <g transform={`translate(${W / 2} ${H / 2 + dy}) scale(${zoom}) translate(${-W / 2} ${-H / 2})`}>{children}</g>
      </g>
    </svg>
  );
};

export const Tx: React.FC<{ x: number; y: number; size?: number; rot?: number; anchor?: 'start' | 'middle' | 'end'; fill?: string; bold?: number; children: React.ReactNode }> = ({
  x, y, size = 48, rot = 0, anchor = 'middle', fill = INK, bold = 0, children,
}) => (
  <text x={x} y={y} fontFamily={hand} fontSize={size} fill={fill} stroke={bold ? fill : 'none'} strokeWidth={bold} textAnchor={anchor} transform={`rotate(${rot} ${x} ${y})`}>
    {children}
  </text>
);

/** Заголовок-плашка: одна мысль на кадр, читается без звука; подчёркивание дорисовывается. */
export const Head: React.FC<{ lines: string[]; t: number; y?: number }> = ({ lines, t, y = 215 }) => {
  const max = Math.max(...lines.map((l) => l.length));
  const fs = Math.min(116, Math.floor(1720 / max));
  const step = fs * 1.14;
  const lastY = y + (lines.length - 1) * step;
  const w = Math.min(900, max * fs * 0.56);
  const p = clamp((t - 2) / 14);
  return (
    <g>
      {lines.map((l, i) => <Tx key={i} x={W / 2} y={y + i * step} size={fs} bold={2.4}>{l}</Tx>)}
      {p > 0 && <path d={`M${W / 2 - w / 2} ${lastY + 30} q${w / 8} -12 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeWidth={4} />}
    </g>
  );
};

export const Draw: React.FC<{ d: string; t: number; at?: number; n?: number; strokeWidth?: number }> = ({ d, t, at = 0, n = 12, strokeWidth }) => {
  const p = clamp((t - at) / n);
  if (p <= 0) return null;
  return <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeWidth={strokeWidth} />;
};

export const Pop: React.FC<{ x: number; y: number; t: number; at?: number; n?: number; children: React.ReactNode }> = ({ x, y, t, at = 0, n = 9, children }) => {
  if (t < at) return null;
  const s = backOut(clamp((t - at) / n));
  return <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>{children}</g>;
};

export const Ground: React.FC<{ y?: number; seed?: number; hatch?: boolean }> = ({ y = G, seed = 5, hatch = true }) => {
  const r = rnd(seed);
  return (
    <g strokeWidth={2.4}>
      <path d={`M0 ${y} H${W} M0 ${y + 14} H${W}`} />
      {hatch && Array.from({ length: 46 }, (_, i) => {
        const x = r() * W;
        const yy = y + 36 + r() * 280;
        return <path key={i} d={`M${x} ${yy} l${16 + r() * 34} ${-3 + r() * 6}`} strokeWidth={1.8} />;
      })}
    </g>
  );
};

/** Штамп со шлепком. */
export const Stamp: React.FC<{ x: number; y: number; text: string; t: number; at: number; rot?: number; size?: number }> = ({ x, y, text, t, at, rot = -7, size = 92 }) => {
  if (t < at) return null;
  const s = lerp(1.9, 1, easeOut(clamp((t - at) / 5)));
  const w = text.length * size * 0.56 + 70;
  const h = size * 1.5;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={INK} />
      <rect x={-w / 2 + 10} y={-h / 2 + 10} width={w - 20} height={h - 20} stroke={PAPER} strokeWidth={3} />
      <Tx x={0} y={size * 0.34} size={size} fill={PAPER} bold={1.6}>{text}</Tx>
    </g>
  );
};

const Tie: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M-13 -158 L13 -158 L7 -136 L18 -72 L0 -50 L-18 -72 L-7 -136 Z" fill={INK} />
);

const HEAD_Y = -227;
const HEAD_R = 46;
const TORSO =
  'M-22 -188 C-26 -168 -40 -164 -42 -146 C-46 -110 -48 -60 -46 -18 Q-45 0 -26 0 Q-10 0 -8 -14 L-3 -40 Q0 -46 3 -40 L8 -14 Q10 0 26 0 Q45 0 46 -18 C48 -60 46 -110 42 -146 C40 -164 26 -168 22 -188 Z';

/** Человечек одним контуром: голова, шея, тело и руки сливаются в общий силуэт, линия одной толщины при любом масштабе. */
export const Man: React.FC<BlobProps> = ({ x, y = G, s = 1, flip, mouth = 'smile', eyes = 'dots', brow = 'none', hair = 'none', la = [-30, 78], ra = [30, 78], seed = 0, bob }) => {
  const f = useCurrentFrame();
  const dy = bob ? Math.sin((f + seed * 9) / 7) * 3 : 0;
  const blink = (f + seed * 17) % 100 < 4;
  const lw = 3.6 / s;
  const R = 10.5;
  const SH = -150;
  const fx = 3;
  const arms = ([[-36, la, -1], [36, ra, 1]] as [number, [number, number], number][]).map(([sx, p, side]) => ({
    d: `M${sx} ${SH} Q${sx + p[0] / 2 + side * 14} ${SH + p[1] / 2 + 6} ${sx + p[0]} ${SH + p[1]}`,
    front: Math.abs(sx + p[0]) < 46, // кисть внутри силуэта: такая рука рисуется поверх тела своим контуром
  }));
  const back = arms.filter((a) => !a.front);
  const front = arms.filter((a) => a.front);
  const eye = (ex: number) => {
    if (eyes === 'closed' || blink) return <path d={`M${ex - 6} -232 Q${ex} -227 ${ex + 6} -232`} />;
    if (eyes === 'wide') return <g><circle cx={ex} cy={-233} r={7.5} fill={PAPER} /><circle cx={ex} cy={-233} r={1.8} fill={INK} /></g>;
    if (eyes === 'up') return <circle cx={ex + 2} cy={-238} r={3.4} fill={INK} stroke="none" />;
    return <circle cx={ex} cy={-233} r={3.4} fill={INK} stroke="none" />;
  };
  let mouthEl: React.ReactNode;
  if (mouth === 'smile') mouthEl = <path d={`M${fx - 9} -209 Q${fx} -200 ${fx + 9} -209`} />;
  else if (mouth === 'grin') mouthEl = <path d={`M${fx - 13} -212 Q${fx} -190 ${fx + 13} -212 Z`} fill={PAPER} />;
  else if (mouth === 'open') mouthEl = <ellipse cx={fx} cy={-205} rx={8} ry={10} fill={INK} />;
  else if (mouth === 'o') mouthEl = <circle cx={fx} cy={-205} r={5.5} />;
  else mouthEl = <path d={`M${fx - 9} -206 H${fx + 9}`} />;
  return (
    <g transform={`translate(${x} ${y + dy}) scale(${flip ? -s : s} ${s})`} strokeWidth={lw}>
      <g fill={INK} stroke={INK} strokeWidth={lw * 2}>
        <circle cy={HEAD_Y} r={HEAD_R} />
        <path d={TORSO} />
      </g>
      {back.map((a, i) => <path key={i} d={a.d} fill="none" stroke={INK} strokeWidth={R * 2 + lw * 2} />)}
      <g fill={PAPER} stroke="none">
        <circle cy={HEAD_Y} r={HEAD_R} />
        <path d={TORSO} />
      </g>
      {back.map((a, i) => <path key={i} d={a.d} fill="none" stroke={PAPER} strokeWidth={R * 2} />)}
      {front.map((a, i) => (
        <g key={i} fill="none">
          <path d={a.d} stroke={INK} strokeWidth={R * 2 + lw * 2} />
          <path d={a.d} stroke={PAPER} strokeWidth={R * 2} />
        </g>
      ))}
      {hair === 'tuft' && <path d="M-12 -271 q-8 -18 5 -22 M0 -273 q2 -22 14 -18 M14 -269 q14 -12 18 -2" />}
      {brow === 'angry' && <path d={`M${fx - 24} -250 L${fx - 7} -243 M${fx + 24} -250 L${fx + 7} -243`} />}
      {brow === 'sad' && <path d={`M${fx - 24} -243 L${fx - 7} -250 M${fx + 24} -243 L${fx + 7} -250`} />}
      {brow === 'raised' && <path d={`M${fx - 24} -250 Q${fx - 15} -256 ${fx - 6} -250 M${fx + 7} -246 Q${fx + 15} -250 ${fx + 23} -246`} />}
      {eye(fx - 13)}
      {eye(fx + 13)}
      {mouthEl}
    </g>
  );
};

const Boss: React.FC<BlobProps> = (p) => (
  <g>
    <Man {...p} />
    <Tie x={p.x} y={p.y ?? G} s={p.s} />
  </g>
);

export const Specs: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={3 / s}>
    <circle cx={-10} cy={-233} r={13.5} />
    <circle cx={16} cy={-233} r={13.5} />
    <path d="M3.5 -233 H2.5" />
  </g>
);

export const Tash: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M3 -214 Q-11 -223 -27 -209 Q-11 -207 3 -209 Q17 -207 33 -209 Q17 -223 3 -214 Z" fill={INK} />
);

const Car: React.FC<{ x: number; y: number; s?: number; flip?: boolean }> = ({ x, y, s = 1, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M-172 -36 Q-174 -78 -132 -86 L-94 -92 L-54 -142 H52 L98 -92 L150 -84 Q178 -78 176 -36 Z" fill={PAPER} />
    <path d="M-44 -132 L-78 -94 H-6 V-132 Z M6 -132 V-94 H80 L46 -132 Z" strokeWidth={2.4} />
    <path d="M152 -66 h20 M-168 -62 h16" strokeWidth={5} />
    {[-104, 108].map((w) => (
      <g key={w}>
        <circle cx={w} cy={-30} r={32} fill={PAPER} />
        <circle cx={w} cy={-30} r={12} />
      </g>
    ))}
  </g>
);

const Gear: React.FC<{ x: number; y: number; r: number; a: number; n?: number }> = ({ x, y, r, a, n = 10 }) => {
  const pts = Array.from({ length: n * 4 }, (_, i) => {
    const q = (i / (n * 4)) * Math.PI * 2;
    const rr = i % 4 < 2 ? r * 1.2 : r;
    return `${Math.cos(q) * rr} ${Math.sin(q) * rr}`;
  });
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <path d={`M${pts.join(' L')} Z`} fill={PAPER} />
      <circle r={r * 0.34} />
    </g>
  );
};

const Wrench: React.FC<{ x: number; y: number; a: number; s?: number }> = ({ x, y, a, s = 1 }) => (
  <path transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} d="M0 0 L0 -84 M-17 -112 L-17 -92 Q0 -74 17 -92 L17 -112" strokeWidth={8} />
);

const Smoke: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g strokeWidth={2.6}>
    {[0, 1, 2].map((i) => {
      const u = ((t * 1.6 + i * 34) % 100) / 100;
      return <path key={i} opacity={1 - u} d={`M${x + Math.sin(u * 7) * 8} ${y - u * 130} q-16 -16 0 -32 t0 -32`} />;
    })}
  </g>
);

const Confetti: React.FC<{ t: number; at?: number; seed?: number; top?: number; n?: number }> = ({ t, at = 0, seed = 8, top = 380, n = 46 }) => {
  if (t < at) return null;
  const r = rnd(seed);
  return (
    <g strokeWidth={2.4}>
      {Array.from({ length: n }, (_, i) => {
        const x = r() * W;
        const v = 12 + r() * 16;
        const d = r() * 300;
        const a = r() * 360 + (t - at) * 14;
        const ink = r() < 0.5;
        const y = top - d + (t - at) * v;
        if (y > G - 10) return null;
        return <rect key={i} x={-9} y={-6} width={18} height={12} fill={ink ? INK : PAPER} transform={`translate(${x} ${y}) rotate(${a})`} />;
      })}
    </g>
  );
};

const Check: React.FC<{ x: number; y: number; t: number; at: number; s?: number }> = ({ x, y, t, at, s = 1 }) => (
  <Draw t={t} at={at} n={6} strokeWidth={6} d={`M${x} ${y} l${14 * s} ${16 * s} l${30 * s} ${-40 * s}`} />
);

// 1. Роддом: младенец в кроватке, на «повысили» шлёпается штамп и появляется галстук.
export const S1: React.FC = () => {
  const t = useCurrentFrame();
  const HIT = 84;
  const raised = t >= HIT;
  return (
    <Sheet hit={HIT}>
      <Head lines={['ТВОЙ НАЧАЛЬНИК', 'НЕ РОДИЛСЯ ИДИОТОМ']} t={t} />
      <Clock x={176} y={560} r={72} hour={60 + t * 0.1} min={t * 3} />
      <rect x={756} y={456} width={250} height={320} fill={PAPER} />
      <path d="M770 470 H992 V762 H770 Z M881 470 V762 M770 616 H992" strokeWidth={2.2} />
      <Ground />
      <path d="M60 960 h260 v90 h-260 Z" fill={PAPER} />
      <Tx x={190} y={1022} size={56}>РОДДОМ</Tx>
      <Man x={190} y={G} s={1.45} mouth="smile" brow="raised" la={[-20, 80]} ra={[120, -30]} seed={2} />
      <path d={`M${190 - 66} ${G - 386} q66 -74 132 0 Z M${190 - 12} ${G - 416} h24 M${190} ${G - 428} v24`} fill={PAPER} />
      <Man x={700} y={G - 150} s={1.08} mouth={raised ? 'flat' : 'smile'} eyes={raised ? 'wide' : 'dots'} la={[-64, -46]} ra={[64, -46]} seed={5} bob />
      {raised && <Tie x={700} y={G - 150} s={1.08} />}
      <rect x={470} y={G - 170} width={460} height={100} fill={PAPER} />
      <g strokeWidth={3}>
        <path d={`M470 ${G - 320} H930 M470 ${G - 70} H930 M470 ${G - 330} V${G} M930 ${G - 330} V${G}`} strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${504 + i * 35} ${G - 320} V${G - 70}`} />)}
      </g>
      <Stamp x={540} y={830} text="ПОВЫШЕН" t={t} at={HIT} size={120} />
    </Sheet>
  );
};

// 2. Питер и книга: календарь докручивается до 1969, папки со случаями, чёрная книга.
export const S2: React.FC = () => {
  const t = useCurrentFrame();
  const year = 1950 + Math.round(clamp(t / 30) * 19);
  return (
    <Sheet>
      <Head lines={['ПРИНЦИП ПИТЕРА']} t={t} />
      <g>
        <rect x={350} y={400} width={380} height={300} fill={PAPER} />
        <rect x={350} y={400} width={380} height={70} fill={INK} />
        {[410, 510, 610, 670].map((x) => <path key={x} d={`M${x} 380 v50`} strokeWidth={8} stroke={INK} />)}
        <Tx x={540} y={630} size={150} bold={2}>{year}</Tx>
      </g>
      <Ground />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={46 + (i % 2) * 14} y={G - 72 - i * 72} width={270} height={72} fill={PAPER} />
          <Tx x={181 + (i % 2) * 14} y={G - 22 - i * 72} size={38}>СЛУЧАЙ №{i + 1}</Tx>
        </g>
      ))}
      <Man x={560} y={G} s={1.6} mouth="grin" brow="raised" la={[-80, 20]} ra={[110, -30]} seed={3} />
      <Specs x={560} y={G} s={1.6} />
      <Pop x={860} y={1210} t={t} at={16}>
        <g transform="rotate(6 860 1210)">
          <rect x={700} y={990} width={320} height={440} fill={INK} />
          <rect x={716} y={1006} width={288} height={408} stroke={PAPER} strokeWidth={3} />
          <Tx x={860} y={1130} size={72} fill={PAPER} bold={1.4}>ПРИНЦИП</Tx>
          <Tx x={860} y={1214} size={72} fill={PAPER} bold={1.4}>ПИТЕРА</Tx>
          <Tx x={860} y={1370} size={52} fill={PAPER}>1969</Tx>
        </g>
      </Pop>
    </Sheet>
  );
};

// 3. Автосервис: машина на подъёмнике, механик под ней, шестерни, список закрывается галочками.
export const S3: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet hit={54}>
      <Head lines={['ЛУЧШИЙ МЕХАНИК']} t={t} />
      <path d="M30 420 H1050 M30 420 V1570 M1050 420 V1570" strokeWidth={4} />
      <rect x={300} y={385} width={480} height={78} fill={PAPER} />
      <Tx x={540} y={442} size={58}>АВТОСЕРВИС</Tx>
      <Gear x={150} y={610} r={70} a={t * 3} />
      <Gear x={268} y={690} r={52} a={-t * 4.2 + 20} n={8} />
      <g>
        <rect x={700} y={520} width={300} height={380} fill={PAPER} />
        <path d="M780 520 v-20 h140 v20" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <rect x={724} y={552 + i * 55} width={36} height={36} strokeWidth={2.4} />
            <path d={`M778 ${572 + i * 55} h${190 - (i % 3) * 30}`} strokeWidth={2.4} />
            <Check x={728} y={570 + i * 55} t={t} at={6 + i * 7} s={0.8} />
          </g>
        ))}
      </g>
      <Ground />
      <path d="M170 1570 V1130 M910 1570 V1130" strokeWidth={9} />
      <path d="M130 1130 H950" strokeWidth={11} />
      <Car x={540} y={1118} s={1.75} />
      <Man x={540} y={G} s={1.5} mouth="grin" brow="raised" hair="tuft" la={[-50, -100]} ra={[56, -112]} seed={7} />
      <Wrench x={624} y={G - 340 + Math.sin(t / 3) * 10} a={8 + Math.sin(t / 3) * 22} s={1.1} />
      <Stamp x={372} y={796} text="ЧИНИТ ВСЁ" t={t} at={54} size={92} />
    </Sheet>
  );
};

// 4. Сверху падает галстук, ключ из руки на пол.
export const S4: React.FC = () => {
  const t = useCurrentFrame();
  const drop = lerp(-1200, 0, backOut(clamp(t / 12)));
  const fall = clamp((t - 10) / 10);
  return (
    <Sheet hit={12}>
      <Head lines={['СДЕЛАЛИ НАЧАЛЬНИКОМ']} t={t} />
      <rect x={60} y={720} width={300} height={850} fill={PAPER} />
      <rect x={90} y={760} width={240} height={90} fill={INK} />
      <Tx x={210} y={820} size={46} fill={PAPER}>НАЧАЛЬНИК</Tx>
      <circle cx={320} cy={1200} r={14} fill={INK} />
      <Ground />
      <Man x={660} y={G} s={2} mouth="o" eyes="wide" brow="raised" hair="tuft" la={[-60, 90]} ra={[90, 30]} seed={4} />
      <g transform={`translate(0 ${drop})`}>
        <Tie x={660} y={G} s={2} />
        {t < 12 && <path d={`M660 ${G - 318} V${G - 2200}`} strokeWidth={3} />}
      </g>
      <Wrench x={lerp(860, 900, fall)} y={lerp(1320, G - 10, fall * fall)} a={lerp(10, 110, fall)} s={1.4} />
    </Sheet>
  );
};

// 5. Два этажа: сверху начальник в моторе, снизу курят слесари и стоит очередь машин.
export const S5: React.FC = () => {
  const t = useCurrentFrame();
  const T1 = 49;
  const FL = 1000;
  return (
    <Sheet hit={72}>
      <Head lines={['ЛЕЗЕТ В КАЖДЫЙ МОТОР']} t={t} />
      <Ground y={FL} hatch={false} />
      <Boss x={280} y={FL} s={1.5} mouth="open" brow="angry" la={[-70, -10]} ra={[150, 30 + Math.sin(t / 2) * 16]} seed={1} />
      <Car x={720} y={FL} s={1.5} />
      <g transform={`rotate(-34 590 ${FL - 150})`}>
        <path d={`M590 ${FL - 150} h-180 q-20 -30 30 -36 h150 Z`} fill={PAPER} />
      </g>
      <Gear x={520} y={FL - 124} r={30} a={t * 8} n={7} />
      <Wrench x={470 + Math.sin(t / 2) * 12} y={FL - 150} a={-70 + Math.sin(t / 2) * 30} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = ((t * 7 + i * 73) % 360) * (Math.PI / 180);
        const u = ((t + i * 5) % 18) / 18;
        return <path key={i} d={`M${540 + Math.cos(a) * 40 * u} ${FL - 230 - u * 90} l${Math.cos(a) * 18} ${-22}`} strokeWidth={4} />;
      })}
      <g>
        <path d="M60 470 h340 q26 0 26 26 v92 q0 26 -26 26 h-240 l-40 60 v-60 h-60 q-26 0 -26 -26 v-92 q0 -26 26 -26 Z" fill={PAPER} transform="translate(0 0)" />
        <Tx x={232} y={574} size={78} bold={1.4}>НЕ ТАК!</Tx>
      </g>
      <Pop x={320} y={G} t={t} at={T1}>
        {[150, 320, 490].map((x, i) => (
          <g key={x}>
            <Man x={x} y={G} s={1.1} mouth="flat" eyes="closed" hair={i === 1 ? 'tuft' : 'none'} la={[28, -46]} ra={[30, 80]} seed={i} />
            <path d={`M${x + 20} ${G - 204} h34`} strokeWidth={6} />
            <Smoke x={x + 56} y={G - 208} t={t} />
          </g>
        ))}
      </Pop>
      <Pop x={840} y={1300} t={t} at={T1 + 8}>
        <rect x={700} y={1090} width={320} height={210} fill={PAPER} />
        <rect x={700} y={1090} width={320} height={58} fill={INK} />
        <Tx x={860} y={1134} size={44} fill={PAPER}>СРОК</Tx>
        <Tx x={860} y={1254} size={92} bold={1.6}>ВЧЕРА</Tx>
      </Pop>
      {t >= 72 && <Car x={855} y={G} s={0.98} />}
      {t >= 72 && <Stamp x={855} y={1400} text="СТОЯТ" t={t} at={72} size={64} />}
    </Sheet>
  );
};

// 6. Лестница ступень за ступенью, упёрся головой в чёрный потолок, остаётся сидеть.
export const S6: React.FC = () => {
  const t = useCurrentFrame();
  const N = 6;
  const SW = 150;
  const SH = 130;
  const p = clamp(t / 38) * (N - 1);
  const i = Math.floor(p);
  const fr = p - i;
  const hx = 135 + p * SW;
  const hy = G - (Math.min(i + fr, N - 1) + 1) * SH - Math.sin(fr * Math.PI) * 54;
  const stuck = t >= 40;
  const stars = stuck ? Math.floor(t / 3) : 0;
  return (
    <Sheet hit={40}>
      <Head lines={['ВЫШЕ НЕ ПОДНИМУТ']} t={t} />
      <rect x={690} y={400} width={360} height={110} fill={INK} />
      <Tx x={870} y={478} size={76} fill={PAPER} bold={1.4}>ПОТОЛОК</Tx>
      <Ground />
      {Array.from({ length: N }, (_, k) => (
        <g key={k}>
          <rect x={60 + k * SW} y={G - (k + 1) * SH} width={SW} height={(k + 1) * SH} fill={PAPER} />
          <Tx x={135 + k * SW} y={G - (k + 1) * SH + 44} size={k === N - 1 ? 30 : 28}>{k === N - 1 ? 'не тянет' : 'справился'}</Tx>
          {k < N - 1 && <Check x={114 + k * SW} y={G - (k + 1) * SH + 88} t={t} at={(k + 1) * 7} s={0.9} />}
        </g>
      ))}
      <Boss x={hx} y={hy} s={1.02} mouth={stuck ? 'flat' : 'smile'} brow={stuck ? 'sad' : 'none'} eyes={stuck ? 'wide' : 'dots'} la={[-40, 60]} ra={[40, 60]} seed={6} />
      {stuck && [0, 1, 2, 3].map((k) => {
        const a = (stars * 24 + k * 90) * (Math.PI / 180);
        const sx = hx + Math.cos(a) * 92;
        const sy = hy - 276 + Math.sin(a) * 18;
        return <path key={k} d={`M${sx - 12} ${sy} h24 M${sx} ${sy - 12} v24`} strokeWidth={4} />;
      })}
      <Stamp x={330} y={760} text="ТАК И СИДИТ" t={t} at={44} size={76} rot={-5} />
    </Sheet>
  );
};

// 7. Сплит: механика перечёркивает, снизу начальник за столом.
export const S7: React.FC = () => {
  const t = useCurrentFrame();
  const AT = 35;
  const MID = 960;
  return (
    <Sheet hit={AT}>
      <Tx x={W / 2} y={260} size={150} bold={3}>ПОТЕРЯЛИ</Tx>
      <Ground y={MID - 16} hatch={false} />
      <Man x={540} y={MID - 18} s={1.9} mouth="grin" brow="raised" hair="tuft" la={[-70, 80]} ra={[90, -30]} seed={2} />
      <Wrench x={768} y={MID - 340} a={18} s={1.2} />
      <Draw t={t} at={6} n={8} strokeWidth={22} d={`M230 330 L850 ${MID - 30}`} />
      <Draw t={t} at={12} n={8} strokeWidth={22} d={`M850 330 L230 ${MID - 30}`} />
      {t >= AT && (
        <g>
          <rect x={0} y={MID} width={W} height={H - MID} fill={INK} />
          <Tx x={W / 2} y={1150} size={150} fill={PAPER} bold={3}>ПОЛУЧИЛИ</Tx>
          <Boss x={540} y={1650} s={1.6} mouth="flat" brow="angry" eyes="dots" la={[-70, 40]} ra={[70, 40]} seed={4} />
          <rect x={150} y={1450} width={780} height={300} fill={PAPER} />
          <rect x={150} y={1450} width={780} height={300} stroke={INK} strokeWidth={5} />
          <Tx x={540} y={1580} size={110} bold={2}>ИДИОТ</Tx>
          <Tx x={540} y={1670} size={46}>старший мастер</Tx>
        </g>
      )}
    </Sheet>
  );
};

// 8. Разрез конторы: этажи загораются снизу вверх, на каждом свой начальник.
export const S8: React.FC = () => {
  const t = useCurrentFrame();
  const TOP = 470;
  const F = 7;
  const fh = (G - TOP) / F;
  const r = rnd(21);
  const cells = Array.from({ length: F * 3 }, () => ({ ink: r() < 0.16, zz: r() < 0.33, m: r() }));
  return (
    <Sheet>
      <Head lines={['НА КАЖДОМ ЭТАЖЕ']} t={t} />
      <rect x={360} y={TOP - 72} width={360} height={72} fill={INK} />
      <Tx x={540} y={TOP - 18} size={56} fill={PAPER}>КОНТОРА</Tx>
      <rect x={70} y={TOP} width={940} height={G - TOP} fill={PAPER} strokeWidth={6} />
      <Ground />
      {Array.from({ length: F }, (_, fl) => {
        const row = F - 1 - fl;
        if (t < row * 3) return null;
        const y = TOP + fl * fh;
        return (
          <g key={fl}>
            {fl > 0 && <path d={`M70 ${y} H1010`} strokeWidth={5} />}
            {[0, 1, 2].map((c) => {
              const cell = cells[fl * 3 + c];
              const x = 70 + c * (940 / 3);
              const cx = x + 940 / 6;
              if (cell.ink) return <rect key={c} x={x} y={y} width={940 / 3} height={fh} fill={INK} />;
              return (
                <g key={c}>
                  {c > 0 && <path d={`M${x} ${y} V${y + fh}`} strokeWidth={3} />}
                  <Boss x={cx - 34} y={y + fh - 4} s={0.5} mouth={cell.m < 0.4 ? 'flat' : cell.m < 0.7 ? 'o' : 'open'} eyes={cell.zz ? 'closed' : 'dots'} brow={cell.m > 0.7 ? 'angry' : 'none'} la={[-30, 40]} ra={[50, -6]} seed={fl + c} />
                  <rect x={cx - 16} y={y + fh - 62} width={118} height={60} fill={PAPER} strokeWidth={2.6} />
                  {cell.zz ? <Tx x={cx + 74} y={y + 42} size={32}>zZz</Tx> : <rect x={cx + 26} y={y + fh - 96} width={46} height={34} fill={PAPER} strokeWidth={2.4} />}
                </g>
              );
            })}
          </g>
        );
      })}
    </Sheet>
  );
};

// 9. Итальянцы и модель: доска, пирамида-иерархия мигает узлами.
export const S9: React.FC = () => {
  const t = useCurrentFrame();
  const tick = Math.floor(t / 5);
  return (
    <Sheet>
      <Head lines={['ИТАЛЬЯНЦЫ ПОСЧИТАЛИ']} t={t} />
      <rect x={70} y={380} width={940} height={640} fill={PAPER} strokeWidth={6} />
      <rect x={84} y={394} width={912} height={612} strokeWidth={2} />
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: row + 1 }, (_, c) => {
          const x = 330 + (c - row / 2) * 84;
          const y = 450 + row * 96;
          const on = rnd(row * 9 + c * 3 + tick * 7)() < 0.4;
          return <circle key={`${row}-${c}`} cx={x} cy={y} r={28} fill={on ? INK : PAPER} />;
        }),
      )}
      <path d="M330 478 V522 M330 478 L288 522 M330 478 L372 522" strokeWidth={2} />
      <Tx x={790} y={520} size={118} bold={2}>2010</Tx>
      <Tx x={790} y={640} size={54}>модель</Tx>
      <Tx x={790} y={712} size={54}>фирмы</Tx>
      <Tx x={790} y={856} size={46}>P(k+1) = ?</Tx>
      <Tx x={790} y={930} size={46}>n = 160</Tx>
      <Ground />
      <Man x={270} y={G} s={1.7} mouth="smile" brow="raised" la={[-60, 70]} ra={[80, -70 + Math.sin(t / 4) * 20]} seed={3} />
      <Tash x={270} y={G} s={1.7} />
      <Specs x={270} y={G} s={1.7} />
      <Man x={790} y={G} s={1.7} flip mouth="o" hair="tuft" la={[-30, -56]} ra={[60, 70]} seed={5} />
      <Tash x={790} y={G} s={1.7} />
    </Sheet>
  );
};

// 10. Рулетка повышений тормозит, чёрный столбик «наугад» обгоняет «лучших».
export const S10: React.FC = () => {
  const t = useCurrentFrame();
  const cx = 540;
  const cy = 700;
  const R = 250;
  const a = 1100 * easeOut(clamp(t / 44));
  const best = 300 * easeOut(clamp((t - 14) / 14));
  const rand = 500 * easeInOut(clamp((t - 30) / 16));
  return (
    <Sheet>
      <Head lines={['НАУГАД ВЫГОДНЕЕ']} t={t} />
      <g transform={`rotate(${a} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={R} fill={PAPER} strokeWidth={7} />
        {Array.from({ length: 8 }, (_, i) => {
          const q0 = (i * Math.PI) / 4;
          const q1 = ((i + 1) * Math.PI) / 4;
          const p = (q: number) => `${cx + Math.cos(q) * R} ${cy + Math.sin(q) * R}`;
          return <path key={i} d={`M${cx} ${cy} L${p(q0)} A${R} ${R} 0 0 1 ${p(q1)} Z`} fill={i % 2 ? INK : PAPER} />;
        })}
        <circle cx={cx} cy={cy} r={34} fill={PAPER} strokeWidth={5} />
      </g>
      <path d={`M${cx - 30} ${cy - R - 60} H${cx + 30} L${cx} ${cy - R + 18} Z`} fill={INK} />
      <Ground />
      <rect x={170} y={G - best} width={250} height={best} fill={PAPER} strokeWidth={6} />
      <rect x={660} y={G - rand} width={250} height={rand} fill={INK} />
      <Tx x={295} y={G - best - 24} size={62} bold={1.4}>{best > 20 ? 'ЛУЧШИХ' : ''}</Tx>
      <Tx x={785} y={G - rand - 24} size={62} bold={1.4}>{rand > 20 ? 'НАУГАД' : ''}</Tx>
      <Man x={540} y={G} s={1.06} mouth="o" eyes="up" brow="raised" la={[-40, 66]} ra={[40, 66]} seed={2} />
      <Specs x={540} y={G} s={1.06} />
    </Sheet>
  );
};

// 11. Сцена, кулисы, чёрный кубок.
export const S11: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet hit={4}>
      <Head lines={['ДАЛИ ШНОБЕЛЕВКУ']} t={t} />
      <g fill={PAPER}>
        <path d="M0 380 H230 Q210 800 110 960 Q60 1200 80 1570 H0 Z" />
        <path d="M1080 380 H850 Q870 800 970 960 Q1020 1200 1000 1570 H1080 Z" />
      </g>
      <path d="M50 400 Q50 900 40 1570 M120 400 Q110 800 60 1100 M1030 400 Q1030 900 1040 1570 M960 400 Q970 800 1020 1100" strokeWidth={2.4} />
      <Ground />
      <rect x={380} y={1240} width={320} height={330} fill={PAPER} strokeWidth={5} />
      <Tx x={540} y={1400} size={100} bold={2}>Ig</Tx>
      <Tx x={540} y={1500} size={60}>Nobel</Tx>
      <Pop x={540} y={1240} t={t}>
        <path d="M420 640 H660 Q670 900 575 960 V1110 H660 V1240 H420 V1110 H505 V960 Q410 900 420 640 Z" fill={INK} />
        <path d="M420 680 Q320 690 350 800 Q370 860 440 880 M660 680 Q760 690 730 800 Q710 860 640 880" strokeWidth={14} />
      </Pop>
      <Man x={230} y={G} s={1.5} mouth="grin" brow="raised" la={[-40, -130]} ra={[40, -130 + Math.sin(t / 3) * 16]} seed={1} />
      <Tash x={230} y={G} s={1.5} />
      <Specs x={230} y={G} s={1.5} />
      <Man x={850} y={G} s={1.5} flip mouth="grin" hair="tuft" la={[-40, -130 + Math.sin(t / 3 + 2) * 16]} ra={[40, -130]} seed={3} />
      <Tash x={850} y={G} s={1.5} />
      <Confetti t={t} seed={9} />
    </Sheet>
  );
};

const Hat: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-44 -258 L0 -366 L44 -258 Q0 -240 -44 -258 Z" fill={INK} />
    <circle cx={0} cy={-374} r={15} fill={PAPER} />
  </g>
);

// 12. Открытый офис: все спят, ты за столом, на «радуйся» колпак и конфетти.
export const S12: React.FC = () => {
  const t = useCurrentFrame();
  const AT = 35;
  const party = t >= AT;
  const jump = party ? Math.abs(Math.sin((t - AT) / 3.4)) * 90 : 0;
  return (
    <Sheet hit={AT}>
      <Head lines={['ТЕБЯ НЕ ПОВЫШАЮТ?']} t={t} />
      <Cloud x={120} y={520} s={1.3} />
      <Cloud x={720} y={470} s={1.1} />
      <Ground />
      {[175, 905].map((x, i) => (
        <g key={x}>
          <Boss x={x} y={G} s={1.1} eyes="closed" mouth="flat" la={[-20, 70]} ra={[20, 70]} seed={i} />
          <rect x={x - 130} y={G - 120} width={260} height={120} fill={PAPER} />
          <Tx x={x + 70} y={G - 360 - ((t + i * 12) % 30)} size={56}>zZz</Tx>
        </g>
      ))}
      <g>
        <Man x={540} y={G - jump} s={1.5} mouth={party ? 'grin' : 'flat'} brow={party ? 'raised' : 'sad'} la={party ? [-70, -110] : [-40, 60]} ra={party ? [70, -110] : [40, 60]} seed={4} />
        {party && <Hat x={540} y={G - jump} s={1.5} />}
      </g>
      {!party && (
        <g>
          <path d="M540 960 V1090 M516 1064 L540 1094 L564 1064" strokeWidth={6} />
          <Tx x={540} y={930} size={96} bold={2}>ТЫ</Tx>
        </g>
      )}
      <Stamp x={540} y={700} text="РАДУЙСЯ" t={t} at={AT} size={128} />
      <Confetti t={t} at={AT} seed={14} top={420} n={60} />
    </Sheet>
  );
};

// 13. Ростомер: огромный начальник у чёрной отметки, ты тянешься и не достаёшь.
export const S13: React.FC<{ len: number }> = () => {
  const t = useCurrentFrame();
  const MARK = 470;
  const stretch = Math.abs(Math.sin(t / 8)) * 34;
  const head = G - 300 - stretch;
  return (
    <Sheet>
      <Head lines={['ТЫ ЕЩЁ НЕ ДОРОС', 'ДО СВОЕГО ИДИОТА']} t={t} y={190} />
      <Boss x={240} y={G} s={3.95} mouth="flat" eyes="dots" brow="raised" la={[-40, 60]} ra={[40, 60]} />
      <rect x={510} y={MARK - 30} width={120} height={G - MARK + 30} fill={PAPER} strokeWidth={5} />
      {Array.from({ length: 22 }, (_, i) => {
        const y = G - i * 50;
        return <path key={i} d={`M510 ${y} h${i % 2 ? 36 : 66}`} strokeWidth={i % 2 ? 2.4 : 3.6} />;
      })}
      <Draw t={t} at={2} n={14} strokeWidth={14} d={`M440 ${MARK} H1040`} />
      <Tx x={840} y={MARK + 74} size={64} bold={1.4}>ТВОЙ ИДИОТ</Tx>
      <Ground />
      <Man x={780} y={G - stretch} s={1.1} mouth="open" brow="raised" eyes="up" la={[-30, -130]} ra={[34, -136]} seed={3} />
      {t >= 30 && (
        <g>
          <path d={`M940 ${MARK + 110} V${head} M920 ${MARK + 134} L940 ${MARK + 110} L960 ${MARK + 134} M920 ${head - 24} L940 ${head} L960 ${head - 24}`} strokeWidth={5} />
          <Tx x={826} y={(MARK + head) / 2 + 20} size={66} bold={1}>расти</Tx>
        </g>
      )}
    </Sheet>
  );
};

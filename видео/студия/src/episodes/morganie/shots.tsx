import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp, easeInOut, lerp } from '../../engine/anim';
import { Blob, BlobProps, Building, Cloud, Floor, H, INK, PAPER, Paper, T, W, hand, rnd } from '../../lines/kit';

export type Shot = React.FC<{ len: number }>;

// Числа t в планах — кадры от начала плана (30 fps), сняты с таймингов слов голоса.
const pop = (t: number, at: number, n = 8) => clamp((t - at) / n);
const Gena: React.FC<BlobProps> = (p) => <Blob hair="tuft" {...p} />;
const Dark: React.FC<{ children: React.ReactNode }> = ({ children }) => <AbsoluteFill style={{ filter: 'invert(1)' }}>{children}</AbsoluteFill>;

const Wavy: React.FC<{ x: number; y: number; w: number; p: number }> = ({ x, y, w, p }) => (
  <path d={`M${x} ${y} q${w / 8} -10 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeWidth={3} />
);
const Q: React.FC<{ t: number; at: number; x: number; y: number; size?: number; rot?: number }> = ({ t, at, x, y, size = 120, rot = 0 }) => (
  <T x={x} y={y} size={size * (0.7 + 0.3 * pop(t, at))} rot={rot} o={pop(t, at)}>?</T>
);
const Ruled: React.FC = () => (
  <>
    <g strokeWidth={1.6} opacity={0.45}>
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M0 ${70 + i * 52} H${W}`} />)}
      <path d={`M150 0 V${H} M158 0 V${H}`} />
    </g>
    {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={64} cy={60 + i * 84} r={13} strokeWidth={2.4} fill={PAPER} />)}
  </>
);
const Stopwatch: React.FC<{ x: number; y: number; r: number; deg: number }> = ({ x, y, r, deg }) => (
  <g>
    <rect x={x - 22} y={y - r - 34} width={44} height={36} fill={PAPER} />
    <circle cx={x} cy={y} r={r} fill={PAPER} />
    <circle cx={x} cy={y} r={r - 12} strokeWidth={1.8} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return <path key={i} d={`M${x + Math.sin(a) * (r - 30)} ${y - Math.cos(a) * (r - 30)} L${x + Math.sin(a) * (r - 16)} ${y - Math.cos(a) * (r - 16)}`} strokeWidth={2.4} />;
    })}
    <path d={`M${x} ${y} L${x + Math.sin((deg * Math.PI) / 180) * (r - 36)} ${y - Math.cos((deg * Math.PI) / 180) * (r - 36)}`} strokeWidth={5} />
  </g>
);
/** Киноплёнка: кадр dark залит чернью и при p → 1 схлопывается, соседние съезжаются. */
const FilmStrip: React.FC<{ x: number; y: number; fw: number; fh: number; n: number; dark?: number; p?: number }> = ({ x, y, fw, fh, n, dark, p = 0 }) => {
  let cx = x;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const isDark = i === dark;
        const w = isDark ? fw * (1 - p) : fw;
        const x0 = cx;
        cx += w;
        if (w < 1) return null;
        const m = x0 + w / 2;
        const c = y + fh / 2;
        return (
          <g key={i}>
            <rect x={x0} y={y} width={w} height={fh} fill={isDark ? INK : PAPER} />
            {!isDark && (
              <>
                <path d={`M${m - fw * 0.3} ${y + 14} h${fw * 0.12} M${m + fw * 0.18} ${y + 14} h${fw * 0.12} M${m - fw * 0.3} ${y + fh - 14} h${fw * 0.12} M${m + fw * 0.18} ${y + fh - 14} h${fw * 0.12}`} strokeWidth={6} />
                <circle cx={m} cy={c} r={fh * 0.22} strokeWidth={2.6} />
                <circle cx={m - fh * 0.08} cy={c - 4} r={3} fill={INK} stroke="none" />
                <circle cx={m + fh * 0.08} cy={c - 4} r={3} fill={INK} stroke="none" />
              </>
            )}
          </g>
        );
      })}
    </g>
  );
};
const Brain: React.FC<{ x: number; y: number; s?: number; face?: boolean }> = ({ x, y, s = 1, face }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-180 40 C-220 -60 -140 -150 -50 -130 C-20 -190 90 -180 120 -120 C210 -130 250 -30 190 40 C210 110 120 160 60 120 C20 170 -90 160 -110 110 C-170 130 -210 90 -180 40 Z" fill={PAPER} />
    <path d="M-110 -70 q34 30 0 62 M30 -112 q-34 40 12 72 M130 -40 q-44 10 -54 52 M-60 70 q30 -30 60 -6" strokeWidth={2.6} />
    {face && (
      <>
        <circle cx={-44} cy={-6} r={7} fill={INK} stroke="none" />
        <circle cx={40} cy={-6} r={7} fill={INK} stroke="none" />
        <path d="M-30 44 Q0 66 30 44" />
      </>
    )}
  </g>
);
const Scissors: React.FC<{ x: number; y: number; a: number; rot?: number }> = ({ x, y, a, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} strokeWidth={5}>
    {[a, -a].map((d, i) => (
      <g key={i} transform={`rotate(${d})`}>
        <path d="M-120 0 L120 0" />
        <circle cx={-146} cy={0} r={26} fill={PAPER} />
      </g>
    ))}
    <circle r={6} fill={INK} stroke="none" />
  </g>
);
const Bubble: React.FC<{ x: number; y: number; rx: number; ry: number; text: string; fromX: number; fromY: number; size?: number }> = ({ x, y, rx, ry, text, fromX, fromY, size = 60 }) => (
  <g>
    <circle cx={lerp(fromX, x, 0.35)} cy={lerp(fromY, y, 0.35)} r={9} fill={PAPER} />
    <circle cx={lerp(fromX, x, 0.62)} cy={lerp(fromY, y, 0.62)} r={15} fill={PAPER} />
    <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={PAPER} />
    <T x={x} y={y + size * 0.3} size={size}>{text}</T>
  </g>
);

// 1. Темнота: белое на чёрном, «3,5 года».
export const M1: Shot = () => {
  const t = useCurrentFrame();
  return (
    <Dark>
      <Paper specks={140}>
        <g opacity={pop(t, 6, 12)}>
          <T x={960} y={340} size={250}>3,5 года</T>
          <T x={960} y={460} size={70} o={pop(t, 66, 12)}>в полной темноте</T>
        </g>
        <Blob x={960} y={770} s={0.62} eyes="closed" mouth="smile" bob />
      </Paper>
    </Dark>
  );
};

// 2. Гена гуляет и ничего не замечает.
export const M2: Shot = ({ len }) => {
  const t = useCurrentFrame();
  const k = clamp(t / len);
  return (
    <Paper>
      <Cloud x={300} y={150} s={1.2} />
      <Cloud x={1420} y={120} />
      <Building x={40} y={300} w={240} h={406} cols={2} rows={5} seed={3} />
      <Building x={1620} y={250} w={260} h={456} cols={3} rows={6} seed={8} />
      <Floor />
      <Gena x={lerp(420, 1260, k)} eyes="dots" mouth="grin" la={[-40, 66 + Math.sin(t / 3) * 16]} ra={[40, 66 - Math.sin(t / 3) * 16]} bob />
    </Paper>
  );
};

// 3. Зритель со спины перед экраном, а в экране этот же ролик.
export const M3: Shot = () => {
  const t = useCurrentFrame();
  return (
    <Paper>
      <rect x={520} y={40} width={880} height={500} rx={14} fill={PAPER} />
      <rect x={548} y={68} width={824} height={444} fill={INK} />
      <text x={960} y={330} textAnchor="middle" fontFamily={hand} fontSize={150} fill={PAPER} stroke="none">3,5 года</text>
      <path d="M880 540 V600 M1040 540 V600 M780 600 H1140" strokeWidth={5} />
      <path d="M560 804 C600 680 760 640 960 640 C1160 640 1320 680 1360 804 Z" fill={PAPER} />
      <circle cx={960} cy={560} r={170} fill={PAPER} />
      <Q t={t} at={3} x={270} y={280} size={190} rot={-12} />
      <Q t={t} at={32} x={1640} y={300} size={230} rot={10} />
      <Q t={t} at={50} x={1730} y={620} size={110} rot={-6} />
      <Q t={t} at={50} x={190} y={620} size={130} rot={14} />
    </Paper>
  );
};

// 4. Это Гена, крупно: на «опять» и «моргнул» глаза закрываются.
export const M4: Shot = () => {
  const t = useCurrentFrame();
  const shut = (t >= 72 && t < 78) || (t >= 105 && t < 113);
  return (
    <Paper>
      <Gena x={960} y={1088} s={3.2} eyes={shut ? 'closed' : 'dots'} mouth="flat" brow="raised" la={[-30, 70]} ra={[30, 70]} />
      <rect x={620} y={650} width={680} height={190} rx={12} fill={PAPER} />
      <circle cx={960} cy={726} r={16} strokeWidth={2.6} />
      <g opacity={pop(t, 2)}>
        <T x={1560} y={230} size={110}>Гена</T>
        <path d="M1470 260 Q1320 300 1200 340 M1200 340 l30 -28 M1200 340 l42 10" strokeWidth={4} />
      </g>
      <g opacity={t >= 105 && t < 130 ? 1 : 0}>
        <T x={380} y={380} size={120} rot={-8}>морг</T>
      </g>
    </Paper>
  );
};

// 5. Тетрадь: за минуту пятнадцать чёрточек.
export const M5: Shot = () => {
  const t = useCurrentFrame();
  return (
    <Paper specks={40}>
      <Ruled />
      <T x={960} y={120} size={92}>Давай посчитаем</T>
      <Wavy x={640} y={146} w={640} p={pop(t, 4, 22)} />
      <Stopwatch x={470} y={470} r={190} deg={clamp((t - 39) / 64) * 360} />
      <T x={470} y={740} size={60}>1 минута</T>
      {Array.from({ length: 15 }, (_, i) => {
        const p = clamp((t - 39 - i * 4.2) / 4);
        if (p <= 0) return null;
        const x0 = 880 + (i % 5) * 96;
        const y0 = 270 + Math.floor(i / 5) * 130;
        const j = (rnd(i + 21)() - 0.5) * 8;
        return <path key={i} d={`M${x0 + j} ${y0} L${x0 - j} ${y0 + 92 * p}`} strokeWidth={5} />;
      })}
      <T x={1570} y={480} size={150} o={pop(t, 88)}>15</T>
      <T x={1570} y={560} size={60} o={pop(t, 92)}>раз</T>
    </Paper>
  );
};

// 6. День: солнце идёт дугой, счётчик морганий крутится до 14 400.
export const M6: Shot = () => {
  const t = useCurrentFrame();
  const k = clamp(t / 62);
  const sx = lerp(180, 1700, k);
  const sy = 400 - Math.sin(k * Math.PI) * 170;
  const n = Math.round(14400 * easeInOut(clamp((t - 62) / 50)));
  return (
    <Paper>
      <g transform={`translate(${sx} ${sy})`} strokeWidth={3}>
        <circle r={46} fill={PAPER} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i * Math.PI) / 5;
          return <path key={i} d={`M${Math.cos(a) * 60} ${Math.sin(a) * 60} l${Math.cos(a) * 24} ${Math.sin(a) * 24}`} />;
        })}
      </g>
      <Building x={60} y={400} w={260} h={306} cols={3} rows={4} seed={5} />
      <Building x={1560} y={360} w={300} h={346} cols={3} rows={4} seed={12} />
      <Floor />
      <Gena x={960} eyes="dots" mouth="flat" brow="sad" bob />
      <T x={1660} y={140} size={70} o={pop(t, 33)}>16 часов</T>
      {t >= 62 ? (
        <g>
          <T x={960} y={150} size={140}>{n.toLocaleString('ru-RU')}</T>
          <T x={960} y={215} size={56} o={pop(t, 112, 10)}>морганий в день</T>
        </g>
      ) : null}
    </Paper>
  );
};

// 7. Огромный глаз медленно моргает, рядом секундомер; Гена отмахивается.
export const M7: Shot = () => {
  const t = useCurrentFrame();
  const lid = (s: number, e: number) => (t < s || t > e ? 0 : Math.sin(((t - s) / (e - s)) * Math.PI));
  const p = Math.max(lid(14, 40), lid(62, 86), lid(120, 146));
  return (
    <Paper>
      <path d="M430 400 Q960 -40 1490 400 Q960 840 430 400 Z" fill={PAPER} />
      <circle cx={960} cy={400} r={190} fill={PAPER} />
      <circle cx={960} cy={400} r={96} fill={INK} />
      <circle cx={1000} cy={356} r={26} fill={PAPER} stroke="none" />
      <path d={`M430 400 Q960 -40 1490 400 Q960 ${lerp(-40, 840, p)} 430 400 Z`} fill={PAPER} />
      <g opacity={pop(t, 66)}>
        <Stopwatch x={1700} y={170} r={92} deg={108} />
        <T x={1700} y={350} size={68}>0,3 с</T>
      </g>
      <g opacity={pop(t, 104)}>
        <Gena x={170} y={800} s={0.62} eyes="dots" mouth="smile" la={[-30, 60]} ra={[50, -20]} />
        <Bubble x={340} y={270} rx={190} ry={90} text="ерунда" fromX={210} fromY={600} size={72} />
      </g>
    </Paper>
  );
};

// 8. Тетрадь: умножение, 72 минуты.
export const M8: Shot = () => {
  const t = useCurrentFrame();
  return (
    <Paper specks={40}>
      <Ruled />
      <T x={860} y={170} size={100}>14 400 раз</T>
      <T x={860} y={285} size={100} o={pop(t, 6)}>× 0,3 секунды</T>
      <path d="M430 320 H1300" strokeWidth={4} opacity={pop(t, 16)} />
      <T x={860} y={510} size={200} o={pop(t, 24)}>72 минуты</T>
      <T x={860} y={610} size={72} o={pop(t, 44)}>в день</T>
      <Gena x={1620} y={780} s={1.05} eyes="closed" mouth="flat" la={[-34, 76]} ra={[34, 76]} bob />
    </Paper>
  );
};

// 9. Диван, попкорн и телевизор с чёрным экраном.
export const M9: Shot = () => {
  const t = useCurrentFrame();
  return (
    <Paper>
      <Floor />
      <rect x={240} y={420} width={640} height={290} rx={40} fill={PAPER} />
      <Gena x={560} y={690} eyes="dots" brow="raised" mouth="smile" la={[-20, 30]} ra={[34, 30 + Math.sin(t / 5) * 10]} />
      <rect x={200} y={590} width={720} height={116} rx={30} fill={PAPER} />
      <path d="M640 520 L650 610 H740 L750 520 Z" fill={PAPER} />
      <path d="M655 520 q16 -22 34 -4 q18 -20 36 4 M640 520 H750" strokeWidth={2.8} />
      <rect x={1180} y={210} width={500} height={330} rx={16} fill={PAPER} />
      <rect x={1206} y={236} width={448} height={278} fill={INK} />
      <rect x={1130} y={540} width={600} height={166} fill={PAPER} />
      <path d="M1430 540 V706 M1160 610 H1400 M1460 610 H1700" strokeWidth={2.6} />
    </Paper>
  );
};

// 10. Линия жизни: чёрные полоски собираются в один блок.
export const M10: Shot = () => {
  const t = useCurrentFrame();
  const r = rnd(47);
  const slivers = Array.from({ length: 40 }, () => 130 + r() * 1650);
  const m = easeInOut(clamp((t - 41) / 30));
  return (
    <Paper>
      <path d="M110 548 H1810 M110 530 V566 M1810 530 V566" strokeWidth={4} />
      <T x={110} y={140} size={56} anchor="start">0</T>
      <T x={1810} y={140} size={56} anchor="end">70 лет</T>
      <Gena x={300} y={540} s={0.6} eyes="dots" mouth="smile" />
      <Gena x={940} y={540} s={1} eyes="dots" mouth="flat" />
      <Gena x={1560} y={540} s={1} eyes="dots" mouth="flat" brow="sad" la={[34, 86]} ra={[60, 86]} />
      <path d="M1672 530 V408 Q1672 390 1690 392" strokeWidth={6} />
      {slivers.map((x, i) => {
        const p = pop(t, i * 0.9, 4);
        if (p <= 0) return null;
        return <rect key={i} x={lerp(x, 1726 + (i / 40) * 80, m)} y={584} width={lerp(5, 3, m)} height={48} fill={INK} stroke="none" />;
      })}
      {m >= 1 && <rect x={1726} y={584} width={84} height={48} fill={INK} />}
      <T x={1810} y={700} size={78} anchor="end" o={pop(t, 62)}>3,5 года</T>
      <g opacity={pop(t, 96)}>
        <T x={800} y={704} size={70}>1 200 с лишним дней без единого кадра</T>
      </g>
    </Paper>
  );
};

// 11. Гена чешет голову.
export const M11: Shot = () => {
  const t = useCurrentFrame();
  return (
    <Paper>
      <Floor />
      <Gena x={960} eyes="dots" brow="raised" mouth="o" la={[10, -70 + Math.sin(t / 3) * 8]} ra={[34, 76]} />
      <Q t={t} at={3} x={620} y={260} size={150} rot={-12} />
      <Q t={t} at={16} x={1330} y={230} size={190} rot={10} />
      <Q t={t} at={30} x={440} y={520} size={110} rot={8} />
      <Q t={t} at={42} x={1520} y={500} size={130} rot={-8} />
    </Paper>
  );
};

// 12. Голова в профиль: ручка «зрение» уходит вниз, чёрный кадр схлопывается.
export const M12: Shot = () => {
  const t = useCurrentFrame();
  const deg = lerp(60, -70, easeInOut(clamp((t - 22) / 40)));
  return (
    <Paper>
      <path d="M180 804 C170 620 200 200 520 110 C800 60 960 220 960 400 L1020 470 L950 500 C950 600 880 660 770 660 L770 804 Z" fill={PAPER} />
      <circle cx={850} cy={350} r={10} fill={INK} stroke="none" />
      <Brain x={500} y={340} s={1.05} />
      <T x={1420} y={110} size={72}>зрение</T>
      <circle cx={1420} cy={260} r={108} fill={PAPER} />
      <path d={`M1420 260 L${1420 + Math.sin((deg * Math.PI) / 180) * 90} ${260 - Math.cos((deg * Math.PI) / 180) * 90}`} strokeWidth={6} />
      <T x={1274} y={290} size={64}>−</T>
      <T x={1566} y={290} size={64}>+</T>
      <FilmStrip x={1040} y={480} fw={150} fh={190} n={5} dark={2} p={easeInOut(clamp((t - 98) / 26))} />
    </Paper>
  );
};

// 13. Мозг-монтажёр режет плёнку, чёрный кадр падает; Гена возмущён.
export const M13: Shot = () => {
  const t = useCurrentFrame();
  const a = 8 + Math.abs(Math.sin(t / 4)) * 16;
  const fall = clamp((t - 34) / 40);
  return (
    <Paper>
      <Floor />
      <Brain x={360} y={280} s={1.15} face />
      <path d="M560 340 Q760 520 912 446" strokeWidth={6} />
      <FilmStrip x={640} y={220} fw={150} fh={150} n={2} />
      <FilmStrip x={1090} y={220} fw={150} fh={150} n={2} />
      <rect x={940} y={lerp(220, 556, fall)} width={150} height={150} fill={INK} transform={`rotate(${fall * 12} 1015 ${lerp(295, 631, fall)})`} />
      <Scissors x={940} y={295} a={t < 34 ? a : 6} rot={90} />
      <g opacity={pop(t, 80)}>
        <Gena x={1660} eyes="dots" brow="angry" mouth="open" la={[-46, -50]} ra={[46, -50]} />
      </g>
    </Paper>
  );
};

// 14. Гена смотрит на тебя, вокруг обрывки плёнки; веки закрываются в чёрное.
export const M14: Shot = () => {
  const t = useCurrentFrame();
  const p = easeInOut(clamp((t - 134) / 18));
  return (
    <>
      <Paper>
        <g transform="rotate(-14 260 200)">
          <FilmStrip x={60} y={120} fw={130} fh={150} n={3} dark={1} />
        </g>
        <g transform="rotate(12 1660 640)">
          <FilmStrip x={1460} y={560} fw={130} fh={150} n={3} dark={1} />
        </g>
        <Gena x={960} y={1088} s={3.2} eyes="dots" mouth="flat" brow="raised" la={[-30, 70]} ra={[30, 70]} />
        <Q t={t} at={46} x={1520} y={260} size={190} rot={10} />
        <Q t={t} at={86} x={380} y={560} size={150} rot={-10} />
      </Paper>
      <AbsoluteFill>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: `${p * 52}%`, background: '#000' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${p * 52}%`, background: '#000' }} />
      </AbsoluteFill>
    </>
  );
};

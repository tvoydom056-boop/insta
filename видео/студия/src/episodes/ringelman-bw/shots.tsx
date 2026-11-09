import React from 'react';
import { useCurrentFrame } from 'remotion';
import { clamp, easeOut, lerp } from '../../engine/anim';
import { Clock, INK, PAPER } from '../../lines/kit';
import { Draw, Ground, Head, Man, Pop, Sheet, Specs, Stamp, Tash, Tx, G } from '../piter-bw/shots';

// «Эффект Рингельмана»: вертикальный ЧБ 1080×1920 в той же подаче, что «Принцип Питера» (заголовок-плашка, один сюжет на кадр).

const GRID = [155, 405, 655, 905];
const VASYA = 5; // индекс «того самого Васи» в сетке 4×3

/** Кабинет: 12 человечков в сетке 4×3. */
const roomXY = (i: number) => ({ x: GRID[i % 4], y: [800, 1150, 1500][Math.floor(i / 4)] });

const Rope: React.FC<{ y: number; x1: number; x2: number; sag?: number }> = ({ y, x1, x2, sag = 0 }) => (
  <g>
    <path d={`M${x1} ${y} Q${(x1 + x2) / 2} ${y + sag} ${x2} ${y}`} strokeWidth={9} />
    <path d={`M${x1} ${y} Q${(x1 + x2) / 2} ${y + sag} ${x2} ${y}`} strokeWidth={3} stroke={PAPER} strokeDasharray="10 14" />
  </g>
);

const Laptop: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={3 / s}>
    <rect x={-48} y={-70} width={96} height={64} fill={PAPER} />
    <path d="M-62 0 H62 L50 -8 H-50 Z" fill={INK} />
  </g>
);

// 1. Кабинет: двенадцать человек, один работает.
export const S1: React.FC = () => {
  const t = useCurrentFrame();
  const s = 0.9;
  const v = roomXY(VASYA);
  return (
    <Sheet>
      <Head lines={['СОВЕЩАНИЕ', 'НА 12 ЧЕЛОВЕК']} t={t} />
      <Clock x={940} y={450} r={56} hour={90 + t * 0.2} min={t * 6} />
      {Array.from({ length: 12 }, (_, i) => {
        const { x, y } = roomXY(i);
        if (i === VASYA) return null;
        return <Man key={i} x={x} y={y} s={s} mouth="flat" eyes={i % 3 === 0 ? 'up' : 'closed'} seed={i} la={[-26, 70]} ra={[26, 70]} />;
      })}
      <Man x={v.x} y={v.y} s={s} mouth="grin" eyes="dots" hair="tuft" la={[-22, 46]} ra={[22, 46]} seed={VASYA} bob />
      <Laptop x={v.x} y={v.y - 40} s={1.15} />
      <Draw t={t} at={100} n={12} strokeWidth={6} d={`M${v.x} ${v.y - 290} a120 165 0 1 1 -0.1 0`} />
      <Stamp x={540} y={495} text="ОДИН" t={t} at={112} size={104} />
    </Sheet>
  );
};

// 2. Рингельман: француз в берете, блокнот, моток каната.
export const S2: React.FC = () => {
  const t = useCurrentFrame();
  const s = 2.1;
  const x = 400;
  return (
    <Sheet>
      <Head lines={['РИНГЕЛЬМАН']} t={t} />
      <Pop x={790} y={560} t={t} at={6}>
        <rect x={560} y={420} width={440} height={150} fill={INK} />
        <rect x={574} y={434} width={412} height={122} stroke={PAPER} strokeWidth={3} />
        <Tx x={780} y={512} size={56} fill={PAPER} bold={1.2}>СТО ЛЕТ НАЗАД</Tx>
      </Pop>
      <Ground />
      <Man x={x} y={G} s={s} mouth="grin" brow="raised" la={[-70, 10]} ra={[-30, 60]} seed={3} />
      <Specs x={x} y={G} s={s} />
      <Tash x={x} y={G} s={s} />
      <ellipse cx={x + 8 * s} cy={G - 268 * s} rx={64 * s} ry={15 * s} fill={INK} />
      <path d={`M${x + 8 * s} ${G - 281 * s} v${-16 * s}`} strokeWidth={9} />
      <g transform={`rotate(-12 ${x - 223} ${G - 294})`}>
        <rect x={x - 283} y={G - 374} width={120} height={160} fill={PAPER} />
        <path d={`M${x - 265} ${G - 338} h84 M${x - 265} ${G - 308} h84 M${x - 265} ${G - 278} h60`} strokeWidth={2.4} />
      </g>
      {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={810} cy={G - 40 - i * 16} rx={150 - i * 14} ry={34} fill={PAPER} />)}
      <path d={`M960 ${G - 52} q60 -30 40 -90`} strokeWidth={9} />
      <Draw t={t} at={30} n={14} strokeWidth={5} d="M560 700 q120 -40 240 0 t240 0" />
      <Tx x={780} y={790} size={64} bold={1.2}>канат</Tx>
    </Sheet>
  );
};

type PullProps = { xs: number[]; s: number; strain?: boolean; base?: number };
/** Ряд людей на канате: руки лежат на верёвке на уровне плеч. */
const Pullers: React.FC<PullProps & { block?: boolean; ghost?: boolean; t: number }> = ({ xs, s, t, strain = true, ghost = false, base = G }) => {
  const y = base - 140 * s;
  return (
    <g>
      {xs.map((x, i) => (
        <g key={x} opacity={ghost && i % 2 === 1 ? 0.18 : 1}>
          <Man x={x} y={base} s={s} mouth={strain ? 'open' : 'flat'} brow={strain ? 'angry' : 'none'} eyes={strain ? 'closed' : 'dots'} la={[-70 * 0.9, 10]} ra={[70 * 0.9, 10]} seed={i} />
        </g>
      ))}
      <Rope y={y} x1={0} x2={ghost ? 1080 : 860} sag={Math.sin(t / 4) * 4} />
    </g>
  );
};

// 3. Двое тянут на 93 %, трое на 85 %.
export const S3: React.FC = () => {
  const t = useCurrentFrame();
  const SW = 85;
  const three = t >= SW;
  const pct = three ? lerp(93, 85, easeOut(clamp((t - SW) / 12))) : 93;
  const s = three ? 1.05 : 1.3;
  const xs = three ? [160, 430, 700] : [250, 600];
  return (
    <Sheet hit={SW}>
      <Head lines={[three ? 'ВТРОЁМ: 85 %' : 'ВДВОЁМ: 93 %']} t={three ? t - SW : t} />
      <Tx x={540} y={560} size={58}>СИЛА КАЖДОГО</Tx>
      <rect x={130} y={600} width={820} height={96} fill={PAPER} strokeWidth={5} />
      <rect x={136} y={606} width={808 * (pct / 100)} height={84} fill={INK} stroke="none" />
      <Tx x={540} y={990} size={270} bold={3}>{Math.round(pct)} %</Tx>
      <Ground />
      <Pullers xs={xs} s={s} t={t} />
      <rect x={860} y={G - 300} width={190} height={300} fill={PAPER} strokeWidth={5} />
      <Tx x={955} y={G - 130} size={56}>ГРУЗ</Tx>
    </Sheet>
  );
};

// 4. Восемь тянут как четверо.
export const S4: React.FC = () => {
  const t = useCurrentFrame();
  const xs = [140, 380, 620, 860];
  return (
    <Sheet hit={34}>
      <Head lines={['8 ЧЕЛОВЕК', 'ТЯНУТ КАК 4']} t={t} />
      <Ground y={1120} hatch={false} />
      <Ground />
      <Pullers xs={xs} s={0.95} t={t} ghost={t >= 34} base={1120} />
      <Pullers xs={xs} s={0.95} t={t + 3} ghost={t >= 34} />
      <Pop x={540} y={700} t={t} at={14}>
        <Tx x={540} y={760} size={300} bold={4}>8 = 4</Tx>
      </Pop>
    </Sheet>
  );
};

// 5. Социальная лень: тянет один, остальные стоят рядом.
export const S5: React.FC = () => {
  const t = useCurrentFrame();
  const s = 0.82;
  const xs = [110, 280, 450, 620, 790, 960];
  return (
    <Sheet>
      <Head lines={['СОЦИАЛЬНАЯ ЛЕНЬ']} t={t} />
      <Ground />
      <Man x={xs[0]} y={G} s={s} mouth="open" brow="angry" eyes="closed" la={[-63, 10]} ra={[63, 10]} seed={0} />
      {xs.slice(1).map((x, i) => (
        <Man key={x} x={x} y={G} s={s} mouth={i % 2 ? 'o' : 'flat'} eyes={i % 2 ? 'closed' : 'up'} seed={i + 1} la={[-26, 70]} ra={[26, 70]} />
      ))}
      <Rope y={G - 140 * s} x1={0} x2={1080} sag={Math.sin(t / 4) * 4} />
      {[1, 3].map((i) => (
        <g key={i}>
          <Tx x={xs[i] + 60} y={G - 330 - Math.sin(t / 6 + i) * 8} size={54}>z</Tx>
          <Tx x={xs[i] + 96} y={G - 372 - Math.sin(t / 6 + i) * 8} size={76}>Z</Tx>
        </g>
      ))}
      <Pop x={560} y={800} t={t} at={50}>
        <path d="M290 690 q-24 0 -24 -34 v-70 q0 -34 34 -34 h520 q34 0 34 34 v70 q0 34 -34 34 h-280 l-70 60 v-60 Z" fill={PAPER} />
        <Tx x={560} y={650} size={76} bold={1.4}>пусть они тянут</Tx>
      </Pop>
      <Stamp x={540} y={960} text="ЛЕНЬ" t={t} at={30} size={120} />
    </Sheet>
  );
};

const Tick: React.FC<{ x: number; y: number }> = ({ x, y }) => <path d={`M${x} ${y} l10 12 l24 -30`} strokeWidth={5} />;

// 6. Рабочий чат на 40 человек: прочитали все, ответа нет.
export const S6: React.FC = () => {
  const t = useCurrentFrame();
  const n = Math.min(39, Math.floor(clamp((t - 96) / 34) * 39));
  return (
    <Sheet hit={136}>
      <Head lines={['ЧАТ НА 40 ЧЕЛОВЕК']} t={t} />
      <Clock x={125} y={1000} r={80} hour={t * 1.6} min={t * 19} />
      <Tx x={125} y={1140} size={42}>полдня</Tx>
      <rect x={250} y={420} width={730} height={1140} rx={70} fill={PAPER} strokeWidth={6} />
      <path d="M250 540 H980" strokeWidth={4} />
      <Tx x={615} y={500} size={50} bold={1}>РАБОЧИЙ ЧАТ · 40</Tx>
      <Pop x={500} y={700} t={t} at={8}>
        <rect x={290} y={590} width={560} height={150} rx={30} fill={PAPER} strokeWidth={4} />
        <Tx x={570} y={655} size={44}>Кто знает, куда</Tx>
        <Tx x={570} y={708} size={44}>сдавать отчёт?</Tx>
      </Pop>
      {t >= 96 && (
        <g>
          <Tick x={310} y={850} />
          <Tick x={338} y={850} />
          <Tx x={400} y={866} size={62} anchor="start">прочитали: {n}</Tx>
        </g>
      )}
      <rect x={290} y={1440} width={650} height={80} rx={40} fill={PAPER} strokeWidth={4} />
      {Math.floor(t / 12) % 2 === 0 && <path d="M330 1462 v36" strokeWidth={4} />}
      <Stamp x={615} y={1130} text="ОТВЕТОВ: 0" t={t} at={136} size={84} />
    </Sheet>
  );
};

/** Люди появляются в кабинете по одному, на экране растёт счётчик. */
export const S7: React.FC = () => {
  const t = useCurrentFrame();
  const s = 0.9;
  const shown = Math.min(12, Math.floor(t / 4) + 1);
  return (
    <Sheet>
      <Head lines={['СОВЕЩАНИЕ', 'НА 12 ЧЕЛОВЕК']} t={t} />
      {Array.from({ length: 12 }, (_, i) => {
        const { x, y } = roomXY(i);
        return (
          <Pop key={i} x={x} y={y} t={t} at={i * 4} n={6}>
            <Man x={x} y={y} s={s} mouth="flat" eyes="dots" seed={i} la={[-26, 70]} ra={[26, 70]} />
          </Pop>
        );
      })}
      <Tx x={940} y={520} size={130} bold={2}>{shown}</Tx>
    </Sheet>
  );
};

// 8. Одиннадцать зрителей и Вася.
export const S8: React.FC = () => {
  const t = useCurrentFrame();
  const sp = 0.75;
  const rowA = Array.from({ length: 6 }, (_, i) => ({ x: 110 + i * 172, y: 810 }));
  const rowB = Array.from({ length: 5 }, (_, i) => ({ x: 196 + i * 172, y: 1110 }));
  const crowd = [...rowA, ...rowB];
  const hand = Math.sin(t / 3) * 14;
  return (
    <Sheet>
      <Head lines={['11 ЗРИТЕЛЕЙ', 'И ОДИН ВАСЯ']} t={t} />
      {crowd.map((p, i) => (
        <Pop key={i} x={p.x} y={p.y} t={t} at={i * 2} n={7}>
          <Man x={p.x} y={p.y} s={sp} mouth="smile" eyes="dots" seed={i} bob la={[-18, 46 + (i % 2 ? hand : -hand)]} ra={[18, 46 + (i % 2 ? -hand : hand)]} />
        </Pop>
      ))}
      <Ground />
      <Pop x={540} y={G} t={t} at={44}>
        <Man x={540} y={G} s={1.45} mouth="open" eyes="wide" brow="sad" hair="tuft" la={[-50, 56]} ra={[50, 56]} seed={9} bob />
        <Laptop x={540} y={G - 28} s={1.75} />
        {[0, 1, 2].map((i) => {
          const u = ((t * 2 + i * 11) % 30) / 30;
          return <path key={i} opacity={1 - u} d={`M${660 + i * 22} ${G - 430 + u * 40} q8 14 0 22 q-8 -8 0 -22 Z`} fill={INK} />;
        })}
      </Pop>
      <Pop x={190} y={1470} t={t} at={52}>
        <Tx x={190} y={1480} size={110} bold={2.4}>ВАСЯ</Tx>
        <path d="M290 1456 q60 -10 112 -10 M380 1426 l30 20 l-34 22" strokeWidth={6} />
      </Pop>
    </Sheet>
  );
};

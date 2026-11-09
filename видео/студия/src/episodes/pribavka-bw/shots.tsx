import React from 'react';
import { useCurrentFrame } from 'remotion';
import { clamp, easeOut, lerp } from '../../engine/anim';
import { INK, PAPER } from '../../lines/kit';
import { Car, Check, Confetti, Draw, G, Ground, Head, Man, Pop, Sheet, Specs, Stamp, Tx } from '../piter-bw/shots';

// «Прибавка, которую ты не заметишь»: вертикальный ЧБ 1080×1920 в той же подаче, что «Принцип Питера».
// Моменты внутри плана (кадры от начала плана) собраны в T по словам голоса: (время слова − начало плана) × 30.
export const T = {
  s1: { arrow: 11, stamp: 72 },
  s2: { book: 18, year: 38 },
  s3: { inc: 0, exp: 10, hit: 36 },
  s4: { note: 4, stamp: 44, label: 8 },
  s5: { conf: 30, c1: 6, c2: 16, c3: 26 },
  s6: { r1: 0, r2: 33, r3: 59 },
  s7: { cal: 9, bubble: 38 },
};

/** Купюра: рамка, номинал, «Р» со штрихом. */
export const Note: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeWidth={3.4 / s}>
    <rect x={-150} y={-76} width={300} height={152} fill={PAPER} />
    <rect x={-136} y={-62} width={272} height={124} strokeWidth={2 / s} />
    <circle cx={-84} cy={0} r={34} />
    <Tx x={-84} y={14} size={44} bold={1}>Р</Tx>
    <Tx x={44} y={20} size={62} bold={1.2}>30 000</Tx>
  </g>
);

/** Монета: круг, внутри кружок. */
export const Coin: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 16 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={PAPER} />
    <circle cx={x} cy={y} r={r * 0.5} />
  </g>
);

/** Мешок с дырой: деньги высыпаются, не доходя до земли. */
export const Sack: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={3.4 / s}>
    <path d="M-110 0 Q-150 -130 -66 -214 L-46 -250 Q0 -272 46 -250 L66 -214 Q150 -130 110 0 Z" fill={PAPER} />
    <path d="M-50 -246 Q0 -226 50 -246" />
    <Tx x={-6} y={-92} size={130} bold={2}>Р</Tx>
    <path d="M-38 -66 H26" strokeWidth={6 / s} />
    <ellipse cx={92} cy={-70} rx={13} ry={19} fill={INK} />
    {[0, 1, 2, 3].map((i) => {
      const u = ((t * 1.7 + i * 25) % 100) / 100;
      return (
        <g key={i} opacity={1 - u * u * u}>
          <Coin x={96 + u * 34} y={-62 + u * u * 62} r={15} />
        </g>
      );
    })}
  </g>
);

// 1. Прибавка есть, денег нет.
export const S1: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet hit={T.s1.stamp}>
      <Head lines={['ПРИБАВКА ЕСТЬ', 'ДЕНЕГ НЕТ']} t={t} />
      <Ground />
      <Draw t={t} at={T.s1.arrow} n={14} strokeWidth={9} d="M930 1010 V700 M880 760 L930 700 L980 760" />
      <Pop x={900} y={640} t={t} at={T.s1.arrow + 8}>
        <Tx x={885} y={650} size={58} bold={1.2}>ЗАРПЛАТА</Tx>
      </Pop>
      <Man x={310} y={G} s={1.75} mouth="flat" eyes="up" brow="sad" la={[-26, 70]} ra={[70, -60]} seed={2} bob />
      <Sack x={690} y={G} s={1.55} t={t} />
      <Stamp x={430} y={900} text="СТОЛЬКО ЖЕ" t={t} at={T.s1.stamp} size={104} />
    </Sheet>
  );
};

// 2. Паркинсон, 60-й год: календарь докручивается, выскакивает книга.
export const S2: React.FC = () => {
  const t = useCurrentFrame();
  const year = Math.round(lerp(1950, 1960, easeOut(clamp((t - T.s2.year) / 22))));
  return (
    <Sheet>
      <Head lines={['ВТОРОЙ ЗАКОН']} t={t} />
      <g transform="translate(540 560)">
        <rect x={-270} y={-190} width={540} height={400} fill={PAPER} strokeWidth={5} />
        <rect x={-270} y={-190} width={540} height={96} fill={INK} />
        <Tx x={0} y={-120} size={62} fill={PAPER} bold={1}>ГОД</Tx>
        {[-170, 170].map((rx) => <path key={rx} d={`M${rx} -214 v52`} strokeWidth={10} />)}
        <Tx x={0} y={110} size={210} bold={2}>{year}</Tx>
      </g>
      <Ground />
      <Man x={290} y={G} s={1.6} mouth="smile" eyes="dots" la={[-26, 70]} ra={[60, 20]} seed={4} bob />
      <Specs x={290} y={G} s={1.6} />
      <Pop x={760} y={G} t={t} at={T.s2.book}>
        <rect x={640} y={G - 330} width={280} height={330} fill={INK} />
        <rect x={656} y={G - 314} width={248} height={298} stroke={PAPER} strokeWidth={3} />
        <Tx x={780} y={G - 190} size={56} fill={PAPER} bold={1.2}>ЗАКОН</Tx>
        <Tx x={780} y={G - 120} size={56} fill={PAPER} bold={1.2}>№ 2</Tx>
      </Pop>
    </Sheet>
  );
};

export const STAIR = (base: number, shift: number) => `M130 ${base} H${300 + shift} V${base - 150} H${470 + shift} V${base - 300} H${640 + shift} V${base - 450} H${810 + shift} V${base - 600} H960`;

// 3. Расходы догоняют доходы: две лесенки, вторая отстаёт на ступень и дотягивается.
export const S3: React.FC = () => {
  const t = useCurrentFrame();
  const catchUp = t >= T.s3.hit;
  return (
    <Sheet hit={T.s3.hit}>
      <Head lines={['РАСХОДЫ ДОГОНЯЮТ ДОХОДЫ']} t={t} />
      <path d="M130 540 V1500 H990 M105 585 L130 540 L155 585 M945 1475 L990 1500 L945 1525" strokeWidth={5} />
      <Draw t={t} at={T.s3.inc} n={24} strokeWidth={8} d={STAIR(1250, 0)} />
      <Draw t={t} at={T.s3.exp} n={32} strokeWidth={8} d={STAIR(1400, 0).replace(/V(\d+)(?= H960$)/, 'V650')} />
      <Pop x={860} y={600} t={t} at={T.s3.inc + 20}>
        <Tx x={860} y={598} size={64} bold={1.2}>доходы</Tx>
      </Pop>
      <Pop x={300} y={1450} t={t} at={T.s3.exp + 6}>
        <Tx x={310} y={1465} size={64} bold={1.2}>расходы</Tx>
      </Pop>
      {catchUp && <circle cx={960} cy={650} r={18 + Math.abs(Math.sin(t / 3)) * 10} fill={INK} />}
    </Sheet>
  );
};

// 4. Саша ловит купюру в 30 000.
export const S4: React.FC = () => {
  const t = useCurrentFrame();
  const p = easeOut(clamp((t - T.s4.note) / 30));
  return (
    <Sheet hit={T.s4.stamp}>
      <Head lines={['ВОТ САША']} t={t} />
      <Ground />
      <Man x={540} y={G} s={1.7} mouth="grin" eyes="wide" hair="tuft" la={[-40, -86]} ra={[40, -86]} seed={5} bob />
      <Note x={540} y={lerp(380, 930, p)} rot={lerp(-24, 4, p)} />
      <Pop x={880} y={1300} t={t} at={T.s4.label}>
        <Tx x={880} y={1290} size={96} bold={2}>САША</Tx>
        <path d="M790 1250 Q730 1210 690 1220 M708 1180 L686 1222 L728 1250" strokeWidth={6} />
      </Pop>
      <Stamp x={540} y={720} text="+30 000" t={t} at={T.s4.stamp} size={110} />
    </Sheet>
  );
};

// 5. Впервые хватает на всё: прыжок, конфетти, галочки.
export const S5: React.FC = () => {
  const t = useCurrentFrame();
  const jump = Math.abs(Math.sin(t / 5)) * 110;
  const items = [
    { w: 'ЖИЛЬЁ', at: T.s5.c1 },
    { w: 'ЕДА', at: T.s5.c2 },
    { w: 'ОТПУСК', at: T.s5.c3 },
  ];
  return (
    <Sheet hit={T.s5.conf}>
      <Head lines={['ХВАТАЕТ НА ВСЁ']} t={t} />
      <Confetti t={t} at={T.s5.conf} top={420} n={50} />
      {items.map((it, i) => (
        <Pop key={it.w} x={110} y={560 + i * 150} t={t} at={it.at - 6}>
          <Tx x={110} y={590 + i * 150} size={84} bold={1.8} anchor="start">{it.w}</Tx>
          <Check x={460 + i * 40} y={575 + i * 150} t={t} at={it.at} s={1.7} />
        </Pop>
      ))}
      <Ground />
      <Man x={700} y={G - jump} s={1.5} mouth="grin" eyes="wide" hair="tuft" la={[-40, -86]} ra={[40, -86]} seed={5} />
    </Sheet>
  );
};

export const Cup: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-96 -130 L-72 0 H72 L96 -130 Z" fill={PAPER} />
    <path d="M96 -104 q56 0 44 52 q-12 34 -66 30" strokeWidth={6} />
    {[0, 1, 2].map((i) => {
      const u = ((t * 1.4 + i * 34) % 100) / 100;
      return <path key={i} opacity={1 - u} d={`M${-40 + i * 40} ${-150 - u * 90} q-14 -14 0 -28 t0 -28`} strokeWidth={4} />;
    })}
  </g>
);

export const Phone: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-78} y={-270} width={156} height={270} rx={26} fill={PAPER} strokeWidth={5} />
    <rect x={-62} y={-246} width={124} height={190} rx={8} strokeWidth={2.6} />
    <circle cx={0} cy={-28} r={10} />
    <circle cx={0} cy={-151} r={34} fill={INK} />
  </g>
);

// 6. Такси, кофе, айфон: три траты по словам.
export const S6: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['ТАКСИ, КОФЕ, АЙФОН']} t={t} />
      <Pop x={300} y={720} t={t} at={T.s6.r1}>
        <Car x={290} y={730} s={1.1} />
        <Tx x={760} y={670} size={112} bold={2}>ТАКСИ</Tx>
        <Tx x={760} y={770} size={68} bold={1}>метро</Tx>
        <path d="M625 745 H895" strokeWidth={7} />
      </Pop>
      <Pop x={300} y={1100} t={t} at={T.s6.r2}>
        <Cup x={290} y={1110} t={t} />
        <Tx x={760} y={1040} size={112} bold={2}>КОФЕ</Tx>
        <Tx x={760} y={1140} size={80} bold={1.4}>300 р.</Tx>
      </Pop>
      <Pop x={300} y={1490} t={t} at={T.s6.r3}>
        <Phone x={290} y={1520} />
        <Tx x={760} y={1400} size={112} bold={2}>АЙФОН</Tx>
        <Tx x={760} y={1500} size={68} bold={1}>в рассрочку</Tx>
      </Pop>
    </Sheet>
  );
};

// 7. Полгода спустя Саша просит у коллеги до получки.
export const S7: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['ДО ПОЛУЧКИ']} t={t} />
      {Array.from({ length: 6 }, (_, i) => (
        <Pop key={i} x={150 + i * 156} y={470} t={t} at={T.s7.cal + i * 5} n={7}>
          <rect x={92 + i * 156} y={380} width={116} height={130} fill={PAPER} strokeWidth={4} />
          <rect x={92 + i * 156} y={380} width={116} height={34} fill={INK} />
          <Tx x={150 + i * 156} y={486} size={72} bold={1.2}>{i + 1}</Tx>
        </Pop>
      ))}
      <Pop x={540} y={580} t={t} at={T.s7.cal + 16}>
        <Tx x={540} y={600} size={60} bold={1}>полгода спустя</Tx>
      </Pop>
      <Ground />
      <Man x={290} y={G} s={1.55} mouth="flat" eyes="up" brow="raised" la={[26, 70]} ra={[-26, 70]} seed={7} />
      <Man x={780} y={G} s={1.55} mouth="o" eyes="wide" brow="sad" hair="tuft" la={[-120, 0]} ra={[26, 70]} seed={8} bob />
      <Pop x={655} y={840} t={t} at={T.s7.bubble}>
        <path d="M434 750 h442 q34 0 34 34 v42 q0 34 -34 34 h-60 l-24 70 l-52 -70 h-306 q-34 0 -34 -34 v-42 q0 -34 34 -34 Z" fill={PAPER} />
        <Tx x={655} y={818} size={62} bold={1.3}>займи до получки</Tx>
      </Pop>
    </Sheet>
  );
};

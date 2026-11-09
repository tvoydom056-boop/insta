import React from 'react';
import { useCurrentFrame } from 'remotion';
import { clamp, easeOut, lerp } from '../../engine/anim';
import { INK, PAPER } from '../../lines/kit';
import { Car, Check, Confetti, Draw, G, Ground, Head, Man, Pop, Sheet, Specs, Stamp, Tx } from '../piter-bw/shots';
import { Coin, Cup, Phone, Sack, STAIR } from '../pribavka-bw/shots';
import { T } from './timing';

// «Прибавка» на 80–100 с: вертикальный ЧБ 1080×1920, 34 плана. Моменты внутри плана (кадры от начала плана) лежат в timing.ts
// и собираются скриптом из best_words.json: (время слова − начало плана) × 30.

/** Стопка/купюра с любым номиналом. */
const Bill: React.FC<{ x: number; y: number; rot?: number; s?: number; v: string }> = ({ x, y, rot = 0, s = 1, v }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeWidth={3.4 / s}>
    <rect x={-150} y={-76} width={300} height={152} fill={PAPER} />
    <rect x={-136} y={-62} width={272} height={124} strokeWidth={2 / s} />
    <circle cx={-84} cy={0} r={34} />
    <Tx x={-84} y={14} size={44} bold={1}>Р</Tx>
    <Tx x={44} y={20} size={v.length > 8 ? 38 : v.length > 6 ? 50 : 62} bold={1.2}>{v}</Tx>
  </g>
);

/** Фигурка-палочка для толпы. */
const Dude: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={3.2 / s} fill={PAPER}>
    <circle cx={0} cy={-52} r={12} />
    <path d="M0 -40 V-8 M-14 -28 H14 M0 -8 L-10 14 M0 -8 L10 14" fill="none" />
  </g>
);

/** Дом: коробка, крыша, дверь, окно. */
const House: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={4 / s}>
    <rect x={-120} y={-170} width={240} height={170} fill={PAPER} />
    <path d="M-146 -170 L0 -270 L146 -170 Z" fill={INK} />
    <rect x={-34} y={-98} width={68} height={98} />
    <rect x={56} y={-134} width={44} height={44} />
  </g>
);

/** Сейф: корпус, дверца, ручка. */
const Safe: React.FC<{ x: number; y: number; s?: number; open?: number }> = ({ x, y, s = 1, open = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeWidth={5 / s}>
    <rect x={-150} y={-300} width={300} height={300} fill={PAPER} />
    <rect x={-124} y={-274} width={248} height={248} strokeWidth={3 / s} fill={open ? INK : PAPER} />
    {!open && (
      <>
        <circle cx={0} cy={-150} r={56} />
        <circle cx={0} cy={-150} r={8} fill={INK} />
        <path d="M0 -206 V-186 M56 -150 H36" />
      </>
    )}
    <path d="M-110 0 v22 M110 0 v22" />
  </g>
);

const Ruble: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 30 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={PAPER} />
    <Tx x={x} y={y + r * 0.36} size={r * 1.1} bold={1}>Р</Tx>
  </g>
);

const Clock2: React.FC<{ x: number; y: number; r?: number; t: number }> = ({ x, y, r = 170, t }) => {
  const a = (t * 7) * (Math.PI / 180);
  return (
    <g strokeWidth={6}>
      <circle cx={x} cy={y} r={r} fill={PAPER} />
      {Array.from({ length: 12 }, (_, i) => {
        const b = (i * 30 * Math.PI) / 180;
        return <path key={i} d={`M${x + Math.sin(b) * (r - 10)} ${y - Math.cos(b) * (r - 10)} L${x + Math.sin(b) * (r - 30)} ${y - Math.cos(b) * (r - 30)}`} strokeWidth={4} />;
      })}
      <path d={`M${x} ${y} L${x + Math.sin(a) * (r - 40)} ${y - Math.cos(a) * (r - 40)}`} />
      <path d={`M${x} ${y} L${x + Math.sin(a / 12) * (r - 85)} ${y - Math.cos(a / 12) * (r - 85)}`} strokeWidth={9} />
      <circle cx={x} cy={y} r={10} fill={INK} />
    </g>
  );
};

/** Лицо-смайл без тела: плоский рот, точки-глаза. */
const Face: React.FC<{ x: number; y: number; r?: number; mood?: 'flat' | 'smile' }> = ({ x, y, r = 56, mood = 'flat' }) => (
  <g strokeWidth={4}>
    <circle cx={x} cy={y} r={r} fill={PAPER} />
    <circle cx={x - r * 0.36} cy={y - r * 0.15} r={4} fill={INK} />
    <circle cx={x + r * 0.36} cy={y - r * 0.15} r={4} fill={INK} />
    <path d={mood === 'flat' ? `M${x - r * 0.4} ${y + r * 0.4} H${x + r * 0.4}` : `M${x - r * 0.4} ${y + r * 0.3} Q${x} ${y + r * 0.7} ${x + r * 0.4} ${y + r * 0.3}`} />
  </g>
);

// 1. Прибавка есть, денег нет.
export const S1: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet hit={T.p1.stamp}>
      <Head lines={['ПРИБАВКА ЕСТЬ', 'ДЕНЕГ НЕТ']} t={t} />
      <Ground />
      <Draw t={t} at={T.p1.arrow} n={14} strokeWidth={9} d="M930 1010 V700 M880 760 L930 700 L980 760" />
      <Pop x={900} y={640} t={t} at={T.p1.arrow + 8}>
        <Tx x={885} y={650} size={58} bold={1.2}>ЗАРПЛАТА</Tx>
      </Pop>
      <Man x={310} y={G} s={1.75} mouth="flat" eyes="up" brow="sad" la={[-26, 70]} ra={[70, -60]} seed={2} bob />
      <Sack x={690} y={G} s={1.55} t={t} />
      <Stamp x={430} y={900} text="СТОЛЬКО ЖЕ" t={t} at={T.p1.stamp} size={104} />
    </Sheet>
  );
};

// 2. «Это не твоя глупость. Это второй закон Паркинсона.»
export const S2: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['НЕ ТВОЯ ГЛУПОСТЬ']} t={t} />
      <Ground />
      <Man x={290} y={G} s={1.7} mouth="smile" eyes="dots" brow="raised" la={[-70, 10]} ra={[70, 10]} seed={3} bob />
      <Pop x={770} y={G} t={t} at={T.p2.book}>
        <rect x={640} y={G - 330} width={280} height={330} fill={INK} />
        <rect x={656} y={G - 314} width={248} height={298} stroke={PAPER} strokeWidth={3} />
        <Tx x={780} y={G - 190} size={56} fill={PAPER} bold={1.2}>ЗАКОН</Tx>
        <Tx x={780} y={G - 120} size={56} fill={PAPER} bold={1.2}>№ 2</Tx>
      </Pop>
      <Pop x={780} y={700} t={t} at={T.p2.name}>
        <Tx x={780} y={720} size={84} bold={1.6}>ПАРКИНСОН</Tx>
        <path d="M600 750 H960" strokeWidth={6} />
      </Pop>
    </Sheet>
  );
};

// 3. Работа растягивается на всё время.
export const S3: React.FC = () => {
  const t = useCurrentFrame();
  const grow = easeOut(clamp((t - T.p3.stretch) / 40));
  const w = lerp(150, 820, grow);
  return (
    <Sheet>
      <Head lines={['РАБОТА РАСТЯГИВАЕТСЯ']} t={t} />
      <Pop x={540} y={620} t={t} at={T.p3.work}>
        <Tx x={540} y={640} size={66} bold={1.2}>вся неделя</Tx>
      </Pop>
      <rect x={130} y={720} width={820} height={150} fill={PAPER} strokeWidth={6} />
      {[1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${130 + i * 117} 720 v26`} strokeWidth={4} />)}
      <Pop x={200} y={800} t={t} at={T.p3.work}>
        <rect x={150} y={750} width={w} height={90} fill={INK} />
        <Tx x={150 + w / 2} y={812} size={50} fill={PAPER} bold={1}>ЗАДАЧА</Tx>
      </Pop>
      <Pop x={540} y={1010} t={t} at={T.p3.work + 6}>
        <Tx x={540} y={1030} size={60} bold={1}>на час, а заняла всё</Tx>
      </Pop>
      <Ground />
      <Man x={540} y={G} s={1.55} mouth="flat" eyes="up" brow="raised" la={[-26, 70]} ra={[26, 70]} seed={6} bob />
    </Sheet>
  );
};

// 4. В 60-м году он написал: календарь докручивается до 1960.
export const S4: React.FC = () => {
  const t = useCurrentFrame();
  const year = Math.round(lerp(1950, 1960, easeOut(clamp((t - T.p4.year) / 22))));
  return (
    <Sheet>
      <Head lines={['ПАРКИНСОН, 1960']} t={t} />
      <g transform="translate(540 680)">
        <rect x={-270} y={-190} width={540} height={400} fill={PAPER} strokeWidth={5} />
        <rect x={-270} y={-190} width={540} height={96} fill={INK} />
        <Tx x={0} y={-120} size={62} fill={PAPER} bold={1}>ГОД</Tx>
        {[-170, 170].map((rx) => <path key={rx} d={`M${rx} -214 v52`} strokeWidth={10} />)}
        <Tx x={0} y={110} size={210} bold={2}>{year}</Tx>
      </g>
      <Ground />
      <Man x={290} y={G} s={1.6} mouth="smile" eyes="dots" la={[-26, 70]} ra={[60, 20]} seed={4} bob />
      <Specs x={290} y={G} s={1.6} />
      <Pop x={790} y={1380} t={t} at={T.p4.year + 10}>
        <rect x={650} y={1260} width={280} height={150} fill={PAPER} strokeWidth={4} />
        <path d="M680 1300 H900 M680 1340 H900 M680 1380 H840" strokeWidth={4} />
      </Pop>
    </Sheet>
  );
};

// 5. Расходы догоняют доходы: две лесенки.
export const S5: React.FC = () => {
  const t = useCurrentFrame();
  const catchUp = t >= T.p5.hit;
  return (
    <Sheet hit={T.p5.hit}>
      <Head lines={['РАСХОДЫ ДОГОНЯЮТ ДОХОДЫ']} t={t} />
      <path d="M130 540 V1500 H990 M105 585 L130 540 L155 585 M945 1475 L990 1500 L945 1525" strokeWidth={5} />
      <Draw t={t} at={T.p5.inc} n={24} strokeWidth={8} d={STAIR(1250, 0)} />
      <Draw t={t} at={T.p5.exp} n={32} strokeWidth={8} d={STAIR(1400, 0).replace(/V(\d+)(?= H960$)/, 'V650')} />
      <Pop x={860} y={600} t={t} at={T.p5.inc + 20}>
        <Tx x={860} y={598} size={64} bold={1.2}>доходы</Tx>
      </Pop>
      <Pop x={300} y={1450} t={t} at={T.p5.exp + 6}>
        <Tx x={310} y={1465} size={64} bold={1.2}>расходы</Tx>
      </Pop>
      {catchUp && <circle cx={960} cy={650} r={18 + Math.abs(Math.sin(t / 3)) * 10} fill={INK} />}
    </Sheet>
  );
};

// 6. Вот Саша, +30 000.
export const S6: React.FC = () => {
  const t = useCurrentFrame();
  const p = easeOut(clamp((t - T.p6.note) / 30));
  return (
    <Sheet hit={T.p6.stamp}>
      <Head lines={['ВОТ САША']} t={t} />
      <Ground />
      <Man x={540} y={G} s={1.7} mouth="grin" eyes="wide" hair="tuft" la={[-40, -86]} ra={[40, -86]} seed={5} bob />
      <Bill x={540} y={lerp(380, 930, p)} rot={lerp(-24, 4, p)} v="30 000" />
      <Pop x={880} y={1300} t={t} at={T.p6.note + 4}>
        <Tx x={880} y={1290} size={96} bold={2}>САША</Tx>
        <path d="M790 1250 Q730 1210 690 1220 M708 1180 L686 1222 L728 1250" strokeWidth={6} />
      </Pop>
      <Stamp x={540} y={720} text="+30 000" t={t} at={T.p6.stamp} size={110} />
    </Sheet>
  );
};

// 7. Впервые хватает на всё.
export const S7: React.FC = () => {
  const t = useCurrentFrame();
  const jump = Math.abs(Math.sin(t / 5)) * 110;
  const items = [
    { w: 'ЖИЛЬЁ', at: T.p7.conf + 2 },
    { w: 'ЕДА', at: T.p7.conf + 12 },
    { w: 'ОТПУСК', at: T.p7.conf + 22 },
  ];
  return (
    <Sheet hit={T.p7.conf}>
      <Head lines={['ХВАТАЕТ НА ВСЁ']} t={t} />
      <Confetti t={t} at={T.p7.conf} top={420} n={50} />
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

// 8. Первый месяц он как король: корона, руки вверх, монеты дождём.
export const S8: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet hit={T.p8.king}>
      <Head lines={['КАК КОРОЛЬ']} t={t} />
      <Ground />
      <Man x={540} y={G} s={1.7} mouth="grin" eyes="wide" hair="tuft" la={[-70, -70]} ra={[70, -70]} seed={5} bob />
      <Pop x={540} y={1020} t={t} at={T.p8.king}>
        <path d="M430 1060 L440 940 L490 1000 L540 920 L590 1000 L640 940 L650 1060 Z" fill={PAPER} strokeWidth={6} />
        <circle cx={440} cy={934} r={10} fill={INK} /><circle cx={540} cy={914} r={10} fill={INK} /><circle cx={640} cy={934} r={10} fill={INK} />
      </Pop>
      <Confetti t={t} at={T.p8.king} top={450} n={36} seed={4} />
    </Sheet>
  );
};

// 9. Такси, кофе, айфон: три траты по словам.
export const S9: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['ТАКСИ, КОФЕ, АЙФОН']} t={t} />
      <Pop x={300} y={720} t={t} at={T.p9.r1}>
        <Car x={290} y={730} s={1.1} />
        <Tx x={760} y={670} size={112} bold={2}>ТАКСИ</Tx>
        <Tx x={760} y={770} size={68} bold={1}>метро</Tx>
        <path d="M625 745 H895" strokeWidth={7} />
      </Pop>
      <Pop x={300} y={1100} t={t} at={T.p9.r2}>
        <Cup x={290} y={1110} t={t} />
        <Tx x={760} y={1040} size={112} bold={2}>КОФЕ</Tx>
        <Tx x={760} y={1140} size={80} bold={1.4}>300 р.</Tx>
      </Pop>
      <Pop x={300} y={1490} t={t} at={T.p9.r3}>
        <Phone x={290} y={1520} />
        <Tx x={760} y={1400} size={112} bold={2}>АЙФОН</Tx>
        <Tx x={760} y={1500} size={68} bold={1}>в рассрочку</Tx>
      </Pop>
    </Sheet>
  );
};

// 10. Полгода спустя Саша просит у коллеги до получки.
export const S10: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['ДО ПОЛУЧКИ']} t={t} />
      {Array.from({ length: 6 }, (_, i) => (
        <Pop key={i} x={150 + i * 156} y={470} t={t} at={T.p10.cal + i * 5} n={7}>
          <rect x={92 + i * 156} y={380} width={116} height={130} fill={PAPER} strokeWidth={4} />
          <rect x={92 + i * 156} y={380} width={116} height={34} fill={INK} />
          <Tx x={150 + i * 156} y={486} size={72} bold={1.2}>{i + 1}</Tx>
        </Pop>
      ))}
      <Pop x={540} y={580} t={t} at={T.p10.cal + 16}>
        <Tx x={540} y={600} size={60} bold={1}>полгода спустя</Tx>
      </Pop>
      <Ground />
      <Man x={290} y={G} s={1.55} mouth="flat" eyes="up" brow="raised" la={[26, 70]} ra={[-26, 70]} seed={7} />
      <Man x={780} y={G} s={1.55} mouth="o" eyes="wide" brow="sad" hair="tuft" la={[-120, 0]} ra={[26, 70]} seed={8} bob />
      <Pop x={655} y={840} t={t} at={T.p10.bubble}>
        <path d="M434 750 h442 q34 0 34 34 v42 q0 34 -34 34 h-60 l-24 70 l-52 -70 h-306 q-34 0 -34 -34 v-42 q0 -34 34 -34 Z" fill={PAPER} />
        <Tx x={655} y={818} size={62} bold={1.3}>займи до получки</Tx>
      </Pop>
    </Sheet>
  );
};

// 11. Куда делись тридцать тысяч: пустой кошелёк, монеты улетают, вопросы.
export const S11: React.FC = () => {
  const t = useCurrentFrame();
  const u = clamp((t - T.p11.gone) / 40);
  return (
    <Sheet>
      <Head lines={['КУДА ДЕЛИСЬ?']} t={t} />
      <Ground />
      <Man x={300} y={G} s={1.65} mouth="o" eyes="wide" brow="sad" la={[-40, 20]} ra={[60, -30]} seed={9} bob />
      <g transform="translate(760 1100)" strokeWidth={5}>
        <rect x={-170} y={-100} width={340} height={200} rx={22} fill={PAPER} />
        <path d="M-170 -60 H170" />
        <rect x={100} y={-20} width={70} height={60} fill={INK} />
      </g>
      {[0, 1, 2, 3, 4].map((i) => {
        const v = clamp(u * 1.3 - i * 0.12);
        return <g key={i} opacity={1 - v * v}><Ruble x={700 + i * 40 + v * 30} y={1000 - v * 480} r={30} /></g>;
      })}
      <Pop x={560} y={720} t={t} at={T.p11.gone + 6}><Tx x={560} y={760} size={170} bold={3}>?</Tx></Pop>
      <Pop x={900} y={640} t={t} at={T.p11.gone + 16}><Tx x={900} y={680} size={130} bold={3} rot={10}>?</Tx></Pop>
    </Sheet>
  );
};

// 12. Дыру расширили: до и после.
export const S12: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet hit={T.p12.big}>
      <Head lines={['ДЫРУ РАСШИРИЛИ']} t={t} />
      <Ground />
      <Pop x={290} y={1300} t={t} at={T.p12.small}>
        <Sack x={290} y={G} s={1.4} t={t} />
        <Tx x={290} y={1090} size={80} bold={1.6}>БЫЛО</Tx>
      </Pop>
      <Pop x={780} y={1300} t={t} at={T.p12.big}>
        <Sack x={780} y={G} s={1.4} t={t} />
        <ellipse cx={780 + 92 * 1.4} cy={G - 70 * 1.4} rx={54} ry={72} fill={INK} />
        <Tx x={780} y={1090} size={80} bold={1.6}>СТАЛО</Tx>
      </Pop>
      <Draw t={t} at={T.p12.big - 4} n={10} strokeWidth={8} d="M480 1350 H600 M560 1310 L600 1350 L560 1390" />
    </Sheet>
  );
};

// 13. При любой зарплате: три ступени, у каждого мешок с дырой.
export const S13: React.FC = () => {
  const t = useCurrentFrame();
  const steps = [
    { x: 200, y: 1370, v: '50 000', at: T.p13.a },
    { x: 540, y: 1150, v: '150 000', at: T.p13.a + 14 },
    { x: 880, y: 930, v: '500 000', at: T.p13.a + 28 },
  ];
  return (
    <Sheet>
      <Head lines={['ПРИ ЛЮБОЙ ЗАРПЛАТЕ']} t={t} />
      {steps.map((s, i) => (
        <Pop key={s.v} x={s.x} y={s.y} t={t} at={s.at}>
          <path d={`M${s.x - 150} ${s.y} H${s.x + 150}`} strokeWidth={6} />
          <path d={`M${s.x - 120} ${s.y} V${G} M${s.x + 120} ${s.y} V${G}`} strokeWidth={3} strokeDasharray="10 14" />
          <Man x={s.x - 40} y={s.y} s={0.8} mouth="flat" eyes="up" brow="sad" la={[-26, 70]} ra={[26, 70]} seed={i + 3} />
          <Sack x={s.x + 70} y={s.y} s={0.5} t={t} />
          <Tx x={s.x} y={s.y - 330} size={58} bold={1.2}>{s.v}</Tx>
        </Pop>
      ))}
      <Ground />
    </Sheet>
  );
};

// 14. Квартира побольше, платёж побольше.
export const S14: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['КВАРТИРА ПОБОЛЬШЕ']} t={t} />
      <Ground />
      <Pop x={290} y={G} t={t} at={T.p14.house}>
        <House x={290} y={G} s={1.1} />
      </Pop>
      <Pop x={780} y={G} t={t} at={T.p14.house + 10}>
        <House x={780} y={G} s={1.75} />
      </Pop>
      <Pop x={290} y={1210} t={t} at={T.p14.pay}>
        <Tx x={290} y={1220} size={58} bold={1.1}>платёж</Tx>
      </Pop>
      <Pop x={780} y={1000} t={t} at={T.p14.pay + 8}>
        <Tx x={780} y={1040} size={106} bold={2.2}>ПЛАТЁЖ</Tx>
        <path d="M600 1075 H960" strokeWidth={8} />
      </Pop>
    </Sheet>
  );
};

// 15. Машина получше, страховка получше.
export const S15: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['МАШИНА ПОЛУЧШЕ']} t={t} />
      <Ground />
      <Pop x={280} y={G} t={t} at={T.p15.car}>
        <Car x={270} y={G - 20} s={0.85} />
      </Pop>
      <Pop x={790} y={G} t={t} at={T.p15.car + 10}>
        <Car x={790} y={G - 20} s={1.35} flip />
      </Pop>
      <Pop x={270} y={1340} t={t} at={T.p15.ins}>
        <Tx x={270} y={1350} size={52} bold={1}>страховка</Tx>
      </Pop>
      <Pop x={790} y={1270} t={t} at={T.p15.ins + 8}>
        <Tx x={790} y={1300} size={84} bold={1.8}>СТРАХОВКА</Tx>
        <path d="M580 1330 H1000" strokeWidth={7} />
      </Pop>
    </Sheet>
  );
};

// 16. Стал начальником, часы за сорок тысяч.
export const S16: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet hit={T.p16.watch}>
      <Head lines={['НАЧАЛЬНИК, ЧАСЫ']} t={t} />
      <Ground />
      <Man x={280} y={G} s={1.6} mouth="grin" eyes="dots" brow="raised" la={[-26, 70]} ra={[60, -40]} seed={11} bob />
      <Pop x={730} y={960} t={t} at={T.p16.watch}>
        <g strokeWidth={8}>
          <path d="M650 800 L670 660 H790 L810 800 M650 1120 L670 1260 H790 L810 1120" fill={PAPER} />
          <circle cx={730} cy={960} r={190} fill={PAPER} />
          <circle cx={730} cy={960} r={160} strokeWidth={3} />
          <path d="M730 960 V850 M730 960 L810 1000" />
          <circle cx={730} cy={960} r={10} fill={INK} />
        </g>
        <Tx x={730} y={1370} size={100} bold={2}>40 000</Tx>
      </Pop>
    </Sheet>
  );
};

// 17. 1978: двадцать два победителя лотереи.
export const S17: React.FC = () => {
  const t = useCurrentFrame();
  const n = Math.min(22, Math.max(0, Math.floor((t - T.p17.psy) / 2)));
  return (
    <Sheet>
      <Head lines={['1978, АМЕРИКА', 'ЛОТЕРЕЯ']} t={t} />
      <Pop x={540} y={620} t={t} at={T.p17.psy - 10}>
        <g transform="rotate(-4 540 620)" strokeWidth={5}>
          <rect x={330} y={520} width={420} height={200} fill={PAPER} />
          <path d="M330 620 h30 M750 620 h-30" />
          <Tx x={540} y={600} size={60} bold={1.4}>БИЛЕТ</Tx>
          <Tx x={540} y={686} size={64} bold={1.4}>7 7 7</Tx>
        </g>
      </Pop>
      {Array.from({ length: n }, (_, i) => (
        <Dude key={i} x={140 + (i % 6) * 160} y={900 + Math.floor(i / 6) * 135} s={1.3} />
      ))}
      <Pop x={540} y={1500} t={t} at={T.p17.n22}>
        <Tx x={540} y={1530} size={150} bold={3}>22</Tx>
      </Pop>
    </Sheet>
  );
};

// 18. Выиграли крупно, не на пиццу.
export const S18: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['НЕ НА ПИЦЦУ']} t={t} />
      <Pop x={330} y={900} t={t} at={T.p18.pile}>
        <Bill x={330} y={1060} rot={-6} s={1.1} v="1 000 000" />
        <Bill x={350} y={960} rot={5} s={1.1} v="1 000 000" />
        <Bill x={320} y={860} rot={-3} s={1.1} v="1 000 000" />
      </Pop>
      <Pop x={790} y={1000} t={t} at={T.p18.pizza}>
        <g strokeWidth={6}>
          <path d="M640 760 Q790 700 940 760 L790 1240 Z" fill={PAPER} />
          <circle cx={760} cy={880} r={26} fill={INK} /><circle cx={830} cy={960} r={22} fill={INK} /><circle cx={780} cy={1060} r={20} fill={INK} />
        </g>
      </Pop>
      <Draw t={t} at={T.p18.pizza + 8} n={10} strokeWidth={14} d="M620 740 L960 1260 M960 740 L620 1260" />
      <Ground />
    </Sheet>
  );
};

// 19. Потом их спросили, счастливы ли они.
export const S19: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['СЧАСТЛИВЫ ЛИ ВЫ?']} t={t} />
      <Ground />
      <Man x={260} y={G} s={1.6} mouth="smile" eyes="dots" la={[-26, 70]} ra={[60, 0]} seed={12} bob />
      <Specs x={260} y={G} s={1.6} />
      <Pop x={170} y={1180} t={t} at={T.p19.q - 20}>
        <rect x={110} y={1150} width={120} height={160} fill={PAPER} strokeWidth={5} />
        <path d="M130 1190 H210 M130 1230 H210 M130 1270 H190" strokeWidth={4} />
      </Pop>
      <Man x={800} y={G} s={1.6} mouth="flat" eyes="up" brow="raised" la={[-26, 70]} ra={[26, 70]} seed={13} bob />
      <Bill x={800} y={1000} rot={-8} s={0.8} v="1 000 000" />
      <Pop x={470} y={760} t={t} at={T.p19.q}>
        <path d="M240 640 h520 q34 0 34 34 v50 q0 34 -34 34 h-290 l-60 80 l-20 -80 h-150 q-34 0 -34 -34 v-50 q0 -34 34 -34 Z" fill={PAPER} />
        <Tx x={500} y={720} size={68} bold={1.3}>счастлив?</Tx>
      </Pop>
    </Sheet>
  );
};

// 20. Не счастливее остальных: два одинаковых столбика.
export const S20: React.FC = () => {
  const t = useCurrentFrame();
  const h = easeOut(clamp((t - T.p20.bars) / 20)) * 520;
  return (
    <Sheet hit={T.p20.stamp}>
      <Head lines={['НЕ СЧАСТЛИВЕЕ']} t={t} />
      <path d="M130 1450 H950" strokeWidth={6} />
      <rect x={220} y={1450 - h} width={230} height={h} fill={INK} />
      <rect x={620} y={1450 - h} width={230} height={h} fill={PAPER} strokeWidth={6} />
      <Tx x={335} y={1520} size={60} bold={1}>обычные</Tx>
      <Tx x={735} y={1520} size={60} bold={1}>победители</Tx>
      <Stamp x={540} y={800} text="ОДИНАКОВО" t={t} at={T.p20.stamp} size={96} />
    </Sheet>
  );
};

// 21. Разговор с другом, шутка, комплимент радовали меньше.
export const S21: React.FC = () => {
  const t = useCurrentFrame();
  const rows = [
    { w: 'ДРУГ', at: T.p21.friend, y: 640 },
    { w: 'ШУТКА', at: T.p21.joke, y: 940 },
    { w: 'КОМПЛИМЕНТ', at: T.p21.comp, y: 1240 },
  ];
  return (
    <Sheet>
      <Head lines={['РАДОВАЛИ МЕНЬШЕ']} t={t} />
      {rows.map((r) => (
        <Pop key={r.w} x={540} y={r.y} t={t} at={r.at}>
          <Tx x={110} y={r.y + 20} size={r.w.length > 7 ? 82 : 100} bold={2} anchor="start">{r.w}</Tx>
          <Face x={900} y={r.y} r={64} mood={t >= T.p21.less ? 'flat' : 'smile'} />
        </Pop>
      ))}
      <Pop x={540} y={1530} t={t} at={T.p21.less}>
        <Tx x={540} y={1550} size={74} bold={1.4}>у победителей: меньше</Tx>
      </Pop>
    </Sheet>
  );
};

// 22. После джекпота обычный вторник.
export const S22: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['ОБЫЧНЫЙ ВТОРНИК']} t={t} />
      <Pop x={300} y={650} t={t} at={T.p22.jack}>
        <g strokeWidth={6} transform="rotate(-5 300 650)">
          <rect x={110} y={540} width={380} height={220} rx={24} fill={PAPER} />
          <Tx x={300} y={640} size={110} bold={2}>777</Tx>
          <Tx x={300} y={720} size={52} bold={1}>ДЖЕКПОТ</Tx>
        </g>
      </Pop>
      <Pop x={780} y={700} t={t} at={T.p22.tue}>
        <rect x={610} y={520} width={340} height={360} fill={PAPER} strokeWidth={5} />
        <rect x={610} y={520} width={340} height={80} fill={INK} />
        <Tx x={780} y={580} size={56} fill={PAPER} bold={1}>ВТ</Tx>
        <Tx x={780} y={800} size={170} bold={2}>17</Tx>
      </Pop>
      <Ground />
      <Man x={540} y={G} s={1.7} mouth="flat" eyes="up" brow="sad" la={[-26, 70]} ra={[26, 70]} seed={14} bob />
    </Sheet>
  );
};

// 23. Шведы проверили на большой выборке: много людей и лупа.
export const S23: React.FC = () => {
  const t = useCurrentFrame();
  const n = Math.min(60, Math.max(0, Math.floor((t - T.p23.swede) * 1.4)));
  return (
    <Sheet>
      <Head lines={['ШВЕДЫ ПРОВЕРИЛИ']} t={t} />
      {Array.from({ length: n }, (_, i) => (
        <Dude key={i} x={110 + (i % 10) * 96} y={760 + Math.floor(i / 10) * 125} s={1.1} />
      ))}
      <Pop x={820} y={1380} t={t} at={T.p23.big}>
        <g strokeWidth={9}>
          <circle cx={820} cy={1290} r={100} fill={PAPER} />
          <path d="M892 1362 L980 1450" strokeWidth={22} />
        </g>
      </Pop>
      <Pop x={300} y={1480} t={t} at={T.p23.big}>
        <Tx x={90} y={1520} size={66} bold={1.4} anchor="start">БОЛЬШАЯ ВЫБОРКА</Tx>
      </Pop>
    </Sheet>
  );
};

// 24. Довольство жизнью выросло и держится годами.
export const S24: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['ДОВОЛЬСТВО ЖИЗНЬЮ']} t={t} />
      <path d="M150 560 V1400 H960 M125 605 L150 560 L175 605 M915 1375 L960 1400 L915 1425" strokeWidth={5} />
      <Tx x={150} y={520} size={54} bold={1} anchor="start">довольство</Tx>
      <Tx x={960} y={1480} size={54} bold={1} anchor="end">годы</Tx>
      <Draw t={t} at={T.p24.line} n={26} strokeWidth={9} d="M170 1300 H300 Q380 1300 440 1000 T560 780 H940" />
      <Pop x={760} y={700} t={t} at={T.p24.years}>
        <Tx x={760} y={700} size={64} bold={1.2}>держится</Tx>
      </Pop>
      <Ground />
    </Sheet>
  );
};

// 25. На сто тысяч долларов — на копейки.
export const S25: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet hit={T.p25.tiny}>
      <Head lines={['СТО ТЫСЯЧ —', 'НА КОПЕЙКИ']} t={t} />
      <Pop x={330} y={900} t={t} at={T.p25.bag}>
        <Bill x={330} y={1000} rot={-5} s={1.15} v="100 000 $" />
        <Bill x={350} y={880} rot={4} s={1.15} v="100 000 $" />
      </Pop>
      <Draw t={t} at={T.p25.bag + 14} n={10} strokeWidth={8} d="M520 950 H640 M600 910 L640 950 L600 990" />
      <Pop x={820} y={950} t={t} at={T.p25.tiny}>
        <Coin x={790} y={1000} r={24} />
        <Coin x={850} y={1010} r={20} />
        <Tx x={820} y={1120} size={64} bold={1.2}>копейки</Tx>
      </Pop>
      <Ground />
    </Sheet>
  );
};

// 26. Деньги работают, но не так, как ждёшь: две стрелки.
export const S26: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['ДЕНЬГИ РАБОТАЮТ']} t={t} />
      <Tx x={110} y={640} size={80} bold={1.6} anchor="start">ЖДЁШЬ</Tx>
      <Draw t={t} at={T.p26.work} n={16} strokeWidth={14} d="M420 700 L940 470 M860 460 L945 466 L910 545" />
      <Tx x={110} y={1100} size={80} bold={1.6} anchor="start">НА ДЕЛЕ</Tx>
      <Draw t={t} at={T.p26.no} n={16} strokeWidth={14} d="M460 1160 Q700 1160 940 1100 M870 1070 L945 1100 L880 1150" />
      <Pop x={700} y={1330} t={t} at={T.p26.no + 10}>
        <Tx x={700} y={1350} size={64} bold={1.2}>чуть-чуть выше</Tx>
      </Pop>
      <Ground />
    </Sheet>
  );
};

// 27. Что делать?
export const S27: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['ЧТО ДЕЛАТЬ?']} t={t} />
      <Ground />
      <Man x={540} y={G} s={1.8} mouth="o" eyes="up" brow="raised" la={[-40, -60]} ra={[26, 70]} seed={15} bob />
      <Pop x={820} y={780} t={t} at={6}><Tx x={820} y={850} size={240} bold={4} rot={8}>?</Tx></Pop>
      <Pop x={250} y={880} t={t} at={14}><Tx x={250} y={930} size={170} bold={3} rot={-10}>?</Tx></Pop>
    </Sheet>
  );
};

// 28. Отложи прибавку в первый день: купюра летит в сейф.
export const S28: React.FC = () => {
  const t = useCurrentFrame();
  const p = easeOut(clamp((t - T.p28.note) / 26));
  return (
    <Sheet hit={T.p28.safe}>
      <Head lines={['В ПЕРВЫЙ ДЕНЬ']} t={t} />
      <Ground />
      <Safe x={760} y={G} s={1.6} open={t < T.p28.safe ? 1 : 0} />
      <Bill x={lerp(240, 760, p)} y={lerp(700, 1220, p)} rot={lerp(-20, 6, p)} s={lerp(1, 0.55, p)} v="30 000" />
      <Pop x={240} y={1250} t={t} at={T.p28.note}>
        <Tx x={240} y={1270} size={72} bold={1.4}>прибавка</Tx>
      </Pop>
    </Sheet>
  );
};

// 29. Пока ты к ней не привык: часы тикают.
export const S29: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['ПОКА НЕ ПРИВЫК']} t={t} />
      <Clock2 x={540} y={900} r={260} t={t} />
      <Pop x={540} y={1330} t={t} at={T.p29.used}>
        <Tx x={540} y={1370} size={96} bold={2}>день 1</Tx>
      </Pop>
      <Ground />
    </Sheet>
  );
};

// 30. Автоплатёж на накопительный в день зарплаты.
export const S30: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['АВТОПЛАТЁЖ']} t={t} />
      <Pop x={290} y={760} t={t} at={T.p30.day}>
        <rect x={110} y={560} width={360} height={380} fill={PAPER} strokeWidth={5} />
        <rect x={110} y={560} width={360} height={80} fill={INK} />
        <Tx x={290} y={620} size={52} fill={PAPER} bold={1}>ЗАРПЛАТА</Tx>
        <Tx x={290} y={850} size={170} bold={2}>5</Tx>
      </Pop>
      <Draw t={t} at={T.p30.acc - 6} n={14} strokeWidth={10} d="M500 750 H640 M590 700 L640 750 L590 800" />
      <Pop x={820} y={1000} t={t} at={T.p30.acc}>
        <g strokeWidth={5}>
          <ellipse cx={810} cy={930} rx={150} ry={110} fill={PAPER} />
          <circle cx={930} cy={900} r={12} fill={INK} />
          <path d="M700 1020 v70 M900 1020 v70 M690 850 q-40 -30 -10 -60 M820 820 H850" />
          <path d="M770 790 h80" strokeWidth={8} />
        </g>
        <Tx x={810} y={1190} size={60} bold={1.2}>накопительный</Tx>
      </Pop>
      <Ground />
    </Sheet>
  );
};

// 31. Не видишь деньги — не тратишь: перечёркнутый глаз.
export const S31: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet>
      <Head lines={['НЕ ВИДИШЬ —', 'НЕ ТРАТИШЬ']} t={t} />
      <g strokeWidth={8}>
        <path d="M200 900 Q540 640 880 900 Q540 1160 200 900 Z" fill={PAPER} />
        <circle cx={540} cy={900} r={96} />
        <circle cx={540} cy={900} r={42} fill={INK} />
      </g>
      <Draw t={t} at={T.p31.see} n={10} strokeWidth={22} d="M170 1110 L910 700" />
      <Pop x={540} y={1330} t={t} at={T.p31.spend}>
        <Bill x={540} y={1300} s={0.9} v="30 000" />
        <Stamp x={540} y={1300} text="НЕ ТРОНУТО" t={t} at={T.p31.spend + 6} size={64} />
      </Pop>
    </Sheet>
  );
};

// 32. Жить можно на прежнюю сумму: два равных столбика.
export const S32: React.FC = () => {
  const t = useCurrentFrame();
  const h = easeOut(clamp((t - T.p32.a) / 20)) * 460;
  return (
    <Sheet>
      <Head lines={['ЖИЛ И ПРОЖИВЁШЬ']} t={t} />
      <path d="M130 1450 H950" strokeWidth={6} />
      <rect x={220} y={1450 - h} width={230} height={h} fill={PAPER} strokeWidth={6} />
      <Pop x={735} y={1000} t={t} at={T.p32.b}>
        <rect x={620} y={1450 - 460} width={230} height={460} fill={INK} />
        <Tx x={735} y={1450 - 490} size={60} bold={1}>на то же</Tx>
      </Pop>
      <Tx x={335} y={1520} size={60} bold={1}>до прибавки</Tx>
      <Tx x={735} y={1520} size={60} bold={1}>после</Tx>
      <Draw t={t} at={T.p32.b} n={10} strokeWidth={6} d="M450 1000 H620" />
    </Sheet>
  );
};

// 33. Прибавка придёт. Вопрос, у кого она останется.
export const S33: React.FC = () => {
  const t = useCurrentFrame();
  const p = easeOut(clamp((t - T.p33.come) / 30));
  return (
    <Sheet>
      <Head lines={['ПРИБАВКА ПРИДЁТ']} t={t} />
      <Ground />
      <Man x={540} y={G} s={1.7} mouth="flat" eyes="up" brow="raised" la={[-40, -86]} ra={[40, -86]} seed={16} bob />
      <Bill x={540} y={lerp(380, 930, p)} rot={lerp(-20, 3, p)} v="30 000" />
      <Pop x={850} y={1000} t={t} at={T.p33.who}>
        <path d="M640 840 h360 q34 0 34 34 v50 q0 34 -34 34 h-80 l-30 70 l-60 -70 h-190 q-34 0 -34 -34 v-50 q0 -34 34 -34 Z" fill={PAPER} transform="translate(-60 -80)" />
        <Tx x={780} y={850} size={72} bold={1.4}>у кого?</Tx>
      </Pop>
    </Sheet>
  );
};

// 34. Финал: тот же мешок с дырой, столько же.
export const S34: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Sheet hit={T.p34.stamp}>
      <Head lines={['ПРИБАВКА ЕСТЬ', 'ДЕНЕГ НЕТ']} t={t} />
      <Ground />
      <Man x={310} y={G} s={1.75} mouth="flat" eyes="up" brow="sad" la={[-26, 70]} ra={[70, -60]} seed={2} bob />
      <Sack x={690} y={G} s={1.55} t={t} />
      <Stamp x={430} y={900} text="СТОЛЬКО ЖЕ" t={t} at={T.p34.stamp} size={104} />
    </Sheet>
  );
};

// A (после 11). Ни ремонта, ни отпуска: вычеркнутые желания.
export const SA: React.FC = () => {
  const t = useCurrentFrame();
  const rows = [
    { w: 'РЕМОНТ', y: 700, at: T.pA.r1 },
    { w: 'ОТПУСК', y: 1000, at: T.pA.r2 },
  ];
  return (
    <Sheet hit={T.pA.no}>
      <Head lines={['ПРОСТО НЕТ']} t={t} />
      {rows.map((r) => (
        <React.Fragment key={r.w}>
          <Pop x={540} y={r.y} t={t} at={r.at}>
            <rect x={120} y={r.y - 110} width={840} height={190} fill={PAPER} strokeWidth={5} />
            <Tx x={540} y={r.y + 30} size={130} bold={2.4}>{r.w}</Tx>
          </Pop>
          <Draw t={t} at={r.at + 8} n={10} strokeWidth={16} d={`M140 ${r.y + 50} L940 ${r.y - 80}`} />
        </React.Fragment>
      ))}
      <Stamp x={540} y={1330} text="НЕТ ДЕНЕГ" t={t} at={T.pA.no} size={110} />
    </Sheet>
  );
};

// B (после 16). Прибавили 20 %, аппетит вырос на 40.
export const SB: React.FC = () => {
  const t = useCurrentFrame();
  const ha = easeOut(clamp((t - T.pB.a) / 18)) * 300;
  const hb = easeOut(clamp((t - T.pB.b) / 18)) * 600;
  return (
    <Sheet hit={T.pB.b}>
      <Head lines={['АППЕТИТ БЫСТРЕЕ']} t={t} />
      <path d="M130 1450 H950" strokeWidth={6} />
      <rect x={220} y={1450 - ha} width={230} height={ha} fill={PAPER} strokeWidth={6} />
      <rect x={620} y={1450 - hb} width={230} height={hb} fill={INK} />
      <Pop x={335} y={1000} t={t} at={T.pB.a + 14}>
        <Tx x={335} y={1450 - ha - 40} size={90} bold={1.8}>+20 %</Tx>
      </Pop>
      <Pop x={735} y={800} t={t} at={T.pB.b + 14}>
        <Tx x={735} y={1450 - hb - 40} size={90} bold={1.8}>+40 %</Tx>
      </Pop>
      <Tx x={335} y={1520} size={60} bold={1}>доход</Tx>
      <Tx x={735} y={1520} size={60} bold={1}>аппетит</Tx>
    </Sheet>
  );
};

// C (после 29). Тысяча причин, и все уважительные.
export const SC: React.FC = () => {
  const t = useCurrentFrame();
  const ex = [
    { w: 'акция!', x: 270, y: 620, r: -6 },
    { w: 'день рождения', x: 700, y: 760, r: 4 },
    { w: 'срочно надо', x: 330, y: 930, r: 3 },
    { w: 'заслужил', x: 720, y: 1090, r: -4 },
  ];
  return (
    <Sheet>
      <Head lines={['ТЫСЯЧА ПРИЧИН']} t={t} />
      {ex.map((e, i) => (
        <Pop key={e.w} x={e.x} y={e.y} t={t} at={T.pC.k + i * 9}>
          <g transform={`rotate(${e.r} ${e.x} ${e.y})`}>
            <rect x={e.x - 230} y={e.y - 62} width={460} height={110} rx={30} fill={PAPER} strokeWidth={5} />
            <Tx x={e.x} y={e.y + 12} size={62} bold={1.1}>{e.w}</Tx>
          </g>
        </Pop>
      ))}
      <Ground />
      <Man x={540} y={G} s={1.5} mouth="smile" eyes="dots" brow="raised" la={[-26, 70]} ra={[26, 70]} seed={17} bob />
    </Sheet>
  );
};

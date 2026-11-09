import React from 'react';
import { clamp, easeInOut, lerp, rnd } from '../../engine/anim';
import { Chip, F, LineMan, Man, P, cam, drift } from '../../flat/kit';

export type StoryShot = React.FC<{ t: number; len: number }>;
const fade = (t: number, at: number, n = 22) => clamp((t - at) / n);

// Старт слов на экране считается от начала плана (кадры, 30 fps).
export const MARK_AT = 44; // с этого кадра в тетради пошли чёрточки часов
export const NOTE_AT = 140; // с этого кадра появляется «как у пьяного»

// 1. Ночная комната: Костя сидит у выключенного от усталости компьютера, пустые кружки, часы показывают четыре.
export const T1: StoryShot = ({ t, len }) => (
  <>
    <g transform={cam(drift(t, len, 930, 985), drift(t, len, 590, 575), drift(t, len, 1.24, 1.34))}>
      <rect x={-100} y={-100} width={2200} height={1400} fill="#363A4C" />
      <rect x={-100} y={640} width={2200} height={240} fill="#2A2D3B" />
      <rect x={-100} y={880} width={2200} height={400} fill="#1F2029" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-60 + i * 180} y={640} width={3} height={240} fill="#20222D" />)}
      <rect x={1390} y={230} width={270} height={340} fill="#1D1F2A" />
      <rect x={1404} y={244} width={242} height={312} fill="#2F3C58" />
      <path d="M 1404 556 L 1404 470 L 1470 470 L 1470 430 L 1550 430 L 1550 490 L 1646 490 L 1646 556 Z" fill="#232B3F" />
      <rect x={1522} y={244} width={7} height={312} fill="#1D1F2A" />
      <rect x={230} y={350} width={250} height={530} rx={10} fill="#43465A" />
      <rect x={230} y={510} width={250} height={5} fill="#2F3140" />
      <rect x={254} y={400} width={12} height={70} rx={5} fill="#5F6276" />
      <rect x={254} y={540} width={12} height={110} rx={5} fill="#5F6276" />
      {/* часы: короткая стрелка на четырёх, длинная ползёт */}
      <circle cx={690} cy={270} r={50} fill="#1F2230" />
      <circle cx={690} cy={270} r={42} fill="#6F6C63" />
      <line x1={690} y1={270} x2={690 + 20 * Math.sin(Math.PI * 2 * (4 / 12))} y2={270 - 20 * Math.cos(Math.PI * 2 * (4 / 12))} stroke={P.ink} strokeWidth={5} strokeLinecap="round" />
      <line x1={690} y1={270} x2={690 + 33 * Math.sin((t / 30) * 0.5)} y2={270 - 33 * Math.cos((t / 30) * 0.5)} stroke={P.ink} strokeWidth={3.5} strokeLinecap="round" />
      {/* монитор светит на стол */}
      <defs>
        <radialGradient id="monGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7FA0CC" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#7FA0CC" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={1180} cy={600} rx={460} ry={360} fill="url(#monGlow)" />
      <rect x={960} y={690} width={390} height={18} fill="#5A4636" />
      <rect x={985} y={708} width={16} height={172} fill="#46372C" />
      <rect x={1310} y={708} width={16} height={172} fill="#46372C" />
      <rect x={1140} y={560} width={210} height={130} fill="#1B1D26" />
      <rect x={1152} y={572} width={186} height={104} fill="#5E7CA6" />
      <rect x={1160} y={584} width={90} height={5} fill="#BCD0EA" opacity={0.7} />
      <rect x={1160} y={598} width={140} height={5} fill="#BCD0EA" opacity={0.5} />
      <rect x={1160} y={612} width={110} height={5} fill="#BCD0EA" opacity={0.5} />
      <rect x={1160} y={626} width={60 + 40 * ((Math.floor(t / 20)) % 2)} height={5} fill="#BCD0EA" opacity={0.5} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={990 + i * 52} y={650} width={34} height={40} rx={5} fill="#8A8676" />
          <path d={`M ${1024 + i * 52} 660 q 14 8 0 20`} fill="none" stroke="#8A8676" strokeWidth={5} />
        </g>
      ))}
      <rect x={790} y={704} width={150} height={18} fill="#46372C" />
      <rect x={806} y={722} width={14} height={158} fill="#3A2E25" />
      <rect x={908} y={722} width={14} height={158} fill="#3A2E25" />
      <Man x={850} y={880} t={t} sit top="#3B3F58" topDark="#2E3248" ring="#3B3F58" armF={[96, 138]} armB={[44, 112]} look={t > 90 && t < 130 ? 1 : 0} mouth="flat" />
    </g>
    <Chip t={t} at={45} title="СУТКИ БЕЗ СНА" sub="КОСТЯ" />
  </>
);

// 2. Тетрадь: человечек, чёрточки часов считаются одна за другой, пометка про пьяного.
export const T2: StoryShot = ({ t, len }) => (
  <>
    <g transform={cam(drift(t, len, 960, 985), drift(t, len, 540, 575), drift(t, len, 1.0, 1.09))}>
      <rect x={-100} y={-100} width={2200} height={1400} fill={P.paper} />
      {Array.from({ length: 26 }, (_, i) => <rect key={i} x={-100} y={-40 + i * 52} width={2200} height={2} fill={P.paperLine} />)}
      <LineMan x={560} y={950} s={1.42} p={clamp(easeInOut(t / 46))} />
      <g opacity={fade(t, 30)} style={{ fontFamily: F.serif }} textAnchor="middle">
        <text x={1290} y={380} fontSize={150} fontWeight={700} fill="none" stroke={P.pen} strokeWidth={3}>24 часа</text>
        <text x={1290} y={448} fontSize={44} fill={P.pen}>без сна</text>
      </g>
      {Array.from({ length: 24 }, (_, i) => {
        const x0 = 1010 + (i % 8) * 70;
        const y0 = 520 + Math.floor(i / 8) * 84;
        const p = clamp((t - MARK_AT - i * 2.4) / 5);
        if (p <= 0) return null;
        const j = (rnd(11, i) - 0.5) * 5;
        return <line key={i} x1={x0 + j} y1={y0} x2={x0 - j} y2={y0 + 58 * p} stroke={P.pen} strokeWidth={4} strokeLinecap="round" />;
      })}
      <g opacity={fade(t, NOTE_AT)} style={{ fontFamily: F.serif }} textAnchor="middle">
        <text x={1290} y={830} fontSize={60} fontStyle="italic" fill={P.red}>мозг как у пьяного</text>
        <rect x={1020} y={846} width={540 * fade(t, NOTE_AT + 8, 24)} height={4} fill={P.red} />
      </g>
    </g>
    <rect width={1920} height={1080} fill="url(#notebookVig)" />
  </>
);

// 3. Ночной перекрёсток: красный горит, Костя стоит на «зебре», слева разгорается свет фар.
export const T3: StoryShot = ({ t, len }) => {
  const k = clamp(t / len);
  return (
    <>
      <g transform={cam(drift(t, len, 1000, 930), 560, drift(t, len, 1.05, 1.16))}>
        <rect x={-200} y={-100} width={2500} height={1200} fill="#262B3C" />
        {Array.from({ length: 9 }, (_, i) => {
          const h = 260 + rnd(9, i) * 320;
          return (
            <g key={i}>
              <rect x={-120 + i * 250} y={760 - h} width={210} height={h} fill={i % 2 ? '#1C2030' : '#202537'} />
              {Array.from({ length: 6 }, (_, w) => rnd(4, i * 6 + w) > 0.6 ? <rect key={w} x={-90 + i * 250 + (w % 3) * 62} y={800 - h + Math.floor(w / 3) * 90} width={36} height={46} fill="#C9A867" opacity={0.7} /> : null)}
            </g>
          );
        })}
        <rect x={-200} y={760} width={2500} height={40} fill="#3A3D48" />
        <rect x={-200} y={800} width={2500} height={400} fill="#2C2F3A" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={560 + i * 86} y={820} width={46} height={190} fill="#8E8B80" opacity={0.75} />)}
        {/* светофор: красный горит */}
        <rect x={1640} y={300} width={14} height={470} fill="#15161D" />
        <rect x={1612} y={250} width={70} height={170} rx={10} fill="#15161D" />
        <circle cx={1647} cy={290} r={20} fill={P.red} />
        <circle cx={1647} cy={335} r={20} fill="#33261F" />
        <circle cx={1647} cy={380} r={20} fill="#1F2A24" />
        <ellipse cx={1647} cy={290} rx={90} ry={90} fill={P.red} opacity={0.14} />
        {/* фары слева */}
        <defs>
          <radialGradient id="headGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F0DDAA" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#F0DDAA" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={lerp(0, 420, k)} cy={800} rx={lerp(150, 380, k)} ry={lerp(60, 130, k)} fill="url(#headGlow)" opacity={0.3 + k * 0.7} />
        <circle cx={lerp(-60, 260, k)} cy={800} r={lerp(14, 32, k)} fill="#F5E6B8" opacity={0.8} />
        <Man x={1010} y={930} t={t} s={1.0} top="#3B3F58" topDark="#2E3248" ring="#3B3F58" look={0} mouth="flat" armF={[8, 176]} />
      </g>
      <Chip t={t} at={105} title="КРАСНЫЙ СВЕТ" sub="ВИДЕЛ, НО НЕ ЗАМЕТИЛ" />
    </>
  );
};

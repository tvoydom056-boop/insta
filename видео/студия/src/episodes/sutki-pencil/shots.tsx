import React from 'react';
import { clamp, easeInOut, lerp, rnd } from '../../engine/anim';
import { F, cam, drift } from '../../flat/kit';
import { BlobMan, FAINT, INK, LW, PAPER, PencilChip, Rays, SOFT } from '../../pencil/kit';
import { MARK_AT, NOTE_AT, StoryShot } from '../sutki/shots';

// Те же три кадра, что в sutki/shots.tsx (координаты, камера, тайминги), нарисованные контуром без заливок.
const fade = (t: number, at: number, n = 22) => clamp((t - at) / n);
const shape = { fill: PAPER, stroke: INK, strokeWidth: LW, strokeLinejoin: 'round' as const };
const HLine: React.FC<{ y: number; c?: string; x0?: number; x1?: number }> = ({ y, c = INK, x0 = -200, x1 = 2300 }) => (
  <line x1={x0} y1={y} x2={x1} y2={y} stroke={c} strokeWidth={LW} strokeLinecap="round" />
);
const Bg: React.FC = () => <rect x={-300} y={-300} width={2800} height={1800} fill={PAPER} />;

export const P1: StoryShot = ({ t, len }) => (
  <>
    <g transform={cam(drift(t, len, 930, 985), drift(t, len, 590, 575), drift(t, len, 1.24, 1.34))}>
      <Bg />
      <HLine y={640} />
      <HLine y={880} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60 + i * 180} y1={640} x2={-60 + i * 180} y2={880} stroke={SOFT} strokeWidth={LW * 0.8} />)}
      <rect x={1390} y={230} width={270} height={340} {...shape} />
      <rect x={1404} y={244} width={242} height={312} {...shape} />
      <path d="M 1404 470 L 1470 470 L 1470 430 L 1550 430 L 1550 490 L 1646 490" fill="none" stroke={SOFT} strokeWidth={LW} strokeLinejoin="round" />
      <rect x={1522} y={244} width={7} height={312} {...shape} />
      <rect x={230} y={350} width={250} height={530} rx={10} {...shape} />
      <line x1={230} y1={512} x2={480} y2={512} stroke={INK} strokeWidth={LW} />
      <rect x={254} y={400} width={12} height={70} rx={5} {...shape} />
      <rect x={254} y={540} width={12} height={110} rx={5} {...shape} />
      <circle cx={690} cy={270} r={50} {...shape} />
      <circle cx={690} cy={270} r={42} {...shape} />
      <line x1={690} y1={270} x2={690 + 20 * Math.sin(Math.PI * 2 * (4 / 12))} y2={270 - 20 * Math.cos(Math.PI * 2 * (4 / 12))} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <line x1={690} y1={270} x2={690 + 33 * Math.sin((t / 30) * 0.5)} y2={270 - 33 * Math.cos((t / 30) * 0.5)} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      <rect x={960} y={690} width={390} height={18} {...shape} />
      <rect x={985} y={708} width={16} height={172} {...shape} />
      <rect x={1310} y={708} width={16} height={172} {...shape} />
      <rect x={1140} y={560} width={210} height={130} {...shape} />
      <rect x={1152} y={572} width={186} height={104} {...shape} />
      {[[584, 90], [598, 140], [612, 110], [626, 60 + 40 * (Math.floor(t / 20) % 2)]].map(([y, w]) => (
        <line key={y} x1={1160} y1={y + 2} x2={1160 + w} y2={y + 2} stroke={SOFT} strokeWidth={LW} strokeLinecap="round" />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={`M ${1024 + i * 52} 660 q 14 8 0 20`} fill="none" stroke={INK} strokeWidth={LW} />
          <rect x={990 + i * 52} y={650} width={34} height={40} rx={5} {...shape} />
        </g>
      ))}
      <rect x={790} y={704} width={150} height={18} {...shape} />
      <rect x={806} y={722} width={14} height={158} {...shape} />
      <rect x={908} y={722} width={14} height={158} {...shape} />
      <BlobMan x={850} y={880} t={t} s={0.92} sit glance={t > 90 && t < 130 ? 1 : 0} />
    </g>
    <PencilChip t={t} at={45} title="СУТКИ БЕЗ СНА" sub="КОСТЯ" />
  </>
);

export const P2: StoryShot = ({ t, len }) => (
  <g transform={cam(drift(t, len, 960, 985), drift(t, len, 540, 575), drift(t, len, 1.0, 1.09))}>
    <Bg />
    {Array.from({ length: 26 }, (_, i) => <HLine key={i} y={-40 + i * 52 + 1} c={FAINT} />)}
    <BlobMan x={560} y={950} t={t} s={1.42} mouth="smile" reveal={clamp(easeInOut(t / 46))} />
    <g opacity={fade(t, 30)} style={{ fontFamily: F.serif }} textAnchor="middle">
      <text x={1290} y={380} fontSize={150} fontWeight={700} fill={PAPER} stroke={INK} strokeWidth={3}>24 часа</text>
      <text x={1290} y={448} fontSize={44} fill={INK}>без сна</text>
    </g>
    {Array.from({ length: 24 }, (_, i) => {
      const x0 = 1010 + (i % 8) * 70;
      const y0 = 520 + Math.floor(i / 8) * 84;
      const p = clamp((t - MARK_AT - i * 2.4) / 5);
      if (p <= 0) return null;
      const j = (rnd(11, i) - 0.5) * 5;
      return <line key={i} x1={x0 + j} y1={y0} x2={x0 - j} y2={y0 + 58 * p} stroke={INK} strokeWidth={4} strokeLinecap="round" />;
    })}
    <g opacity={fade(t, NOTE_AT)} style={{ fontFamily: F.serif }} textAnchor="middle">
      <text x={1290} y={830} fontSize={60} fontStyle="italic" fill={INK}>мозг как у пьяного</text>
      <rect x={1020} y={846} width={540 * fade(t, NOTE_AT + 8, 24)} height={4} fill={INK} />
    </g>
  </g>
);

export const P3: StoryShot = ({ t, len }) => {
  const k = clamp(t / len);
  const headX = lerp(-60, 260, k);
  const headR = lerp(14, 32, k);
  return (
    <>
      <g transform={cam(drift(t, len, 1000, 930), 560, drift(t, len, 1.05, 1.16))}>
        <Bg />
        {Array.from({ length: 9 }, (_, i) => {
          const h = 260 + rnd(9, i) * 320;
          return (
            <g key={i}>
              <rect x={-120 + i * 250} y={760 - h} width={210} height={h} {...shape} />
              {Array.from({ length: 6 }, (_, w) => rnd(4, i * 6 + w) > 0.6 ? <rect key={w} x={-90 + i * 250 + (w % 3) * 62} y={800 - h + Math.floor(w / 3) * 90} width={36} height={46} {...shape} /> : null)}
            </g>
          );
        })}
        <rect x={-300} y={760} width={2800} height={40} {...shape} />
        <HLine y={800} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={560 + i * 86} y={820} width={46} height={190} {...shape} />)}
        <rect x={1640} y={300} width={14} height={470} {...shape} />
        <rect x={1612} y={250} width={70} height={170} rx={10} {...shape} />
        <circle cx={1647} cy={290} r={20} {...shape} />
        <circle cx={1647} cy={335} r={20} {...shape} />
        <circle cx={1647} cy={380} r={20} {...shape} />
        <Rays cx={1647} cy={290} r0={48} r1={70} n={9} from={-200} to={20} />
        <Rays cx={headX} cy={800} r0={headR + 12} r1={headR + 12 + lerp(14, 60, k)} n={14} />
        <circle cx={headX} cy={800} r={headR} {...shape} />
        <BlobMan x={1010} y={930} t={t} />
      </g>
      <PencilChip t={t} at={105} title="КРАСНЫЙ СВЕТ" sub="ВИДЕЛ, НО НЕ ЗАМЕТИЛ" />
    </>
  );
};

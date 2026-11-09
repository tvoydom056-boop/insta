import React from 'react';
import { useCurrentFrame } from 'remotion';
import { clamp, easeInOut, lerp } from '../../engine/anim';
import { Blob, Building, Cloud, Clock, Cup, DoodleMan, FLOOR, Floor, Fridge, H, INK, PAPER, Paper, T, W, Win, rnd } from '../../lines/kit';

const fade = (t: number, at: number, n = 18) => clamp((t - at) / n);

// Моменты внутри плана (кадры от начала плана, 30 fps). Совпадают с голосом.
export const TITLE_AT = 45; // «СУТКИ БЕЗ СНА»
export const MARK_AT = 44; // чёрточки часов в тетради
export const NOTE_AT = 140; // «мозг как у пьяного»
export const LABEL_AT = 105; // «КРАСНЫЙ СВЕТ»

const Wavy: React.FC<{ x: number; y: number; w: number; p: number }> = ({ x, y, w, p }) => (
  <path d={`M${x} ${y} q${w / 8} -10 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeWidth={3} />
);

// 1. Ночная кухня: Костя подпирает щёку у стойки, ноутбук, три кружки, часы на четырёх.
export const L1: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Paper>
      <Fridge x={140} />
      <Clock x={620} y={190} hour={120} min={20 + t * 0.25} />
      <Win x={1370} y={150} night />
      <Blob x={760} y={730} eyes="dots" brow="sad" mouth="flat" la={[8, -52]} ra={[64, 0]} bob />
      <rect x={640} y={590} width={680} height={170} fill={PAPER} />
      <Floor />
      <path d="M1160 590 V470 H1300 V590 M1175 485 H1285 V575 H1175 Z" />
      <path d="M1195 505 h70 M1195 525 h80 M1195 545 h50" strokeWidth={2.2} />
      <Cup x={960} y={590} />
      <Cup x={1020} y={590} />
      <Cup x={1080} y={590} />
      <g opacity={fade(t, TITLE_AT)}>
        <T x={960} y={96} size={72}>СУТКИ БЕЗ СНА</T>
        <Wavy x={690} y={120} w={540} p={fade(t, TITLE_AT + 8, 22)} />
        <T x={1180} y={166} size={40} rot={-4}>Костя</T>
      </g>
    </Paper>
  );
};

// 2. Тетрадь в линейку: человечек рисуется линией, «24 часа», чёрточки считаются, пометка про пьяного.
export const L2: React.FC = () => {
  const t = useCurrentFrame();
  return (
    <Paper specks={40}>
      <g strokeWidth={1.6} opacity={0.45}>
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M0 ${70 + i * 52} H${W}`} />)}
        <path d={`M150 0 V${H} M158 0 V${H}`} />
      </g>
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={64} cy={60 + i * 84} r={13} strokeWidth={2.4} fill={PAPER} />)}
      <DoodleMan x={520} y={760} s={1.5} p={clamp(easeInOut(t / 46))} />
      <g opacity={fade(t, 18)}>
        <T x={1290} y={300} size={170}>24 часа</T>
        <T x={1290} y={376} size={64}>без сна</T>
      </g>
      {Array.from({ length: 24 }, (_, i) => {
        const p = clamp((t - MARK_AT - i * 2.4) / 5);
        if (p <= 0) return null;
        const x0 = 1010 + (i % 8) * 70;
        const y0 = 440 + Math.floor(i / 8) * 84;
        const j = (rnd(i + 3)() - 0.5) * 6;
        return <path key={i} d={`M${x0 + j} ${y0} L${x0 - j} ${y0 + 58 * p}`} strokeWidth={4} />;
      })}
      <g opacity={fade(t, NOTE_AT)}>
        <T x={1290} y={730} size={74} rot={-2}>мозг как у пьяного</T>
        <Wavy x={970} y={752} w={640} p={fade(t, NOTE_AT + 8, 24)} />
      </g>
    </Paper>
  );
};

// 3. Ночной перекрёсток: красный горит (залит чернью), Костя на «зебре», слева разгорается свет фар.
export const L3: React.FC<{ len: number }> = ({ len }) => {
  const t = useCurrentFrame();
  const k = clamp(t / len);
  const drift = lerp(0, -26, k);
  return (
    <Paper>
      <g transform={`translate(${drift} 0)`}>
        <Cloud x={820} y={190} s={1.3} />
        <Cloud x={1560} y={110} />
        <Building x={60} y={240} w={300} h={466} cols={3} rows={7} seed={4} />
        <Building x={420} y={340} w={260} h={366} cols={3} rows={5} seed={9} />
        <Building x={1660} y={280} w={240} h={426} cols={2} rows={6} seed={6} />
        <Building x={1380} y={400} w={220} h={306} cols={2} rows={4} seed={2} />
        <Floor />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${500 + i * 100} 736 H${548 + i * 100} L${530 + i * 100} 796 H${476 + i * 100} Z`} strokeWidth={2.6} />)}
        <g>
          <path d="M1110 706 V250" strokeWidth={5} />
          <rect x={1080} y={200} width={60} height={150} rx={10} fill={PAPER} />
          <circle cx={1110} cy={235} r={17} fill={INK} />
          <circle cx={1110} cy={275} r={17} />
          <circle cx={1110} cy={315} r={17} />
          <path d="M1070 235 h-26 M1150 235 h26 M1084 205 l-20 -18 M1136 205 l20 -18" strokeWidth={2.6} />
        </g>
        <Blob x={900} y={FLOOR + 22} eyes="dots" mouth="flat" brow="sad" la={[-6, 78]} ra={[6, 78]} bob />
      </g>
      <g strokeWidth={2.4} opacity={0.5 + k * 0.5}>
        <circle cx={lerp(-60, 250, k)} cy={752} r={lerp(12, 28, k)} fill={PAPER} />
        <circle cx={lerp(0, 380, k)} cy={752} r={lerp(12, 28, k)} fill={PAPER} />
        {[-22, 0, 22].map((a, i) => (
          <path key={i} d={`M${lerp(0, 380, k) + lerp(26, 50, k)} ${752 + a * 0.8} h${lerp(60, 160, k)}`} strokeDasharray="14 10" />
        ))}
      </g>
      <g opacity={fade(t, LABEL_AT)}>
        <T x={110} y={120} size={78} anchor="start">КРАСНЫЙ СВЕТ</T>
        <Wavy x={112} y={142} w={500} p={fade(t, LABEL_AT + 8, 22)} />
        <T x={112} y={192} size={40} anchor="start">видел, но не заметил</T>
      </g>
    </Paper>
  );
};

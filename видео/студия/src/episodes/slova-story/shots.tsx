import React from 'react';
import { clamp, easeInOut, lerp, rnd } from '../../engine/anim';
import { Cat, Chip, F, LineMan, Man, P, cam, drift } from '../../flat/kit';

export type StoryShot = React.FC<{ t: number; len: number }>;
const fade = (t: number, at: number, n = 22) => clamp((t - at) / n);
const mix = (a: string, b: string, k: number) => {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), k))).join(',')})`;
};

// Ночная кухня: герой сидит, зажав рот рукой.
export const S1: StoryShot = ({ t, len }) => (
  <>
    <g transform={cam(drift(t, len, 930, 985), drift(t, len, 590, 575), drift(t, len, 1.26, 1.36))}>
      <rect x={-100} y={-100} width={2200} height={1400} fill="#3A3D4E" />
      <defs>
        <radialGradient id="lampWall" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C89A62" stopOpacity={0.34} />
          <stop offset="100%" stopColor="#C89A62" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-100} y={640} width={2200} height={240} fill="#282B38" />
      <rect x={-100} y={880} width={2200} height={400} fill="#1F2029" />
      <ellipse cx={1010} cy={520} rx={640} ry={470} fill="url(#lampWall)" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-60 + i * 180} y={640} width={3} height={240} fill="#20222D" />)}
      <rect x={1390} y={230} width={270} height={340} fill="#1D1F2A" />
      <rect x={1404} y={244} width={242} height={312} fill="#3C4A66" />
      <path d="M 1404 556 L 1404 470 L 1470 470 L 1470 430 L 1550 430 L 1550 490 L 1646 490 L 1646 556 Z" fill="#2A3147" />
      <circle cx={1590} cy={310} r={24} fill="#C6C7B6" opacity={0.8} />
      <rect x={1522} y={244} width={7} height={312} fill="#1D1F2A" />
      <rect x={230} y={350} width={250} height={530} rx={10} fill="#43465A" />
      <rect x={230} y={510} width={250} height={5} fill="#2F3140" />
      <rect x={254} y={400} width={12} height={70} rx={5} fill="#5F6276" />
      <rect x={254} y={540} width={12} height={110} rx={5} fill="#5F6276" />
      <circle cx={690} cy={270} r={50} fill="#1F2230" />
      <circle cx={690} cy={270} r={42} fill="#6F6C63" />
      <line x1={690} y1={270} x2={690} y2={240} stroke={P.ink} strokeWidth={5} strokeLinecap="round" />
      <line x1={690} y1={270} x2={716} y2={282} stroke={P.ink} strokeWidth={4} strokeLinecap="round" />
      <line x1={1130} y1={-100} x2={1130} y2={300} stroke="#14151C" strokeWidth={5} />
      <path d="M 1072 346 L 1098 298 L 1162 298 L 1188 346 Z" fill="#3A3331" />
      <path d="M 1072 346 L 1188 346 L 1500 880 L 760 880 Z" fill="#D9A25F" opacity={0.06} />
      <ellipse cx={1130} cy={700} rx={270} ry={30} fill="#D9A25F" opacity={0.18} />
      <rect x={960} y={690} width={390} height={18} fill="#5A4636" />
      <rect x={985} y={708} width={16} height={172} fill="#46372C" />
      <rect x={1310} y={708} width={16} height={172} fill="#46372C" />
      <rect x={1140} y={650} width={44} height={40} rx={5} fill="#8A8676" />
      <path d="M 1184 660 q 18 10 0 22" fill="none" stroke="#8A8676" strokeWidth={6} />
      <rect x={790} y={704} width={150} height={18} fill="#46372C" />
      <rect x={806} y={722} width={14} height={158} fill="#3A2E25" />
      <rect x={908} y={722} width={14} height={158} fill="#3A2E25" />
      <Man x={850} y={880} t={t} sit top="#34364A" topDark="#2A2C3C" ring="#34364A" palm armB={[44, 112]} armF={[30, -54]} look={t > 92 && t < 124 ? 1 : 0} mouth="frown" />
      <Cat x={1540} y={884} t={t} s={0.86} c="#3F4049" dark="#30313A" />
    </g>
  </>
);

// Чёрный титр, тишина.
export const S2: StoryShot = ({ t }) => (
  <g style={{ fontFamily: F.head }} textAnchor="middle" opacity={fade(t, 6, 18)}>
    <text x={960} y={540} fontSize={104} fontWeight={600} letterSpacing={5} fill={P.cream}>ВСЕ ТВОИ СЛОВА</text>
    <rect x={925} y={574} width={70} height={3} fill={P.red} />
    <text x={960} y={622} fontSize={25} fontWeight={500} letterSpacing={6} fill={P.red}>ДАВАЙ ПОСЧИТАЕМ</text>
  </g>
);

// Тетрадь в линейку: человечек, число, насечки считают дальше.
export const S3: StoryShot = ({ t, len }) => (
  <>
    <g transform={cam(drift(t, len, 960, 985), drift(t, len, 540, 575), drift(t, len, 1.0, 1.09))}>
      <rect x={-100} y={-100} width={2200} height={1400} fill={P.paper} />
      {Array.from({ length: 26 }, (_, i) => <rect key={i} x={-100} y={-40 + i * 52} width={2200} height={2} fill={P.paperLine} />)}
      <LineMan x={560} y={950} s={1.42} p={clamp(easeInOut(t / 46))} />
      <g opacity={fade(t, 112)} style={{ fontFamily: F.serif }} textAnchor="middle">
        <text x={1290} y={420} fontSize={150} fontWeight={700} fill="none" stroke={P.pen} strokeWidth={3}>16 000</text>
        <text x={1290} y={492} fontSize={44} fill={P.pen}>слов в день</text>
      </g>
      {Array.from({ length: 28 }, (_, g) => {
        const x0 = 1010 + (g % 7) * 84;
        const y0 = 560 + Math.floor(g / 7) * 88;
        return Array.from({ length: 5 }, (_, n) => {
          const p = clamp((t - 128 - (g * 5 + n) * 0.42) / 5);
          if (p <= 0) return null;
          const j = (rnd(7, g * 5 + n) - 0.5) * 5;
          return n < 4 ? (
            <line key={`${g}${n}`} x1={x0 + n * 13 + j} y1={y0} x2={x0 + n * 13 - j} y2={y0 + 54 * p} stroke={P.pen} strokeWidth={3.8} strokeLinecap="round" />
          ) : (
            <line key={`${g}${n}`} x1={x0 - 9} y1={y0 + 42} x2={x0 - 9 + 66 * p} y2={y0 + 42 - 30 * p} stroke={P.pen} strokeWidth={3.8} strokeLinecap="round" />
          );
        });
      })}
    </g>
    <rect width={1920} height={1080} fill="url(#notebookVig)" />
  </>
);

// Двор днём: Игорь всё говорит, соседка терпит.
export const S4: StoryShot = ({ t, len }) => (
  <>
    <g transform={cam(drift(t, len, 905, 1010), 560, 1.04)}>
      <rect x={-200} y={-100} width={2500} height={1000} fill="#C6C1AE" />
      <rect x={-200} y={230} width={760} height={560} fill="#A7A08C" />
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-160 + i * 100} y={280} width={44} height={60} fill="#8F8875" />)}
      <rect x={380} y={110} width={1300} height={640} fill="#AD8F68" />
      <rect x={380} y={110} width={1300} height={18} fill="#8C7251" />
      {Array.from({ length: 28 }, (_, i) => {
        const lit = rnd(3, i) > 0.72;
        return (
          <g key={i}>
            <rect x={440 + (i % 7) * 176} y={170 + Math.floor(i / 7) * 138} width={92} height={96} fill="#7B6547" />
            <rect x={448 + (i % 7) * 176} y={178 + Math.floor(i / 7) * 138} width={76} height={80} fill={lit ? '#CFAE6B' : '#4B4A49'} />
            <rect x={485 + (i % 7) * 176} y={178 + Math.floor(i / 7) * 138} width={3} height={80} fill="#7B6547" />
          </g>
        );
      })}
      <rect x={1000} y={570} width={150} height={180} fill="#5B4632" />
      <rect x={984} y={552} width={182} height={18} fill="#6E5840" />
      <rect x={-200} y={750} width={2500} height={40} fill="#6F7554" />
      <rect x={-200} y={790} width={2500} height={400} fill="#7A6F5C" />
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-200 + i * 170} y={790} width={3} height={260} fill="#6B6150" />)}
      <rect x={1560} y={420} width={30} height={340} fill="#5A4938" />
      <ellipse cx={1575} cy={350} rx={150} ry={160} fill="#6C7650" />
      <ellipse cx={1500} cy={420} rx={90} ry={90} fill="#5F6A47" />
      <rect x={1640} y={840} width={210} height={14} fill="#54402E" />
      <rect x={1660} y={854} width={12} height={60} fill="#3F2F24" />
      <rect x={1820} y={854} width={12} height={60} fill="#3F2F24" />
      <Man x={690} y={930} t={t} s={1.02} armF={[62 + Math.sin(t / 19) * 16, 68 + Math.cos(t / 23) * 22]} mouth="talk" />
      <Man x={1040} y={930} t={t} s={0.98} dir={-1} ring="#B9AE97" top="#6C7355" topDark="#596046" legs="#574A3C" cords={false} armF={[20, 150]} seed={3} mouth="frown" />
      <Man x={1320} y={930} t={t} s={0.9} dir={-1} hair="#4B3A2C" top="#7A5C42" topDark="#634A35" legs="#46505C" cords={false} seed={5} look={1} mouth="flat" />
      <Cat x={1500} y={942} t={t} s={0.72} c="#8A7C69" dark="#73675A" />
    </g>
    <Chip t={t} at={60} title="117 000 000 СЛОВ" sub="ЗА ДВАДЦАТЬ ЛЕТ" />
  </>
);

// Стена из одинаковых томов, камера отходит: внизу маленький Игорь.
export const S5: StoryShot = ({ t, len }) => {
  const k = clamp(t / (len * 0.82));
  return (
    <>
      <g transform={cam(lerp(1180, 960, k), lerp(330, 560, k), lerp(1.75, 1.0, k))}>
        <rect x={-100} y={-100} width={2200} height={1400} fill="#6F5C47" />
        <rect x={120} y={40} width={1680} height={850} fill="#4A3829" />
        {Array.from({ length: 7 }, (_, r) => (
          <g key={r}>
            {Array.from({ length: 30 }, (_, c) => {
              const lean = rnd(5, r * 30 + c) > 0.93 ? 1.6 : 0;
              return (
                <g key={c} transform={`translate(${150 + c * 54.6} ${62 + r * 118}) rotate(${lean} 26 102)`}>
                  <rect width={50} height={102} fill={c % 2 ? '#47533F' : '#434F3B'} />
                  <rect y={20} width={50} height={3} fill="#9A8351" opacity={0.7} />
                  <rect x={15} y={38} width={20} height={14} fill="#9A8351" opacity={0.45} />
                </g>
              );
            })}
            <rect x={120} y={164 + r * 118} width={1680} height={16} fill="#6A5238" />
          </g>
        ))}
        <rect x={-100} y={890} width={2200} height={400} fill="#4F4336" />
        <Man x={960} y={1010} t={t} s={0.62} look={0} mouth="o" armB={[-8, 178]} armF={[6, 178]} />
      </g>
      <Chip t={t} at={26} title="«ВОЙНА И МИР»" sub="БОЛЬШЕ ДВУХСОТ ТОМОВ" />
    </>
  );
};

// Рассвет у окна: герой молчит, рука поднимается ко рту, окно теплеет.
export const S6: StoryShot = ({ t, len }) => {
  const k = clamp(t / len);
  const lift = easeInOut(clamp((t - 46) / 44));
  return (
    <g transform={cam(960, drift(t, len, 560, 545), drift(t, len, 1.0, 1.08))}>
      <rect x={-100} y={-100} width={2200} height={1400} fill={mix('#3A3D4A', '#6D6253', k)} />
      <rect x={210} y={130} width={600} height={720} fill="#1D1E27" />
      <rect x={226} y={146} width={568} height={688} fill={mix('#4E5C78', '#E2C08E', k)} />
      <circle cx={510} cy={lerp(745, 620, k)} r={90} fill="#F0D9A6" opacity={0.85} />
      <path d={`M 226 834 L 226 640 L 330 640 L 330 560 L 470 560 L 470 660 L 620 660 L 620 590 L 794 590 L 794 834 Z`} fill={mix('#2D344A', '#7B6B58', k)} />
      <rect x={500} y={146} width={12} height={688} fill="#1D1E27" />
      <path d="M 820 1080 L 1120 280 L 1500 280 L 1500 1080 Z" fill="#E2C08E" opacity={0.07 + k * 0.1} />
      <Man x={1190} y={1270} t={t} s={1.86} dir={-1} look={k > 0.5 ? 0.6 : 0} palm={lift > 0.6} armF={[lerp(10, 30, lift), lerp(176, -54, lift)]} shadow={false} />
      <rect x={160} y={850} width={700} height={36} fill="#17181F" />
      <rect x={-100} y={886} width={1100} height={400} fill="#20212A" />
      <path d="M 300 850 q -24 -70 -70 -96 q 62 -2 86 46 q -2 -88 40 -120 q 26 58 -2 120 q 30 -34 74 -28 q -30 40 -86 78 Z" fill="#15161C" />
    </g>
  );
};

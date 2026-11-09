import React from 'react';
import { useCurrentFrame } from 'remotion';
import { INK, PAPER } from '../../lines/kit';
import { Draw, Ground, Head, Man, Pop, Sheet, Specs, Stamp, Tash, Tx } from '../piter-bw/shots';
import { at } from './timing';

// Только SVG. Важные элементы заканчиваются до y=1530; низ оставлен интерфейсу Reels.
const Father: React.FC<{ x: number; y: number; s?: number; talking?: boolean }> = ({ x, y, s = 1.65, talking = false }) => {
  const t = useCurrentFrame();
  return <g>
    <Man x={x} y={y} s={s} mouth={talking && Math.floor(t / 4) % 2 ? 'open' : 'flat'} brow="raised" la={[-35, 65]} ra={talking ? [90, -35 + Math.sin(t / 5) * 8] : [30, 65]} seed={7} bob />
    <Specs x={x} y={y} s={s} /><Tash x={x} y={y} s={s} />
  </g>;
};

const Heat: React.FC<{ t: number; y?: number }> = ({ t, y = 980 }) => <g strokeWidth={4}>
  {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${155 + i * 190} ${y + Math.sin(t / 8 + i) * 14} q-22 -35 0 -70 t0 -70`} />)}
</g>;

const Balloon: React.FC<{ x: number; y: number; text: string; width?: number; thought?: boolean }> = ({ x, y, text, width = 410, thought = false }) => <g>
  <rect x={x - width / 2} y={y - 58} width={width} height={116} rx={thought ? 58 : 24} fill={PAPER} strokeWidth={4} />
  {thought ? <g fill={PAPER}><circle cx={x - 35} cy={y + 84} r={12} /><circle cx={x - 52} cy={y + 110} r={7} /></g>
    : <path d={`M${x - 48} ${y + 58} l-16 44 l68 -44`} fill={PAPER} strokeWidth={4} />}
  <Tx x={x} y={y + 21} size={62}>{text}</Tx>
</g>;

// Хук: толпа на празднике и организатор, которому самому хочется домой.
export const Corporate: React.FC = () => {
  const t = useCurrentFrame();
  const reveal = at(0, 5);
  return <Sheet hit={at(0, 2)}>
    <Head lines={['ПРАЗДНИК', 'ЧЕРЕЗ НЕ ХОЧУ']} t={t} />
    <Draw t={t} at={at(0, 1)} d="M55 410 Q540 580 1025 410" strokeWidth={4} />
    {t >= at(0, 1) && [0, 1, 2, 3, 4, 5, 6].map(i => <path key={i} d={`M${130 + i * 133} ${440 + Math.sin(i / 6 * Math.PI) * 73} l25 65 l27 -65 Z`} fill={i % 2 ? PAPER : INK} />)}
    {Array.from({ length: 18 }, (_, i) => {
      const x = 110 + i % 6 * 172;
      const y = 830 + Math.floor(i / 6) * 285;
      return <Man key={i} x={x} y={y} s={0.8} eyes={i % 2 ? 'closed' : 'up'} mouth="flat" seed={i} bob />;
    })}
    <Stamp x={540} y={530} text="ЖЕЛАЮЩИХ: 0" size={72} t={t} at={at(0, 2)} rot={-4} />
    {t >= reveal && <g>
      <path d="M290 970 Q280 930 320 930 H770 Q810 930 800 970 V1485 H290 Z" fill={PAPER} strokeWidth={4} />
      <Man x={540} y={1470} s={1.6} mouth="flat" brow="sad" hair="tuft" la={[-35, 65]} ra={[35, 65]} seed={30} bob />
      <Balloon x={540} y={850} text="я бы домой" thought width={450} />
      <rect x={377} y={1270} width={326} height={64} fill={INK} />
      <Tx x={540} y={1316} size={42} fill={PAPER}>ОРГАНИЗАТОР</Tx>
    </g>}
    <Ground />
  </Sheet>;
};

// Дата относится к названию парадокса; не подменяет дату самой поездки.
export const Paradox: React.FC = () => {
  const t = useCurrentFrame();
  return <Sheet>
    <Head lines={['ПАРАДОКС АБИЛИНА']} t={t} />
    <Tx x={540} y={500} size={56}>КОГДА ВСЕ СОГЛАСНЫ</Tx>
    <g transform={`translate(540 925) rotate(${Math.sin(t / 18) * 1.5})`}>
      <path d="M-170 -180 Q0 -310 170 -180 M170 -180 l-60 7 m60 -7 l-8 -60 M175 180 Q0 310 -175 180 M-175 180 l60 -7 m-60 7 l8 60" strokeWidth={7} />
    </g>
    <Man x={300} y={1110} s={1.5} mouth="flat" brow="sad" seed={2} bob />
    <Man x={780} y={1110} s={1.5} mouth="flat" brow="sad" seed={5} bob />
    <Balloon x={310} y={615} text="ради них" width={350} />
    <Balloon x={770} y={615} text="ради них" width={350} />
    <Pop x={540} y={1370} t={t} at={at(1, 13)}>
      <rect x={330} y={1200} width={420} height={300} fill={PAPER} strokeWidth={5} />
      <rect x={330} y={1200} width={420} height={65} fill={INK} />
      <Tx x={540} y={1247} size={40} fill={PAPER}>НАЗВАНИЕ ПАРАДОКСА</Tx>
      <Tx x={540} y={1435} size={150} bold={2}>1974</Tx>
    </Pop>
    <Ground />
  </Sheet>;
};

export const Texas: React.FC = () => {
  const t = useCurrentFrame();
  return <Sheet>
    <Head lines={['ТЕХАС', 'ДУХОВКА СНАРУЖИ']} t={t} />
    <Tx x={540} y={520} size={52}>ПОГОДА ДЛЯ ПОЕЗДКИ?</Tx>
    <Pop x={540} y={790} t={t} at={at(2, 18)} n={5}>
      <Tx x={540} y={850} size={260} bold={3}>40°</Tx>
    </Pop>
    {t >= at(2, 16) && <Heat t={t} y={1190} />}
    <g transform={`rotate(${Math.sin(t / 10)} 540 1510)`}>
      <path d="M505 1510 V1280 Q505 1240 540 1240 Q575 1240 575 1280 V1510 M505 1400 H445 Q405 1400 405 1360 V1300 Q405 1270 430 1270 Q455 1270 455 1300 V1345 H505 M575 1350 H625 V1220 Q625 1195 650 1195 Q675 1195 675 1220 V1365 Q675 1400 640 1400 H575" fill={PAPER} strokeWidth={5} />
      <path d="M525 1290 V1490 M552 1290 V1490 M418 1320 l-20 -12 M656 1240 l32 -10 M485 1460 l28 -8 M567 1450 l25 -12" strokeWidth={3} />
    </g>
    <Ground />
  </Sheet>;
};

export const Invitation: React.FC = () => {
  const t = useCurrentFrame();
  return <Sheet>
    <Head lines={['А ДАВАЙТЕ', 'КУДА-НИБУДЬ СЪЕЗДИМ']} t={t} />
    <Father x={260} y={1510} talking />
    <Man x={780} y={1510} s={1.5} hair="tuft" mouth="flat" seed={4} bob />
    <Pop x={400} y={710} t={t} at={at(3, 21)} n={5}>
      <Balloon x={400} y={710} text="поехали?" width={480} />
    </Pop>
    <Pop x={785} y={590} t={t} at={at(3, 24)} n={5}>
      <path d="M585 490 H955 L1010 560 L955 630 H585 Z M650 630 V840 M675 630 V840" fill={PAPER} strokeWidth={5} />
      <Tx x={785} y={582} size={76}>АБИЛИН</Tx>
    </Pop>
    <Pop x={540} y={1040} t={t} at={at(3, 25)} n={5}>
      <ellipse cx={540} cy={1020} rx={130} ry={65} fill={PAPER} strokeWidth={5} />
      <ellipse cx={540} cy={1020} rx={92} ry={39} />
      <path d="M375 940 V1100 M353 940 V980 Q375 1005 397 980 V940 M714 940 Q674 985 697 1035 V1100" strokeWidth={7} />
    </Pop>
    <Ground />
  </Sheet>;
};

// Шутка: тесть пытается буквально «спасти» гостей от скуки, хотя им хорошо на диване.
export const Worry: React.FC = () => {
  const t = useCurrentFrame();
  return <Sheet>
    <Head lines={['СПАСАТЕЛЬ', 'ОТ ЧУЖОЙ СКУКИ']} t={t} />
    <Father x={245} y={1510} />
    <Pop x={300} y={700} t={t} at={at(4, 28)} n={5}>
      <Balloon x={300} y={700} text="им скучно?" thought width={440} />
    </Pop>
    <g>
      <Man x={665} y={1370} s={1.15} mouth="smile" eyes="closed" hair="tuft" seed={2} bob />
      <Man x={880} y={1370} s={1.15} mouth="smile" eyes="closed" seed={3} bob />
      <rect x={540} y={1350} width={470} height={130} rx={32} fill={PAPER} strokeWidth={5} />
      <path d="M570 1480 V1520 M980 1480 V1520 M775 1360 V1460" strokeWidth={5} />
    </g>
    <Pop x={770} y={860} t={t} at={at(4, 30)} n={4}>
      <Balloon x={770} y={860} text="нам хорошо" thought width={430} />
    </Pop>
    <Draw t={t} at={at(4, 31)} n={5} d="M420 1150 Q490 1000 530 1120 M500 1085 L530 1120 L490 1130" strokeWidth={5} />
    <Ground />
  </Sheet>;
};

// Рты улыбаются только на ответе; мысли за спиной остаются прежними.
export const Agreement: React.FC = () => {
  const t = useCurrentFrame();
  const yes = at(5, 34);
  return <Sheet hit={yes}>
    <Head lines={['ХОРОМ ЗА', 'ПРО СЕБЯ ПРОТИВ']} t={t} />
    {[220, 540, 860].map((x, i) => <g key={x}>
      <Man x={x} y={1460} s={1.35} mouth={t >= yes ? 'grin' : 'flat'} eyes={t >= yes ? 'dots' : 'closed'} hair={i === 1 ? 'tuft' : 'none'} la={[-25, 70]} ra={[40, t >= yes ? -75 + Math.sin(t / 5 + i) * 8 : 70]} seed={i} bob />
      <Balloon x={x} y={925} text="не хочу" width={270} thought />
    </g>)}
    <Stamp x={540} y={590} text="ОТЛИЧНАЯ ИДЕЯ!" size={88} t={t} at={yes} rot={-4} />
    <Ground />
  </Sheet>;
};

// Машина в разрезе: четыре пассажира и перечёркнутая снежинка вместо кондиционера.
export const Journey: React.FC = () => {
  const t = useCurrentFrame();
  const car = at(6, 39);
  const ac = at(6, 41);
  const road = t * 11 % 210;
  return <Sheet hit={ac}>
    <Head lines={['СОГЛАСИЛИСЬ?', 'ТЕПЕРЬ ТЕРПИТЕ']} t={t} />
    <Pop x={540} y={580} t={t} at={0} n={4}>
      <Tx x={540} y={650} size={220} bold={3}>85 км</Tx>
    </Pop>
    <Heat t={t} y={910} />
    <Pop x={540} y={1340} t={t} at={car} n={5}>
      <g transform={`translate(0 ${Math.sin(t * 0.8) * 3})`}>
        <path d="M130 1330 L195 1060 Q210 1020 250 1020 H835 Q880 1020 895 1070 L960 1330" fill={PAPER} strokeWidth={6} />
        {[290, 460, 630, 800].map((x, i) => <g key={x}>
          <Man x={x} y={1330} s={0.8} mouth="open" eyes="closed" brow="sad" seed={i} />
          {i === 0 && <Specs x={x} y={1330} s={0.8} />}
        </g>)}
        <path d="M100 1280 H980 V1445 H100 Z" fill={PAPER} strokeWidth={6} />
        <path d="M195 1280 V1435 M880 1280 V1435 M530 1295 V1435 M595 1320 H635 M280 1320 H320" strokeWidth={4} />
        {[260, 810].map(x => <g key={x}>
          <circle cx={x} cy={1445} r={64} fill={INK} />
          <circle cx={x} cy={1445} r={34} fill={PAPER} />
          <path transform={`rotate(${t * 16} ${x} 1445)`} d={`M${x - 25} 1445 H${x + 25} M${x} 1420 V1470`} strokeWidth={4} />
        </g>)}
      </g>
    </Pop>
    <Pop x={540} y={840} t={t} at={ac} n={4}>
      <rect x={325} y={755} width={430} height={170} rx={30} fill={PAPER} strokeWidth={4} />
      <g transform="translate(540 840)" strokeWidth={5}>
        {[0, 60, 120].map(a => <path key={a} transform={`rotate(${a})`} d="M0 -56 V56 M-14 -42 L0 -30 L14 -42 M-14 42 L0 30 L14 42" />)}
        <path d="M-77 62 L77 -62" strokeWidth={12} />
      </g>
    </Pop>
    <path d="M0 1545 H1080" strokeWidth={4} />
    {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M${i * 210 - road} 1595 h95`} strokeWidth={5} />)}
    <Ground y={1640} />
  </Sheet>;
};

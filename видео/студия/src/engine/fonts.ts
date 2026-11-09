import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import { loadFont as loadTitle } from '@remotion/google-fonts/Montserrat';
import { loadFont as loadMono } from '@remotion/google-fonts/RobotoMono';
import { loadFont as loadHand } from '@remotion/google-fonts/Neucha';
import { STUDIO } from '../studio.config';

// Изменено относительно оригинала (what-if-animation, MIT): кириллические шрифты вместо Bricolage / Fragment Mono / Kalam.
// Title: Montserrat, ui: Roboto Mono, hand: Neucha.

loadTitle('normal', { weights: ['600', '700', '800'], subsets: ['cyrillic', 'latin'] });
loadMono('normal', { weights: ['400'], subsets: ['cyrillic', 'latin'] });
loadHand('normal', { subsets: ['cyrillic', 'latin'] });
if (STUDIO.titleFont) loadFont({ family: STUDIO.titleFont.family, url: staticFile(STUDIO.titleFont.file), weight: STUDIO.titleFont.weight });

export const FONT = {
  title: STUDIO.titleFont ? STUDIO.titleFont.family : 'Montserrat',
  ui: 'Roboto Mono',
  hand: 'Neucha',
};

import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { S1, S2, S3, S4, S5, S6, S7, S8, S9 } from './shots';

// Ч/Б-минимализм: без виньетки и зерна, белая бумага.
export const slovaBw = defineEpisode('SlovaBW', {
  timeline: timeline as Timeline,
  shots: { S1, S2, S3, S4, S5, S6, S7, S8, S9 },
  grain: false,
  vignette: false,
  bg: '#FFFFFF',
});

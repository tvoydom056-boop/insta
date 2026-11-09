import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import { S1, S2, S3, S4, S5, S6, S7, S8, S9 } from '../slova/shots';

// Те же кадры, что в slova, но неторопливый монтаж: кадры растянуты (клок кадра идёт медленнее), между репликами паузы.
export const slovaSlow = defineEpisode('SlovaSlow', {
  timeline: timeline as Timeline,
  shots: { S1, S2, S3, S4, S5, S6, S7, S8, S9 },
});

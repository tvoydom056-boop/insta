import React from 'react';
import { AbsoluteFill } from 'remotion';
import { H, W } from '../piter-bw/shots';

const Main: React.FC = () => <AbsoluteFill style={{ backgroundColor: '#fff' }} />;

export const streisandBw = { id: 'StreisandBw', total: 30, shotCount: 1, width: W, height: H, Main, Board: Main };

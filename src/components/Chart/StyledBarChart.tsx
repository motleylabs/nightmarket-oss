import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, Label, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export function StyledBarChart(props: {
  height?: number;
  data: unknown[];
  options?: {
    yDataKey?: string;
  };
  children?: ReactNode;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={props.data}>
        <defs>
          <linearGradient id="lineColor" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#F85C04" />
            <stop offset="100%" stopColor="#EC9D08" />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#A8A8A8" horizontal={false} />
        <YAxis
          dataKey={'y'}
          tickCount={10}
          tickLine={false}
          tick={{ stroke: '#A8A8A8', strokeWidth: '0.5', fontSize: '12px' }}
          axisLine={false}
        >
          <Label angle={-90} fontSize="12px" fill="#8B8B8E" position="insideLeft" />
        </YAxis>
        <XAxis
          tickLine={false}
          tick={{ stroke: '#A8A8A8', strokeWidth: '0.5', fontSize: '12px' }}
          axisLine={false}
          dataKey="label"
        >
          <Label fontSize="12px" fill="#8B8B8E" position="insideBottom" dy={15} />
        </XAxis>
        <CartesianGrid vertical={false} stroke="#A8A8A8" />
        <Bar barSize={24} dataKey="y" fill="url(#lineColor)" />
        {props.children}
      </BarChart>
    </ResponsiveContainer>
  );
}

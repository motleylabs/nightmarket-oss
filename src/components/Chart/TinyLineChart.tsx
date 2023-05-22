import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

import type { DataPoint } from '../../typings';
import { CustomLineChartTooltip } from './Chart';

export function TinyLineChart(props: {
  height?: number;
  data: DataPoint[];
  loading: boolean;
  animation: boolean;
  options?: {
    yDataKey?: string;
  };
  children?: ReactNode;
}) {
  const { t } = useTranslation('analytics');

  const chartRef = useRef(null);

  // TODO: replace this hack with a better solution once this https://github.com/recharts/recharts/issues/3055 is resolved
  // could for better accuracy check if the values are the same across the entire array but for speed we'll avoid that for now
  const hasNoChange: boolean = props.data[0]?.amount === props.data[props.data.length - 1]?.amount;

  return props.data.length > 0 && !props.loading ? (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        ref={chartRef}
        data={props.data}
        margin={{ top: 2, right: 24, bottom: 0, left: 24 }}
      >
        <defs>
          <linearGradient id="lineColor" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#F85C04" />
            <stop offset="100%" stopColor="#EC9D08" />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#A8A8A8" horizontal={false} />
        <YAxis
          tickCount={4}
          tickLine={false}
          tick={{ stroke: '#A8A8A8', strokeWidth: '0.5', fontSize: '10px' }}
          width={10}
          hide={true}
          axisLine={false}
          domain={['dataMin', 'dataMax']}
        />
        <Line
          type="monotone"
          dot={false}
          strokeWidth={2}
          dataKey="amount"
          stroke={hasNoChange ? '#F85C04' : 'url(#lineColor)'}
          isAnimationActive={props.animation}
        />
        <Tooltip
          content={<CustomLineChartTooltip />}
          wrapperStyle={{
            backgroundColor: '#2D2D2D',
            padding: '4px',
            borderRadius: '2px',
            fontSize: '10px',
          }}
        />

        {props.children}
      </LineChart>
    </ResponsiveContainer>
  ) : (
    <div className="my-auto mx-auto text-sm text-gray-300">
      {props.loading ? (
        <TailSpin
          height="20px"
          width="20px"
          color="#ED9E09"
          ariaLabel={t('loading', { ns: 'analytics' })}
        />
      ) : (
        t('noData', { ns: 'analytics' })
      )}
    </div>
  );
}

import { format, roundToNearestMinutes } from 'date-fns';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TailSpin } from 'react-loader-spinner';

import { DateRangeOption } from '../../modules/time';
import type { DataPoint } from '../../typings';
import { CustomLineChartTooltip } from './Chart';

const tickGapDict = {
  [DateRangeOption.DAY]: 30,
  [DateRangeOption.WEEK]: 60,
  [DateRangeOption.MONTH]: 60,
};

export function StyledLineChart(props: {
  dateRange?: DateRangeOption.DAY | DateRangeOption.WEEK | DateRangeOption.MONTH;
  height?: number;
  data: DataPoint[];
  loading: boolean;
  options?: {
    yDataKey?: string;
  };
  children?: ReactNode;
}) {
  const { t } = useTranslation('analytics');

  // TODO: replace this hack with a better solution once this https://github.com/recharts/recharts/issues/3055 is resolved
  // could for better accuracy check if the values are the same across the entire array but for speed we'll avoid that for now
  const hasNoChange: boolean = props.data[0]?.amount === props.data[props.data.length - 1]?.amount;

  return props.data.length > 0 && !props.loading ? (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={props.data} margin={{ top: 24, right: 10, bottom: 24, left: 10 }}>
        <defs>
          <linearGradient id="lineColor" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#F85C04" />
            <stop offset="100%" stopColor="#EC9D08" />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          horizontal={false}
          stroke="#A8A8A8"
          strokeDasharray="1000 0 "
        />
        <XAxis
          interval="preserveEnd"
          tickLine={false}
          tick={{ stroke: '#A8A8A8', strokeWidth: '0.5', fontSize: '12px' }}
          axisLine={false}
          height={1}
          dataKey="timestamp"
          type="number"
          scale={'time'}
          domain={['auto', 'auto']}
          minTickGap={(props.dateRange && tickGapDict[props.dateRange]) || 5}
          tickFormatter={(tick) => {
            const dateTime = roundToNearestMinutes(Number(tick), { nearestTo: 30 });
            let dateStr = '';
            if (props.dateRange === DateRangeOption.DAY) {
              dateStr = format(dateTime, 'h:mm');
            } else if (props.dateRange === DateRangeOption.WEEK) {
              dateStr = format(dateTime, 'MM-dd HH:mm');
            } else {
              dateStr = format(dateTime, 'MM-dd');
            }
            return dateStr; // 12:30
          }}
        />
        <YAxis
          tickCount={3}
          tickLine={false}
          allowDecimals={false}
          width={30}
          tick={{ stroke: '#A8A8A8', strokeWidth: '0.5', fontSize: '12px' }}
          axisLine={false}
          domain={['dataMin', 'dataMax']}
        />
        <Line
          type="monotone"
          dot={false}
          strokeWidth={4}
          dataKey="amount"
          stroke={hasNoChange ? '#F85C04' : 'url(#lineColor)'}
        />
        <Tooltip
          content={<CustomLineChartTooltip />}
          wrapperStyle={{ backgroundColor: '#2D2D2D', padding: '6px', borderRadius: '4px' }}
        />
        {props.children}
      </LineChart>
    </ResponsiveContainer>
  ) : (
    <div className="my-auto mx-auto pb-10 text-lg text-gray-300">
      {props.loading ? (
        <TailSpin
          height="40px"
          width="40px"
          color="#ED9E09"
          ariaLabel={t('loading', { ns: 'analytics' })}
        />
      ) : (
        t('noData', { ns: 'analytics' })
      )}
    </div>
  );
}

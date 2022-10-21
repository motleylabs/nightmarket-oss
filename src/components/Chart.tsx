import clsx from 'clsx';
import { ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { ButtonGroup } from './ButtonGroup';

export enum DateRangeOption {
  DAY = 'One day',
  WEEK = 'One week',
  MONTH = 'One month',
}

export function Chart() {
  return <div />;
}

function StyledLineChart(props: {
  height?: number;
  data: any[];
  options?: {
    yDataKey?: string;
  };
  children?: ReactNode;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={props.data} margin={{ top: 24, right: 10, bottom: 24, left: 10 }}>
        <defs>
          <linearGradient id="lineColor" x1="1" y1="1" x2="0" y2="0">
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
          interval={10}
          tickLine={false}
          width={25}
          tick={{ stroke: '#A8A8A8', strokeWidth: '0.5', fontSize: '12px' }}
          axisLine={false}
        />
        <YAxis
          tickCount={3}
          tickLine={false}
          width={25}
          tick={{ stroke: '#A8A8A8', strokeWidth: '0.5', fontSize: '12px' }}
          axisLine={false}
          domain={['dataMin', 'dataMax']}
        />
        <Line
          type="monotone"
          dot={false}
          strokeWidth={4}
          dataKey="price"
          stroke="url(#lineColor)"
        />
        {props.children}
      </LineChart>
    </ResponsiveContainer>
  );
}
Chart.LineChart = StyledLineChart;

function TinyLineChart(props: {
  height?: number;
  data: any[];
  options?: {
    yDataKey?: string;
  };
  children?: ReactNode;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={props.data}>
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
          width={15}
          axisLine={false}
          domain={['dataMin', 'dataMax']}
        />
        <Line
          type="monotone"
          dot={false}
          strokeWidth={2}
          dataKey="price"
          stroke="url(#lineColor)"
        />
        {props.children}
      </LineChart>
    </ResponsiveContainer>
  );
}
Chart.TinyLineChart = TinyLineChart;

function StyledBarChart(props: {
  height?: number;
  data: any[];
  options?: {
    yDataKey?: string;
  };
  children?: ReactNode;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={props.data} margin={{ bottom: 10 }}>
        <defs>
          <linearGradient id="lineColor" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#F85C04" />
            <stop offset="100%" stopColor="#EC9D08" />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#A8A8A8" horizontal={false} />
        <YAxis
          dataKey={'y'}
          tickCount={6}
          tickLine={false}
          tick={{ stroke: '#A8A8A8', strokeWidth: '0.5', fontSize: '12px' }}
          axisLine={false}
        >
          <Label
            value="Number of Holders"
            angle={-90}
            fontSize="12px"
            fill="#8B8B8E"
            position={'insideLeft'}
          />
        </YAxis>
        <XAxis
          // interval={10}
          tickLine={false}
          tick={{ stroke: '#A8A8A8', strokeWidth: '0.5', fontSize: '12px' }}
          axisLine={false}
          dataKey="label"
        >
          <Label
            value="Number of Tokens Held"
            fontSize="12px"
            fill="#8B8B8E"
            position={'insideBottom'}
            dy={15}
          />
        </XAxis>
        <CartesianGrid vertical={false} stroke="#A8A8A8" />
        <Bar type="monotone" barSize={24} dataKey="y" fill="url(#lineColor)" />
        {props.children}
      </BarChart>
    </ResponsiveContainer>
  );
}
Chart.BarChart = StyledBarChart;

function ChartCard(props: {
  title: string;
  control: any;
  dateRangeId?: string;
  chart: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-col gap-10 rounded-lg bg-gray-800 p-6', props.className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2>{props.title}</h2>
          <p className="text-xs text-gray-250">One Day</p>
        </div>
        {props.dateRangeId && (
          <Controller
            control={props.control}
            name={props.dateRangeId}
            render={({ field: { onChange, value } }) => (
              <ButtonGroup value={value} onChange={onChange} style="plain">
                <ButtonGroup.PlainStyleOption value={DateRangeOption.DAY}>
                  1D
                </ButtonGroup.PlainStyleOption>
                <ButtonGroup.PlainStyleOption value={DateRangeOption.WEEK}>
                  1W
                </ButtonGroup.PlainStyleOption>
                <ButtonGroup.PlainStyleOption value={DateRangeOption.MONTH}>
                  1M
                </ButtonGroup.PlainStyleOption>
              </ButtonGroup>
            )}
          />
        )}
      </div>
      {props.chart}
    </div>
  );
}
Chart.Card = ChartCard;

function ChartPreview({
  title,
  dateRange,
  chart,
  className,
}: {
  title: string;
  dateRange: string;
  chart: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-col gap-3 rounded-xl bg-gray-800 p-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-gray-300">{title}</h2>
        <h2 className="text-sm text-gray-300">{dateRange}</h2>
      </div>
      {chart}
    </div>
  );
}
Chart.Preview = ChartPreview;

import clsx from 'clsx';
import { ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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
    <ResponsiveContainer width="100%" height={props.height || 500}>
      <LineChart data={props.data} margin={{ top: 24, right: 24, bottom: 24, left: 24 }}>
        <CartesianGrid vertical={false} stroke="#262626" strokeDasharray="1000 0 " />
        <XAxis interval={2} />
        <YAxis tickCount={6} width={25} axisLine={false} domain={['dataMin', 'dataMax']} />
        <Line type="monotone" dot={false} strokeWidth={4} dataKey="price" stroke="#80EDFF" />
        {props.children}
      </LineChart>
    </ResponsiveContainer>
  );
}

Chart.LineChart = StyledLineChart;

function ChartCard(props: { title: string; control: any; dateRangeId?: string; chart: ReactNode }) {
  return (
    <div className=" rounded-lg   shadow-2xl shadow-black">
      <div className="flex items-center justify-between p-6 ">
        <div className="">
          <h2>{props.title}</h2>
          <p className="text-xs text-gray-400">{/* Might put something in here later */}</p>
        </div>
        {props.dateRangeId && (
          <Controller
            control={props.control}
            name={props.dateRangeId}
            render={({ field: { onChange, value } }) => (
              <ButtonGroup value={value} onChange={onChange}>
                <ButtonGroup.Option value={DateRangeOption.DAY}>1D</ButtonGroup.Option>
                <ButtonGroup.Option value={DateRangeOption.WEEK}>1W</ButtonGroup.Option>
                <ButtonGroup.Option value={DateRangeOption.MONTH}>1M</ButtonGroup.Option>
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
          <linearGradient id="colorUv" x1="1" y1="1" x2="0" y2="0">
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
        <Line type="monotone" dot={false} strokeWidth={2} dataKey="price" stroke="url(#colorUv)" />
        {props.children}
      </LineChart>
    </ResponsiveContainer>
  );
}

Chart.TinyLineChart = TinyLineChart;

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

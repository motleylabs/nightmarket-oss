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

export function StyledLineChart(props: {
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

export function ChartCard(props: {
  title: string;
  control: any;
  dateRangeId?: string;
  chart: ReactNode;
}) {
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

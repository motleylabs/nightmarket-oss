import clsx from 'clsx';
import { ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ButtonGroup } from './ButtonGroup';

enum DateOption {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
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
    <ResponsiveContainer width={'100%'} height={props.height || 500}>
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

export function ChartCard(props: { title: string; noDateRange?: boolean; chart: ReactNode }) {
  // this might need to be moved up one level to facilitate data manipulation
  const { watch, control } = useForm({
    defaultValues: { dateRange: DateOption.DAY },
  });

  const dateRange = watch('dateRange');

  return (
    <div className=" rounded-lg   shadow-2xl shadow-black">
      <div className="flex items-center justify-between p-6 ">
        <div className="">
          <h2>{props.title}</h2>
          <p className="text-xs text-gray-400">One {dateRange}</p>
        </div>
        <Controller
          control={control}
          name={'dateRange'}
          render={({ field: { onChange, value } }) => (
            <ButtonGroup
              className={clsx(props.noDateRange && 'hidden')}
              value={value}
              onChange={onChange}
            >
              <ButtonGroup.Option value={DateOption.DAY}>1D</ButtonGroup.Option>
              <ButtonGroup.Option value={DateOption.WEEK}>1W</ButtonGroup.Option>
              <ButtonGroup.Option value={DateOption.MONTH}>1M</ButtonGroup.Option>
            </ButtonGroup>
          )}
        />
      </div>
      {props.chart}
    </div>
  );
}

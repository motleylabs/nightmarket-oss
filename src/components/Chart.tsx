import { QueryResult } from '@apollo/client';
import clsx from 'clsx';
import { format, roundToNearestMinutes } from 'date-fns';
import { ReactNode, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CollectionAnalyticsData, CollectionAnalyticsVariables } from '../app.types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { Datapoint } from '../graphql.types';
import { ButtonGroup } from './ButtonGroup';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { DateRangeOption, getDateTimeRange } from '../modules/time';
import { TailSpin } from 'react-loader-spinner';

export function Chart() {
  return <div />;
}

const tickGapDict = {
  [DateRangeOption.DAY]: 60,
  [DateRangeOption.WEEK]: 200,
  [DateRangeOption.MONTH]: 90,
};

const CustomLineChartTooltip = ({ active, payload, label }: TooltipProps): JSX.Element => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${payload[0].value}`}</p>
      </div>
    );
  } 

  return <></>;
};

function StyledLineChart(props: {
  dateRange?: DateRangeOption;
  height?: number;
  data: Datapoint[];
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
            const dateTime = roundToNearestMinutes(tick, { nearestTo: 30 });
            if (props.dateRange === DateRangeOption.DAY) {
              return format(dateTime, 'h:mm'); // 12:30
            } else if (props.dateRange === DateRangeOption.WEEK) {
              return format(dateTime, 'do'); // 24th
            } else {
              return format(dateTime, 'do'); // 24th
            }
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
        <Tooltip content={<CustomLineChartTooltip />} wrapperStyle={{ backgroundColor: "#2D2D2D", padding: '6px', borderRadius: '4px'}} />
        {props.children}              
      </LineChart>
    </ResponsiveContainer>
  ) : (
    <div className="my-auto mx-auto pb-10 text-lg text-gray-300">
      {props.loading ? (
        <TailSpin height="40px" width="40px" color="#ED9E09" ariaLabel={t('loading', { ns: 'analytics' })} />
      ) : (
        t('noData', { ns: 'analytics' })
      )}
    </div>
  );
}
Chart.LineChart = StyledLineChart;

function TinyLineChart(props: {
  height?: number;
  data: Datapoint[];
  loading: boolean;
  options?: {
    yDataKey?: string;
  };
  children?: ReactNode;
}) {
  const { t } = useTranslation('analytics');

  const chartRef = useRef(null);
  const [hideAxis, setHideAxis] = useState(true);

  // TODO: replace this hack with a better solution once this https://github.com/recharts/recharts/issues/3055 is resolved
  // could for better accuracy check if the values are the same across the entire array but for speed we'll avoid that for now
  const hasNoChange: boolean = props.data[0]?.amount === props.data[props.data.length - 1]?.amount;

  return props.data.length > 0 && !props.loading ? (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        ref={chartRef}
        data={props.data}
        margin={{ top: 2, right: 24, bottom: 0, left: hideAxis ? 24 : 50 }}
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
          hide={hideAxis}
          axisLine={false}
          domain={['dataMin', 'dataMax']}
        />
        <Line
          type="monotone"
          dot={false}
          strokeWidth={2}
          dataKey="amount"
          stroke={hasNoChange ? '#F85C04' : 'url(#lineColor)'}
        />
        <Tooltip content={<CustomLineChartTooltip />} wrapperStyle={{ backgroundColor: "#2D2D2D", padding: '4px', borderRadius: '2px', fontSize: "10px"}} />
        
        {props.children}
      </LineChart>
    </ResponsiveContainer>
  ) : (
    <div className="my-auto mx-auto text-sm text-gray-300">
      {props.loading ? (
        <TailSpin height="20px" width="20px" color="#ED9E09" ariaLabel={t('loading', { ns: 'analytics' })} />
      ) : (
        t('noData', { ns: 'analytics' })
      )}
    </div>
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
Chart.BarChart = StyledBarChart;

function ChartTimeseries(props: {
  title: string;
  className?: string;
  query: QueryResult<CollectionAnalyticsData, CollectionAnalyticsVariables>;
  timeseries: Datapoint[] | undefined;
}) {
  const router = useRouter();
  const { t } = useTranslation('analytics');

  const { watch, control } = useForm({
    defaultValues: {
      range: DateRangeOption.DAY,
    },
  });

  const dateRange = watch('range');

  const selectedDateRange = useMemo(() => {
    switch (dateRange) {
      case DateRangeOption.DAY:
        return t('oneDay', { ns: 'analytics' });
      case DateRangeOption.WEEK:
        return t('oneWeek', { ns: 'analytics' });
      case DateRangeOption.MONTH:
        return t('oneMonth', { ns: 'analytics' });
    }
  }, [dateRange, t]);

  useEffect(() => {
    const subscription = watch(({ range }) => {
      let dateRange = getDateTimeRange(range!);

      let variables: CollectionAnalyticsVariables = {
        id: router.query.id as string,
        startTime: dateRange.startTime,
        endTime: dateRange.endTime,
      };

      props.query.refetch(variables);
    });

    return subscription.unsubscribe;
  }, [watch, router.query.id, props.query]);

  return (
    <div className={clsx('flex flex-col gap-10 rounded-lg bg-gray-800 p-6', props.className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2>{props.title}</h2>
          <p className="text-gray-250 text-sm">{selectedDateRange}</p>
        </div>
        <Controller
          control={control}
          name="range"
          render={({ field: { onChange, value } }) => (
            <ButtonGroup value={value} onChange={onChange} style="plain">
              <ButtonGroup.Option plain value={DateRangeOption.DAY}>
                1D
              </ButtonGroup.Option>
              <ButtonGroup.Option plain value={DateRangeOption.WEEK}>
                1W
              </ButtonGroup.Option>
              <ButtonGroup.Option plain value={DateRangeOption.MONTH}>
                1M
              </ButtonGroup.Option>
            </ButtonGroup>
          )}
        />
      </div>
      <Chart.LineChart
        dateRange={dateRange}
        data={props.timeseries || []}
        loading={props.query.loading}
      />
    </div>
  );
}

Chart.Timeseries = ChartTimeseries;

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
    <div className={clsx('flex flex-col gap-3 rounded-xl bg-gray-800 py-6', className)}>
      <div className="flex items-center justify-between px-6">
        <h2 className="text-sm text-gray-300">{title}</h2>
        <h2 className="text-sm text-gray-300">{dateRange}</h2>
      </div>
      {chart}
    </div>
  );
}

Chart.Preview = ChartPreview;

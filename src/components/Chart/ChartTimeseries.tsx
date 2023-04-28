import clsx from 'clsx';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { DateRangeOption } from '../../modules/time';
import type { DataPoint } from '../../typings';
import { ButtonGroup } from '../ButtonGroup';
import { Chart } from './Chart';

export function ChartTimeseries(props: {
  title: string;
  className?: string;
  isLoading: boolean;
  slug: string;
  timeseries?: DataPoint[];
  onDateRangeChange?: (range: DateRangeOption) => void;
}) {
  const { t } = useTranslation('analytics');

  const { watch, control } = useForm({
    defaultValues: {
      range: DateRangeOption.DAY,
    },
  });

  const dateRange = watch('range') as
    | DateRangeOption.DAY
    | DateRangeOption.WEEK
    | DateRangeOption.MONTH;

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
            <ButtonGroup
              value={value}
              onChange={(newValue) => {
                onChange(newValue);
                props.onDateRangeChange?.(newValue);
              }}
              style="plain"
            >
              <ButtonGroup.Option plain value={DateRangeOption.DAY}>
                1D
              </ButtonGroup.Option>
              <ButtonGroup.Option plain value={DateRangeOption.WEEK}>
                7D
              </ButtonGroup.Option>
              <ButtonGroup.Option plain value={DateRangeOption.MONTH}>
                30D
              </ButtonGroup.Option>
            </ButtonGroup>
          )}
        />
      </div>
      <Chart.LineChart
        dateRange={dateRange}
        data={props.timeseries || []}
        loading={props.isLoading}
      />
    </div>
  );
}

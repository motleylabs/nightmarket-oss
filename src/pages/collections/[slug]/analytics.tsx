import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import React from 'react';

import { Chart } from '../../../components/Chart';
import { useSeries } from '../../../hooks/collection/useSeries';
import { api } from '../../../infrastructure/api';
import CollectionLayout from '../../../layouts/CollectionLayout';
import { DateRangeOption, getDateTimeRange } from '../../../modules/time';
import { CollectionDateRange } from '../../../typings/index.d';
import type { Collection } from '../../../typings/index.d';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  try {
    const i18n = await serverSideTranslations(locale as string, [
      'collection',
      'common',
      'analytics',
    ]);

    const { data } = await api.get<Collection>(`/collections/${params?.slug}`);

    if (data === null) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        collection: data,
        ...i18n,
      },
    };
  } catch (e) {
    return {
      redirect: {
        destination: `/`,
      },
    };
  }
}

const roundFloat = (value: number, decimals = 2): number => {
  const rounded = Math.round(value * 10 ** decimals);
  return rounded / 10 ** decimals;
};

const FloorPriceChart = () => {
  const { t } = useTranslation('analytics');
  const { query, timeseries, isLoading, handleDateRangeChange } = useTimeSeries();

  const floorPrice = useMemo(
    () =>
      timeseries.map((t) => ({
        amount: roundFloat(Number(t.floorPrice) / LAMPORTS_PER_SOL),
        timestamp: `${t.timestamp}000`,
        value: t.floorPrice,
      })),
    [timeseries]
  );

  return (
    <Chart.Timeseries
      className="h-96"
      title={t('collection.floorPriceChartTitle', { ns: 'analytics' })}
      isLoading={isLoading}
      slug={query.slug as string}
      onDateRangeChange={handleDateRangeChange}
      timeseries={floorPrice}
    />
  );
};

const ListedCountChart = () => {
  const { t } = useTranslation('analytics');
  const { query, isLoading, timeseries, handleDateRangeChange } = useTimeSeries();

  const listed = useMemo(
    () =>
      timeseries.map((t) => ({
        amount: t.listed,
        timestamp: `${t.timestamp}000`,
        value: t.listed,
      })),
    [timeseries]
  );

  return (
    <Chart.Timeseries
      className="h-96"
      title={t('collection.listedCountChartTitle', { ns: 'analytics' })}
      timeseries={listed}
      slug={query.slug as string}
      isLoading={isLoading}
      onDateRangeChange={handleDateRangeChange}
    />
  );
};

const HolderCountChart = () => {
  const { t } = useTranslation('analytics');
  const { query, isLoading, timeseries, handleDateRangeChange } = useTimeSeries();

  const holders = useMemo(
    () =>
      timeseries.map((t) => ({
        amount: t.holders,
        timestamp: `${t.timestamp}000`,
        value: t.holders,
      })),
    [timeseries]
  );

  return (
    <Chart.Timeseries
      className="h-96"
      title={t('collection.holderCountChartTitle', { ns: 'analytics' })}
      timeseries={holders}
      slug={query.slug as string}
      isLoading={isLoading}
      onDateRangeChange={handleDateRangeChange}
    />
  );
};

export default function CollectionAnalyticsPage() {
  return (
    <div className="mt-10 px-10 pt-4 md:mt-[90px]">
      <FloorPriceChart />
      <div className="flex flex-col gap-8 py-8 sm:grid sm:grid-cols-2">
        <ListedCountChart />
        <HolderCountChart />
      </div>
    </div>
  );
}

CollectionAnalyticsPage.getLayout = function CollectionNftsLayout({
  children,
  collection,
}: {
  children: ReactElement;
  collection: Collection;
}): JSX.Element {
  return <CollectionLayout collection={collection}>{children}</CollectionLayout>;
};

function useTimeSeries() {
  const { query } = useRouter();
  const [granularity, setGranularity] = useState<`${CollectionDateRange}`>(
    CollectionDateRange.HOUR
  );
  const [dateRange, setDateRange] = useState<{
    startTime: number;
    endTime: number;
  }>(getDateTimeRange(DateRangeOption.DAY));
  const [rangeOption, setRangeOption] = useState<DateRangeOption>(DateRangeOption.DAY);

  const handleDateRangeChange = (range: DateRangeOption) => {
    if (range === DateRangeOption.MONTH) {
      setGranularity(CollectionDateRange.DAY);
    } else {
      setGranularity(CollectionDateRange.HOUR);
    }
    setDateRange(getDateTimeRange(range));
    setRangeOption(range);
  };

  const { data, isValidating } = useSeries(
    query.slug as string,
    dateRange.startTime,
    dateRange.endTime,
    granularity,
    170
  );

  const timeseries = useMemo(() => {
    const seriesLength = data?.series.length ?? 0;
    return (
      data?.series.slice(
        Math.max(
          0,
          seriesLength - (rangeOption === DateRangeOption.MONTH ? 30 : parseInt(rangeOption, 10))
        ),
        seriesLength
      ) ?? []
    );
  }, [data, rangeOption]);

  return {
    query,
    timeseries,
    handleDateRangeChange,
    isLoading: !data && isValidating,
  };
}

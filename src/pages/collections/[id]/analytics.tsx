import React, { ReactElement } from 'react';
import client from '../../../client';
import { Collection } from '../../../graphql.types';
import CollectionLayout from '../../../layouts/CollectionLayout';
import {
  CollectionQuery,
  CollectionAnalyticsHolderCountQuery,
  CollectionAnalyticsListedCountQuery,
  CollectionAnalyticsFloorPriceQuery,
} from './../../../queries/collection.graphql';
import { CollectionAnalyticsData, CollectionAnalyticsVariables } from './../../../app.types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { Chart } from '../../../components/Chart';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { DateRangeOption, getDateTimeRange } from '../../../modules/time';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, [
    'collection',
    'common',
    'analytics',
  ]);

  const { data } = await client.query({
    query: CollectionQuery,
    fetchPolicy: 'network-only',
    variables: {
      id: params?.id,
    },
  });
  const collection: Collection = data.collection;

  if (collection === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      collection,
      ...i18n,
    },
  };
}

const DEFAULT_DATE_RANGE = getDateTimeRange(DateRangeOption.DAY);

const FloorPriceChart = () => {
  const { t } = useTranslation('analytics');
  const router = useRouter();

  const floorDataQuery = useQuery<CollectionAnalyticsData, CollectionAnalyticsVariables>(
    CollectionAnalyticsFloorPriceQuery,
    {
      notifyOnNetworkStatusChange: true,
      variables: {
        id: router.query.id as string,
        startTime: DEFAULT_DATE_RANGE.startTime,
        endTime: DEFAULT_DATE_RANGE.endTime,
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  return (
    <Chart.Timeseries
      className="h-96"
      title={t('collection.floorPriceChartTitle')}
      query={floorDataQuery}
      timeseries={floorDataQuery.data?.collection.timeseries.floorPrice}
    />
  );
};

const ListedCountChart = () => {
  const { t } = useTranslation('analytics');
  const router = useRouter();

  const listedCountQuery = useQuery<CollectionAnalyticsData, CollectionAnalyticsVariables>(
    CollectionAnalyticsListedCountQuery,
    {
      notifyOnNetworkStatusChange: true,
      variables: {
        id: router.query.id as string,
        startTime: DEFAULT_DATE_RANGE.startTime,
        endTime: DEFAULT_DATE_RANGE.endTime,
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  return (
    <Chart.Timeseries
      className="h-96"
      title={t('collection.listedCountChartTitle')}
      query={listedCountQuery}
      timeseries={listedCountQuery.data?.collection.timeseries.listedCount}
    />
  );
};

const HolderCountChart = () => {
  const { t } = useTranslation('analytics');
  const router = useRouter();

  const holderCountQuery = useQuery<CollectionAnalyticsData, CollectionAnalyticsVariables>(
    CollectionAnalyticsHolderCountQuery,
    {
      notifyOnNetworkStatusChange: true,
      variables: {
        id: router.query.id as string,
        startTime: DEFAULT_DATE_RANGE.startTime,
        endTime: DEFAULT_DATE_RANGE.endTime,
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  return (
    <Chart.Timeseries
      className="h-96"
      title={t('collection.holderCountChartTitle')}
      query={holderCountQuery}
      timeseries={holderCountQuery.data?.collection.timeseries.ownersCount}
    />
  );
};

export default function CollectionAnalyticsPage(props: { collection: Collection }) {
  return (
    <div className="mt-10 px-10 pb-20 pt-4 md:mt-[90px]">
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

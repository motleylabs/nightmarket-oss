import React, { ReactElement } from 'react';
import client from '../../../client';
import { Collection } from '../../../graphql.types';
import CollectionLayout from '../../../layouts/CollectionLayout';
import { CollectionQuery, CollectionAnalyticsQuery } from './../../../queries/collection.graphql';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { Chart, DateRangeOption } from '../../../components/Chart';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { getDateTimeRange } from '../../../modules/time';

const priceDistributionData = Array.from({ length: 24 }).map((_, i) => ({
  label: i > 12 ? i - 12 : i,
  price: Math.floor(Math.random() * 200) + 930,
}));

const holdersVsTokensHeldData = [
  {
    y: 2012,
    label: '1',
  },
  {
    y: 959,
    label: '2-5',
  },
  {
    y: 60,
    label: '6-24',
  },
  {
    y: 4,
    label: '25-50',
  },
  {
    y: 0,
    label: '50+',
  },
];

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, [
    'collection',
    'common',
    'analytics',
  ]);

  const { data } = await client.query({
    query: CollectionQuery,
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

export interface CollectionAnalyticsData {
  collection: Collection;
}

export interface CollectionAnalyticsVariables {
  id: string;
  startTime: string;
  endTime: string;
}

export default function CollectionAnalyticsPage(props: { collection: Collection }) {
  const { t } = useTranslation('analytics');
  const router = useRouter();

  const defaultDateRange = getDateTimeRange(DateRangeOption.DAY);

  const floorDataQuery = useQuery<CollectionAnalyticsData, CollectionAnalyticsVariables>(
    CollectionAnalyticsQuery,
    {
      variables: {
        id: router.query.id as string,
        startTime: defaultDateRange.startTime,
        endTime: defaultDateRange.endTime,
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  const listedCountQuery = useQuery<CollectionAnalyticsData, CollectionAnalyticsVariables>(
    CollectionAnalyticsQuery,
    {
      variables: {
        id: router.query.id as string,
        startTime: defaultDateRange.startTime,
        endTime: defaultDateRange.endTime,
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  const holderCountQuery = useQuery<CollectionAnalyticsData, CollectionAnalyticsVariables>(
    CollectionAnalyticsQuery,
    {
      variables: {
        id: router.query.id as string,
        startTime: defaultDateRange.startTime,
        endTime: defaultDateRange.endTime,
      },
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  return (
    <div className="mt-10 px-10 pt-6 pb-20 md:mt-32">
      <Chart.TimeseriesCard
        className="h-96"
        title={t('collection.floorPriceChartTitle')}
        query={floorDataQuery}
        queryKey="floorPrice"
      />

      <div className="flex flex-col gap-8 py-8 sm:grid sm:grid-cols-2">
        <Chart.TimeseriesCard
          className="h-96"
          title={t('collection.listedCountChartTitle')}
          query={listedCountQuery}
          queryKey="listedCount"
        />

        <Chart.TimeseriesCard
          className="h-96"
          title={t('collection.holderCountChartTitle')}
          query={holderCountQuery}
          queryKey="holderCount"
        />
      </div>

      {/* <Chart.Card
        className="h-96"
        title={t('collection.holdersVsTokensHeldChartTitle')}
        dateRangeId="holdersVsHeldDateRange"
        control={control}
        chart={<Chart.BarChart data={holdersVsTokensHeldData} />}
      /> */}
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

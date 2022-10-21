import React, { ReactElement, ReactNode } from 'react';
import client from '../../../client';
import { Collection } from '../../../graphql.types';
import CollectionLayout from '../../../layouts/CollectionLayout';
import { CollectionQuery } from './../../../queries/collection.graphql';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { useForm } from 'react-hook-form';
import { Chart, DateRangeOption } from '../../../components/Chart';
import { useTranslation } from 'next-i18next';

const floorPriceData = Array.from({ length: 24 }, (v, i) => ({
  label: i > 12 ? i - 12 : i,
  price: Math.floor(Math.random() * 40) + 10,
}));

const listedCountData = Array.from({ length: 24 }).map((_, i) => ({
  label: i > 12 ? i - 12 : i,
  price: Math.floor(Math.random() * 50) + 930,
}));

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
      address: params?.address,
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

export default function CollectionAnalyticsPage(props: { collection: Collection }) {
  const { t } = useTranslation('analytics');

  const { watch, control } = useForm({
    defaultValues: {
      floorPriceDateRange: DateRangeOption.DAY,
      listingCountDateRange: DateRangeOption.DAY,
      priceDistributionDateRange: DateRangeOption.DAY,
      holdersVsHeldDateRange: DateRangeOption.DAY,
    },
  });

  return (
    <div className="mt-10 px-10 pt-6 pb-20 md:mt-32">
      <Chart.Card
        className="h-96"
        title={t('collection.floorPriceChartTitle')}
        dateRangeId="floorPriceDateRange"
        control={control}
        chart={<Chart.LineChart data={floorPriceData} />}
      />

      <div className="grid grid-cols-2 gap-8 py-8">
        <Chart.Card
          className="h-96"
          title={t('collection.listedCountChartTitle')}
          dateRangeId="listingCountDateRange"
          control={control}
          chart={<Chart.LineChart data={listedCountData} />}
        />

        <Chart.Card
          className="h-96"
          title={t('collection.priceDistributionChartTitle')}
          dateRangeId="priceDistributionDateRange"
          control={control}
          chart={<Chart.LineChart data={priceDistributionData} />}
        />
      </div>

      <Chart.Card
        className="h-96"
        title={t('collection.holdersVsTokensHeldChartTitle')}
        dateRangeId="holdersVsHeldDateRange"
        control={control}
        chart={<Chart.BarChart data={holdersVsTokensHeldData} />}
      />
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

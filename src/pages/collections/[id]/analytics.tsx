import React, { ReactElement, ReactNode } from 'react';
import client from '../../../client';
import { Collection } from '../../../graphql.types';
import CollectionLayout from '../../../layouts/CollectionLayout';
import { CollectionQuery } from './../../../queries/collection.graphql';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
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
    <div className="px-10 pt-6 pb-20">
      <Chart.Card
        title={t('collection.floorPriceChartTitle')}
        dateRangeId="floorPriceDateRange"
        control={control}
        chart={<Chart.LineChart data={floorPriceData} />}
      />

      <div className=" grid grid-cols-2 gap-8 py-8">
        <Chart.Card
          title={t('collection.listedCountChartTitle')}
          dateRangeId="listingCountDateRange"
          control={control}
          chart={<Chart.LineChart data={listedCountData} />}
        />

        <Chart.Card
          title={t('collection.priceDistributionChartTitle')}
          dateRangeId="priceDistributionDateRange"
          control={control}
          chart={<Chart.LineChart data={priceDistributionData} />}
        />
      </div>

      <Chart.Card
        title={t('collection.holdersVsTokensHeldChartTitle')}
        dateRangeId="holdersVsHeldDateRange"
        control={control}
        chart={
          <ResponsiveContainer width="100%" height={500}>
            <BarChart width={400} height={400} data={holdersVsTokensHeldData}>
              <YAxis dataKey={'y'} tickCount={6} axisLine={false} />

              <CartesianGrid vertical={false} stroke="#262626" />
              <XAxis axisLine={false} dataKey="label" />
              <Bar type="monotone" barSize={24} dataKey="y" fill="#36C6B0" />
            </BarChart>
          </ResponsiveContainer>
        }
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

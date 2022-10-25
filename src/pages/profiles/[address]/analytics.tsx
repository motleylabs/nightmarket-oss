import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { WalletProfileQuery } from './../../../queries/profile.graphql';
import { ReactElement, useMemo } from 'react';
import client from '../../../client';
import { Wallet } from '../../../graphql.types';
import ProfileLayout, {
  WalletProfileData,
  WalletProfileVariables,
} from '../../../layouts/ProfileLayout';
import { BarChart, CartesianGrid, ResponsiveContainer, Bar, XAxis, YAxis } from 'recharts';
import { QueryResult } from '@apollo/client';
import { Chart, DateRangeOption } from '../../../components/Chart';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { formatDistanceToNow, subDays } from 'date-fns';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'profile', 'analytics']);

  const {
    data: { wallet },
  } = await client.query({
    query: WalletProfileQuery,
    variables: {
      address: params?.address,
    },
  });

  if (wallet === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      wallet,
      ...i18n,
    },
  };
}
const walletValueData = Array.from({ length: 24 }).map((_, i) => ({
  label: formatDistanceToNow(subDays(Date.now(), 24 - i)),
  price: Math.floor(Math.random() * 25),
}));

const listedCountData = Array.from({ length: 24 }).map((_, i) => ({
  label: i > 12 ? i - 12 : i,
  price: Math.floor(Math.random() * 25),
}));

const nftsBoughtAndNftsSold = Array.from({ length: 24 }).map((_, i) => ({
  label: i > 12 ? i - 12 : i,
  // price is actually percentage, but the chart component only accepts price right now
  price: Math.floor(Math.random() * 25) / (Math.floor(Math.random() * 25) + 1),
  bought: Math.floor(Math.random() * 25),
  sold: Math.floor(Math.random() * 25),
}));

export default function ProfileAnalyticsPage({
  walletProfileClientQuery,
}: {
  walletProfileClientQuery: QueryResult<WalletProfileData, WalletProfileVariables>;
}) {
  const { t } = useTranslation('analytics');

  const { watch, control } = useForm({
    defaultValues: {
      walletValueDateRange: DateRangeOption.DAY,
      listingCountDataRange: DateRangeOption.DAY,
      nftsBoughtVsNftsSoldDateRange: DateRangeOption.DAY,
    },
  });

  const portfolioValue = useMemo(() => {
    const total = walletProfileClientQuery.data?.wallet.collectedCollections.reduce(
      (total, current) => total + Number.parseFloat(current.estimatedValue),
      0
    );

    if (!total) {
      return undefined;
    }

    const multiplier = Math.pow(10, 2);
    return Math.round((total * multiplier) / multiplier);
  }, [walletProfileClientQuery.data?.wallet.collectedCollections]);

  const collectedCollectionData = useMemo(
    () =>
      (portfolioValue &&
        walletProfileClientQuery.data?.wallet?.collectedCollections
          .map((c) => ({
            collectionName: c.collection?.name,
            count: c.nftsOwned,
            porfolioValueFraction: c.estimatedValue / portfolioValue,
          }))
          .filter((c) => c.porfolioValueFraction > 0.01)) ||
      [],
    [portfolioValue]
  );

  console.log(collectedCollectionData);

  return (
    <div className="px-10 pt-6 pb-20">
      <Chart.Card
        title={t('profile.walletValueChartTitle')}
        control={control}
        dateRangeId="walletValueDateRange"
        chart={<Chart.LineChart data={walletValueData} />}
      />

      <Chart.Card
        title={t('profile.totalAssetBreakdownChartTitle')}
        control={control}
        chart={
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              layout="vertical"
              data={collectedCollectionData}
              margin={{ top: 24, right: 24, bottom: 24, left: 24 }}
            >
              <CartesianGrid vertical={false} stroke="#262626" />

              <XAxis axisLine={false} dataKey="count" allowDecimals={false} type="number" />
              <YAxis
                tickCount={6}
                axisLine={false}
                type="category"
                width={220}
                dataKey="collectionName"
              />
              <Bar barSize={24} dataKey="count" fill="#36C6B0" />
              <Bar
                barSize={24}
                dataKey="porfolioValueFraction"
                label={CustomizedLabel}
                fill="#8884d8"
              />
            </BarChart>
          </ResponsiveContainer>
        }
      />
      <div className=" grid grid-cols-2 gap-8 py-8">
        <Chart.Card
          title={t('profile.listedCountChartTitle')}
          dateRangeId="listedCountDateRange"
          control={control}
          chart={<Chart.LineChart data={listedCountData} />}
        />

        <Chart.Card
          title={t('profile.nftsBoughtVsNftsSoldChartTitle')}
          dateRangeId="nftsBoughtVsNftsSoldDateRange"
          control={control}
          chart={<Chart.LineChart data={nftsBoughtAndNftsSold} />}
        />
      </div>
    </div>
  );
}
const CustomizedLabel = (props: { x: number; y: number; fill: string; value: number }) => {
  const { x, y, fill, value } = props;
  return (
    <text
      x={x}
      y={y + 14}
      fontSize="14"
      className="font-sans text-white"
      fill={fill}
      textAnchor="start"
    >
      {(value * 100).toFixed(0)}%
    </text>
  );
};

ProfileAnalyticsPage.getLayout = function ProfileAnalyticsLayout({
  children,
  wallet,
}: {
  children: ReactElement;
  wallet: Wallet;
}): JSX.Element {
  return <ProfileLayout wallet={wallet}>{children}</ProfileLayout>;
};

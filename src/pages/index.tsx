import type { NextPage, GetStaticPropsContext } from 'next';
import { useEffect } from 'react';
import { subDays, formatISO, subHours, subMonths, startOfDay } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { SwiperSlide } from 'swiper/react';
import GetHomeQuery from './../queries/home.graphql';
import TrendingCollectionQuery from './../queries/trending.graphql';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { Collection } from '../components/Collection';
import ProfileCard from '../components/ProfileCard';
import { Collection as CollectionType, Wallet } from '../graphql.types';
import Carousel from '../components/Carousel';
import { useWallet } from '@solana/wallet-adapter-react';

import { ArrowUpIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Area, AreaChart } from 'recharts';
import { percentageDifference } from '../modules/number';
import Icon from '../components/Icon';
import { Controller, useForm } from 'react-hook-form';
import { ButtonGroup } from '../components/ButtonGroup';

type FloorData = {
  price: number;
};

interface TrendingCollectionProps {
  name: string;
  image: string;
  floor: number;
  volume: number;
  sales: number;
  marketcap: number;
  address: string;
  floorTrend: FloorData[];
}

function TrendingCollection({
  name,
  image,
  floor,
  volume,
  sales,
  floorTrend,
  address,
}: TrendingCollectionProps) {
  const priceChange = floorTrend[floorTrend.length - 1].price - floorTrend[0].price;
  const priceChangePercentage = percentageDifference(
    floorTrend[0].price,
    floorTrend[floorTrend.length - 1].price
  );
  const trendColor = priceChange >= 0 ? '#12B76A' : '#F04438';
  return (
    <>
      <td>
        <Link href={`/collections/${address}`}>
          <a className="flex flex-row items-center gap-6 py-2 pl-4 lg:pl-0">
            <img
              src={image}
              alt={name}
              className="h-10 w-10 transform rounded-md object-cover duration-500 ease-in-out hover:scale-110"
            />
            <h6 className="transform truncate overflow-ellipsis text-base font-semibold duration-500 ease-in-out hover:scale-105">
              {name}
            </h6>
          </a>
        </Link>
      </td>
      <td className="gap-2 pl-4 lg:pl-0">
        <div className="flex flex-row items-center justify-center gap-2">
          <p className="text-base font-semibold">{floor.toFixed(2)} SOL</p>
          <p
            className={clsx(clsx, 'flex items-center gap-1 text-xs', {
              'text-[#12B76A]': priceChange >= 0,
              'text-[#F04438]': priceChange < 0,
            })}
          >
            <ArrowUpIcon
              className={clsx(clsx, 'h-2 w-2', {
                'rotate-180 transform': priceChange < 0,
                'rotate-0 transform': priceChange >= 0,
              })}
            />
            {priceChangePercentage.toFixed(1)}%
          </p>
        </div>
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="flex flex-row items-center justify-center gap-2">
          <p className="text-base font-semibold">{volume.toFixed(2)}</p>
          <p
            className={clsx(clsx, 'flex items-center gap-1 text-xs', {
              'text-[#12B76A]': priceChange >= 0,
              'text-[#F04438]': priceChange < 0,
            })}
          >
            <ArrowUpIcon
              className={clsx(clsx, 'h-2 w-2', {
                'rotate-180 transform': priceChange < 0,
                'rotate-0 transform': priceChange >= 0,
              })}
            />
            {priceChangePercentage.toFixed(1)}%
          </p>
        </div>
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="flex justify-center">
          <p className="text-base font-normal">{sales}</p>
        </div>
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="flex items-center justify-end">
          <AreaChart
            key={`${address}-collection-trend-chart`}
            width={120}
            height={40}
            data={floorTrend}
          >
            <Area
              dataKey="price"
              stroke={trendColor}
              strokeWidth={1}
              fill={trendColor}
              fillOpacity={0.2}
              type="monotone"
            ></Area>
          </AreaChart>
        </div>
      </td>
    </>
  );
}

function LoadingTrendingCollection() {
  return (
    <>
      <td className="flex flex-row items-center gap-6 py-2 pl-4 lg:pl-0">
        <div className="h-10 w-10 animate-pulse rounded-md bg-gray-800" />
        <div className="h-4 w-36 animate-pulse rounded-md bg-gray-800" />
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="flex justify-center">
          <div className="h-4 w-16 animate-pulse rounded-md bg-gray-800" />
        </div>
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="flex justify-center">
          <div className="h-4 w-12 animate-pulse rounded-md bg-gray-800" />
        </div>
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="flex justify-center">
          <div className="h-4 w-12 animate-pulse rounded-md bg-gray-800" />
        </div>
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="flex justify-end">
          <div className="h-4 w-36 animate-pulse rounded-md bg-gray-800" />
        </div>
      </td>
    </>
  );
}

interface GetHomePageData {
  collectionsFeaturedByVolume: CollectionType[];
  collectionsFeaturedByMarketCap: CollectionType[];
  followWallets: Wallet[];
}

interface TrendingCollectionData {
  collectionsFeaturedByVolume: CollectionType[];
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, [
      'common',
      'home',
      'collection',
      'profile',
    ])),
  },
});

enum DateOption {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

const DEFAULT_DATE_OPTION: DateOption = DateOption.DAY;

const now = new Date();
const nowUTC = formatISO(now);
const dayAgo = subDays(now, 1);
const dayAgoUTC = formatISO(dayAgo);

interface TrendingCollectionForm {
  filter: DateOption;
}

interface TrendingCollectionVariables {
  startDate: string;
  endDate: string;
}

const Home: NextPage = () => {
  const { t } = useTranslation('home');
  const { publicKey } = useWallet();

  const { watch, control } = useForm<TrendingCollectionForm>({
    defaultValues: { filter: DEFAULT_DATE_OPTION },
  });

  const homeQueryResult = useQuery<GetHomePageData>(GetHomeQuery, {
    variables: {
      startDate: dayAgoUTC,
      endDate: nowUTC,
      userWallet: publicKey?.toBase58(),
    },
  });

  const trendingCollectionsQuery = useQuery<TrendingCollectionData, TrendingCollectionVariables>(
    TrendingCollectionQuery,
    {
      variables: {
        startDate: dayAgoUTC,
        endDate: nowUTC,
      },
    }
  );

  useEffect(() => {
    const subscription = watch(({ filter }) => {
      let variables: TrendingCollectionVariables = {
        startDate: dayAgoUTC,
        endDate: nowUTC,
      };
      switch (filter) {
        case DateOption.DAY:
          const dayAgo = subDays(now, 1);
          const dayAgoUTC = formatISO(dayAgo);
          variables.startDate = dayAgoUTC;
          break;
        case DateOption.WEEK:
          const weekAgo = startOfDay(subDays(now, 7));
          const weekAgoUTC = formatISO(weekAgo);
          variables.startDate = weekAgoUTC;
          break;
        case DateOption.MONTH:
          const monthAgo = startOfDay(subMonths(now, 1));
          const monthAgoUTC = formatISO(monthAgo);
          variables.startDate = monthAgoUTC;
          break;
      }

      trendingCollectionsQuery.refetch(variables);
    });
    return subscription.unsubscribe;
  }, [watch, trendingCollectionsQuery]);

  return (
    <>
      <Head>
        <title>{t('metadata.title')}</title>
        <meta name="description" content={t('metadata.description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto px-6 pb-6 lg:px-0">
        <section className="mt-32 flex flex-col items-center justify-items-center gap-4 text-center">
          <h1 className="text-3xl md:text-5xl">
            {t('hero.title')} <span className="text-orange-600 ">{t('hero.title2')}</span>.
          </h1>
          <h2 className="text-xl md:text-2xl">{t('hero.subtitle')}</h2>
        </section>
        <section className="mt-28">
          <header className={'mb-16 flex w-full flex-col justify-between gap-4 md:flex-row'}>
            <h1 className="m-0 text-2xl">{t('trendingCollections.title')}</h1>
            <div className="flex flex-row items-center gap-2">
              <Controller
                control={control}
                name={'filter'}
                render={({ field: { onChange, value } }) => (
                  <ButtonGroup value={value} onChange={onChange}>
                    <ButtonGroup.Option value={DateOption.DAY}>
                      {t('trendingCollections.filters.day')}
                    </ButtonGroup.Option>
                    <ButtonGroup.Option value={DateOption.WEEK}>
                      {t('trendingCollections.filters.week')}
                    </ButtonGroup.Option>
                    <ButtonGroup.Option value={DateOption.MONTH}>
                      {t('trendingCollections.filters.month')}
                    </ButtonGroup.Option>
                  </ButtonGroup>
                )}
              />
            </div>
          </header>
          <div className=" scrollbar-thumb-rounded-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-900 lg:pb-0">
            <table className="w-full table-auto border-spacing-x-24 divide-y divide-gray-800">
              <thead>
                <tr>
                  <th className="pl-4 pb-2 text-left text-xs font-normal text-gray-300">
                    {t('trendingCollections.collection')}
                  </th>
                  <th className="pl-4 pb-2 text-center text-xs font-normal text-gray-300 lg:pl-0">
                    {t('trendingCollections.floor')}
                  </th>
                  <th className="pl-4 pb-2 text-center text-xs font-normal text-gray-300 lg:pl-0">
                    {t('trendingCollections.volume')}
                  </th>
                  <th className="pl-4 pb-2 text-center text-xs font-normal text-gray-300 lg:pl-0">
                    {t('trendingCollections.sales')}
                  </th>
                  <th className="pb-2 text-right text-xs font-normal text-gray-300">
                    {t('trendingCollections.trend')}
                  </th>
                </tr>
              </thead>
              <tbody className="mt-2 divide-y divide-gray-800">
                {trendingCollectionsQuery.loading ? (
                  <>
                    <tr>
                      <LoadingTrendingCollection />
                    </tr>
                    <tr>
                      <LoadingTrendingCollection />
                    </tr>
                    <tr>
                      <LoadingTrendingCollection />
                    </tr>
                    <tr>
                      <LoadingTrendingCollection />
                    </tr>
                  </>
                ) : (
                  trendingCollectionsQuery.data?.collectionsFeaturedByVolume.map(
                    (collection, i) => (
                      <tr key={`collection-${collection.mintAddress}-${i}`}>
                        <TrendingCollection
                          address={collection.nft.mintAddress}
                          key={`collection-${collection.mintAddress}-${i}`}
                          name={collection.nft.name}
                          image={collection.nft.image}
                          floor={collection.floorPrice}
                          volume={collection.volumeTotal}
                          sales={collection.holderCount}
                          marketcap={Number(collection.floorPrice) * Number(collection.nftCount)}
                          floorTrend={[
                            { price: Math.random() * 10 },
                            { price: Math.random() * 50 },
                            { price: Math.random() * 20 },
                            { price: Math.random() * 60 },
                            { price: Math.random() * 40 },
                            { price: Math.random() * 100 },
                            { price: collection.floorPrice }, // TODO: get historical floor data into query
                          ]}
                        />
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="mt-28">
          <header className="mb-4 flex w-full flex-row justify-between border-b border-gray-800">
            <h1 className="mb-2  text-2xl">{t('topVolume.title')}</h1>
          </header>
          {homeQueryResult.loading ? (
            <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Collection.Card.Skeleton />
              <Collection.Card.Skeleton className="hidden sm:inline-block" />
              <Collection.Card.Skeleton className="hidden md:inline-block" />
              <Collection.Card.Skeleton className="hidden lg:inline-block" />
            </div>
          ) : (
            <Carousel
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 4,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 4,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 4,
                },
              }}
              slidesPerView={1}
            >
              {homeQueryResult.data?.collectionsFeaturedByVolume.map((collection) => {
                return (
                  <SwiperSlide key={collection.nft.address} className="p-2">
                    <Link href={`/collections/${collection.nft.mintAddress}/nfts`}>
                      <a>
                        <Collection.Card collection={collection} />
                      </a>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Carousel>
          )}
        </section>
        <section className="mt-28">
          <header className="mb-4 flex w-full flex-row justify-between border-b border-gray-800">
            <h1 className="mb-2 text-2xl">{t('topMarketCap.title')}</h1>
          </header>
          {homeQueryResult.loading ? (
            <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Collection.Card.Skeleton />
              <Collection.Card.Skeleton className="hidden sm:inline-block" />
              <Collection.Card.Skeleton className="hidden md:inline-block" />
              <Collection.Card.Skeleton className="hidden lg:inline-block" />
            </div>
          ) : (
            <Carousel
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 4,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 4,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 4,
                },
              }}
              slidesPerView={1}
            >
              {homeQueryResult.data?.collectionsFeaturedByMarketCap.map((collection) => {
                return (
                  <SwiperSlide key={collection.nft.address} className="p-2">
                    <Link href={`/collections/${collection.nft.mintAddress}/nfts`}>
                      <a>
                        <Collection.Card collection={collection} />
                      </a>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Carousel>
          )}
        </section>
        {/* <section className="mt-28">
          <header className="mb-4 flex w-full flex-row justify-between border-b border-gray-800">
            <h1 className="mb-2 text-2xl">{t('followWallets.title')}</h1>
          </header>
          {homeQueryResult.loading ? (
            <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <ProfileCard.Skeleton />
              <ProfileCard.Skeleton />
              <ProfileCard.Skeleton className="hidden md:inline-block" />
              <ProfileCard.Skeleton className="hidden md:inline-block" />
              <ProfileCard.Skeleton className="hidden lg:inline-block" />
              <ProfileCard.Skeleton className="hidden lg:inline-block" />
            </div>
          ) : (
            <Carousel
              breakpoints={{
                640: {
                  slidesPerView: 1,
                  spaceBetween: 4,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 4,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 4,
                },
              }}
              grid={{
                rows: 2,
                fill: 'row',
              }}
              slidesPerView={1}
              spaceBetween={4}
            >
              {homeQueryResult.data?.followWallets.map((wallet) => {
                return (
                  <SwiperSlide key={wallet.address} className="p-2">
                    <Link href={`/profiles/${wallet.address}/collected`}>
                      <a>
                        <ProfileCard wallet={wallet} />
                      </a>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Carousel>
          )}
        </section> */}
      </main>
    </>
  );
};

export default Home;

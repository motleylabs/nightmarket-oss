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
import { LoadingTrendingCollection, TrendingCollection } from '../components/TrendingCollection';
import { Controller, useForm } from 'react-hook-form';
import { ButtonGroup } from '../components/ButtonGroup';

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
  HOUR = '1hr',
  DAY = '24hr',
  WEEK = '7d',
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
        case DateOption.HOUR:
          const hourAgo = subHours(now, 1);
          const hourAgoUTC = formatISO(hourAgo);
          variables.startDate = hourAgoUTC;
          break;
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
          <h1 className="text-3xl md:text-5xl">{t('hero.title')}</h1>
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
                    <ButtonGroup.Option value={DateOption.HOUR}>
                      {t('trendingCollections.filters.hour')}
                    </ButtonGroup.Option>
                    <ButtonGroup.Option value={DateOption.DAY}>
                      {t('trendingCollections.filters.day')}
                    </ButtonGroup.Option>
                    <ButtonGroup.Option value={DateOption.WEEK}>
                      {t('trendingCollections.filters.week')}
                    </ButtonGroup.Option>
                  </ButtonGroup>
                )}
              />
            </div>
          </header>
          <div className=" scrollbar-thumb-rounded-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-900 lg:pb-0">
            <table className="w-full table-auto border-spacing-x-24">
              <thead>
                <tr>
                  <th className="border-b border-gray-800 pl-4 pb-2 text-left text-xs font-normal text-gray-300">
                    {t('trendingCollections.collection')}
                  </th>
                  <th className="border-b border-gray-800 pl-4 pb-2 text-left text-xs font-normal text-gray-300 lg:pl-0">
                    {t('trendingCollections.floor')}
                  </th>
                  <th className="border-b border-gray-800 pl-4 pb-2 text-left text-xs font-normal text-gray-300 lg:pl-0">
                    {t('trendingCollections.volume')}
                  </th>
                  <th className="border-b border-gray-800 pl-4 pb-2 text-left text-xs font-normal text-gray-300 lg:pl-0">
                    {t('trendingCollections.sales')}
                  </th>
                  <th className="border-b border-gray-800 pl-4 pb-2 text-left text-xs font-normal text-gray-300 lg:pl-0">
                    {t('trendingCollections.marketcap')}
                  </th>
                  <th className="border-b border-gray-800 pl-4 pb-2 text-left text-xs font-normal text-gray-300 lg:pl-0">
                    {t('trendingCollections.trend')}
                  </th>
                </tr>
              </thead>
              <tbody className="mt-2">
                {trendingCollectionsQuery.loading ? (
                  <>
                    <tr className="border-b border-gray-800">
                      <LoadingTrendingCollection />
                    </tr>
                    <tr className="border-b border-gray-800">
                      <LoadingTrendingCollection />
                    </tr>
                    <tr className="border-b border-gray-800">
                      <LoadingTrendingCollection />
                    </tr>
                    <tr className="border-b border-gray-800">
                      <LoadingTrendingCollection />
                    </tr>
                  </>
                ) : (
                  trendingCollectionsQuery.data?.collectionsFeaturedByVolume.map(
                    (collection, i) => (
                      <tr
                        className="border-b border-gray-800"
                        key={`collection-${collection.mintAddress}-${i}`}
                      >
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
        <section className="mt-28">
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
        </section>
      </main>
    </>
  );
};

export default Home;

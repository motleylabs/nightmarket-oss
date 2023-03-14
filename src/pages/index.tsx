import type { NextPage, GetStaticPropsContext } from 'next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import TrendingCollectionQuery from './../queries/trending.graphql';
import PayoutsQuery from './../queries/payouts.graphql';
import { useQuery } from '@apollo/client';
import { Collection } from '../components/Collection';
import {
  CollectionInterval,
  CollectionSort,
  CollectionTrend,
  OrderDirection,
  Maybe,
  AuctionHouse,
  Nft,
} from '../graphql.types';
import { useWallet } from '@solana/wallet-adapter-react';
import Hero from '../components/Hero';
import Icon from '../components/Icon';
import Img from '../components/Image';
import { Controller, useForm } from 'react-hook-form';
import { ButtonGroup } from '../components/ButtonGroup';
import Select from '../components/Select';
import Button, {
  ButtonBackground,
  ButtonBorder,
  ButtonColor,
  ButtonSize,
} from '../components/Button';
import useLogin from '../hooks/login';
import Router from 'next/router';
import Drop from '../components/Drop';
import { addDays } from 'date-fns';
import Link from 'next/link';
import config from '../app.config';
import Banner from '../components/Banner';

interface TrendingCollectionsData {
  collectionTrends: CollectionTrend[];
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => {
  const i18n = await serverSideTranslations(locale as string, [
    'common',
    'home',
    'collection',
    'profile',
    'launchpad',
    'referrals',
  ]);

  return {
    props: {
      ...i18n,
    },
  };
};

interface TrendingCollectionForm {
  filter: CollectionInterval;
  sort: CollectionSort;
}

interface TrendingCollectionsVariables {
  sortBy: CollectionSort;
  timeFrame: CollectionInterval;
  orderDirection: OrderDirection;
  offset: number;
}

interface PayoutsData {
  auctionHouse: AuctionHouse;
}

interface PayoutsVariables {
  address: String;
  limit: number;
  offset: number;
}

interface SelectedTrend {
  listedCount: Maybe<string> | undefined;
  listedCountChange: Maybe<number> | undefined;
  volume: Maybe<string> | undefined;
  volumeChange: Maybe<number> | undefined;
  floorPrice: Maybe<string> | undefined;
  floorPriceChange: Maybe<number> | undefined;
}

interface SortOption {
  label: string;
  value: CollectionSort;
}

const DEFAULT_TIME_FRAME: CollectionInterval = CollectionInterval.OneDay;
const DEFAULT_SORT: CollectionSort = CollectionSort.Volume;
const DEFAULT_ORDER: OrderDirection = OrderDirection.Desc;

const Home: NextPage = () => {
  const [loadingMoreTrends, setLoadingMoreTrends] = useState(false);
  const { t } = useTranslation(['home', 'collection']);
  const [hasMoreTrends, setHasMoreTrends] = useState(true);

  const sortOptions: SortOption[] = useMemo(
    () => [
      {
        value: CollectionSort.Volume,
        label: t('trendingCollectionsSort.byVolumeTraded', { ns: 'collection' }),
      },
      {
        value: CollectionSort.Floor,
        label: t('trendingCollectionsSort.byFloorPrice', { ns: 'collection' }),
      },
      {
        value: CollectionSort.NumberListed,
        label: t('trendingCollectionsSort.byListingsCount', { ns: 'collection' }),
      },
    ],
    [t]
  );

  const { publicKey, connected } = useWallet();
  const trendingCollectionsRef = useRef<null | HTMLDivElement>(null);
  const onLogin = useLogin();

  const { watch, control } = useForm<TrendingCollectionForm>({
    defaultValues: { filter: DEFAULT_TIME_FRAME, sort: DEFAULT_SORT },
  });

  const timeFrame = watch('filter');

  const payoutsQuery = useQuery<PayoutsData, PayoutsVariables>(PayoutsQuery, {
    variables: {
      address: config.auctionHouse as string,
      limit: 3,
      offset: 0,
    },
  });

  payoutsQuery.startPolling(10_000);

  const trendingCollectionsQuery = useQuery<TrendingCollectionsData, TrendingCollectionsVariables>(
    TrendingCollectionQuery,
    {
      variables: {
        sortBy: DEFAULT_SORT,
        timeFrame: DEFAULT_TIME_FRAME,
        orderDirection: DEFAULT_ORDER,
        offset: 0,
      },
    }
  );

  const onShowMoreTrends = async () => {
    if (!hasMoreTrends) return;
    setLoadingMoreTrends(true);
    const {
      data: { collectionTrends },
    } = await trendingCollectionsQuery.fetchMore({
      variables: {
        offset: trendingCollectionsQuery.data?.collectionTrends.length ?? 0,
      },
    });
    setLoadingMoreTrends(false);
    setHasMoreTrends(collectionTrends && collectionTrends.length >= 0);
  };

  const onExploreNftsClick = () => {
    trendingCollectionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSellNftsClick = () => {
    if (connected && publicKey) {
      Router.push(`/profiles/${publicKey}`);
    } else {
      onLogin();
    }
  };

  useEffect(() => {
    const subscription = watch(({ filter, sort }) => {
      let variables: TrendingCollectionsVariables = {
        sortBy: sort ?? DEFAULT_SORT,
        timeFrame: filter ?? DEFAULT_TIME_FRAME,
        orderDirection: DEFAULT_ORDER,
        offset: 0,
      };

      trendingCollectionsQuery.refetch(variables);
    });
    return subscription.unsubscribe;
  }, [timeFrame, trendingCollectionsQuery, watch]);

  return (
    <>
      <Head>
        <title>{t('metadata.title', { ns: 'home' })}</title>
        <meta name="description" content={t('metadata.description', { ns: 'home' })} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto px-4 xl:px-24">
        <Hero>
          <Hero.Main>
            <Hero.Title>{t('hero.title', { ns: 'home' })}</Hero.Title>
            <Hero.SubTitle>{t('hero.subtitle', { ns: 'home' })}</Hero.SubTitle>
            <Hero.Actions>
              <Button
                className="w-full md:w-auto"
                color={ButtonColor.White}
                background={ButtonBackground.Gradient}
                onClick={onExploreNftsClick}
              >
                {t('hero.exploreNfts', { ns: 'home' })}
              </Button>
              <Button
                className="w-full md:w-auto"
                block
                background={ButtonBackground.Black}
                border={ButtonBorder.Gradient}
                color={ButtonColor.Gradient}
                onClick={onSellNftsClick}
              >
                {t('hero.sellNfts', { ns: 'home' })}
              </Button>
            </Hero.Actions>
          </Hero.Main>
          <Hero.Aside
            loading={payoutsQuery.loading}
            payouts={payoutsQuery.data?.auctionHouse.rewardCenter?.payouts}
          />
        </Hero>

        <section>
          <Banner />
        </section>
        <section className="mt-28 scroll-mt-20" ref={trendingCollectionsRef}>
          <header className="mb-10 flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
            <h1 className="m-0 font-serif text-2xl">
              {t('trendingCollections.title', { ns: 'home' })}
            </h1>
            <div className="flex flex-row items-center gap-4">
              <Controller
                control={control}
                name="filter"
                render={({ field: { onChange, value } }) => (
                  <ButtonGroup value={value} onChange={onChange}>
                    <ButtonGroup.Option value={CollectionInterval.OneDay}>
                      {t('timeInterval.day', { ns: 'collection' })}
                    </ButtonGroup.Option>
                    <ButtonGroup.Option value={CollectionInterval.SevenDay}>
                      {t('timeInterval.week', { ns: 'collection' })}
                    </ButtonGroup.Option>
                    <ButtonGroup.Option value={CollectionInterval.ThirtyDay}>
                      {t('timeInterval.month', { ns: 'collection' })}
                    </ButtonGroup.Option>
                  </ButtonGroup>
                )}
              />
              <div className="hidden sm:w-48 lg:block">
                <Controller
                  control={control}
                  name="sort"
                  render={({ field: { onChange, value } }) => (
                    <Select value={value} onChange={onChange} options={sortOptions} />
                  )}
                />
              </div>
            </div>
          </header>
          <Collection.List>
            {trendingCollectionsQuery.loading ? (
              <>
                <Collection.List.Loading />
                <Collection.List.Loading />
                <Collection.List.Loading />
                <Collection.List.Loading />
                <Collection.List.Loading />
                <Collection.List.Loading />
              </>
            ) : (
              trendingCollectionsQuery.data?.collectionTrends.map((trend, i) => {
                let selectedTrend: SelectedTrend;
                let volumeLabel: string;

                switch (timeFrame) {
                  case CollectionInterval.OneDay:
                    selectedTrend = {
                      floorPrice: trend.compactFloor1d,
                      floorPriceChange: trend.changeFloor1d,
                      volume: trend.compactVolume1d,
                      volumeChange: trend.changeVolume1d,
                      listedCount: trend.compactListed1d,
                      listedCountChange: trend.changeListed7d,
                    };
                    volumeLabel = t('24hVolume', { ns: 'collection' });
                    break;
                  case CollectionInterval.SevenDay:
                    selectedTrend = {
                      floorPrice: trend.compactFloor7d,
                      floorPriceChange: trend.changeFloor7d,
                      volume: trend.compactVolume7d,
                      volumeChange: trend.changeVolume7d,
                      listedCount: trend.compactListed7d,
                      listedCountChange: trend.changeListed7d,
                    };
                    volumeLabel = t('7dVolume', { ns: 'collection' });
                    break;
                  case CollectionInterval.ThirtyDay:
                    selectedTrend = {
                      floorPrice: trend.compactFloor30d,
                      floorPriceChange: trend.changeFloor30d,
                      volume: trend.compactVolume30d,
                      volumeChange: trend.changeVolume30d,
                      listedCount: trend.compactListed30d,
                      listedCountChange: trend.changeListed30d,
                    };
                    volumeLabel = t('30dVolume', { ns: 'collection' });
                    break;
                }

                return (
                  <Collection.List.Row key={trend.collection?.id}>
                    <Link
                      className="flex w-full items-center justify-start gap-4 rounded-2xl xl:gap-8"
                      href={`/collections/[id]`}
                      as={`/collections/${trend.collection?.id}`}
                    >
                      <Collection.List.Col className="flex-none">
                        <Img
                          fallbackSrc="/images/moon.svg"
                          src={trend.collection?.image}
                          alt={trend.collection?.name}
                          className="relative aspect-square w-16 rounded-lg object-cover md:w-20"
                        />
                      </Collection.List.Col>
                      <Collection.List.Col className="flex w-full flex-col justify-start gap-2 py-1 md:flex-row md:items-center xl:gap-8">
                        <div className="w-full line-clamp-2 md:w-24 xl:w-36">
                          {trend.collection?.name}
                        </div>
                        <div className="flex gap-1  lg:justify-start lg:gap-4">
                          <Collection.List.DataPoint
                            value={selectedTrend.floorPrice}
                            icon={<Icon.Sol />}
                            name={t('globalFloor', { ns: 'collection' })}
                            status={
                              <Collection.List.DataPoint.Status
                                value={selectedTrend.floorPriceChange}
                              />
                            }
                          />
                          <Collection.List.DataPoint
                            value={selectedTrend.volume}
                            icon={<Icon.Sol />}
                            name={volumeLabel}
                            status={
                              <Collection.List.DataPoint.Status
                                value={selectedTrend.volumeChange}
                              />
                            }
                          />
                          <Collection.List.DataPoint
                            value={selectedTrend.listedCount}
                            name={t('listings', { ns: 'collection' })}
                            status={
                              <Collection.List.DataPoint.Status
                                value={selectedTrend.listedCountChange}
                              />
                            }
                          />
                        </div>
                      </Collection.List.Col>
                    </Link>
                    <Collection.List.Col className="flex w-full gap-2 md:w-auto lg:gap-4">
                      <Collection.List.NftPreview collection={trend.collection?.id} />
                    </Collection.List.Col>
                  </Collection.List.Row>
                );
              })
            )}
          </Collection.List>
          <Button
            className="mx-auto mt-8"
            onClick={onShowMoreTrends}
            background={ButtonBackground.Black}
            border={ButtonBorder.Gradient}
            color={ButtonColor.Gradient}
            loading={loadingMoreTrends}
            disabled={loadingMoreTrends}
          >
            {t('showMoreCollections', { ns: 'collection' })}
          </Button>
        </section>
        <section className="mt-16 scroll-mt-20 md:mt-28">
          <header className="mb-4 flex w-full flex-row justify-between gap-4 md:mb-12">
            <h1 className="m-0 font-serif text-2xl">{t('drops.title', { ns: 'home' })}</h1>
          </header>
          <div className="flex flex-col items-center justify-start gap-12 lg:flex-row">
            <Drop
              launchDate={addDays(new Date(), 3)}
              title="Motley Friends"
              description={t('drops.motley', { ns: 'home' })}
              price={'TBD'}
              supply={10000}
              image={'/images/launchpad/motley-launchpad-nft.png'}
              link={'/launchpad/test'}
            />
            <div className="flex w-full flex-col items-center justify-center gap-4 text-center">
              <h4 className="text-xl font-semibold">
                {t('drops.moreLaunchesTitle', { ns: 'home' })}
              </h4>
              <p>{t('drops.moreLaunchesDescription', { ns: 'home' })}</p>
              <a
                href="https://share.hsforms.com/18ted9lQUTVS2kHj8HtuZswe31d7"
                target={'_blank'}
                rel="noreferrer"
              >
                <Button
                  background={ButtonBackground.Black}
                  border={ButtonBorder.Gradient}
                  size={ButtonSize.Large}
                  color={ButtonColor.Gradient}
                >
                  {t('drops.launchButton', { ns: 'home' })}
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      {/* Report Banner in Footer */}
      {/* <section className="mx-6 mb-28 hidden items-center justify-around gap-2 rounded-2xl bg-gradient-primary py-12 px-4 lg:mx-10 lg:flex lg:px-16">
        <div className="flex items-center gap-4">
          <span className="text-4xl text-white xl:text-6xl">{'47,241'}</span>
          <span className="w-52 text-sm text-white xl:text-base">
            {t('report.sauceDistributedToUsers', { ns: 'home' })}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-4xl text-white xl:text-6xl">{'47,241'}</span>
          <span className="w-52 text-sm text-white xl:text-base">
            {t('report.solDistributedToSauceHolders', { ns: 'home', sol: '124,023' })}
          </span>
        </div>
        <Button border={ButtonBorder.White}>{t('report.learnMore', { ns: 'home' })}</Button>
      </section> */}
    </>
  );
};

export default Home;

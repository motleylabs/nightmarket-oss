import type { NextPage, GetStaticPropsContext } from 'next';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import TrendingCollectionQuery from './../queries/trending.graphql';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { Collection } from '../components/Collection';
import {
  CollectionInterval,
  CollectionSort,
  CollectionTrend,
  OrderDirection,
  Maybe,
} from '../graphql.types';
import { useWallet } from '@solana/wallet-adapter-react';
import Hero from '../components/Hero';
import Icon from '../components/Icon';
import { Controller, useForm } from 'react-hook-form';
import { ButtonGroup } from '../components/ButtonGroup';
import Select from '../components/Select';
import config from '../app.config';
import Button, { ButtonBackground, ButtonBorder, ButtonColor, ButtonSize } from '../components/Button';
import useLogin from '../hooks/login';
import Router from 'next/router';
import Footer from '../components/Footer';
import Drop from '../components/Drop';

interface TrendingCollectionData {
  collectionTrends: CollectionTrend[];
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, [
      'common',
      'home',
      'collection',
      'profile',
      'launchpad',
    ])),
  },
});

interface TrendingCollectionForm {
  filter: CollectionInterval;
  sort: SortOption;
}

interface TrendingCollectionVariables {
  sortBy: CollectionSort;
  timeFrame: CollectionInterval;
  orderDirection: OrderDirection;
  offset: number;
}

interface SelectedTrend {
  salesCount: Maybe<string> | undefined;
  volume: Maybe<string> | undefined;
  volumeChange: number;
  floorPrice: Maybe<string> | undefined;
  floorPriceChange: number;
}

interface SortOption {
  label: string;
  value: CollectionSort;
}

const DEFAULT_TIME_FRAME: CollectionInterval = CollectionInterval.OneDay;
const DEFAULT_SORT: CollectionSort = CollectionSort.Volume;
const DEFAULT_ORDER: OrderDirection = OrderDirection.Desc;

const Home: NextPage = () => {
  const { t } = useTranslation(['home', 'collection']);

  const sortOptions: SortOption[] = [
    {
      value: CollectionSort.Volume,
      label: t('collection:trendingCollectionsSort.byVolumeTraded'),
    },
    {
      value: CollectionSort.Floor,
      label: t('collection:trendingCollectionsSort.byFloorPrice'),
    },
  ];
  const { publicKey, connected } = useWallet();
  const trendingCollectionsRef = useRef<null | HTMLDivElement>(null);
  const onLogin = useLogin();

  const { watch, control } = useForm<TrendingCollectionForm>({
    defaultValues: { filter: DEFAULT_TIME_FRAME, sort: sortOptions[0] },
  });

  const timeFrame = watch('filter');

  const trendingCollectionsQuery = useQuery<TrendingCollectionData, TrendingCollectionVariables>(
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

  const onShowMoreTrends = () => {
    trendingCollectionsQuery.fetchMore({
      variables: {
        ...trendingCollectionsQuery.variables,
        offset: trendingCollectionsQuery.data?.collectionTrends.length ?? 0,
      },
    });
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
      let variables: TrendingCollectionVariables = {
        sortBy: sort?.value!,
        timeFrame: filter!,
        orderDirection: DEFAULT_ORDER,
        offset: 0,
      };

      trendingCollectionsQuery.refetch(variables);
    });
    return subscription.unsubscribe;
  }, [watch, trendingCollectionsQuery]);

  const nfts: any[] = [];

  return (
    <>
      <Head>
        <title>{t('metadata.title')}</title>
        <meta name="description" content={t('metadata.description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" mx-auto px-6 pb-28 md:px-20">
        <Hero>
          <Hero.Main>
            <Hero.Title>{t('hero.title')}</Hero.Title>
            <Hero.SubTitle>{t('hero.subtitle')}</Hero.SubTitle>
            <Hero.Actions>
              <Button className="w-full md:w-auto" onClick={onExploreNftsClick}>
                {t('hero.exploreNfts')}
              </Button>
              <Button
                className="w-full md:w-auto"
                block
                background={ButtonBackground.Black}
                border={ButtonBorder.Gradient}
                color={ButtonColor.Gradient}
                onClick={onSellNftsClick}
              >
                {t('hero.sellNfts')}
              </Button>
            </Hero.Actions>
          </Hero.Main>
          <Hero.Aside>
            <Hero.Preview
              imgUrlTemp="https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149611030.jpg?w=2000"
              nft={nfts[0]}
              className="absolute bottom-0 right-1/2 z-10 -mr-16 lg:-mr-24"
              hPosition="left"
              vPosition="bottom"
            />
            <Hero.Preview
              imgUrlTemp="https://metadata.degods.com/g/3097.png"
              nft={nfts[0]}
              className="absolute bottom-1/2 left-0 -mb-14 lg:-mb-4"
              hPosition="left"
              vPosition="top"
            />
            <Hero.Preview
              imgUrlTemp="https://assets.holaplex.tools/ipfs/bafybeickme6bmkora47xisln47mz5wckpcx7pjvotouo37dpkdyzcznxvm?width=400&path=2503.png"
              nft={nfts[0]}
              className="absolute bottom-1/2 right-0 -mb-20 lg:-mb-14"
              hPosition="right"
              vPosition="bottom"
            />
          </Hero.Aside>
        </Hero>
        <section className="mt-28 scroll-mt-20">
          <header className="mb-12 flex w-full flex-row justify-between gap-4">
            <h1 className="m-0 font-serif text-2xl">{t('drops.title')}</h1>
          </header>
          <div className="flex flex-col items-center justify-start gap-12 md:flex-row">
            <Drop
              title={'Team Motley'}
              description={
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi'
              }
              price={128}
              supply={10000}
              image={'/images/launchpad/motley-launchpad-nft.png'}
              link={'/launchpad/test'}
            />
            <div className="flex w-full flex-col items-center justify-center gap-4 text-center">
              <h4 className="text-xl font-semibold">{t('drops.more')}</h4>
              <p>
                Labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi
              </p>
              <Button background={ButtonBackground.Black} border={ButtonBorder.Gradient} size={ButtonSize.Large}>
                {t('drops.launchButton')}
              </Button>
            </div>
          </div>
        </section>
        <section className="mt-28 scroll-mt-20" ref={trendingCollectionsRef}>
          <header className={'mb-16 flex w-full flex-col justify-between gap-4 md:flex-row'}>
            <h1 className="m-0 font-serif text-2xl">{t('trendingCollections.title')}</h1>
            <div className="flex flex-row items-center gap-2">
              <Controller
                control={control}
                name="filter"
                render={({ field: { onChange, value } }) => (
                  <ButtonGroup value={value} onChange={onChange}>
                    <ButtonGroup.Option value={CollectionInterval.OneDay}>
                      {t('collection:timeInterval.day')}
                    </ButtonGroup.Option>
                    <ButtonGroup.Option value={CollectionInterval.SevenDay}>
                      {t('collection:timeInterval.week')}
                    </ButtonGroup.Option>
                    <ButtonGroup.Option value={CollectionInterval.ThirtyDay}>
                      {t('collection:timeInterval.month')}
                    </ButtonGroup.Option>
                  </ButtonGroup>
                )}
              />
              <div className="hidden flex-grow sm:w-48 sm:flex-grow-0 lg:block">
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
              </>
            ) : (
              trendingCollectionsQuery.data?.collectionTrends.map((trend, i) => {
                let selectedTrend: SelectedTrend;
                let volumeLabel: string;

                switch (timeFrame) {
                  case CollectionInterval.OneDay:
                    selectedTrend = {
                      floorPrice: trend.compactFloorPrice,
                      floorPriceChange: trend.oneDayFloorPriceChange,
                      volume: trend.compactOneDayVolume,
                      volumeChange: trend.oneDayVolumeChange,
                      salesCount: trend.compactOneDaySalesCount,
                    };
                    volumeLabel = t('collection:24hVolume');
                    break;
                  case CollectionInterval.SevenDay:
                    selectedTrend = {
                      floorPrice: trend.compactFloorPrice,
                      floorPriceChange: trend.sevenDayFloorPriceChange,
                      volume: trend.compactSevenDayVolume,
                      volumeChange: trend.sevenDayVolumeChange,
                      salesCount: trend.compactSevenDaySalesCount,
                    };
                    volumeLabel = t('collection:7dVolume');
                    break;
                  case CollectionInterval.ThirtyDay:
                    selectedTrend = {
                      floorPrice: trend.compactFloorPrice,
                      floorPriceChange: trend.thirtyDayFloorPriceChange,
                      volume: trend.compactThirtyDayVolume,
                      volumeChange: trend.thirtyDayVolumeChange,
                      salesCount: trend.compactThirtyDaySalesCount,
                    };
                    volumeLabel = t('collection:30dVolume');
                    break;
                }

                if (trend.collection) {
                  return (
                    <Collection.List.Row mindAddress={trend.collection.nft.mintAddress}>
                      <Collection.List.Col className="flex-none">
                        <img
                          src={trend.collection.nft.image}
                          alt={trend.collection.nft.name}
                          className="relative aspect-square w-16 rounded-lg object-cover md:w-12"
                        />
                      </Collection.List.Col>
                      <Collection.List.Col className="flex w-full flex-col justify-between gap-2 py-1 md:flex-row md:items-center lg:gap-8">
                        <div className="w-32 lg:w-40">{trend.collection.nft.name}</div>
                        <div className="flex lg:w-96 lg:justify-between lg:gap-8">
                          <Collection.List.DataPoint
                            value={trend.compactFloorPrice}
                            icon={<Icon.Sol />}
                            name={t('collection:globalFloor')}
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
                            value={'10'}
                            name={t('collection:listings')}
                            status={<Collection.List.DataPoint.Status value={5} />}
                          />
                        </div>
                        {/* TODO: Add real data */}
                        <div className="flex gap-4">
                          <div className="hidden gap-4 lg:flex">
                            <Collection.List.ShowcaseNft
                              image="https://www.thismorningonchain.com/content/images/2022/01/solana-opensea-degenerate-ape.png"
                              name="abc"
                              price={26}
                            />
                            <Collection.List.ShowcaseNft
                              image="https://miro.medium.com/max/503/1*WeVD3wTaKIeFigDiEX6fhg.png"
                              name="abc"
                              price={26}
                            />
                            <Collection.List.ShowcaseNft
                              image="https://pbs.twimg.com/media/E-JerziXoAQHCIN.jpg"
                              name="abc"
                              price={26}
                            />
                          </div>
                          <div className="hidden gap-4 xl:flex">
                            <Collection.List.ShowcaseNft
                              image="https://www.thismorningonchain.com/content/images/2022/01/solana-opensea-degenerate-ape.png"
                              name="abc"
                              price={26}
                            />
                            <Collection.List.ShowcaseNft
                              image="https://miro.medium.com/max/503/1*WeVD3wTaKIeFigDiEX6fhg.png"
                              name="abc"
                              price={26}
                            />
                            <Collection.List.ShowcaseNft
                              image="https://pbs.twimg.com/media/E-JerziXoAQHCIN.jpg"
                              name="abc"
                              price={26}
                            />
                          </div>
                        </div>
                      </Collection.List.Col>
                    </Collection.List.Row>
                  );
                }
              })
            )}
          </Collection.List>
          <Button
            className="mx-auto mt-12"
            onClick={onShowMoreTrends}
            background={ButtonBackground.Black}
            border={ButtonBorder.Gradient}
            color={ButtonColor.Gradient}
          >
            {t('collection:showMoreCollections')}
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Home;

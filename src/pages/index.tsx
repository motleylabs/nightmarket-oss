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
  const [loadingMore, setLoadingMore] = useState(false);
  const { t } = useTranslation(['home', 'collection']);

  const sortOptions: SortOption[] = useMemo(
    () => [
      {
        value: CollectionSort.Volume,
        label: t('collection:trendingCollectionsSort.byVolumeTraded'),
      },
      {
        value: CollectionSort.Floor,
        label: t('collection:trendingCollectionsSort.byFloorPrice'),
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
  const sortType = watch('sort');

  // const payoutsQuery = useQuery<PayoutsData, PayoutsVariables>(PayoutsQuery, {
  //   variables: {
  //     address: config.auctionHouse as string,
  //     limit: 3,
  //     offset: 0,
  //   },
  //   pollInterval: 10_000,
  // });

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
    setLoadingMore(true);
    await trendingCollectionsQuery.fetchMore({
      variables: {
        offset: trendingCollectionsQuery.data?.collectionTrends.length ?? 0,
      },
    });
    setLoadingMore(false);
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
    let variables: TrendingCollectionsVariables = {
      sortBy: sortType,
      timeFrame: timeFrame,
      orderDirection: DEFAULT_ORDER,
      offset: 0,
    };

    trendingCollectionsQuery.refetch(variables);
  }, [sortType, timeFrame, trendingCollectionsQuery]);

  return (
    <>
      <Head>
        <title>{t('metadata.title')}</title>
        <meta name="description" content={t('metadata.description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto px-4 pb-28 xl:px-24">
        <Hero>
          <Hero.Main>
            <Hero.Title>{t('hero.title')}</Hero.Title>
            <Hero.SubTitle>{t('hero.subtitle')}</Hero.SubTitle>
            <Hero.Actions>
              <Button
                className="w-full md:w-auto"
                color={ButtonColor.White}
                background={ButtonBackground.Gradient}
                onClick={onExploreNftsClick}
              >
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
          <Hero.Aside
            payouts={
              // payoutsQuery.data?.auctionHouse.rewardCenter?.payouts
              []
            }
          />
        </Hero>
        <section className="mt-16 scroll-mt-20 md:mt-28">
          <header className="mb-4 flex w-full flex-row justify-between gap-4 md:mb-12">
            <h1 className="m-0 font-serif text-2xl">{t('drops.title')}</h1>
          </header>
          <div className="flex flex-col items-center justify-start gap-12 lg:flex-row">
            <Drop
              launchDate={addDays(new Date(), 3)}
              title={'Motley Friends'}
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
              <a
                href="https://form.asana.com/?k=mgC3AlQRa_n7LjlmpIBF1w&d=1202851511866932"
                target={'_blank'}
                rel="noreferrer"
              >
                <Button
                  background={ButtonBackground.Black}
                  border={ButtonBorder.Gradient}
                  size={ButtonSize.Large}
                  color={ButtonColor.Gradient}
                >
                  {t('drops.launchButton')}
                </Button>
              </a>
            </div>
          </div>
        </section>
        <section className="mt-28 scroll-mt-20" ref={trendingCollectionsRef}>
          <header className="mb-10 flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
            <h1 className="m-0 font-serif text-2xl">{t('trendingCollections.title')}</h1>
            <div className="flex flex-row items-center gap-4">
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
                    volumeLabel = t('collection:24hVolume');
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
                    volumeLabel = t('collection:7dVolume');
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
                    volumeLabel = t('collection:30dVolume');
                    break;
                }

                return (
                  <Collection.List.Row key={trend.collection?.id}>
                    <Link href={`/collections/${trend.collection?.id}`}>
                      <a className="flex w-full items-center justify-start gap-4 rounded-2xl xl:gap-8">
                        <Collection.List.Col className="flex-none">
                          <img
                            src={trend.collection?.image}
                            alt={trend.collection?.name}
                            className="relative aspect-square w-16 rounded-lg object-cover md:w-20"
                          />
                        </Collection.List.Col>
                        <Collection.List.Col className="flex w-full flex-col justify-start gap-2 py-1 md:flex-row md:items-center xl:gap-8">
                          <div className="w-full line-clamp-2 md:w-24 xl:w-36">
                            {trend.collection?.name}
                          </div>
                          <div className="flex gap-1  lg:justify-start lg:gap-8">
                            <Collection.List.DataPoint
                              value={selectedTrend.floorPrice}
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
                              value={selectedTrend.listedCount}
                              name={t('collection:listings')}
                              status={
                                <Collection.List.DataPoint.Status
                                  value={selectedTrend.listedCountChange}
                                />
                              }
                            />
                          </div>
                        </Collection.List.Col>
                      </a>
                    </Link>
                    <Collection.List.Col className="hidden gap-4 md:flex">
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
            loading={loadingMore}
            disabled={loadingMore}
          >
            {t('collection:showMoreCollections')}
          </Button>
        </section>
      </main>
      <footer className=" bg-gray-900 py-20 px-6">
        <div className="container mx-auto grid grid-cols-2 items-center gap-4 md:grid-cols-3 ">
          <div>
            {/* Logos */}
            <Link href="/" passHref>
              <a className="flex flex-row gap-2 whitespace-nowrap pb-6 text-2xl font-bold">
                <img
                  src="/images/nightmarket-stacked.svg"
                  className="h-8 w-auto object-fill md:h-20"
                  alt="night market logo"
                />
              </a>
            </Link>
            <div>
              <svg
                width="176"
                height="24"
                viewBox="0 0 176 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.792 18V13.864H5.776C5.992 13.864 6.36 13.848 6.664 13.8C8.584 13.496 9.552 12.04 9.552 10.168C9.552 8.304 8.592 6.84 6.664 6.544C6.36 6.496 6 6.48 5.776 6.48H1.12V18H2.792ZM2.792 8.056H5.712C5.92 8.056 6.2 8.072 6.44 8.136C7.464 8.376 7.848 9.32 7.848 10.168C7.848 11.016 7.464 11.96 6.44 12.208C6.2 12.264 5.92 12.28 5.712 12.28H2.792V8.056ZM14.7939 18.24C17.3699 18.24 19.0339 16.376 19.0339 13.672C19.0339 11 17.3859 9.12 14.7939 9.12C12.2499 9.12 10.5619 10.968 10.5619 13.672C10.5619 16.352 12.2019 18.24 14.7939 18.24ZM14.7939 16.664C13.1779 16.664 12.3379 15.496 12.3379 13.672C12.3379 11.912 13.1139 10.696 14.7939 10.696C16.4259 10.696 17.2579 11.864 17.2579 13.672C17.2579 15.44 16.4419 16.664 14.7939 16.664ZM23.6634 18L25.6874 11.744L27.7034 18H29.0474L31.6874 9.36H30.0394L28.2314 15.288L26.4074 9.36H24.9674L23.1434 15.288L21.3354 9.36L19.6794 9.352L22.3194 18H23.6634ZM40.5595 14.152C40.7355 11.056 39.1995 9.12 36.5595 9.12C34.0315 9.12 32.3275 10.92 32.3275 13.752C32.3275 16.424 34.0555 18.24 36.6395 18.24C38.3115 18.24 39.7755 17.352 40.4475 15.808L38.8075 15.288C38.3835 16.176 37.5995 16.664 36.5595 16.664C35.1035 16.664 34.2555 15.76 34.1195 14.152H40.5595ZM36.6235 10.6C37.9515 10.6 38.6715 11.32 38.8475 12.848H34.1595C34.3755 11.384 35.1995 10.6 36.6235 10.6ZM44.6424 9.848C44.3144 10.064 44.0424 10.376 43.8424 10.736V9.36H42.3544V18H44.0424V13.64C44.0424 12.624 44.3144 11.712 45.1304 11.192C45.7064 10.824 46.4584 10.776 47.0184 10.928V9.36C46.2424 9.216 45.2904 9.368 44.6424 9.848ZM56.1376 14.152C56.3136 11.056 54.7776 9.12 52.1376 9.12C49.6096 9.12 47.9056 10.92 47.9056 13.752C47.9056 16.424 49.6336 18.24 52.2176 18.24C53.8896 18.24 55.3536 17.352 56.0256 15.808L54.3856 15.288C53.9616 16.176 53.1776 16.664 52.1376 16.664C50.6816 16.664 49.8336 15.76 49.6976 14.152H56.1376ZM52.2016 10.6C53.5296 10.6 54.2496 11.32 54.4256 12.848H49.7376C49.9536 11.384 50.7776 10.6 52.2016 10.6ZM63.7485 9.952C63.1485 9.424 62.3645 9.12 61.3965 9.12C58.9645 9.12 57.4525 11.064 57.4525 13.672C57.4525 16.264 58.9565 18.24 61.3645 18.24C62.4525 18.24 63.3165 17.856 63.9405 17.208V18H65.4285V6.48H63.7485V9.952ZM61.5965 16.728C59.9885 16.728 59.2285 15.384 59.2285 13.672C59.2285 11.976 59.9885 10.632 61.6525 10.632C63.2285 10.632 63.9405 11.88 63.9405 13.672C63.9405 15.464 63.2445 16.728 61.5965 16.728ZM74.894 9.12C73.926 9.12 73.142 9.424 72.542 9.952V6.48H70.862V18H72.35V17.208C72.974 17.856 73.838 18.24 74.926 18.24C77.334 18.24 78.838 16.264 78.838 13.672C78.838 11.064 77.326 9.12 74.894 9.12ZM74.694 16.728C73.046 16.728 72.35 15.464 72.35 13.672C72.35 11.88 73.062 10.632 74.638 10.632C76.302 10.632 77.062 11.976 77.062 13.672C77.062 15.384 76.302 16.728 74.694 16.728ZM80.9131 9.36H79.1691L82.6651 17.96L81.2411 21.84H82.8331L87.6011 9.36H85.9051L83.4731 15.848L80.9131 9.36Z"
                  fill="#A8A8A8"
                />
                <g clipPath="url(#clip0_4524_7561)">
                  <path
                    d="M100.118 13.6444L102.699 4H104.716V16.7913H103.333L103.335 11.8404L103.464 6.55545L103.423 6.70227L100.718 16.6914H99.836L97.252 9.85493L97.3824 15.1151V19.9621H96V7.27391H97.6896L100.118 13.6452L100.118 13.6444Z"
                    fill="white"
                  />
                  <path
                    d="M112.588 13.7682C112.522 14.1262 112.428 14.4644 112.306 14.7828C111.648 16.4721 110.027 17.2995 108.335 16.7559C106.697 16.2049 106.043 14.3052 106.054 12.6554C106.066 11.9774 106.011 10.9224 106.149 10.2732C106.422 8.58059 107.546 7.08015 109.335 7.12551C111.603 7.09169 112.718 9.304 112.686 11.3992C112.671 12.0698 112.732 13.1264 112.588 13.7682V13.7682ZM111.109 10.6791C111.024 9.64797 110.488 8.42881 109.334 8.46015C108.182 8.43046 107.701 9.66446 107.624 10.6824C107.562 11.1435 107.598 12.1787 107.589 12.6554C107.574 13.8474 107.9 15.606 109.347 15.5945C111.329 15.5161 111.154 12.8559 111.15 11.386C111.146 11.1459 111.132 10.91 111.109 10.6791Z"
                    fill="white"
                  />
                  <path
                    d="M117.327 8.55833V16.7848H115.81V8.55833H112.979V7.25586H120.177V8.55833H117.326H117.327Z"
                    fill="white"
                  />
                  <path
                    d="M127.029 15.4897V16.7856H121.088V7.25586H122.617V15.4897H127.029Z"
                    fill="white"
                  />
                  <path
                    d="M129.745 12.5119V15.4897H134.207V16.7856H128.215V7.25586H134.175V8.55833H129.745V11.2416H133.565V12.5111H129.745V12.5119Z"
                    fill="white"
                  />
                  <path
                    d="M140.545 7.25586H142.246L139.351 13.3822L139.338 16.7856H137.846L137.84 13.3368L134.971 7.25668H136.666L138.608 11.8116L140.544 7.25668L140.545 7.25586Z"
                    fill="white"
                  />
                  <path
                    d="M152.661 15.4897V16.7856H146.719V7.25586H148.249V15.4897H152.661Z"
                    fill="white"
                  />
                  <path
                    d="M155.76 14.5932L155.131 16.7857H153.544L156.553 7.25684H157.905L160.862 16.7857H159.282L158.659 14.5932H155.758H155.76ZM158.286 13.2454L157.226 9.47574L156.147 13.2454H158.286Z"
                    fill="white"
                  />
                  <path
                    d="M161.891 7.25586H164.849C165.659 7.25916 166.498 7.41671 167.134 7.87781C167.948 8.44615 168.262 9.62654 167.918 10.5908C167.698 11.1806 167.238 11.584 166.67 11.8182V11.8314C167.174 11.9626 167.569 12.2405 167.864 12.6365C168.584 13.6758 168.346 15.3132 167.375 16.0729C166.752 16.5893 165.922 16.7848 165.09 16.7864H161.891V7.25586V7.25586ZM164.881 11.2812C165.497 11.273 166.137 11.0659 166.41 10.4762C166.63 9.99278 166.542 9.27184 166.125 8.93777C165.793 8.63917 165.329 8.57235 164.868 8.55833H163.427V11.2812H164.881V11.2812ZM163.427 15.4897H165.103C165.537 15.4914 165.958 15.3685 166.271 15.0971C166.898 14.5914 166.902 13.4482 166.341 12.898C166.031 12.6035 165.626 12.4872 165.179 12.4789H163.427V15.4897V15.4897Z"
                    fill="white"
                  />
                  <path
                    d="M174.334 13.7418C174.245 13.5719 174.12 13.4193 173.959 13.284C173.242 12.738 172.162 12.6225 171.386 12.1944C170.41 11.7102 169.611 10.92 169.624 9.75689C169.602 8.04776 171.27 7.08926 172.778 7.12556C174.401 7.08431 176.007 8.26553 175.978 10.0316H174.467C174.426 9.58532 174.291 9.16876 173.991 8.86026C173.388 8.27378 172.264 8.2647 171.605 8.7687C171.31 9.01039 171.146 9.35271 171.148 9.75029C171.157 10.463 171.771 10.8375 172.363 11.0726C172.909 11.2903 173.518 11.4264 174.058 11.6846C174.727 11.989 175.344 12.4509 175.702 13.105C176.27 14.1221 176.011 15.5763 175.051 16.2437C173.114 17.6855 169.342 16.7559 169.345 13.9134H170.868C170.908 14.443 171.073 14.895 171.458 15.2093C172.118 15.7479 173.296 15.7925 173.991 15.2942C174.462 14.9701 174.601 14.245 174.334 13.7427V13.7418Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_4524_7561">
                    <rect width="80" height="16" fill="white" transform="translate(96 4)" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-10 text-right text-white md:flex-row">
            {/* Links */}
            <Link href={config.website}>
              <a className="hover:underline" target={'_blank'}>
                About the DAO
              </a>
            </Link>
            <Link href="#">
              <a className="hover:underline">Legal</a>
            </Link>
          </div>
          <div className="flex  gap-6 text-[#A8A8A8] md:justify-end ">
            {/* Social media */}
            {config.socialMedia.twitter && (
              <Link href={config.socialMedia.twitter}>
                <a target="_blank" rel="nofollow noreferrer" className="hover:text-white">
                  <Icon.Twitter />
                </a>
              </Link>
            )}
            {config.socialMedia.discord && (
              <Link href={config.socialMedia.discord}>
                <a target="_blank" rel="nofollow noreferrer" className="hover:text-white">
                  <Icon.Discord />
                </a>
              </Link>
            )}

            {config.socialMedia.medium && (
              <Link href={config.socialMedia.medium}>
                <a target="_blank" rel="nofollow noreferrer" className="hover:text-white">
                  <Icon.Medium />
                </a>
              </Link>
            )}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;

import { useWallet } from '@solana/wallet-adapter-react';

import { addDays } from 'date-fns';
import type { NextPage, GetStaticPropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Router from 'next/router';
import { useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import useSWRInfinite from 'swr/infinite';

import OpenAllNight from '../../public/images/open_all_night.jpg';
import Banner from '../components/Banner';
import Button, {
  ButtonBackground,
  ButtonBorder,
  ButtonColor,
  ButtonSize,
} from '../components/Button';
import { ButtonGroup } from '../components/ButtonGroup';
import { Collection } from '../components/Collection';
import Drop from '../components/Drop';
import Hero from '../components/Hero';
import Img from '../components/Image';
import useLogin from '../hooks/login';
import type { CollectionsTrendsData, CollectionTrend, SelectedTrend } from '../typings/index.d';
import { CollectionInterval, CollectionSort, OrderDirection } from '../typings/index.d';
import { AssetSize, getAssetURL } from '../utils/assets';

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

const DEFAULT_TIME_FRAME: CollectionInterval = CollectionInterval.OneDay;
const DEFAULT_SORT: CollectionSort = CollectionSort.Volume;
const DEFAULT_ORDER: OrderDirection = OrderDirection.Desc;
const PAGE_LIMIT = 10;

const Home: NextPage = () => {
  const { t } = useTranslation(['home', 'collection']);
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<`${CollectionInterval}`>(DEFAULT_TIME_FRAME);

  const getKey = (pageIndex: number, previousPageData: CollectionsTrendsData) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;

    const query = `period=${selectedTimeFrame}&sort_by=${DEFAULT_SORT}&order=${DEFAULT_ORDER}&limit=${PAGE_LIMIT}&offset=${
      pageIndex * PAGE_LIMIT
    }`;

    return `/collections/trend?${query}`;
  };

  const { data, size, setSize, isValidating } = useSWRInfinite<CollectionsTrendsData>(getKey, {
    revalidateOnFocus: false,
  });

  const isLoading = !data && isValidating;

  const { publicKey, connected } = useWallet();
  const trendingCollectionsRef = useRef<null | HTMLDivElement>(null);
  const onLogin = useLogin();

  const { control } = useForm<TrendingCollectionForm>({
    defaultValues: { filter: DEFAULT_TIME_FRAME, sort: DEFAULT_SORT },
  });

  const onShowMoreTrends = () => {
    setSize(size + 1);
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

  const handleFiltersChange = (value: `${CollectionInterval}`) => {
    setSelectedTimeFrame(value);
    if (size > 1) {
      setSize(1);
    }
  };

  const trends: CollectionTrend[] = useMemo(
    () => (data ? data.flatMap((pageData) => pageData.trends) : []),
    [data]
  );

  return (
    <>
      <Head>
        <title>{t('metadata.title', { ns: 'home' })}</title>
        <meta name="description" content={t('metadata.description', { ns: 'home' })} />
        <meta name="og:title" content={t('metadata.title', { ns: 'home' })} />
        <meta name="og:description" content={t('metadata.description', { ns: 'home' })} />
        <meta name="og:image" content="https://nightmarket.io/images/open_all_night.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
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
          <Hero.Image>
            <Image
              className="rounded-tl-2xl rounded-tr-2xl md:rounded-tr-2xl md:rounded-br-2xl"
              src={OpenAllNight.src}
              alt="Open All Night"
              width={1280}
              height={1280}
            />
          </Hero.Image>
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
                render={() => (
                  <ButtonGroup value={selectedTimeFrame} onChange={handleFiltersChange}>
                    <ButtonGroup.Option value={CollectionInterval.OneHour}>
                      {t('timeInterval.hour', { ns: 'collection' })}
                    </ButtonGroup.Option>
                    <ButtonGroup.Option value={CollectionInterval.OneDay}>
                      {t('timeInterval.day', { ns: 'collection' })}
                    </ButtonGroup.Option>
                    <ButtonGroup.Option value={CollectionInterval.SevenDay}>
                      {t('timeInterval.week', { ns: 'collection' })}
                    </ButtonGroup.Option>
                  </ButtonGroup>
                )}
              />
            </div>
          </header>
          <Collection.List>
            {isLoading ? (
              <>
                <Collection.List.Loading />
                <Collection.List.Loading />
                <Collection.List.Loading />
                <Collection.List.Loading />
                <Collection.List.Loading />
                <Collection.List.Loading />
              </>
            ) : (
              trends.map((trend) => {
                let selectedTrend: SelectedTrend = {
                  listedCount: undefined,
                  listedCountChange: undefined,
                  volume: undefined,
                  volumeChange: undefined,
                  floorPrice: undefined,
                  floorPriceChange: undefined,
                };

                let volumeLabel = '';

                switch (selectedTimeFrame) {
                  case CollectionInterval.OneDay:
                    selectedTrend = {
                      floorPrice: trend.floor1d,
                      floorPriceChange: trend.changeFloor1d,
                      volume: trend.volume1d,
                      volumeChange: trend.changeVolume1d,
                      listedCount: trend.listed1d,
                      listedCountChange: trend.changeListed1d,
                    };
                    volumeLabel = t('24hVolume', { ns: 'collection' });
                    break;
                  case CollectionInterval.SevenDay:
                    selectedTrend = {
                      floorPrice: trend.floor1d,
                      floorPriceChange: trend.changeFloor1d,
                      volume: trend.volume7d,
                      volumeChange: trend.changeVolume7d,
                      listedCount: trend.listed1d,
                      listedCountChange: trend.changeListed1d,
                    };
                    volumeLabel = t('7dVolume', { ns: 'collection' });
                    break;
                  case CollectionInterval.OneHour:
                    selectedTrend = {
                      floorPrice: trend.floor1d,
                      floorPriceChange: trend.changeFloor1d,
                      volume: trend.volume1h,
                      volumeChange: trend.changeVolume1h,
                      listedCount: trend.listed1d,
                      listedCountChange: trend.changeListed1d,
                    };
                    volumeLabel = t('1hVolume', { ns: 'collection' });
                    break;
                }

                return (
                  <Collection.List.Row key={trend.collection?.slug}>
                    <Link
                      className="flex w-full items-center justify-start gap-4 rounded-2xl xl:gap-8"
                      href={`/collections/[slug]`}
                      as={`/collections/${trend.collection?.slug}`}
                    >
                      <Collection.List.Col className="flex-none">
                        <Img
                          fallbackSrc="/images/moon.svg"
                          src={getAssetURL(trend.collection?.image, AssetSize.XSmall)}
                          alt={trend.collection?.name}
                          className="relative aspect-square w-16 rounded-lg object-cover md:w-20"
                        />
                      </Collection.List.Col>
                      <Collection.List.Stats
                        name={trend.collection.name}
                        slug={trend.collection.slug}
                        trend={selectedTrend}
                        volumeLabel={volumeLabel}
                        period={selectedTimeFrame}
                      />
                    </Link>
                    {trend.collection.id && (
                      <Collection.List.Col className="flex w-full gap-2 md:w-auto lg:gap-4">
                        <Collection.List.NftPreview collectionSlug={trend.collection.slug} />
                      </Collection.List.Col>
                    )}
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
            loading={isValidating}
            disabled={isValidating}
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
              price={''}
              supply={5909}
              image={'/images/launchpad/motley-launchpad-nft.png'}
              link={
                'https://launchpad.nightmarket.io/m/GZYYxFGfUgwofuzbVUBkxr98UK9s3rsskxmqZKjwTM8k'
              }
            />
            <div className="flex w-full flex-col items-center justify-center gap-4 text-center">
              <h4 className="text-xl font-semibold">
                {t('drops.moreLaunchesTitle', { ns: 'home' })}
              </h4>
              <p>{t('drops.moreLaunchesDescription', { ns: 'home' })}</p>
              <Link
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
                  {t('drops.launchButton', { ns: 'home' })}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;

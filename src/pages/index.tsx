import type { NextPage, GetStaticPropsContext } from 'next';
import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { SwiperSlide } from 'swiper/react';
import GetHomeQuery from './../queries/home.graphql';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { Collection } from '../components/Collection';
import ProfileCard from '../components/ProfileCard';
import { Collection as CollectionType, Wallet } from '../graphql.types';
import Carousel from '../components/Carousel';
import { useWallet } from '@solana/wallet-adapter-react';

interface GetHomePageData {
  collectionsFeaturedByVolume: CollectionType[];
  collectionsFeaturedByMarketCap: CollectionType[];
  followWallets: Wallet[];
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

const Home: NextPage = () => {
  const { t } = useTranslation('home');
  const { publicKey } = useWallet();

  const [startDate, endDate] = useMemo(() => {
    const now = DateTime.now();
    const dayAgo = now.minus({ days: 1 });
    const nowUTC = now.toUTC().toString();
    const dayAgoUTC = dayAgo.toUTC().toString();

    return [dayAgoUTC, nowUTC];
  }, []);

  const homeQueryResult = useQuery<GetHomePageData>(GetHomeQuery, {
    variables: {
      startDate,
      endDate,
      userWallet: publicKey?.toBase58(),
    },
  });

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

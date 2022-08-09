import type { NextPage, GetStaticPropsContext } from 'next'
import { useMemo } from 'react'
import { DateTime } from 'luxon'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { SwiperSlide } from 'swiper/react'
import GetHomeQuery from './../queries/home.graphql'

import { useQuery } from '@apollo/client'
import Link from 'next/link'
import CollectionCard from '../components/CollectionCard'
import { Collection } from '../types'
import Carousel from '../components/Carousel'

interface GetHomePageData {
  collectionsFeaturedByVolume: Collection[]
  collectionsFeaturedByMarketCap: Collection[]
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...await serverSideTranslations(locale as string, ['common', 'home', 'collections']),
  },
})

const Home: NextPage = () => {
  const { t } = useTranslation('home')

  const [startDate, endDate] = useMemo(() => {
    const now = DateTime.now();
    const dayAgo = now.minus({ days: 1 });
    const nowUTC = now.toUTC().toString();
    const dayAgoUTC = dayAgo.toUTC().toString();

    return [dayAgoUTC, nowUTC]
  }, []);

  const homeQueryResult = useQuery<GetHomePageData>(GetHomeQuery, {
    variables: {
      startDate,
      endDate,
    }
  })

  return (
    <>
      <Head>
        <title>{t('metadata.title')}</title>
        <meta name="description" content={t('metadata.description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto px-6 lg:px-0">
        <section className="flex flex-col justify-items-center items-center gap-4 mt-32 text-center">
          <h1 className="text-3xl md:text-5xl">{t('hero.title')}</h1>
          <h2 className="text-xl md:text-2xl">{t('hero.subtitle')}</h2>
        </section>
        <section className="mt-28">
          <header className="flex w-full flex-row mb-4 justify-between border-b border-gray-800">
            <h1 className="text-2xl  mb-2">{t('topVolume.title')}</h1>
          </header>
          {homeQueryResult.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-2">
              <CollectionCard.Skeleton />
              <CollectionCard.Skeleton className="hidden sm:inline-block" />
              <CollectionCard.Skeleton className="hidden md:inline-block" />
              <CollectionCard.Skeleton className="hidden lg:inline-block" />
            </div>
          ) : (
            <Carousel
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 4
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 4
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 4
                },
              }}
              slidesPerView={1}
            >
              {homeQueryResult.data?.collectionsFeaturedByVolume.map((collection) => {
                return (
                  <SwiperSlide key={collection.nft.address}  className="p-2">
                    <Link href={`/collections/${collection.nft.mintAddress}/nfts`}>
                      <a>
                        <CollectionCard collection={collection} />
                      </a>
                    </Link>
                  </SwiperSlide>
                )
              })}
            </Carousel>
          )}
        </section>
        <section className="mt-28">
          <header className="flex w-full flex-row justify-between border-b border-gray-800 mb-4">
            <h1 className="text-2xl mb-2">{t('topMarketCap.title')}</h1>
          </header>
          {homeQueryResult.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-2">
              <CollectionCard.Skeleton />
              <CollectionCard.Skeleton className="hidden sm:inline-block" />
              <CollectionCard.Skeleton className="hidden md:inline-block" />
              <CollectionCard.Skeleton className="hidden lg:inline-block" />
            </div>
          ) : (
            <Carousel
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 4
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 4
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 4
                },
              }}
              slidesPerView={1}
            >
              {homeQueryResult.data?.collectionsFeaturedByMarketCap.map((collection) => {
                return (
                  <SwiperSlide key={collection.nft.address} className="p-2">
                    <Link href={`/collections/${collection.nft.mintAddress}/nfts`}>
                      <a>
                        <CollectionCard collection={collection} />
                      </a>
                    </Link>
                  </SwiperSlide>
                )
              })}
            </Carousel>
          )}
        </section>
      </main>
    </>
  )
}

export default Home

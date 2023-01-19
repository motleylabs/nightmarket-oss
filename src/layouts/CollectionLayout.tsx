import { ReactElement, ReactNode } from 'react';
import Head from 'next/head';
import { Collection } from '../graphql.types';
import { useTranslation } from 'next-i18next';
import { Overview } from './../components/Overview';
import { CollectionQueryClient } from './../queries/collection.graphql';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import Icon from '../components/Icon';
import { Chart } from '../components/Chart';
import { useQuery } from '@apollo/client';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import Link from 'next/link';
interface CollectionLayoutProps {
  children: ReactElement;
  collection: Collection;
}

function CollectionFigure({
  label,
  children,
  loading = false,
}: {
  label: string;
  children: ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="truncate text-sm text-gray-300">{label}</div>
      {loading ? (
        <div className="h-6 w-full animate-pulse rounded-md bg-gray-700 transition" />
      ) : (
        <div className="flex items-center justify-center gap-1 font-semibold">{children}</div>
      )}
    </div>
  );
}

interface CollectionData {
  collection: Collection;
}

interface CollectionVariables {
  id: string;
  startTime: string;
  endTime: string;
}

enum CollectionPath {
  Nfts = '/collections/[id]/nfts',
  Analytics = '/collections/[id]/analytics',
  Activity = '/collections/[id]/activity',
}

function CollectionLayout({ children, collection }: CollectionLayoutProps): JSX.Element {
  const { t } = useTranslation(['collection', 'common']);
  const router = useRouter();
  const startTime = format(
    startOfDay(subDays(new Date(), 1)),
    "yyyy-MM-dd'T'hh:mm:ssxxx"
  ) as string;
  const endTime = format(endOfDay(new Date()), "yyyy-MM-dd'T'hh:mm:ssxxx") as string;

  const collectionQueryClient = useQuery<CollectionData, CollectionVariables>(
    CollectionQueryClient,
    {
      variables: {
        id: router.query.id as string,
        startTime,
        endTime,
      },
    }
  );

  return (
    <>
      <Head>
        <title>{t('metadata.title', { name: collection.name })}</title>
        <meta name="description" content={collection.description} />
        <link rel="icon" href="/favicon.ico" />
        <script defer data-domain="nightmarket.io" src="https://plausible.io/js/script.js"></script>
      </Head>
      <Overview>
        <div className="mx-4 mb-12 flex flex-col items-center justify-center gap-10 text-white md:mx-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start xl:gap-10">
            <div className="flex flex-shrink-0 rounded-lg border-8 border-gray-800">
              <img
                src={collection.image}
                className="inline-block aspect-square h-36 w-36 rounded-md object-cover shadow-xl md:h-36 md:w-36"
                alt="overview avatar"
              />
            </div>
            <div className="space-y-4 md:mt-2">
              <Overview.Title>{collection.name}</Overview.Title>
              {[collection.twitterUrl, collection.websiteUrl, collection.discordUrl].some(
                Boolean
              ) && (
                <div className="flex gap-4 text-gray-300">
                  {collection.twitterUrl && (
                    <Link
                      target="_blank"
                      rel="nofollow noreferrer"
                      className="hover:text-white"
                      href={collection.twitterUrl}
                    >
                      <Icon.Twitter className="h-5 w-auto" />
                    </Link>
                  )}
                  {collection.websiteUrl && (
                    <Link
                      target="_blank"
                      rel="nofollow noreferrer"
                      className="hover:text-white"
                      href={collection.websiteUrl}
                    >
                      <Icon.Web className="h-5 w-auto" />
                    </Link>
                  )}
                  {collection.discordUrl && (
                    <Link
                      target="_blank"
                      rel="nofollow noreferrer"
                      className="hover:text-white"
                      href={collection.discordUrl}
                    >
                      <Icon.Discord className="h-5 w-auto" />
                    </Link>
                  )}
                </div>
              )}

              <p
                className={clsx(
                  'max-w-sm text-center text-gray-300 md:text-left',
                  'line-clamp-2 md:line-clamp-4'
                )}
              >
                {collection.description}
              </p>
            </div>
          </div>

          {/* [Charts], Data */}
          <div className="flex w-full flex-col-reverse items-center justify-center gap-4 md:w-min md:flex-row md:items-start md:justify-start">
            <div className="flex w-full gap-4 md:w-min">
              {(collectionQueryClient.loading ||
                collectionQueryClient.data?.collection.timeseries.floorPrice) && (
                <Chart.Preview
                  className="h-40 w-full md:w-36 xl:w-40"
                  title={t('floorPrice')}
                  dateRange={t('timeInterval.day')}
                  chart={
                    <Chart.TinyLineChart
                      data={collectionQueryClient.data?.collection.timeseries.floorPrice || []}
                      loading={collectionQueryClient.loading}
                    />
                  }
                />
              )}
              {(collectionQueryClient.loading ||
                collectionQueryClient.data?.collection.timeseries.listedCount) && (
                <Chart.Preview
                  className="h-40 w-full md:w-36 xl:w-40"
                  title={t('listings')}
                  dateRange={t('timeInterval.day')}
                  chart={
                    <Chart.TinyLineChart
                      data={collectionQueryClient.data?.collection.timeseries.listedCount || []}
                      loading={collectionQueryClient.loading}
                    />
                  }
                />
              )}
            </div>
            {(collectionQueryClient.loading ||
              [
                collectionQueryClient.data?.collection.trends?.compactFloor1d,
                collectionQueryClient.data?.collection.trends?.compactVolume30d,
                collectionQueryClient.data?.collection.marketCap,
                collectionQueryClient.data?.collection.trends?.compactListed1d,
                collectionQueryClient.data?.collection.holderCount,
                collection?.compactPieces,
              ].every(Boolean)) && (
              <div className="grid h-40 w-full grid-cols-3 grid-rows-2 gap-4 rounded-2xl bg-gray-800 p-6 md:ml-auto md:w-80 xl:w-96">
                <CollectionFigure label="Floor price" loading={collectionQueryClient.loading}>
                  <Icon.Sol /> {collectionQueryClient.data?.collection.trends?.compactFloor1d}
                </CollectionFigure>
                <CollectionFigure label="30 Day Volume" loading={collectionQueryClient.loading}>
                  <Icon.Sol /> {collectionQueryClient.data?.collection.trends?.compactVolume30d}
                </CollectionFigure>
                <CollectionFigure label="Est. Marketcap" loading={collectionQueryClient.loading}>
                  <Icon.Sol /> {collectionQueryClient.data?.collection.marketCap}
                </CollectionFigure>
                <CollectionFigure label="Listings" loading={collectionQueryClient.loading}>
                  {collectionQueryClient.data?.collection.trends?.compactListed1d}
                </CollectionFigure>
                <CollectionFigure label="Holders" loading={collectionQueryClient.loading}>
                  {collectionQueryClient.data?.collection.holderCount}
                </CollectionFigure>
                <CollectionFigure label="Supply" loading={collectionQueryClient.loading}>
                  {collection?.compactPieces}
                </CollectionFigure>
              </div>
            )}
          </div>
        </div>
        <Overview.Tabs>
          <Overview.Tab
            label={t('nfts')}
            href={`/collections/${collection.id}/nfts`}
            active={router.pathname === CollectionPath.Nfts}
          />
          <Overview.Tab
            label="Activity"
            href={`/collections/${collection.id}/activity`}
            active={router.pathname === CollectionPath.Activity}
          />
          <Overview.Tab
            label={t('analytics')}
            href={`/collections/${collection.id}/analytics`}
            active={router.pathname === CollectionPath.Analytics}
          />
        </Overview.Tabs>
        {children}
      </Overview>
    </>
  );
}

export default CollectionLayout;

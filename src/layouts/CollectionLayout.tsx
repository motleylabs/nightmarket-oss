import clsx from 'clsx';
import { subDays } from 'date-fns';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';

import { Chart } from '../components/Chart';
import Icon from '../components/Icon';
import Img from '../components/Image';
import Tooltip from '../components/Tooltip';
import { useSeries } from '../hooks/collection/useSeries';
import useMetaplex from '../hooks/metaplex';
import type { Collection } from '../typings';
import { AssetSize, getAssetURL } from '../utils/assets';
import { getExtendedSolFromLamports, getMegaValue, getSolFromLamports } from '../utils/price';
import { Overview } from './../components/Overview';

interface VerifiedBadgeProps {
  isVerified: boolean;
  className?: string;
}

export function VerifiedBadge({ isVerified, className = '' }: VerifiedBadgeProps) {
  const { t } = useTranslation(['common']);

  if (!isVerified) return null;

  return (
    <Tooltip
      placement="top"
      content={<p>{t('collection.verified', { ns: 'common' })}</p>}
      className="max-w-[12rem] text-center"
      wrapperClass={clsx('flex items-center ml-1', className)}
    >
      <Icon.Verified />
    </Tooltip>
  );
}

interface EnforcedBadgeProps {
  isEnforced: boolean;
}

function EnforcedBadge({ isEnforced }: EnforcedBadgeProps) {
  const { t } = useTranslation(['common']);

  if (!isEnforced) return null;

  return (
    <Tooltip
      placement="top"
      content={<p>{t('collection.enforced', { ns: 'common' })}</p>}
      className="max-w-[12rem] text-center"
    >
      <Icon.Enforced className="mx-1" />
    </Tooltip>
  );
}

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
      <div className="truncate text-sm text-gray-300 my-1">{label}</div>
      {loading ? (
        <div className="h-6 w-full animate-pulse rounded-md bg-gray-700 transition" />
      ) : (
        <div className="flex items-center justify-center gap-1 font-semibold">{children}</div>
      )}
    </div>
  );
}

const defaultStartTime = subDays(new Date(), 1).setMinutes(0, 0, 0) / 1000;
const defaultEndTime = new Date().setMinutes(0, 0, 0) / 1000;

enum CollectionPath {
  Nfts = '/collections/[slug]',
  Analytics = '/collections/[slug]/analytics',
  Activity = '/collections/[slug]/activity',
}

function CollectionLayout({ children, collection }: CollectionLayoutProps): JSX.Element {
  const { t } = useTranslation(['collection', 'common']);
  const { query, pathname } = useRouter();

  const { metadata } = useMetaplex({
    verifiedCollectionAddress: collection?.verifiedCollectionAddress,
  });

  const { data, isValidating } = useSeries(
    query.slug as string,
    defaultStartTime,
    defaultEndTime,
    'per_hour',
    100
  );

  const isLoading = !data && isValidating;

  const { floorPrice, listed } = useMemo(() => {
    const timeseriesList = data?.series ?? [];

    const floorPrice = timeseriesList.map((t) => ({
      amount: getSolFromLamports(t.floorPrice, 0, 2),
      timestamp: t.timestamp,
      value: t.floorPrice,
    }));

    const listed = timeseriesList.map((t) => ({
      amount: t.listed,
      timestamp: t.timestamp,
      value: t.listed,
    }));

    return { floorPrice, listed };
  }, [data]);

  const minFP = useMemo(
    () => floorPrice.reduce((acc, item) => Math.min(acc, item.amount), Infinity),
    [floorPrice]
  );
  const maxFP = useMemo(
    () => floorPrice.reduce((acc, item) => Math.max(acc, item.amount), 0),
    [floorPrice]
  );

  const minListing = useMemo(
    () => listed.reduce((acc, item) => Math.min(acc, item.amount), Infinity),
    [listed]
  );
  const maxListing = useMemo(
    () => listed.reduce((acc, item) => Math.max(acc, item.amount), 0),
    [listed]
  );

  return (
    <>
      <Head>
        <title>{`${t('metadata.title', { ns: 'collection', name: collection.name })} | ${t(
          'header.title',
          { ns: 'common' }
        )}`}</title>
        <meta name="description" content={collection.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Overview>
        <div className="mx-4 mb-10 flex flex-col items-center justify-center gap-10 text-white md:mx-10 md:mb-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start xl:gap-10">
            <div className="flex flex-shrink-0 rounded-lg border-8 border-gray-800">
              <Img
                fallbackSrc="/images/moon.svg"
                src={getAssetURL(collection.image, AssetSize.XSmall)}
                className="inline-block aspect-square h-36 w-36 rounded-md object-cover shadow-xl md:h-36 md:w-36"
                alt="overview avatar"
              />
            </div>
            <div className="space-y-4 md:mt-2">
              <div className="flex w-full justify-center md:justify-start">
                <Overview.Title>{collection.name}</Overview.Title>
                <VerifiedBadge isVerified={true} />
                <EnforcedBadge isEnforced={metadata?.tokenStandard === 4} />
              </div>
              {(!!collection.twitter || !!collection.website || !!collection.discord) && (
                <div className="flex justify-center text-gray-300 md:justify-start gap-3">
                  {!!collection.twitter && (
                    <Link href={collection.twitter} target="_blank">
                      <Icon.Twitter className="h-7 w-7" />
                    </Link>
                  )}
                  {!!collection.website && (
                    <Link href={collection.website} target="_blank">
                      <Icon.Web className="h-7 w-7" />
                    </Link>
                  )}
                  {!!collection.discord && (
                    <Link href={collection.discord} target="_blank">
                      <Icon.Discord className="h-7 w-7" />
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
              {(isLoading || floorPrice) && (
                <Chart.Preview
                  className="h-24 w-full md:w-36 xl:w-40"
                  title={t('floorPrice', { ns: 'collection' })}
                  dateRange={t('timeInterval.day', { ns: 'collection' })}
                  chart={
                    <Chart.TinyLineChart
                      animation={false}
                      data={floorPrice || []}
                      loading={isLoading}
                    />
                  }
                  min={minFP}
                  max={maxFP}
                />
              )}
              {(isLoading || listed) && (
                <Chart.Preview
                  className="h-24 w-full md:w-36 xl:w-40"
                  title={t('listings', { ns: 'collection' })}
                  dateRange={t('timeInterval.day', { ns: 'collection' })}
                  chart={
                    <Chart.TinyLineChart
                      animation={false}
                      data={listed || []}
                      loading={isLoading}
                    />
                  }
                  min={minListing}
                  max={maxListing}
                />
              )}
            </div>
            {(isLoading ||
              [
                collection.statistics.floor1d,
                collection.statistics.volume1d,
                collection.statistics.marketCap,
                collection.statistics.listed1d,
                collection.statistics.holders,
                collection.statistics.supply,
              ].every(Boolean)) && (
              <div className="grid h-40 w-full grid-cols-3 grid-rows-2 gap-4 rounded-2xl bg-gray-800 p-6 md:ml-auto md:w-80 xl:w-96">
                <CollectionFigure label={t('floorPrice', { ns: 'collection' })} loading={isLoading}>
                  <Icon.Sol /> {getSolFromLamports(collection.statistics.floor1d, 0, 2)}
                </CollectionFigure>
                <CollectionFigure label={t('24hVolume', { ns: 'collection' })} loading={isLoading}>
                  <Icon.Sol /> {getExtendedSolFromLamports(collection.statistics.volume1d, 3, 2)}
                </CollectionFigure>
                <CollectionFigure
                  label={t('estimatedMarketcap', { ns: 'collection' })}
                  loading={isLoading}
                >
                  ${getMegaValue(collection.statistics.marketCap)}
                </CollectionFigure>
                <CollectionFigure label={t('listings', { ns: 'collection' })} loading={isLoading}>
                  {parseInt(collection.statistics.listed1d, 10).toLocaleString()}
                </CollectionFigure>
                <CollectionFigure label={t('holders', { ns: 'collection' })} loading={isLoading}>
                  {collection.statistics.holders.toLocaleString()}
                </CollectionFigure>
                <CollectionFigure label={t('supply', { ns: 'collection' })} loading={isLoading}>
                  {collection.statistics.supply.toLocaleString()}
                </CollectionFigure>
              </div>
            )}
          </div>
        </div>
        <Overview.Tabs mode="collection">
          <Overview.Tab
            label={t('nfts', { ns: 'collection' })}
            href={`/collections/${collection.slug}`}
            active={pathname === CollectionPath.Nfts}
          />
          <Overview.Tab
            label={t('activity', { ns: 'collection' })}
            href={`/collections/${collection.slug}/activity`}
            active={pathname === CollectionPath.Activity}
          />
          <Overview.Tab
            label={t('analytics', { ns: 'collection' })}
            href={`/collections/${collection.slug}/analytics`}
            active={pathname === CollectionPath.Analytics}
          />
        </Overview.Tabs>
        {children}
      </Overview>
    </>
  );
}

export default CollectionLayout;

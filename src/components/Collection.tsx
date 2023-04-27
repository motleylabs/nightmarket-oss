import { ArrowUpIcon } from '@heroicons/react/24/outline';

import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';
import React from 'react';
import useSWR from 'swr';

import config from '../app.config';
import { useSeries } from '../hooks/collection/useSeries';
import { asCompactNumber } from '../modules/number';
import type { Nft, CollectionNftsData, SelectedTrend } from '../typings';
import { getAssetURL, AssetSize } from '../utils/assets';
import { getSolFromLamports } from '../utils/price';
import Image from './../components/Image';
import Img from './../components/Image';
import Button, { ButtonBackground, ButtonColor, ButtonSize } from './Button';
import Icon from './Icon';
import Price from './Price';

export function Collection() {
  return <div />;
}

interface CollectionOptionProps {
  className?: string;
  selected: boolean;
  children?: ReactNode;
  avatar: JSX.Element;
  header: JSX.Element;
  floorPrice: number | string | undefined;
}

function CollectionOption({
  className,
  selected,
  children,
  avatar,
  header,
  floorPrice,
}: CollectionOptionProps): JSX.Element {
  const { t } = useTranslation('collection');

  return (
    <div
      className={clsx(
        'group relative mb-2 rounded-2xl border border-transparent p-px',
        selected ? 'bg-gradient-primary' : 'border-gray-800 bg-gray-800 hover:border-white'
      )}
    >
      <div
        className={clsx(
          'flex h-full w-full cursor-pointer rounded-xl  bg-gray-800 p-2 transition ',
          className
        )}
      >
        {avatar}
        <div className="flex w-full flex-col justify-between overflow-hidden px-3">
          {header}
          <div className="flex items-end justify-between">
            {floorPrice && (
              <div className="-mb-1 flex flex-col">
                <span className="text-[10px] text-gray-400">
                  {t('floorPrice', { ns: 'collection' })}
                </span>
                <Price price={floorPrice} />
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

Collection.Option = CollectionOption;

interface CollectionAvatarProps {
  src: string;
  figure?: string;
}

function CollectionOptionAvatar({ src, figure }: CollectionAvatarProps): JSX.Element {
  return (
    <div className="relative flex aspect-square h-16 w-16">
      <Img
        fallbackSrc="/images/moon.svg"
        src={getAssetURL(src, AssetSize.Tiny)}
        className="absolute top-0 left-0 h-full w-full rounded-lg object-cover"
        alt="collection avatar"
      />
      {figure && (
        <span className="min-w-6 absolute right-0 bottom-0 z-10 m-1 flex aspect-square h-6 items-center justify-center rounded bg-gray-800 text-sm text-white">
          {figure}
        </span>
      )}
    </div>
  );
}

CollectionOption.Avatar = CollectionOptionAvatar;

interface CollectedCollectionItemSkeletonProps {
  className?: string;
}

function CollectionOptionSkeleton({
  className,
}: CollectedCollectionItemSkeletonProps): JSX.Element {
  return (
    <div
      className={clsx(
        'over flex animate-pulse rounded-md border border-gray-800 p-2 transition',
        className
      )}
    >
      <div className="aspect-square h-16 w-16 rounded-md bg-gray-800" />
      <div className="flex w-full flex-col justify-between px-3">
        <div className="h-6 w-40 truncate rounded-md bg-gray-800"></div>
        <div className="flex items-end justify-between">
          <div className="flex h-8 w-16 flex-col rounded-md bg-gray-800" />
          <div className="flex h-8 w-16 flex-col rounded-md bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

CollectionOption.Skeleton = CollectionOptionSkeleton;

interface CollectionOptionEstimatedValueProps {
  amount: number;
}

function CollectionOptionEstimatedValue({ amount }: CollectionOptionEstimatedValueProps) {
  const { t } = useTranslation('collection');

  if (!amount) return null;

  return (
    <div className="-mb-1 flex flex-col">
      <span className="text-[10px] text-gray-400">{t('estimatedValue', { ns: 'collection' })}</span>
      <Price price={amount} />
    </div>
  );
}

CollectionOption.EstimatedValue = CollectionOptionEstimatedValue;

function CollectionOptionTitle({ children }: { children: ReactNode }): JSX.Element {
  return <h6 className="text-md truncate">{children}</h6>;
}

CollectionOption.Title = CollectionOptionTitle;

interface CollectionCardProps {
  name: string;
  image: string;
  floorPrice?: string;
  nftCount?: string;
}

export default function CollectionCard({
  name,
  image,
  floorPrice,
  nftCount,
}: CollectionCardProps): JSX.Element {
  const { t } = useTranslation(['collection', 'common']);

  return (
    <div className="relative flex aspect-square w-full flex-col justify-end overflow-hidden rounded-md shadow-lg transition hover:scale-[1.02]">
      <Img
        fallbackSrc="/images/moon.svg"
        src={image}
        className="absolute top-0 left-0 h-full w-full object-cover"
        alt={`Collection ${name}`}
      />
      <div className="pointer-events-none absolute z-10 h-full w-full bg-gradient-to-b from-transparent to-gray-900/80" />
      <h1 className="z-20 px-4 text-3xl">{name}</h1>
      <div className="z-20 grid w-full grid-cols-2 gap-2 p-4 text-white">
        <div className=" flex flex-col justify-center rounded-md bg-gray-800 bg-opacity-50 p-2 text-center text-sm backdrop-blur-md xl:text-base">
          <span className="text-xs text-gray-300">{t('card.supply', { ns: 'collection' })}</span>
          <div className="flex items-center justify-center gap-1">
            <Icon.Sol />
            {nftCount}
          </div>
        </div>
        <div className=" flex flex-col justify-center rounded-md bg-gray-800 bg-opacity-50 p-2 text-center text-sm backdrop-blur-md xl:text-base">
          <span className="text-sm text-gray-300">{t('card.floor', { ns: 'collection' })}</span>
          <div className="flex flex-row items-center justify-center gap-1">
            <Icon.Sol />
            {floorPrice}
          </div>
        </div>
      </div>
    </div>
  );
}

Collection.Card = CollectionCard;

export interface CollectionCardSkeletonProps {
  className?: string;
}

CollectionCard.Skeleton = function CollectionCardSkeleton({
  className,
}: CollectionCardSkeletonProps): JSX.Element {
  return <div className={clsx('aspect-square animate-pulse rounded-md bg-gray-800', className)} />;
};

interface CollectionListProps {
  children?: ReactNode;
}
function CollectionList({ children }: CollectionListProps) {
  return (
    <div className="scrollbar-thumb-rounded-full pb-6 overflow-x-hidden scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-300 lg:pb-0">
      <div className="w-full">{children}</div>
    </div>
  );
}

Collection.List = CollectionList;

function CollectionListLoading() {
  return (
    <div className="mb-4 flex animate-pulse items-center gap-4 rounded-2xl bg-gray-800 p-4 transition md:px-6 lg:gap-7">
      {/* Collection Image */}
      <div className="h-16 w-16 rounded-lg bg-gray-800 md:h-12 md:w-12" />
      <div className="flex w-full flex-col justify-between gap-2 py-1 md:flex-row md:items-center lg:gap-8">
        {/* Collection Name */}
        <div className="lg:w-40">
          <div className="h-6 w-20 rounded-md bg-gray-800" />
        </div>
        {/* Data Points */}
        <div className="flex lg:w-96 lg:justify-between lg:gap-8">
          <div className="flex w-28 flex-col gap-1 sm:w-full">
            <div className="h-5 w-20 rounded-md bg-gray-800" />
            <div className="h-5 w-20 rounded-md bg-gray-800" />
          </div>
          <div className="flex w-28 flex-col gap-1 sm:w-full">
            <div className="h-5 w-20 rounded-md bg-gray-800" />
            <div className="h-5 w-20 rounded-md bg-gray-800" />
          </div>
          <div className="flex w-28 flex-col gap-1 sm:w-full">
            <div className="h-5 w-20 rounded-md bg-gray-800" />
            <div className="h-5 w-20 rounded-md bg-gray-800" />
          </div>
        </div>
        {/* Nfts */}
        <div className="hidden gap-4 lg:flex">
          <div className="h-16 w-16 rounded-lg bg-gray-800" />
          <div className="h-16 w-16 rounded-lg bg-gray-800" />
          <div className="h-16 w-16 rounded-lg bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

CollectionList.Loading = CollectionListLoading;

interface CollectionListRowProps {
  children?: ReactNode;
}
function CollectionListRow({ children }: CollectionListRowProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gray-800 px-4 py-4 text-white md:flex-nowrap md:px-6 xl:gap-7">
      {children}
    </div>
  );
}

CollectionList.Row = CollectionListRow;

interface CollectionListNftPreviewProps {
  collectionSlug: string;
}

function CollectionListNftPreview({ collectionSlug }: CollectionListNftPreviewProps): JSX.Element {
  const previewCount = 7;

  const { data: listedNFTs, isLoading: isListedNFTsLoading } = useSWR<CollectionNftsData>(
    `/collections/nfts?address=${collectionSlug}&sort_by=timestamp&order=desc&limit=${previewCount}&offset=0` +
      `&program=${config.auctionHouseProgram}&auction_house=${config.auctionHouse}&listing_only=true`,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      refreshInterval: 60000,
    }
  );

  const { data: normalNFTs, isLoading: isNFTsLoading } = useSWR<CollectionNftsData>(
    `/collections/nfts?address=${collectionSlug}&sort_by=timestamp&order=desc&limit=${
      previewCount * 2
    }&offset=0`,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      refreshInterval: 60000,
    }
  );

  const isLoading = useMemo(
    () => isListedNFTsLoading || isNFTsLoading,
    [isListedNFTsLoading, isNFTsLoading]
  );
  const previewNFTs = useMemo(() => {
    if (!isLoading) {
      if (!!listedNFTs && !!normalNFTs) {
        if (listedNFTs.nfts.length >= previewCount) {
          return listedNFTs.nfts.slice(0, previewCount).map((nft) => ({ ...nft, isListed: true }));
        } else {
          const listedAddresses = listedNFTs.nfts.map((nft) => nft.mintAddress);
          const notIncludedOnes = normalNFTs.nfts.filter(
            (nft) => !listedAddresses.includes(nft.mintAddress)
          );
          return [
            ...listedNFTs.nfts.map((nft) => ({ ...nft, isListed: true })),
            ...notIncludedOnes
              .slice(0, previewCount - listedNFTs.nfts.length)
              .map((nft) => ({ ...nft, isListed: false })),
          ];
        }
      }
    }
    return [];
  }, [isLoading, listedNFTs, normalNFTs]);

  const loading = !listedNFTs && !normalNFTs && isLoading;

  return (
    <>
      <div className="flex w-full justify-between md:hidden">
        {loading ? (
          <>
            <div className="flex h-16 w-16 animate-pulse rounded-lg bg-gray-700" />
            <div className="flex h-16 w-16 animate-pulse rounded-lg bg-gray-700" />
            <div className="flex h-16 w-16 animate-pulse rounded-lg bg-gray-700" />
            <div className="flex h-16 w-16 animate-pulse rounded-lg bg-gray-700" />
          </>
        ) : (
          previewNFTs
            .slice(0, 4)
            .map((nft) => <Collection.List.ShowcaseNft key={nft.mintAddress} nft={nft} />)
        )}
      </div>
      <div className="hidden justify-end gap-2 md:flex lg:gap-4">
        {loading ? (
          <>
            <div className="flex h-16 w-16 animate-pulse rounded-lg bg-gray-700" />
            <div className="flex h-16 w-16 animate-pulse rounded-lg bg-gray-700" />
          </>
        ) : (
          previewNFTs
            .slice(0, 2)
            .map((nft) => <Collection.List.ShowcaseNft key={nft.mintAddress} nft={nft} />)
        )}
      </div>
      <div className="hidden justify-end gap-2 lg:flex lg:gap-4">
        {loading ? (
          <>
            <div className="flex h-16 w-16 animate-pulse rounded-lg bg-gray-700" />
            <div className="flex h-16 w-16 animate-pulse rounded-lg bg-gray-700" />
            <div className="flex h-16 w-16 animate-pulse rounded-lg bg-gray-700" />
          </>
        ) : (
          previewNFTs
            .slice(2, 5)
            .map((nft) => <Collection.List.ShowcaseNft key={nft.mintAddress} nft={nft} />)
        )}
      </div>
      <div className="hidden justify-end gap-2 lg:gap-4 2xl:flex">
        {loading ? (
          <>
            <div className="flex h-16 w-16 animate-pulse rounded-lg bg-gray-700" />
            <div className="flex h-16 w-16 animate-pulse rounded-lg bg-gray-700" />
          </>
        ) : (
          previewNFTs
            .slice(5, 7)
            .map((nft) => <Collection.List.ShowcaseNft key={nft.mintAddress} nft={nft} />)
        )}
      </div>
    </>
  );
}

CollectionList.NftPreview = CollectionListNftPreview;

interface CollectionListColProps {
  className?: string;
  children?: ReactNode;
}
function CollectionListCol({ children, className }: CollectionListColProps) {
  return <div className={clsx(className)}>{children}</div>;
}

CollectionList.Col = CollectionListCol;

interface CollectionListStatsProps {
  name: string;
  slug: string;
  volumeLabel: string;
  trend: SelectedTrend;
  period: '1h' | '1d' | '7d' | '1m';
}
function CollectionListStats({
  name,
  slug,
  volumeLabel,
  trend,
  period,
}: CollectionListStatsProps): JSX.Element {
  const { t } = useTranslation(['home', 'collection']);
  const endTime = new Date().setMinutes(0, 0, 0) / 1000;
  const startTime = endTime - 86400 * 15;

  const {
    data: dayData,
    isValidating,
    isLoading,
  } = useSeries(slug, startTime, endTime, 'per_day', 100);
  const {
    data: hourData,
    isValidating: isHourValidating,
    isLoading: isHourLoading,
  } = useSeries(slug, endTime - 3600 * 3, endTime, 'per_hour', 100);

  const volumeDayChange = useMemo(() => {
    if (isValidating || isLoading || !dayData || (period !== '1d' && period !== '7d')) {
      return 0;
    }
    const sliceCount = period === '1d' ? 1 : 7;
    const curLen = dayData.series.length;

    if (curLen > 0) {
      const current = dayData.series
        .slice(Math.max(0, curLen - sliceCount), curLen)
        .map((item) => item.volume)
        .reduce((acc, item) => acc + item, 0);
      const prev =
        Math.max(0, curLen - sliceCount) > 0
          ? dayData.series
              .slice(Math.max(0, curLen - 2 * sliceCount), curLen - sliceCount)
              .map((item) => item.volume)
              .reduce((acc, item) => acc + item, 0)
          : 0;

      if (current === 0) {
        return 0;
      } else {
        return Math.round(((prev - current) / current) * 100);
      }
    }

    return 0;
  }, [dayData, isLoading, isValidating, period]);

  const volumeHourChange = useMemo(() => {
    if (isHourValidating || isHourLoading || !hourData || period !== '1h') {
      return 0;
    }

    const curLen = hourData.series.length;
    if (curLen > 0) {
      const current = hourData.series[curLen - 1].volume;
      const prev = curLen > 1 ? hourData.series[curLen - 2].volume : 0;

      if (current === 0) {
        return 0;
      } else {
        return Math.round(((prev - current) / current) * 100);
      }
    }
  }, [hourData, isHourLoading, isHourValidating, period]);

  const listChange = useMemo(() => {
    if (isValidating || isLoading || !dayData) {
      return 0;
    }

    const curLen = dayData.series.length;
    if (curLen > 0) {
      const current = dayData.series[curLen - 1].listed;
      const prev = curLen > 1 ? dayData.series[curLen - 2].listed : 0;

      if (current === 0) {
        return 0;
      } else {
        return Math.round(((prev - current) / current) * 100);
      }
    }

    return 0;
  }, [dayData, isLoading, isValidating]);

  return (
    <Collection.List.Col className="flex w-full flex-col justify-start gap-2 py-1 md:flex-row md:items-center xl:gap-8">
      <div className="w-full line-clamp-2 md:w-24 xl:w-36">{name}</div>
      <div className="flex gap-1  lg:justify-start lg:gap-4">
        <Collection.List.DataPoint
          isPrice
          value={trend.floorPrice as string}
          icon={<Icon.Sol />}
          name={t('globalFloor', { ns: 'collection' })}
          status={<Collection.List.DataPoint.Status value={trend.floorPriceChange} />}
        />
        <Collection.List.DataPoint
          isPrice
          value={trend.volume as string}
          icon={<Icon.Sol />}
          name={volumeLabel}
          suffix="K"
          decimals={3}
          status={
            <Collection.List.DataPoint.Status
              value={
                period === '1h'
                  ? volumeHourChange
                  : period === '1d'
                  ? trend.volumeChange
                  : volumeDayChange
              }
            />
          }
        />
        <Collection.List.DataPoint
          value={trend.listedCount as string}
          name={t('listings', { ns: 'collection' })}
          status={<Collection.List.DataPoint.Status value={listChange} />}
        />
      </div>
    </Collection.List.Col>
  );
}

CollectionList.Stats = CollectionListStats;

interface CollectionListDataPointProps {
  icon?: ReactElement;
  name: string;
  value: string;
  status?: ReactElement;
  className?: string;
  isPrice?: boolean;
  decimals?: number;
  suffix?: string;
}
function CollectionListDataPoint({
  icon,
  name,
  value,
  status,
  suffix,
  decimals = 0,
  isPrice = false,
}: CollectionListDataPointProps) {
  if (value == null) return null;

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="text-xs text-gray-200 md:text-sm">{name}</div>
      <div className="flex flex-col justify-start gap-2 sm:w-28 sm:flex-row sm:items-center">
        <p className="flex items-center gap-1 text-sm font-semibold md:text-base">
          {icon}
          {`${isPrice ? getSolFromLamports(value, decimals).toFixed(2) : value}${suffix ?? ''}`}
        </p>
        {status}
      </div>
    </div>
  );
}

CollectionList.DataPoint = CollectionListDataPoint;

interface CollectionListDataPointStatusProps {
  value?: number;
}
function CollectionListDataPointStatus({ value }: CollectionListDataPointStatusProps) {
  if (!value) {
    return <div></div>;
  }

  return (
    <p
      className={clsx(clsx, 'flex items-center gap-1 text-xs md:text-sm', {
        'text-[#12B76A]': value >= 0,
        'text-[#F04438]': value < 0,
      })}
    >
      {asCompactNumber(Math.abs(value))}%
      <ArrowUpIcon
        className={clsx(clsx, 'h-2 w-2 md:h-3 md:w-3', {
          'rotate-180 transform': value < 0,
          'rotate-0 transform': value >= 0,
        })}
      />
    </p>
  );
}

CollectionListDataPoint.Status = CollectionListDataPointStatus;

interface CollectionListShowcaseNftProps {
  nft: Nft;
}

function CollectionListShowcaseNft({ nft }: CollectionListShowcaseNftProps) {
  return (
    <Link href={`/nfts/[address]`} as={`/nfts/${nft.mintAddress}`}>
      <div className="flex w-16 flex-col items-center">
        <div className="relative rounded-lg p-0.5 hover:bg-gradient-primary">
          <Image
            src={getAssetURL(nft.image, AssetSize.XSmall)}
            alt={`${nft.name} preview`}
            className="relative aspect-square w-16 rounded-lg object-cover"
          />
        </div>
        {nft.isListed && !!nft.latestListing && (
          <div className="group z-20 ">
            <Button
              icon={<Icon.Sol className="h-3 w-3" />}
              color={ButtonColor.Gray}
              background={ButtonBackground.Slate}
              size={ButtonSize.Tiny}
              className="-mt-3 shadow-lg shadow-black group-hover:hidden"
            >
              {getSolFromLamports(nft.latestListing.price, 0, 2)}
            </Button>
            <Button size={ButtonSize.Small} className="-mt-3 hidden group-hover:block">
              Buy
            </Button>
          </div>
        )}
      </div>
    </Link>
  );
}

CollectionList.ShowcaseNft = CollectionListShowcaseNft;

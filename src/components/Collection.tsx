import clsx from 'clsx';
import React, { ReactNode } from 'react';
import Price from './Price';
import { useTranslation } from 'next-i18next';
import { Collection } from '../graphql.types';
import Icon from './Icon';

export function Collection() {
  return <div />;
}

interface CollectionOptionProps {
  className?: string;
  selected: boolean;
  children?: ReactNode;
  avatar: JSX.Element;
  header: JSX.Element;
  floorPrice: number;
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
        'mb-2 flex cursor-pointer rounded-md border border-gray-800 p-2 transition hover:scale-[1.02]',
        selected && 'bg-gray-700',
        className
      )}
    >
      {avatar}
      <div className="flex w-full flex-col justify-between overflow-hidden px-3">
        {header}
        <div className="flex items-end justify-between">
          <div className="-mb-1 flex flex-col">
            <span className="text-[10px] text-gray-400">{t('floorPrice')}</span>
            <Price price={floorPrice} />
          </div>
          {children}
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
      <img
        src={src}
        className="absolute top-0 left-0 h-full w-full rounded object-cover"
        alt="collection avatar"
      />
      {figure && (
        <span className="min-w-6 absolute right-0 bottom-0 z-10 m-1 flex aspect-square h-6 items-center justify-center rounded bg-gray-800 text-xs text-white">
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

function CollectionOptionEstimatedValue({
  amount,
}: CollectionOptionEstimatedValueProps): JSX.Element {
  const { t } = useTranslation('collection');

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
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps): JSX.Element {
  const { t } = useTranslation(['collection', 'common']);

  return (
    <div className="relative flex aspect-square w-full flex-col justify-end overflow-hidden rounded-md shadow-lg transition hover:scale-[1.02]">
      <img
        src={collection.nft.image}
        className="absolute top-0 left-0 h-full w-full object-cover"
        alt={`Collection ${collection.nft.name}`}
      />
      <div className="pointer-events-none absolute z-10 h-full w-full bg-gradient-to-b from-transparent to-gray-900/80" />
      <h1 className="z-20 px-4 text-3xl">{collection.nft.name}</h1>
      <div className="z-20 grid w-full grid-cols-2 gap-2 p-4 text-white">
        <div className="rounded-md bg-gray-800 bg-opacity-50 p-2 text-center text-sm backdrop-blur-md xl:text-base">
          {t('card.count', { amount: collection.nftCount })}
        </div>
        <div className="flex items-center rounded-md bg-gray-800 bg-opacity-50 p-2 text-center text-sm backdrop-blur-md xl:text-base">
          {t('card.floor', { price: collection.floorPrice })} <Icon.Sol />
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

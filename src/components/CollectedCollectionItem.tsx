import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import { CollectedCollection } from '../types';
import Price from './Price';

interface CollectedCollectionItemProps {
  collectedCollection: CollectedCollection;
  selected: boolean;
  className?: string;
}

export default function CollectedCollectionItem({
  collectedCollection,
  selected,
  className,
}: CollectedCollectionItemProps): JSX.Element {
  const { t } = useTranslation('collection');
  return (
    <div
      className={clsx(
        'flex cursor-pointer rounded-lg border border-gray-700 p-2',
        selected && 'bg-gray-700',
        className
      )}
    >
      <div className="relative flex aspect-square h-16 w-16 transition hover:scale-[1.02]">
        <img
          src={collectedCollection.collection.nft.image}
          className="absolute top-0 left-0 h-full w-full rounded object-cover"
          alt={`Collection ${collectedCollection.collection.nft.name}`}
        />
        <span className="absolute right-0 bottom-0 z-10 m-1 rounded bg-gray-900 px-1.5 text-base text-white">
          {collectedCollection.nftsOwned}
        </span>
      </div>
      <div className="flex w-full flex-col justify-between px-3">
        <h1 className="text-md">{collectedCollection.collection.nft.name}</h1>
        <div className="flex items-end justify-between">
          <div className="-mb-1 flex flex-col">
            <span className="text-[10px] text-gray-400">{t('floorPrice')}</span>
            <Price price={collectedCollection.collection.floorPrice} />
          </div>
          <div className="-mb-1 flex flex-col">
            <span className="text-[10px] text-gray-400">{t('estimatedValue')}</span>
            <Price price={collectedCollection.estimatedValue} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface CollectedCollectionItemSkeletonProps {
  className?: string;
}

CollectedCollectionItem.Skeleton = function CollectedCollectionItemSkeleton({
  className,
}: CollectedCollectionItemSkeletonProps): JSX.Element {
  return (
    <div
      className={clsx(
        'flex animate-pulse rounded-lg border border-gray-700 p-2 transition',
        className
      )}
    >
      <div className="aspect-square h-16 w-16 rounded-lg bg-slate-800" />
      <div className="flex w-full flex-col justify-between px-3">
        <div className="h-6 w-40 truncate rounded-md bg-gray-800"></div>
        <div className="flex items-end justify-between">
          <div className="flex h-8 w-16 flex-col bg-gray-800" />
          <div className="flex h-8 w-16 flex-col bg-gray-800" />
        </div>
      </div>
    </div>
  );
};

import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import { Collection } from '../types';

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps): JSX.Element {
  const { t } = useTranslation(['collection', 'common']);

  return (
    <article className="relative flex aspect-square w-full flex-col justify-end overflow-hidden rounded-lg shadow-lg transition hover:scale-[1.02]">
      <img
        src={collection.nft.image}
        className="absolute top-0 left-0 -z-10 h-full w-full object-cover"
        alt={`Collection ${collection.nft.name}`}
      />
      <div className="pointer-events-none absolute z-10 h-full w-full bg-gradient-to-b from-transparent to-gray-900/80" />
      <h1 className="z-20 px-4 text-3xl">{collection.nft.name}</h1>
      <footer className="z-20 grid w-full grid-cols-2 gap-2 p-4 text-white">
        <div className="rounded-lg bg-gray-800 bg-opacity-50 p-2 text-center text-sm backdrop-blur-md xl:text-base">
          {t('card.count', { amount: collection.nftCount })}
        </div>
        <div className="rounded-lg bg-gray-800 bg-opacity-50 p-2 text-center text-sm backdrop-blur-md xl:text-base">
          {t('card.floor', { price: collection.floorPrice })}
        </div>
      </footer>
    </article>
  );
}

interface CollectionCardSkeletonProps {
  className?: string;
}

CollectionCard.Skeleton = function CollectionCardSkeleton({
  className,
}: CollectionCardSkeletonProps): JSX.Element {
  return <div className={clsx('aspect-square animate-pulse rounded-lg bg-gray-800', className)} />;
};

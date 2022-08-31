import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { Nft } from '../graphql.types';
import Button, { ButtonSize, ButtonType } from './Button';

interface NftCardProps {
  nft: Nft;
}

export function NftCard({ nft }: NftCardProps): JSX.Element {
  const { t } = useTranslation('common');

  return (
    <div className="overflow-clip rounded-md text-white shadow-lg transition hover:scale-[1.02]">
      <img
        src={nft.image}
        alt={`Nft image for ${nft.mintAddress}`}
        className="aspect-square w-full object-cover"
      />
      <div className="p-4">
        <div className="mb-4 flex h-6 flex-row items-center justify-start gap-2 text-white">
          {nft.collection && (
            <img
              src={nft.collection?.nft?.image}
              alt={`Collection NFT image ${nft.collection?.nft.mintAddress}`}
              className="aspect-square w-6 rounded-sm object-cover"
            />
          )}
          <span className="truncate">{nft.name}</span>
        </div>
        <div className="flex flex-row items-center justify-between">
          <span className="text-lg">56.90 SOL</span>
          <Button type={ButtonType.Primary} size={ButtonSize.Small}>
            {t('buy')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface NftCardSkeletonProps {
  className?: string;
  key?: any;
}

function NftCardSkeleton({ className }: NftCardSkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse overflow-clip rounded-md text-white shadow-lg transition',
        className
      )}
    >
      <div className="aspect-square w-full bg-gray-800 object-cover" />
      <div className="p-4">
        <div className="mb-4 flex flex-row items-center justify-start gap-2 text-white">
          <div className="aspect-square w-6 rounded-sm bg-gray-800 object-cover" />
          <span className="h-4 w-20 truncate rounded-md bg-gray-800" />
        </div>
        <div className="flex flex-row items-center justify-between">
          <span className="h-6 w-16 rounded-md bg-gray-800" />
          <div className="h-8 w-16 rounded-full bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

NftCard.Skeleton = NftCardSkeleton;

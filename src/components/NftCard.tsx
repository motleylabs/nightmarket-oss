import { useReactiveVar } from '@apollo/client';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { viewerVar } from '../cache';
import { Nft } from '../graphql.types';
import Button, { ButtonSize, ButtonType } from './Button';
import Icon from './Icon';

interface NftCardProps {
  nft: Nft;
  link: string;
  onBuy?: () => void;
  onMakeOffer?: () => void;
}

enum NFTStates {
  LISTED,
  UNLISTED,
  LISTED_ON_ME,
  OWNER,
  // OWNED AND LISTED?
}

export function NftCard({ nft, onBuy, onMakeOffer, link }: NftCardProps): JSX.Element {
  const { t } = useTranslation('common');

  const nightmarketListings = nft.listings?.filter(
    (listing) => listing.auctionHouse?.address === process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS
  );
  const magicEdenListings = nft.listings?.filter(
    (listing) => listing.auctionHouse?.address === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K'
  );

  const viewer = useReactiveVar(viewerVar);

  const listing = nightmarketListings?.sort((a, b) => a.price - b.price)[0];
  const isListedOnME = !!magicEdenListings.length;

  const lastSale = nft.purchases[0]?.previewPrice;

  const isOwner = viewer ? viewer?.address === nft.owner?.address : false;

  if (listing) {
    console.log('nft', nft.name, { nft, listing });
  }

  return (
    <div className="group overflow-clip rounded-2xl bg-gray-800 text-white shadow-lg transition">
      <Link href={link} passHref>
        <a className="block overflow-hidden">
          <img
            src={nft.image}
            alt={`Nft image for ${nft.mintAddress}`}
            className={clsx(
              'aspect-square w-full  object-cover',
              'duration-100 ease-out group-hover:origin-center group-hover:scale-105 group-hover:ease-in' // this does not work quite as it should yet, the point is to get the image to scale up wihtout affecting the rest of the card. Like OS.
            )}
          />
        </a>
      </Link>
      <div className="z-20 p-4">
        <Link href={link} passHref>
          <a>
            <div className="mb-4 flex h-6 flex-row items-center justify-start gap-2 text-white">
              {nft.collection?.nft?.image && (
                <img
                  src={nft.collection?.nft?.image}
                  alt={`Collection NFT image ${nft.collection?.nft.mintAddress}`}
                  className="aspect-square w-6 rounded-sm object-cover"
                />
              )}
              <span className="truncate">{nft.name}</span>
            </div>
          </a>
        </Link>
        <div className="relative flex flex-row items-center justify-between">
          {isOwner ? (
            <>
              {listing ? (
                <>
                  <span className="flex items-center text-lg font-bold">
                    <Icon.Sol />
                    {listing?.previewPrice}
                  </span>
                  <Button type={ButtonType.Primary} size={ButtonSize.Small}>
                    {t('update')}
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-lg"></span>
                  <Button
                    className="font-extrabold"
                    type={ButtonType.Tertiary}
                    size={ButtonSize.Small}
                  >
                    {t('list')}
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              {listing ? (
                <>
                  <span className="flex items-center text-lg">
                    <Icon.Sol />
                    {listing?.previewPrice}
                  </span>
                  <Button onClick={onBuy} type={ButtonType.Secondary} size={ButtonSize.Small}>
                    {t('buy')}
                  </Button>
                </>
              ) : (
                <>
                  {/* TODO: last sale price */}
                  <span className="flex items-center text-sm text-gray-300">
                    {Boolean(lastSale) && (
                      <>
                        Last sale <Icon.Sol className="mx-1 h-3 w-3" /> {lastSale}
                      </>
                    )}
                  </span>
                  <Button onClick={onMakeOffer} type={ButtonType.Tertiary} size={ButtonSize.Small}>
                    {t('offer')}
                  </Button>
                </>
              )}
            </>
          )}
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

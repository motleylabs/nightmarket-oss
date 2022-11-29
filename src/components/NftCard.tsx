import { useReactiveVar } from '@apollo/client';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import config from '../app.config';
import { viewerVar } from '../cache';
import { Nft } from '../graphql.types';
import useViewer from '../hooks/viewer';
import Button, { ButtonBackground, ButtonBorder, ButtonColor, ButtonSize } from './Button';
import { Buyable } from './Buyable';
import Icon from './Icon';
import { Offerable } from './Offerable';

interface NftCardProps {
  nft: Nft;
  link: string;
  showCollectionThumbnail?: boolean;
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

// TODO: listing & update listing when instructions done
export function NftCard({
  nft,
  onBuy,
  showCollectionThumbnail = true,
  onMakeOffer,
  link,
}: NftCardProps): JSX.Element {
  const { t } = useTranslation(['common', 'offerable']);

  const { data } = useViewer();

  const listing = nft.listings?.find((listing) => {
    return listing.auctionHouse?.address === config.auctionHouse;
  });

  const myOffer = nft.offers?.find((offer) => {
    return offer.buyer === data?.wallet.address;
  });

  const viewer = useReactiveVar(viewerVar);

  const isOwner = viewer ? viewer?.address === nft.owner?.address : false;

  return (
    <>
      <div className="group overflow-clip rounded-2xl bg-gray-800 pb-4 text-white shadow-lg transition">
        <Link href={link}>
          <div className="relative block overflow-hidden">
            <img
              src={nft.image}
              alt={`Nft image for ${nft.mintAddress}`}
              className={clsx(
                'aspect-square w-full object-cover',
                'duration-100 ease-out group-hover:origin-center group-hover:scale-105 group-hover:ease-in'
              )}
            />
            {nft.moonrankRank && (
              <span className="absolute left-0 top-0 m-2 flex items-center gap-1 rounded-full bg-gray-800 py-1 px-2 text-sm">
                <img
                  src="/images/moonrank-logo.svg"
                  className="h-2.5 w-auto object-cover"
                  alt="moonrank logo"
                />
                {nft.moonrankRank}
              </span>
            )}
          </div>
          <div className="z-20 p-4">
            <div className="flex h-6 flex-row items-center justify-start gap-2 text-white">
              {nft.moonrankCollection?.image && showCollectionThumbnail && (
                <img
                  src={nft.moonrankCollection?.image}
                  alt={`Collection NFT image ${nft.moonrankCollection?.id}`}
                  className="aspect-square w-4 rounded-sm object-cover"
                />
              )}
              <span className="truncate">{nft.name}</span>
            </div>
          </div>
        </Link>

        <div className="relative flex h-[28px] flex-row items-center justify-between px-4">
          {isOwner ? (
            <>
              {listing ? (
                <span className="flex items-center justify-center gap-1 text-lg">
                  <Icon.Sol /> {listing?.solPrice}
                </span>
              ) : nft.lastSale?.price ? (
                <span className="flex flex-wrap items-center gap-1 text-sm text-gray-300">
                  {t('lastSale')}
                  <div className="flex flex-row items-center gap-1">
                    <Icon.Sol className="flex h-3 w-3 pt-0.5" />
                    {nft.lastSale?.solPrice}
                  </div>
                </span>
              ) : (
                <div />
              )}
            </>
          ) : (
            <>
              {listing ? (
                <>
                  <span className="flex items-center justify-start gap-1 text-lg">
                    <Icon.Sol /> {listing?.solPrice}
                  </span>
                  <Buyable connected={Boolean(viewer)}>
                    {({ buyNow }) => (
                      <Button
                        onClick={() => buyNow(nft.mintAddress)}
                        size={ButtonSize.Small}
                        background={ButtonBackground.Slate}
                        border={ButtonBorder.Gradient}
                        color={ButtonColor.Gradient}
                      >
                        {t('buy')}
                      </Button>
                    )}
                  </Buyable>
                </>
              ) : (
                <div className="flex w-full items-center justify-between gap-1">
                  {myOffer ? (
                    <span className="flex flex-wrap items-center gap-1 text-sm text-gray-300">
                      {t('offerable.yourOffer')}
                      <div className="flex flex-row items-center gap-1">
                        <Icon.Sol />
                        {myOffer.solPrice}
                      </div>
                    </span>
                  ) : nft.lastSale?.price ? (
                    <span className="flex flex-wrap items-center gap-1 text-sm text-gray-300">
                      {t('lastSale')}
                      <div className="flex flex-row items-center gap-1">
                        <Icon.Sol className="flex h-3 w-3 pt-0.5" />
                        {nft.lastSale?.solPrice}
                      </div>
                    </span>
                  ) : (
                    <div />
                  )}
                  {!myOffer && (
                    <Offerable connected={Boolean(viewer)}>
                      {({ makeOffer }) => (
                        <Button
                          onClick={() => makeOffer(nft.mintAddress)}
                          border={ButtonBorder.Gray}
                          color={ButtonColor.Gray}
                          size={ButtonSize.Small}
                        >
                          {t('offer')}
                        </Button>
                      )}
                    </Offerable>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
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

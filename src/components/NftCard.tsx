import { useReactiveVar } from '@apollo/client';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { viewerVar } from '../cache';
import { Nft } from '../graphql.types';
import Button, { ButtonBackground, ButtonBorder, ButtonColor, ButtonSize } from './Button';

interface NftCardProps {
  nft: Nft;
  link: string;
  onBuy?: () => void;
  onMakeOffer?: () => void;
}

// TODO: listing & update listing when instructions done
export function NftCard({ nft, onBuy, onMakeOffer, link }: NftCardProps): JSX.Element {
  const { t } = useTranslation('common');

  const daomarketListings = nft.listings?.filter(
    (listing) => listing.auctionHouse?.address === process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS
  );
  // const magicEdenListings = nft?.magicEdenListings;

  const viewer = useReactiveVar(viewerVar);

  const listing = daomarketListings?.sort((a, b) => a.price - b.price)[0];

  const lastSale = nft.purchases[0]?.previewPrice;

  const isOwner = viewer ? viewer?.address === nft.owner?.address : false;

  // console.log('nft', nft.name, {
  //   nft,
  //   magicEdenListings,
  // });

  return (
    <>
      <div className="group overflow-clip rounded-2xl bg-gray-800 pb-4 text-white shadow-lg transition">
        <Link href={link} passHref>
          <a>
            <div className="block overflow-hidden">
              <img
                src={nft.image}
                alt={`Nft image for ${nft.mintAddress}`}
                className={clsx(
                  'aspect-square w-full  object-cover',
                  'duration-100 ease-out group-hover:origin-center group-hover:scale-105 group-hover:ease-in' // this does not work quite as it should yet, the point is to get the image to scale up wihtout affecting the rest of the card. Like OS.
                )}
              />
            </div>

            <div className="z-20 p-4">
              {/* <Link href={link} passHref>
              <a> */}
              <div className="flex h-6 flex-row items-center justify-start gap-2 text-white">
                {nft.collection?.image && (
                  <img
                    src={nft.collection?.image}
                    alt={`Collection NFT image ${nft.collection?.id}`}
                    className="aspect-square w-4 rounded-sm object-cover"
                  />
                )}
                <span className="truncate">{nft.name}</span>
              </div>
              {/* </a>
            </Link> */}
            </div>
          </a>
        </Link>

        <div className="relative flex flex-row items-center justify-between px-4">
          {isOwner ? (
            <>
              <span className="text-lg">{listing && `${listing?.previewPrice} SOL`}</span>
              {!listing ? (
                <Button border={ButtonBorder.Gray} color={ButtonColor.Gray} size={ButtonSize.Small}>
                  {t('list')}
                </Button>
              ) : (
                <Button
                  disabled
                  border={ButtonBorder.Gradient}
                  color={ButtonColor.Gradient}
                  size={ButtonSize.Small}
                >
                  {t('update')}
                </Button>
              )}
            </>
          ) : (
            <>
              {listing ? (
                <>
                  <span className="text-lg">{listing?.previewPrice} SOL</span>
                  <Button
                    onClick={onBuy}
                    size={ButtonSize.Small}
                    background={ButtonBackground.Slate}
                    border={ButtonBorder.Gradient}
                    color={ButtonColor.Gradient}
                  >
                    {t('buy')}
                  </Button>
                </>
              ) : (
                <>
                  {/* TODO: last sale price */}
                  <span className="text-lg"></span>
                  <Button
                    onClick={onMakeOffer}
                    border={ButtonBorder.Gray}
                    color={ButtonColor.Gray}
                    size={ButtonSize.Small}
                  >
                    {t('offer')}
                  </Button>
                </>
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

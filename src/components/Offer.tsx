import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { Maybe, NftMarketplace } from '../graphql.types';
import useProfileInfo from '../hooks/profileinfo';
import Link from 'next/link';
import { Avatar, AvatarSize } from './Avatar';
import Button, { ButtonType } from './Button';

export function Offer(): JSX.Element {
  return <div></div>;
}

interface OfferCardProps {
  isOwner: boolean;
  userAddress: string;
  description: ReactNode | any;
  action: ReactNode | any;
  hidden?: boolean;
}

function OfferCard({ userAddress, description, action, hidden = false }: OfferCardProps) {
  const { wallet } = useProfileInfo(userAddress);

  if (hidden) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-800 p-4">
      <Link href={`/profiles/${wallet?.address}/collected`} passHref>
        <a className="transition hover:scale-[1.02]">
          <Avatar circle size={AvatarSize.Standard} src={wallet?.previewImage as string} />
        </a>
      </Link>
      <div className="flex w-full items-center justify-between">
        {description}
        {action}
      </div>
    </div>
  );
}

Offer.Card = OfferCard;

interface OfferDescription {
  price: Maybe<number> | undefined;
  nftMarketplace: Maybe<NftMarketplace> | undefined;
  userAddress: string;
  variant?: 'viewer' | 'buyer' | 'owner';
}

function OfferCardDescription({
  nftMarketplace,
  price,
  userAddress,
  variant = 'viewer',
}: OfferDescription) {
  const { t } = useTranslation('offers');
  const { wallet } = useProfileInfo(userAddress);

  switch (variant) {
    case 'viewer':
      return (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-medium text-white">
            <Link href={`/profiles/${wallet?.address}/collected`} passHref>
              <a className="transition hover:scale-[1.02]">{wallet?.displayName}</a>
            </Link>{' '}
            <span className="text-gray-300">{t('made')}</span>
          </p>
          <img
            src={nftMarketplace?.logo as string}
            alt={`nft marketplace logo ${nftMarketplace?.marketplaceProgramAddress}`}
            className="h-4 w-20 object-contain"
          />
        </div>
      );
    case 'buyer':
      return (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-medium text-white">{price} SOL</p>
          <img
            src={nftMarketplace?.logo as string}
            alt={`nft marketplace logo ${nftMarketplace?.marketplaceProgramAddress}`}
            className="h-4 w-20 object-contain"
          />
        </div>
      );
    case 'owner':
      return (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-medium text-white">{price} SOL</p>
          <div className="flex gap-2">
            <img
              src={nftMarketplace?.logo as string}
              alt={`nft marketplace logo ${nftMarketplace?.marketplaceProgramAddress}`}
              className="h-4 w-20 border-r-2 border-r-gray-600 object-contain pr-2"
            />
            <Link href={`/profiles/${wallet?.address}/collected`} passHref>
              <a className="m-0 text-xs font-medium text-white transition hover:scale-[1.02]">
                {wallet?.displayName}
              </a>
            </Link>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-medium text-white">
            <Link href={`/profiles/${wallet?.address}/collected`} passHref>
              <a className="transition hover:scale-[1.02]">{wallet?.displayName}</a>
            </Link>{' '}
            <span className="text-gray-300">{t('placedOffer')}</span>
          </p>
        </div>
      );
  }
}

OfferCard.Description = OfferCardDescription;

function OfferCardSkeleton(): JSX.Element {
  return <div className="h-[78px] w-full animate-pulse rounded-lg bg-gray-800"></div>;
}

OfferCard.Skeleton = OfferCardSkeleton;

interface OfferAction {
  timeSince: Maybe<String> | undefined;
  price: Maybe<number> | undefined;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  isActionable?: boolean;
  variant?: 'viewer' | 'buyer' | 'owner';
}

function OfferAction({
  timeSince,
  price,
  isActionable = true,
  variant = 'viewer',
  onSecondaryAction,
  onPrimaryAction,
}: OfferAction) {
  const { t } = useTranslation('offers');

  switch (variant) {
    case 'viewer':
      return (
        <div className="flex flex-col justify-end gap-2 text-right">
          <p className="m-0 text-sm font-medium text-white">{price} SOL</p>
          <p className="m-0 text-xs font-light text-gray-300">{timeSince}</p>
        </div>
      );
    case 'buyer':
      return (
        <div className={`flex gap-4`}>
          <Button onClick={onSecondaryAction} type={ButtonType.Ghost}>
            {t('cancel')}
          </Button>
          <Button onClick={onPrimaryAction} type={ButtonType.Secondary}>
            {t('update')}
          </Button>
        </div>
      );
    case 'owner':
      return (
        <>
          {isActionable ? (
            <Button onClick={onPrimaryAction} type={ButtonType.Primary}>
              {t('accept')}
            </Button>
          ) : (
            <Button onClick={onPrimaryAction} type={ButtonType.Ghost}>
              {t('view')}
            </Button>
          )}
        </>
      );
  }
}

Offer.Action = OfferAction;

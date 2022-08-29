import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { Maybe } from '../graphql.types';
import useProfileInfo from '../hooks/profileinfo';
import { shortenAddress } from '../modules/address';
import { Avatar, AvatarSize } from './Avatar';
import Button, { ButtonType } from './Button';

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
      <Avatar
        circle={true}
        size={AvatarSize.Standard}
        src={wallet?.profile?.profileImageUrlLowres || '/images/placeholder.png'}
      />
      <div className={`flex w-full items-center justify-between`}>
        {description}
        {action}
      </div>
    </div>
  );
}

export default OfferCard;

interface OfferDescription {
  price: Maybe<number> | undefined;
  marketplaceAddress: string;
  userAddress: string;
  variant?: 'viewer' | 'buyer' | 'owner';
}

function OfferDescription({
  marketplaceAddress,

  price,
  userAddress,
  variant = 'viewer',
}: OfferDescription) {
  const { t } = useTranslation('offers');
  const { wallet } = useProfileInfo(userAddress);

  // TODO: add marketplace image helper component

  switch (variant) {
    case 'viewer':
      return (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-medium text-white">
            {wallet?.profile?.handle ? `@${wallet.profile.handle}` : shortenAddress(userAddress)}{' '}
            <span className="text-gray-300">{t('made')}</span>
          </p>
          <img src={'/images/nightmarket.svg'} alt={marketplaceAddress} className="h-4 w-20" />
        </div>
      );
    case 'buyer':
      return (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-medium text-white">{price} SOL</p>
          <img src={'/images/nightmarket.svg'} alt={marketplaceAddress} className="h-4 w-20" />
        </div>
      );
    case 'owner':
      return (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-medium text-white">{price} SOL</p>
          <div className="flex gap-2">
            <img
              src={'/images/nightmarket.svg'}
              alt={marketplaceAddress}
              className="h-4 w-20 border-r-2 border-r-gray-600 pr-2"
            />

            <p className="m-0 text-xs font-medium text-white">
              {wallet?.profile?.handle
                ? `@${wallet?.profile?.handle}`
                : shortenAddress(userAddress)}
            </p>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-medium text-white">
            @{wallet?.profile?.handle || shortenAddress(userAddress)}{' '}
            <span className="text-gray-300">made an offer</span>
          </p>
        </div>
      );
  }
}

OfferCard.Description = OfferDescription;

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
        <div className="flex flex-col gap-2">
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
    default:
      return (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-medium text-white">{price} SOL</p>
          <p className="m-0 text-xs font-light text-gray-300">{timeSince}</p>
        </div>
      );
  }
}

OfferCard.Action = OfferAction;

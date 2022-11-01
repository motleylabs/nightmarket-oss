import { Offer } from '../graphql.types';
import Button, { ButtonSize, ButtonBackground, ButtonColor, ButtonBorder } from './Button';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Avatar, AvatarSize } from './Avatar';
import { Activity, ActivityType } from './Activity';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCloseOffer } from './../hooks/offer';

interface OfferProps {
  offer: Offer;
}
export default function OfferUI({ offer }: OfferProps): JSX.Element {
  const { publicKey } = useWallet();
  const { t } = useTranslation('offers');
  const { closingOffer, onCloseOffer } = useCloseOffer(offer);
  return (
    <Activity
      avatar={
        <Link href={`/nfts/${offer.nft?.mintAddress}/details`} passHref>
          <a className="cursor-pointer transition hover:scale-[1.02]">
            <Avatar src={offer.nft?.image as string} size={AvatarSize.Standard} />
          </a>
        </Link>
      }
      type={ActivityType.Offer}
      key={offer.id}
      meta={
        <Activity.Meta
          title={<Activity.Tag />}
          marketplace={offer.nftMarketplace}
          source={<Activity.Wallet wallet={offer.buyerWallet} />}
        />
      }
      actionButton={
        publicKey &&
        (offer.buyer === publicKey?.toBase58() ? (
          <Button
            background={ButtonBackground.Slate}
            border={ButtonBorder.Gray}
            color={ButtonColor.Gray}
            size={ButtonSize.Small}
            loading={closingOffer}
            disabled={closingOffer}
            onClick={() => onCloseOffer({ nft: offer.nft, auctionHouse: offer.auctionHouse })}
          >
            {t('common:cancel')}
          </Button>
        ) : (
          <Button
            background={ButtonBackground.Slate}
            border={ButtonBorder.Gradient}
            color={ButtonColor.Gradient}
            size={ButtonSize.Small}
            onClick={() => {}}
          >
            {t('accept')}
          </Button>
        ))
      }
    >
      <Activity.Price amount={offer.solPrice} />
      <Activity.Timestamp timeSince={offer.timeSince} />
    </Activity>
  );
}

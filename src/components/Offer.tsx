import { AuctionHouse, Offer, Maybe } from '../graphql.types';
import Button, { ButtonSize, ButtonBackground, ButtonColor, ButtonBorder } from './Button';
import { useTranslation } from 'next-i18next';
import { Activity, ActivityType } from './Activity';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCloseOffer } from './../hooks/offer';

interface OfferProps {
  offer: Offer;
  auctionHouse: Maybe<AuctionHouse> | undefined;
}
export default function OfferUI({ offer, auctionHouse }: OfferProps): JSX.Element {
  const { publicKey } = useWallet();
  const { t } = useTranslation('offers');
  const { closingOffer, onCloseOffer } = useCloseOffer(offer);
  const viewerAddress = publicKey?.toBase58();

  return (
    <Activity
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
        publicKey && (
          <>
            {offer.buyer == viewerAddress && (
              <Button
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gray}
                color={ButtonColor.Gray}
                size={ButtonSize.Small}
                loading={closingOffer}
                disabled={closingOffer}
                onClick={() => onCloseOffer({ nft: offer.nft, auctionHouse })}
              >
                {t('common:cancel')}
              </Button>
            )}
            {offer.nft?.owner?.address === viewerAddress && (
              <Button
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gradient}
                color={ButtonColor.Gradient}
                size={ButtonSize.Small}
                onClick={() => {}}
              >
                {t('accept')}
              </Button>
            )}
          </>
        )
      }
    >
      <Activity.Price amount={offer.solPrice} />
      <Activity.Timestamp timeSince={offer.timeSince} />
    </Activity>
  );
}

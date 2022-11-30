import { AuctionHouse, Offer, Maybe, Nft, AhListing } from '../graphql.types';
import { useMemo } from 'react';
import Button, { ButtonSize, ButtonBackground, ButtonColor, ButtonBorder } from './Button';
import { useTranslation } from 'next-i18next';
import { Activity, ActivityType } from './Activity';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCloseOffer, useAcceptOffer, AcceptOfferResponse } from './../hooks/offer';
import config from '../app.config';
import { toast } from 'react-toastify';

interface OfferProps {
  offer: Offer;
  auctionHouse: Maybe<AuctionHouse> | undefined;
  avatar?: JSX.Element;
  meta: JSX.Element;
  nft: Maybe<Nft> | undefined;
  onCancel: () => void;
  onAccept: (payload: AcceptOfferResponse) => void;
}

export default function OfferUI({
  offer,
  auctionHouse,
  nft,
  meta,
  avatar,
  onAccept,
  onCancel,
}: OfferProps): JSX.Element {
  const { publicKey } = useWallet();
  const { t } = useTranslation('common');
  const { closingOffer, onCloseOffer } = useCloseOffer(offer);
  const viewerAddress = publicKey?.toBase58();

  const listing: AhListing | null = useMemo(() => {
    const listing = nft?.listings?.find((listing: AhListing) => {
      return listing.auctionHouse?.address === config.auctionHouse;
    });

    return listing || null;
  }, [nft?.listings]);

  const { onAcceptOffer, acceptingOffer } = useAcceptOffer(offer);

  const handleAcceptOffer = async () => {
    if (!auctionHouse || !nft) {
      return;
    }

    try {
      const response = await onAcceptOffer({ auctionHouse, nft, listing });

      if (!response) {
        return;
      }

      onAccept(response);
    } catch (e: any) {}
  };

  const handleCancelOffer = async () => {
    try {
      await onCloseOffer({ nft, auctionHouse });
      onCancel();
    } catch (err: any) {}
  };

  return (
    <Activity
      type={ActivityType.OfferCreated}
      key={offer.id}
      avatar={avatar}
      meta={meta}
      actionButton={
        offer.auctionHouse?.address === config.auctionHouse && (
          <>
            {offer.buyer === viewerAddress && (
              <Button
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gray}
                color={ButtonColor.Gray}
                size={ButtonSize.Small}
                loading={closingOffer}
                disabled={closingOffer}
                onClick={handleCancelOffer}
              >
                {t('cancel')}
              </Button>
            )}
            {nft?.owner?.address === viewerAddress && (
              <Button
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gradient}
                color={ButtonColor.Gradient}
                size={ButtonSize.Small}
                onClick={handleAcceptOffer}
                loading={acceptingOffer}
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

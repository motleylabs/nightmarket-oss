import { useWallet } from '@solana/wallet-adapter-react';

import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import config from '../app.config';
import type { Offer, Nft, ActionInfo, AuctionHouse } from '../typings';
import type { AcceptOfferResponse } from './../hooks/offer';
import { useCloseOffer, useAcceptOffer } from './../hooks/offer';
import { Activity, ActivityType } from './Activity';
import Button, { ButtonSize, ButtonBackground, ButtonColor, ButtonBorder } from './Button';

interface OfferProps {
  offer: Offer;
  auctionHouse?: AuctionHouse | null;
  avatar?: JSX.Element;
  meta: JSX.Element;
  nft: Nft | null;
  source?: JSX.Element;
  onCancel: () => void;
  onAccept: (payload: AcceptOfferResponse) => void;
}

export default function OfferUI({
  offer,
  source,
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
  const viewerAddress = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const listing: ActionInfo | null = useMemo(() => {
    if (nft?.latestListing?.auctionHouseAddress === config.auctionHouse) {
      return nft?.latestListing;
    }
    return null;
  }, [nft?.latestListing]);

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
    } catch (e: unknown) {}
  };

  const handleCancelOffer = async () => {
    try {
      await onCloseOffer({ nft, auctionHouse });
      onCancel();
    } catch (err: unknown) {}
  };

  return (
    <Activity
      type={ActivityType.OfferCreated}
      key={offer.martketplaceProgramAddress}
      avatar={avatar}
      meta={meta}
      source={source}
      actionButton={
        offer.martketplaceProgramAddress === config.auctionHouse && (
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
                {t('cancel', { ns: 'common' })}
              </Button>
            )}
            {nft?.owner === viewerAddress && (
              <Button
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gradient}
                color={ButtonColor.Gradient}
                size={ButtonSize.Small}
                onClick={handleAcceptOffer}
                loading={acceptingOffer}
              >
                {t('accept', { ns: 'common' })}
              </Button>
            )}
          </>
        )
      }
    >
      <Activity.Price amount={Number(offer.price)} />
      <Activity.Timestamp signature={offer.signature} timeSince={offer.blockTimestamp} />
    </Activity>
  );
}

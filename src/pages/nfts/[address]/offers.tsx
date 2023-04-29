import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';
import { useMemo, useEffect } from 'react';

import { Activity } from '../../../components/Activity';
import { useOffers } from '../../../hooks/nft';
import { useAction } from '../../../hooks/useAction';
import { createApiTransport } from '../../../infrastructure/api';
import NftLayout from '../../../layouts/NftLayout';
import { useAuctionHouseContext } from '../../../providers/AuctionHouseProvider';
import { useWalletContext } from '../../../providers/WalletContextProvider';
import type { Nft, OfferEvent } from '../../../typings';
import Offer from './../../../components/Offer';

export async function getServerSideProps({ req, locale, params }: GetServerSidePropsContext) {
  try {
    const i18n = await serverSideTranslations(locale as string, ['common', 'nft', 'offers']);

    const api = createApiTransport(req);

    const { data } = await api.get<Nft>(`/nfts/${params?.address}`);

    if (data == null) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        nft: data,
        ...i18n,
      },
    };
  } catch (err) {
    throw err;
  }
}

interface NftOfferPageProps {
  nft: Nft;
}

export default function NftOffers({ nft }: NftOfferPageProps) {
  const { t } = useTranslation('offers');
  const { address } = useWalletContext();
  const { isLoading: auctionHouseLoading, auctionHouse } = useAuctionHouseContext();
  const { data: nftOffers, isLoading, isValidating, mutate } = useOffers(nft.mintAddress);
  const { on, off } = useAction();

  const addOffer = (event: Event) => {
    const newOfferEvent: OfferEvent = (event as CustomEvent).detail;

    if (newOfferEvent.mint === nft.mintAddress) {
      if (!isLoading && !isValidating && !!nftOffers) {
        const offerIndex = nftOffers.findIndex(
          (offer) => offer.buyer === newOfferEvent.offer.buyer
        );
        if (offerIndex > -1) {
          nftOffers.splice(offerIndex, 1);
        }
        if (newOfferEvent.offer.activityType.toLowerCase() !== 'cancelbid') {
          mutate([newOfferEvent.offer, ...nftOffers], { revalidate: false });
        } else {
          mutate([...nftOffers], { revalidate: false });
        }
      }
    }
  };

  const clearOffers = () => {
    mutate([], { revalidate: false });
  };

  useEffect(() => {
    on('offer-add', addOffer);
    on('offer-clear', clearOffers);

    return () => {
      off('offer-add', addOffer);
      off('offer-clear', clearOffers);
    };
  });

  const yourOffers = useMemo(
    () => nftOffers?.filter((offer) => offer.buyer === address),
    [nftOffers, address]
  );

  const remainingOffers = useMemo(
    () => nftOffers?.filter((offer) => offer.buyer !== address),
    [nftOffers, address]
  );

  if (!nftOffers && (auctionHouseLoading || isLoading || isValidating)) {
    return (
      <div className="flex flex-col gap-4">
        <Activity.Skeleton />
        <Activity.Skeleton />
        <Activity.Skeleton />
        <Activity.Skeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {nftOffers?.length === 0 && (
        <div className="flex w-full justify-center rounded-md border border-gray-800 p-4">
          <h3 className="text-gray-300">{t('noOffers', { ns: 'offers' })}</h3>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {yourOffers && yourOffers.length > 0 && (
          <>
            <h6 className="m-0 mt-2 text-2xl font-medium  text-white">
              {t('yours', { ns: 'offers' })}
            </h6>
            {yourOffers.map((offer, i) => (
              <Offer
                meta={
                  <Activity.Meta
                    title={<Activity.Tag />}
                    marketplaceAddress={offer.martketplaceProgramAddress}
                    auctionHouseAddress={offer.auctionHouseAddress}
                  />
                }
                source={<Activity.Wallet buyer={offer.buyer} />}
                offer={offer}
                key={i}
                auctionHouse={auctionHouse}
                nft={nft}
                onAccept={() => null}
                onCancel={() => null}
              />
            ))}
          </>
        )}
        {remainingOffers && remainingOffers.length > 0 && (
          <>
            <h6 className="m-0 mt-2 text-2xl font-medium text-white">
              {t('all', { ns: 'offers' })}
            </h6>
            {remainingOffers?.map((offer, i) => (
              <Offer
                meta={
                  <Activity.Meta
                    title={<Activity.Tag />}
                    marketplaceAddress={offer.martketplaceProgramAddress}
                    auctionHouseAddress={offer.auctionHouseAddress}
                  />
                }
                source={<Activity.Wallet buyer={offer.buyer} />}
                offer={offer}
                key={i}
                auctionHouse={auctionHouse}
                nft={nft}
                onAccept={({ buyerReceiptTokenAccount }) => {
                  // TODO: refresh UI after accepting offer
                  // eslint-disable-next-line no-console
                  console.log({ buyerReceiptTokenAccount });
                }}
                onCancel={() => null}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

interface NftDetailsLayoutProps {
  children: ReactNode;
  nft: Nft;
  auctionHouse: string;
}

NftOffers.getLayout = function NftDetailsLayout({
  children,
  nft,
}: NftDetailsLayoutProps): JSX.Element {
  return <NftLayout nft={nft}>{children}</NftLayout>;
};

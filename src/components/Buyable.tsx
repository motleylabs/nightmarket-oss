import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { Marketplace, Nft } from '../graphql.types';
import useLogin from '../hooks/login';
import Modal from './Modal';
import BuyableQuery from './../queries/buyable.graphql';
import { useLazyQuery, useReactiveVar } from '@apollo/client';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from './Button';
import { Form } from './Form';
import useBuyNow from '../hooks/buy';
import { viewerVar } from '../cache';

interface BuyableData {
  nft: Nft;
  marketplace: Marketplace;
}

interface RenderProps {
  buyNow: (mintAddress: string) => void;
  children: any;
}

interface BuyableProps {
  connected?: boolean;
  children: (args: RenderProps) => any;
}

export function Buyable({ children, connected = false }: BuyableProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const openBuyNow = (mintAddress: string) => {
    buyableQuery({
      variables: { address: mintAddress, subdomain: process.env.NEXT_PUBLIC_MARKETPLACE_SUBDOMAIN },
    });
    setOpen(true);
  };
  const viewer = useReactiveVar(viewerVar);
  const onLogin = useLogin();

  const [buyableQuery, { data, loading, refetch, previousData }] =
    useLazyQuery<BuyableData>(BuyableQuery);

  const nightmarketListings = data?.nft.listings?.filter(
    (listing) => listing.auctionHouse?.address === process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS
  );
  const listing = nightmarketListings?.sort((a, b) => a.price - b.price)[0];

  const { onBuyNow, handleSubmitBuy, onCloseBuy, buyFormState, setValue } = useBuyNow();
  useEffect(() => {
    setValue('amount', listing?.price.toString());
    // TODO: handle form errors somehow
  }, [setValue, listing]);

  const handleBuy = async () => {
    if (data?.nft && data.marketplace && data.nft.listings && listing) {
      await onBuyNow({ marketplace: data.marketplace, nft: data.nft, ahListing: listing });
    }
  };

  return (
    <>
      {children({
        buyNow: openBuyNow,
        children,
      })}
      <Modal title={t('buyable.buyNow')} open={open} setOpen={setOpen}>
        <div className="mt-6 flex flex-col gap-6">
          {loading ? (
            <>
              <section id={'loading-preview-card'} className="flex flex-row gap-4">
                <div className="h-12 w-12 animate-pulse rounded-md bg-gray-800" />
                <div className="flex flex-col justify-between gap-2">
                  <p className="h-5 w-40 animate-pulse rounded-md bg-gray-800" />
                  <p className="h-4 w-32 animate-pulse rounded-md bg-gray-800" />
                </div>
              </section>
              <section id={'loading-rewards'}>
                <div className="h-10 rounded-md bg-primary-500 bg-opacity-50" />
              </section>
              <section id={'loading-prices'} className="flex flex-col gap-2">
                <div className="flex flex-row justify-between gap-2">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-gray-800" />
                  <div className="h-6 w-1/5 animate-pulse rounded-md bg-gray-800" />
                </div>
                <div className="flex flex-row justify-between gap-2">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-gray-800" />
                  <div className="h-6 w-1/5 animate-pulse rounded-md bg-gray-800" />
                </div>
                <div className="flex flex-row justify-between gap-2">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-gray-800" />
                  <div className="h-6 w-1/5 animate-pulse rounded-md bg-gray-800" />
                </div>
                <div className="flex flex-row justify-between gap-2">
                  <div className="h-6 w-1/2 animate-pulse rounded-md bg-gray-800" />
                  <div className="h-6 w-1/5 animate-pulse rounded-md bg-gray-800" />
                </div>
              </section>
              <section id={'loading-buttons'} className="flex flex-col gap-4">
                <Button loading={true} />
                <Button
                  loading={true}
                  background={ButtonBackground.Slate}
                  border={ButtonBorder.Gradient}
                  color={ButtonColor.Gradient}
                />
              </section>
            </>
          ) : (
            <Form onSubmit={handleSubmitBuy(handleBuy)} className="flex flex-col gap-6">
              <section id={'preview-card'} className="flex flex-row gap-4">
                <img
                  src={data?.nft.image}
                  alt={data?.nft.name}
                  className="h-12 w-12 rounded-md object-cover text-xs"
                />
                <div className="flex flex-col justify-between gap-2">
                  <p className="text-base font-medium text-white">{data?.nft.name}</p>
                  <p className="text-xs font-semibold text-gray-300">
                    {data?.nft.moonrankCollection?.name}
                  </p>
                </div>
              </section>
              <section id={'rewards'}>
                <div className="flex flex-row items-center justify-between rounded-md bg-primary-500 p-4">
                  <img
                    src="/images/nightmarket.svg"
                    className="h-5 w-auto object-fill"
                    alt="night market logo"
                  />
                  <p>
                    {t('buyable.earnSauce')} <span className="text-primary-700">{400} SAUCE</span>
                  </p>
                </div>
              </section>
              <section id={'prices'} className="flex flex-col gap-2">
                {data?.nft.moonrankCollection?.trends && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">{t('buyable.floorPrice')}</p>
                    <p className="text-base font-medium text-gray-300">
                      {data?.nft.moonrankCollection?.trends?.compactFloor1d} SOL
                    </p>
                  </div>
                )}
                {data?.nft.listings && data?.nft.listings.length > 0 && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">{t('buyable.listPrice')}</p>
                    {/* TODO: sort for lowest listing thats not expired */}
                    <p className="text-base font-medium text-gray-300">
                      {data?.nft.listings[0].previewPrice} SOL
                    </p>
                  </div>
                )}
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('buyable.marketplaceFee')}
                  </p>
                  <p className="text-base font-medium text-gray-300">
                    {data?.marketplace.auctionHouses[0].fee}%
                    {/* TODO: calculate based on listing price */}
                  </p>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('buyable.currentBalance')}
                  </p>
                  <p className="text-base font-medium text-gray-300">
                    {viewer?.solBalance || '-'} SOL
                  </p>
                </div>
              </section>
              <section id={'buy-buttons'} className="flex flex-col gap-4">
                {connected ? (
                  <>
                    <Button
                      className="font-semibold"
                      block
                      htmlType="submit"
                      loading={buyFormState.isSubmitting}
                    >
                      {t('buyable.buyNowButton')}
                    </Button>
                    <Button
                      className="font-semibold"
                      block
                      onClick={() => {
                        onCloseBuy();
                        setOpen(false);
                      }}
                      background={ButtonBackground.Slate}
                      border={ButtonBorder.Gradient}
                      color={ButtonColor.Gradient}
                    >
                      {t('cancel')}
                    </Button>
                  </>
                ) : (
                  <Button onClick={onLogin} className="font-semibold">
                    {t('buyable.connectToBuy')}
                  </Button>
                )}
              </section>
            </Form>
          )}
        </div>
      </Modal>
    </>
  );
}

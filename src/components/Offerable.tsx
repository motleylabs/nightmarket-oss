import { useApolloClient, useLazyQuery, useReactiveVar } from '@apollo/client';
import React, { useState } from 'react';
import Modal from './Modal';
import OfferableQuery from './../queries/offerable.graphql';
import { AuctionHouse, Nft } from '../graphql.types';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from './Button';
import { useTranslation } from 'next-i18next';
import { Form } from './Form';
import { useMakeOffer } from '../hooks/offer';
import Icon from './Icon';
import useLogin from '../hooks/login';
import clsx from 'clsx';
import { viewerVar } from '../cache';
import config from './../app.config';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface OfferableData {
  nft: Nft;
  auctionHouse: AuctionHouse;
}

interface RenderProps {
  makeOffer: (mintAddress: string) => void;
  children: any;
}

interface OfferableProps {
  connected?: boolean;
  children: (args: RenderProps) => any;
}

export function Offerable({ children, connected = false }: OfferableProps) {
  const { t } = useTranslation(['common']);
  const viewer = useReactiveVar(viewerVar);
  const onLogin = useLogin();

  const client = useApolloClient();

  const [open, setOpen] = useState(false);
  const openOffer = (mintAddress: string) => {
    if (!viewer) {
      onLogin();
      return;
    }

    offerableQuery({
      variables: { address: mintAddress, auctionHouse: config.auctionHouse },
    });
    setOpen(true);
  };

  const [offerableQuery, { data, loading, refetch, previousData }] =
    useLazyQuery<OfferableData>(OfferableQuery);

  const myOffer = data?.nft.offers?.find((offer) => {
    return offer.buyer === viewer?.address;
  });

  const { registerOffer, onMakeOffer, handleSubmitOffer, onCancelMakeOffer, offerFormState } =
    useMakeOffer(data?.nft);

  const handleOffer = async ({ amount }: { amount: string }) => {
    if (!data?.nft || !data?.auctionHouse) {
      return;
    }

    try {
      const response = await onMakeOffer({
        amount,
        nft: data?.nft,
        auctionHouse: data.auctionHouse,
      });

      if (!response) {
        return;
      }

      const { buyerTradeState, metadata } = response;

      client.cache.updateQuery(
        {
          query: OfferableQuery,
          broadcast: false,
          overwrite: true,
          variables: {
            address: data.nft.mintAddress,
            auctionHouse: data.auctionHouse.address,
          },
        },
        (previous) => {
          const { nft }: { nft: Nft } = previous;

          const offer = {
            __typename: 'Offer',
            id: `temp-offer-${viewer?.address}`,
            tradeState: buyerTradeState.toBase58(),
            buyer: viewer?.address,
            metadata: metadata.toBase58(),
            auctionHouse: {
              address: data.auctionHouse.address,
              __typename: 'AuctionHouse',
            },
            price: (Number(amount) * LAMPORTS_PER_SOL).toString(),
          };

          const offers = [...nft.offers, offer];

          return {
            ...previous,
            nft: {
              ...nft,
              offers,
            },
          };
        }
      );
    } catch (e: any) {
    } finally {
      setOpen(false);
    }
  };

  return (
    <>
      {children({
        makeOffer: openOffer,
        children,
      })}
      <Modal title={t('offerable.makeOffer')} open={open} setOpen={setOpen}>
        <div className="mt-6 flex flex-col gap-6">
          {loading ? (
            <>
              <section className="flex flex-row gap-4">
                <div className="h-12 w-12 animate-pulse rounded-md bg-gray-800" />
                <div className="flex flex-col justify-between gap-2">
                  <p className="h-5 w-40 animate-pulse rounded-md bg-gray-800" />
                  <p className="h-4 w-32 animate-pulse rounded-md bg-gray-800" />
                </div>
              </section>
              <section className="flex flex-col gap-2">
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
              <section>
                <div className="h-10 w-full animate-pulse rounded-md border-2 border-gray-800 bg-gray-900" />
              </section>
              <section className="flex flex-col gap-4">
                <Button loading />
                <Button
                  loading
                  background={ButtonBackground.Slate}
                  border={ButtonBorder.Gradient}
                  color={ButtonColor.Gradient}
                />
              </section>
            </>
          ) : (
            <Form onSubmit={handleSubmitOffer(handleOffer)} className="flex flex-col gap-6">
              <section className="flex flex-row gap-4">
                <img
                  src={data?.nft.image}
                  alt={data?.nft.name}
                  className="h-12 w-12 rounded-md object-cover text-sm"
                />
                <div className="flex flex-col justify-between gap-2">
                  <p className="text-base font-medium text-white">{data?.nft.name}</p>
                  <p className="text-sm font-semibold text-gray-300">
                    {data?.nft.moonrankCollection?.name}
                  </p>
                </div>
              </section>
              <section className="flex flex-col gap-2">
                {myOffer && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('offerable.yourOffer')}
                    </p>
                    <p className="flex flex-row items-center  gap-1 text-base font-medium text-gray-300">
                      <Icon.Sol /> {myOffer?.solPrice}
                    </p>
                  </div>
                )}
                {data?.nft.moonrankCollection?.trends && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('offerable.floorPrice')}
                    </p>
                    <p className="flex flex-row items-center gap-1 text-base font-medium text-gray-300">
                      <Icon.Sol /> {data?.nft.moonrankCollection?.trends.compactFloor1d}
                    </p>
                  </div>
                )}
                {data?.nft.listings && data?.nft.listings.length > 0 && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('offerable.listPrice')}
                    </p>
                    {/* TODO: sort for lowest listing thats not expired */}
                    <p className="flex flex-row items-center gap-1 text-base font-medium text-gray-300">
                      <Icon.Sol /> {data.nft.listings[0].solPrice}
                    </p>
                  </div>
                )}
                {data?.nft.purchases && data?.nft.purchases.length > 0 && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('offerable.lastSoldPrice')}
                    </p>
                    <p className="flex flex-row items-center gap-1 text-base font-medium text-gray-300">
                      <Icon.Sol /> {data.nft.purchases[0].solPrice}
                    </p>
                  </div>
                )}
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('offerable.currentBalance')}
                  </p>
                  <p className="flex flex-row items-center gap-1 text-base font-medium text-gray-300">
                    <Icon.Sol /> {viewer?.solBalance}
                  </p>
                </div>
              </section>
              {connected ? (
                <>
                  <section>
                    <Form.Label name={t('offerable.amount')}>
                      {/* Temporarily broke out of component to make it work*/}
                      <div
                        className={clsx(
                          'flex w-full flex-row items-center justify-start rounded-md border border-gray-800 bg-gray-900 p-2 text-white focus-within:border-white focus:ring-0 focus:ring-offset-0',
                          'input'
                        )}
                      >
                        <Icon.Sol />
                        <input
                          {...registerOffer('amount', { required: true })}
                          autoFocus
                          className="w-full bg-transparent pl-2"
                        />
                      </div>
                      {offerFormState.errors.amount?.message && (
                        <p className="whitespace-nowrap text-left text-sm text-red-500">
                          {offerFormState.errors.amount?.message}
                        </p>
                      )}
                    </Form.Label>
                  </section>
                  <section id={'offer-buttons'} className="flex flex-col gap-4">
                    <Button
                      className="font-semibold"
                      block
                      htmlType="submit"
                      disabled={offerFormState.isSubmitting}
                      loading={offerFormState.isSubmitting}
                    >
                      {t('offer')}
                    </Button>
                    <Button
                      className="font-semibold"
                      block
                      onClick={() => {
                        onCancelMakeOffer();
                        setOpen(false);
                      }}
                      disabled={offerFormState.isSubmitting}
                      background={ButtonBackground.Cell}
                      border={ButtonBorder.Gradient}
                      color={ButtonColor.Gradient}
                    >
                      {t('cancel')}
                    </Button>
                  </section>
                </>
              ) : (
                <Button onClick={onLogin} className="font-semibold">
                  {t('offerable.connectToOffer')}
                </Button>
              )}
            </Form>
          )}
        </div>
      </Modal>
    </>
  );
}

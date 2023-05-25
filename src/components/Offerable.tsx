import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React, { useState, useMemo } from 'react';

import useLogin from '../hooks/login';
import { useOffers } from '../hooks/nft';
import { useMakeOffer } from '../hooks/offer';
import { useAuctionHouseContext } from '../providers/AuctionHouseProvider';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { ActionInfo, MiniCollection, Nft } from '../typings';
import { getAssetURL, AssetSize } from '../utils/assets';
import { getSolFromLamports } from '../utils/price';
import config from './../app.config';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from './Button';
import { Form } from './Form';
import Icon from './Icon';
import Img from './Image';
import Modal from './Modal';

interface RenderProps {
  makeOffer: (nft: Nft, collection: MiniCollection | null) => void;
  children: unknown;
}

interface OfferableProps {
  connected?: boolean;
  children: (args: RenderProps) => unknown;
}

export function Offerable({ children, connected = false }: OfferableProps) {
  const { t } = useTranslation('common');
  const onLogin = useLogin();
  const { publicKey, balance } = useWalletContext();

  const [miniCollection, setMiniCollection] = useState<MiniCollection | null>(null);
  const [open, setOpen] = useState(false);
  const [mintAddress, setMintAddress] = useState<string>('');
  const { data: nftOffers, isLoading, isValidating, mutate } = useOffers(mintAddress);
  const { isLoading: auctionHouseLoading, auctionHouse } = useAuctionHouseContext();
  const [nft, setNft] = useState<Nft | undefined>();

  const openOffer = (nft: Nft, collection: MiniCollection | null) => {
    if (!collection) {
      return;
    }

    if (!publicKey) {
      onLogin();
      return;
    }

    setNft(nft);
    setMiniCollection(collection);
    setMintAddress(nft.mintAddress);
    setOpen(true);
  };

  const myOffer = nftOffers?.find((offer) => {
    return offer.buyer === publicKey?.toBase58();
  });

  const listing: ActionInfo | null = useMemo(() => {
    if (nft?.latestListing?.auctionHouseAddress === config.auctionHouse) {
      return nft.latestListing;
    }
    return null;
  }, [nft?.latestListing]);

  const { registerOffer, onMakeOffer, handleSubmitOffer, onCancelMakeOffer, offerFormState } =
    useMakeOffer(listing, miniCollection?.floorPrice);

  const handleOffer: unknown = async ({ amount }: { amount: string }) => {
    if (!nft || !auctionHouse) {
      return;
    }
    try {
      const response = await onMakeOffer({
        amount: Number(amount),
        nft: nft
      });

      if (!response) {
        return;
      }

      if (!!nftOffers) {
        mutate(
          [
            {
              activityType: 'BID',
              buyer: publicKey?.toBase58() ?? '',
              blockTimestamp: Math.floor(new Date().getTime() / 1000),
              martketplaceProgramAddress: config.auctionHouseProgram ?? '',
              auctionHouseAddress: auctionHouse.address,
              price: `${response.buyerPrice}`,
              seller: null,
              signature: response.signature,
            },
            ...nftOffers,
          ],
          { revalidate: false }
        );
      }
    } catch (e: unknown) {
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
          {isLoading || isValidating || auctionHouseLoading ? (
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
            // @ts-expect-error TODO: Fix types
            <Form onSubmit={handleSubmitOffer(handleOffer)} className="flex flex-col gap-6">
              <section className="flex flex-row gap-4">
                <Img
                  fallbackSrc="/images/moon.svg"
                  src={getAssetURL(nft?.image, AssetSize.XSmall)}
                  alt={nft?.name}
                  className="h-12 w-12 rounded-md object-cover text-sm"
                />
                <div className="flex flex-col justify-between gap-2">
                  <p className="text-base font-medium text-white">{nft?.name}</p>
                  <p className="text-sm font-semibold text-gray-300">{miniCollection?.name}</p>
                </div>
              </section>
              <section className="flex flex-col gap-2">
                {!!myOffer && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('offerable.yourOffer', { ns: 'common' })}
                    </p>
                    <p className="flex flex-row items-center  gap-1 text-base font-medium text-gray-300">
                      <Icon.Sol /> {getSolFromLamports(myOffer.price, 0, 3)}
                    </p>
                  </div>
                )}
                {!!miniCollection && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('offerable.floorPrice', { ns: 'common' })}
                    </p>
                    <p className="flex flex-row items-center gap-1 text-base font-medium text-gray-300">
                      <Icon.Sol /> {getSolFromLamports(miniCollection.floorPrice, 0, 2)}
                    </p>
                  </div>
                )}
                {!!listing && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('offerable.listPrice', { ns: 'common' })}
                    </p>
                    {/* TODO: sort for lowest listing thats not expired */}
                    <p className="flex flex-row items-center gap-1 text-base font-medium text-gray-300">
                      <Icon.Sol /> {getSolFromLamports(listing.price, 0, 3)}
                    </p>
                  </div>
                )}
                {!!nft && !!nft.lastSale && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('offerable.lastSoldPrice', { ns: 'common' })}
                    </p>
                    <p className="flex flex-row items-center gap-1 text-base font-medium text-gray-300">
                      <Icon.Sol /> {getSolFromLamports(nft.lastSale.price, 0, 3)}
                    </p>
                  </div>
                )}
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('offerable.currentBalance', { ns: 'common' })}
                  </p>
                  <p className="flex flex-row items-center gap-1 text-base font-medium text-gray-300">
                    <Icon.Sol /> {getSolFromLamports(balance ?? 0, 0, 3)}
                  </p>
                </div>
              </section>
              {connected ? (
                <>
                  <section>
                    <Form.Label name={t('offerable.amount', { ns: 'common' })}>
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
                      {t('offer', { ns: 'common' })}
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
                      {t('cancel', { ns: 'common' })}
                    </Button>
                  </section>
                </>
              ) : (
                <Button onClick={onLogin} className="font-semibold">
                  {t('offerable.connectToOffer', { ns: 'common' })}
                </Button>
              )}
            </Form>
          )}
        </div>
      </Modal>
    </>
  );
}

import { useTranslation } from 'next-i18next';
import { useState, useMemo, useRef } from 'react';

import useAttributedBuyNow from '../hooks/attributedbuy';
import useBuyNow from '../hooks/buy';
import type { BuyListingResponse } from '../hooks/buy';
import useLogin from '../hooks/login';
import { useAuctionHouseContext } from '../providers/AuctionHouseProvider';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { Nft, ActionInfo, MiniCollection } from '../typings';
import { getAssetURL, AssetSize } from '../utils/assets';
import type { Marketplace } from '../utils/marketplaces';
import { getMarketplace } from '../utils/marketplaces';
import { getSolFromLamports, buyerTotalsForListing } from '../utils/price';
import config from './../app.config';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from './Button';
import Icon from './Icon';
import Img from './Image';
import Modal from './Modal';

interface RenderProps {
  buyNow: (nft: Nft, collection: MiniCollection | null, callback?: () => void) => void;
  children: unknown;
}

interface BuyableProps {
  connected?: boolean;
  children: (args: RenderProps) => unknown;
}

export function Buyable({ children, connected = false }: BuyableProps) {
  const { t } = useTranslation(['nft', 'common']);
  const [open, setOpen] = useState(false);
  const [nft, setNft] = useState<Nft | null>(null);
  const [miniCollection, setMiniCollection] = useState<MiniCollection | null>(null);
  const buyCallbackRef = useRef<() => void>();

  const openBuyNow = (nft: Nft, collection: MiniCollection | null, callback?: () => void) => {
    setNft(nft);
    setMiniCollection(collection);
    setOpen(true);
    if (!!callback) {
      buyCallbackRef.current = callback;
    }
  };
  const { isLoading: auctionHouseLoading, auctionHouse } = useAuctionHouseContext();
  const { publicKey, balance } = useWalletContext();
  const onLogin = useLogin();

  const isOwnMarket: boolean = useMemo(() => {
    return nft?.latestListing?.auctionHouseAddress === config.auctionHouse;
  }, [nft?.latestListing]);

  const marketplace: Marketplace | undefined = useMemo(() => {
    return getMarketplace(
      nft?.latestListing?.auctionHouseProgram,
      nft?.latestListing?.auctionHouseAddress
    );
  }, [nft?.latestListing]);

  const listing: ActionInfo | null = useMemo(
    () => nft?.latestListing ?? null,
    [nft?.latestListing]
  );

  const { nftPrice, totalPrice, totalRoyalties, totalMarketplaceFee } = useMemo(() => {
    return buyerTotalsForListing(nft, isOwnMarket, auctionHouse);
  }, [nft, nft?.latestListing, auctionHouse]);

  const { onBuyNow, buying, onCloseBuy } = useBuyNow();
  const { buying: attributedBuying, onAttributedBuyNow } = useAttributedBuyNow();

  const handleBuy = async () => {
    if (!nft || !auctionHouse || !listing) {
      return;
    }

    let response: BuyListingResponse | undefined = undefined;

    try {
      if (isOwnMarket) {
        response = await onBuyNow({
          auctionHouse,
          nft,
          listing,
        });
      } else {
        response = await onAttributedBuyNow({
          nft,
          listing,
        });
      }

      if (!response) {
        return;
      }

      if (!!response.buyAction) {
        // update the original nft
        nft.owner = response.buyAction ? response.buyAction.userAddress : nft.owner;
        nft.lastSale = response.buyAction;
        nft.latestListing = null;

        // update the current modal
        setNft((oldNft) =>
          !!oldNft
            ? {
                ...oldNft,
                // eslint-disable-next-line
                owner: response!.buyAction ? response!.buyAction.userAddress : oldNft.owner,
                // eslint-disable-next-line
                lastSale: response!.buyAction,
                latestListing: null,
              }
            : null
        );

        // execute callback
        if (!!buyCallbackRef.current) {
          buyCallbackRef.current();
        }
      }

      setOpen(false);
    } catch (e: unknown) {}
  };

  return (
    <>
      {children({
        buyNow: openBuyNow,
        children,
      })}
      <Modal title={t('buyable.buyNow', { ns: 'common' })} open={open} setOpen={setOpen}>
        <div className="mt-6 flex flex-col gap-6">
          {auctionHouseLoading ? (
            <>
              <section className="flex flex-row gap-4">
                <div className="h-12 w-12 animate-pulse rounded-md bg-gray-800" />
                <div className="flex flex-col justify-between gap-2">
                  <p className="h-5 w-40 animate-pulse rounded-md bg-gray-800" />
                  <p className="h-4 w-32 animate-pulse rounded-md bg-gray-800" />
                </div>
              </section>
              <section id={'loading-rewards'}>
                <div className="h-10 rounded-md bg-primary-600 bg-opacity-50" />
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
            <div className="flex flex-col gap-6">
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
              <section>
                <div className="flex flex-row items-center rounded-md bg-primary-600 p-4">
                  <img
                    src={marketplace?.logo}
                    className="h-5 w-auto object-fill mr-2"
                    alt={t('logo', { ns: 'nft', market: marketplace?.name })}
                  />
                  {!isOwnMarket && <h2>{marketplace?.name}</h2>}
                </div>
              </section>
              <section id={'prices'} className="flex flex-col gap-2">
                {!!miniCollection && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('buyable.floorPrice', { ns: 'common' })}
                    </p>
                    <p className="flex flex-row items-center text-base font-medium text-gray-300">
                      <Icon.Sol /> {getSolFromLamports(miniCollection.floorPrice, 0, 2)}
                    </p>
                  </div>
                )}
                {nft && listing && (
                  <div>
                    <div className="flex flex-row justify-between">
                      <p className="text-base font-medium text-gray-300">
                        {t('buyable.listPrice', { ns: 'common' })}
                      </p>
                      {/* TODO: sort for lowest listing thats not expired */}
                      <p className="flex flex-row items-center text-base font-medium text-gray-300">
                        <Icon.Sol /> {getSolFromLamports(nftPrice, 0, 3)}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between">
                      <p className="text-base font-medium text-gray-300">
                        {t('royalties', { ns: 'nft' })}
                      </p>
                      <div className="text-base font-medium text-gray-300 flex flex-row justify-center items-center">
                        <Icon.Sol />{' '}
                        <span>
                          {getSolFromLamports(totalRoyalties, 0, 3)} (
                          {nft.sellerFeeBasisPoints / 100}%)
                        </span>
                      </div>
                    </div>
                    {isOwnMarket && !!auctionHouse && (
                      <div className="flex flex-row justify-between">
                        <p className="text-base font-medium text-gray-300">
                          {t('buyable.marketplaceFee', { ns: 'common' })}
                        </p>
                        <div className="text-base font-medium text-gray-300 flex flex-row justify-center items-center">
                          <Icon.Sol />{' '}
                          <span>
                            {getSolFromLamports(totalMarketplaceFee, 0, 3)} (
                            {auctionHouse.sellerFeeBasisPoints / 100}%)
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-row justify-between">
                      <p className="text-base font-medium text-white">
                        {t('total', { ns: 'nft' })}
                      </p>
                      <div className="text-base font-medium text-white flex flex-row justify-center items-center">
                        <Icon.Sol /> <span>{getSolFromLamports(totalPrice, 0, 3)}</span>
                      </div>
                    </div>
                  </div>
                )}
                {!!publicKey && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('buyable.currentBalance', { ns: 'common' })}
                    </p>
                    <p className="flex flex-row items-center text-base font-medium text-gray-300">
                      <Icon.Sol /> {getSolFromLamports(balance ?? 0, 0, 3)}
                    </p>
                  </div>
                )}
              </section>
              <section className="flex flex-col gap-4">
                {connected ? (
                  <Button
                    className="font-semibold"
                    block
                    loading={buying || attributedBuying}
                    disabled={(balance ?? 0) < totalPrice || buying || attributedBuying}
                    onClick={handleBuy}
                  >
                    {t(
                      balance ?? 0 > totalPrice
                        ? 'buyable.buyNowButton'
                        : 'buyable.notEnoughBalance',
                      {
                        ns: 'common',
                      }
                    )}
                  </Button>
                ) : (
                  <Button onClick={onLogin} className="font-semibold">
                    {t('buyable.connectToBuy', { ns: 'common' })}
                  </Button>
                )}
                <Button
                  className="font-semibold"
                  block
                  onClick={() => {
                    onCloseBuy();
                    setOpen(false);
                  }}
                  disabled={buying || attributedBuying}
                  background={ButtonBackground.Cell}
                  border={ButtonBorder.Gradient}
                  color={ButtonColor.Gradient}
                >
                  {t('cancel', { ns: 'common' })}
                </Button>
              </section>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

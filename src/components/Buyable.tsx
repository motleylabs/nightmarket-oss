import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { AhListing, AuctionHouse, Nft } from '../graphql.types';
import useLogin from '../hooks/login';
import Modal from './Modal';
import BuyableQuery from './../queries/buyable.graphql';
import { useApolloClient, useLazyQuery, useReactiveVar } from '@apollo/client';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from './Button';
import useBuyNow from '../hooks/buy';
import Icon from './Icon';
import { viewerVar } from '../cache';
import config from './../app.config';

interface BuyableData {
  nft: Nft;
  auctionHouse: AuctionHouse;
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
  const { t } = useTranslation(['nft', 'common']);
  const [open, setOpen] = useState(false);
  const client = useApolloClient();
  const openBuyNow = (mintAddress: string) => {
    buyableQuery({
      variables: { address: mintAddress, auctionHouse: config.auctionHouse },
    });
    setOpen(true);
  };
  const viewer = useReactiveVar(viewerVar);
  const onLogin = useLogin();

  const [buyableQuery, { data, loading, refetch, previousData }] =
    useLazyQuery<BuyableData>(BuyableQuery);

  const listing = data?.nft.listings?.find(
    (listing) => listing.auctionHouse?.address === config.auctionHouse
  );

  const { onBuyNow, buying, onCloseBuy } = useBuyNow();
  const handleBuy = async () => {
    if (!data?.nft || !data.auctionHouse || !data.nft.listings || !listing) {
      return;
    }

    try {
      const response = await onBuyNow({
        auctionHouse: data.auctionHouse,
        nft: data.nft,
        ahListing: listing,
      });

      if (!response) {
        return;
      }

      const { buyerReceiptTokenAccount } = response;

      client.cache.updateQuery(
        {
          query: BuyableQuery,
          broadcast: false,
          overwrite: false,
          variables: {
            address: data.nft.mintAddress,
            auctionHouse: data.auctionHouse.address,
          },
        },
        (previous) => {
          const { nft }: { nft: Nft } = previous;
          const listings: AhListing[] = nft.listings.filter((l: AhListing) => l.id !== listing.id);

          return {
            ...previous,
            nft: {
              ...nft,
              listings,
              lastSale: {
                __typename: 'LastSale',
                price: listing.price.toString(),
              },
              owner: {
                __typename: 'NftOwner',
                associatedTokenAccountAddress: buyerReceiptTokenAccount.toBase58(),
                address: viewer?.address,
              },
            },
          };
        }
      );
    } catch (e: any) {}
  };

  return (
    <>
      {children({
        buyNow: openBuyNow,
        children,
      })}
      <Modal title={t('buyable.buyNow', { ns: 'common' })} open={open} setOpen={setOpen}>
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
              <section>
                <div className="flex flex-row items-center justify-between rounded-md bg-primary-600 p-4">
                  <img
                    src="/images/nightmarket-beta.svg"
                    className="h-5 w-auto object-fill"
                    alt="night market logo"
                  />
                  <p>
                    {t('buyEarn', { ns: 'nft' })} <span className="text-primary-700">BONK</span>
                  </p>
                </div>
              </section>
              <section id={'prices'} className="flex flex-col gap-2">
                {data?.nft.moonrankCollection?.trends && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">{t('buyable.floorPrice', { ns: 'common' })}</p>
                    <p className="flex flex-row items-center text-base font-medium text-gray-300">
                      <Icon.Sol /> {data?.nft.moonrankCollection?.trends?.compactFloor1d}
                    </p>
                  </div>
                )}
                {data?.nft.listings && data?.nft.listings.length > 0 && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">{t('buyable.listPrice', { ns: 'common' })}</p>
                    {/* TODO: sort for lowest listing thats not expired */}
                    <p className="flex flex-row items-center text-base font-medium text-gray-300">
                      <Icon.Sol /> {data?.nft.listings[0].solPrice}
                    </p>
                  </div>
                )}
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('buyable.marketplaceFee', { ns: 'common' })}
                  </p>
                  <p className="text-base font-medium text-gray-300">{data?.auctionHouse.fee}%</p>
                </div>
                {viewer && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('buyable.currentBalance', { ns: 'common' })}
                    </p>
                    <p className="flex flex-row items-center text-base font-medium text-gray-300">
                      <Icon.Sol /> {viewer?.solBalance}
                    </p>
                  </div>
                )}
              </section>
              <section className="flex flex-col gap-4">
                {connected ? (
                  <>
                    <Button
                      className="font-semibold"
                      block
                      loading={buying}
                      disabled={buying}
                      onClick={handleBuy}
                    >
                      {t('buyable.buyNowButton', { ns: 'common' })}
                    </Button>
                    <Button
                      className="font-semibold"
                      block
                      onClick={() => {
                        onCloseBuy();
                        setOpen(false);
                      }}
                      disabled={buying}
                      background={ButtonBackground.Cell}
                      border={ButtonBorder.Gradient}
                      color={ButtonColor.Gradient}
                    >
                      {t('cancel', { ns: 'common' })}
                    </Button>
                  </>
                ) : (
                  <Button onClick={onLogin} className="font-semibold">
                    {t('buyable.connectToBuy', { ns: 'common' })}
                  </Button>
                )}
              </section>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

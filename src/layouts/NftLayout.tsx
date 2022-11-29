import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NftMarketInfoQuery, NftDetailsQuery } from './../queries/nft.graphql';
import { ReactNode, useRef, useState, useMemo, useEffect } from 'react';
import { useApolloClient, useQuery, useReactiveVar } from '@apollo/client';
import clsx from 'clsx';
import { AuctionHouse, Nft, Offer, AhListing, CollectionTrend } from '../graphql.types';
import { ButtonGroup } from './../components/ButtonGroup';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from './../components/Button';
import { useMakeOffer, useUpdateOffer, useCloseOffer, useAcceptOffer } from '../hooks/offer';
import { useListNft, useUpdateListing, useCloseListing } from '../hooks/list';
import { Form } from '../components/Form';
import Head from 'next/head';
import { viewerVar } from './../cache';
import Icon from '../components/Icon';
import { useWallet } from '@solana/wallet-adapter-react';
import useBuyNow from '../hooks/buy';
import useLogin from '../hooks/login';
import config from '../app.config';
import { RewardCenterProgram } from '../modules/reward-center';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { PublicKey } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import Bugsnag from '@bugsnag/js';

interface NftLayoutProps {
  children: ReactNode;
  nft: Nft;
  auctionHouse: AuctionHouse;
}

interface NftMarketData {
  nft: Nft;
}

interface NftMarketVariables {
  address: string;
}

enum NftPage {
  Details = '/nfts/[address]/details',
  Offers = '/nfts/[address]/offers',
  Activity = '/nfts/[address]/activity',
}

export default function NftLayout({ children, nft, auctionHouse }: NftLayoutProps) {
  const { t } = useTranslation('nft');
  const router = useRouter();
  const onLogin = useLogin();
  const { publicKey, connected } = useWallet();
  const client = useApolloClient();
  const viewer = useReactiveVar(viewerVar);

  const { data, loading } = useQuery<NftMarketData, NftMarketVariables>(NftMarketInfoQuery, {
    variables: {
      address: router.query.address as string,
    },
  });

  const isOwner = viewer?.address === data?.nft.owner?.address;
  const notOwner = !isOwner;
  const listing: AhListing | null = useMemo(() => {
    const listing = data?.nft.listings?.find((listing: AhListing) => {
      return listing.auctionHouse?.address === config.auctionHouse;
    });

    return listing || null;
  }, [data?.nft.listings]);
  const highestOffer: Offer | null = useMemo(() => {
    const offers = data?.nft.offers
      .filter((offer: Offer) => offer.auctionHouse?.address === config.auctionHouse)
      .sort((a: Offer, b: Offer) => {
        return (b.solPrice as number) - (a.solPrice as number);
      });

    if (!offers) {
      return null;
    }

    return offers[0] || null;
  }, [data?.nft.offers]);
  const viewerOffer: Offer | null = useMemo(() => {
    const offer = data?.nft.offers.find((offer: Offer) => offer.buyer === publicKey?.toBase58());

    return offer || null;
  }, [data?.nft.offers, publicKey]);

  const {
    makeOffer,
    registerOffer,
    onMakeOffer,
    handleSubmitOffer,
    onOpenOffer,
    offerFormState,
    onCancelMakeOffer,
  } = useMakeOffer();

  const handleOffer = async ({ amount }: { amount: string }) => {
    if (!amount || !nft || !auctionHouse) {
      return;
    }

    try {
      const response = await onMakeOffer({ amount, nft, auctionHouse });

      if (!response) {
        return;
      }

      const { buyerTradeState, metadata, buyerTradeStateBump, associatedTokenAccount, buyerPrice } =
        response;

      client.cache.updateQuery(
        {
          query: NftMarketInfoQuery,
          broadcast: false,
          overwrite: true,
          variables: {
            address: nft.mintAddress,
          },
        },
        (data) => {
          const offer: Offer = {
            __typename: 'Offer',
            id: `temp-id-${buyerTradeState.toBase58()}`,
            tradeState: buyerTradeState.toBase58(),
            tradeStateBump: buyerTradeStateBump,
            buyer: publicKey?.toBase58(),
            metadata: metadata.toBase58(),
            marketplaceProgramAddress: RewardCenterProgram.PUBKEY.toBase58(),
            tokenAccount: associatedTokenAccount.toBase58(),
            // @ts-ignore
            auctionHouse: {
              address: auctionHouse.address,
              __typename: 'AuctionHouse',
            },
            createdAt: new Date().toISOString(),
            // @ts-ignore
            price: buyerPrice.toString(),
            // @ts-ignore
            nft: {
              __typename: 'Nft',
              address: nft.address,
              mintAddress: nft.mintAddress,
              name: nft.name,
              image: nft.image,
              owner: {
                __typename: 'NftOwner',
                address: nft.owner?.address as string,
                associatedTokenAccountAddress: associatedTokenAccount.toBase58(),
              },
            },
            // @ts-ignore
            buyerWallet: {
              __typename: 'Wallet',
              address: publicKey?.toBase58(),
              twitterHandle: null,
              profile: null,
            },
          };

          const offers = [...data.nft.offers, offer];

          return {
            nft: {
              ...data.nft,
              offers,
            },
          };
        }
      );
    } catch (e: any) {}
  };

  const { buy, onBuyNow, onOpenBuy, onCloseBuy, buying } = useBuyNow();

  const handleBuy = async () => {
    if (!nft || !auctionHouse || !listing) {
      return;
    }

    try {
      const response = await onBuyNow({
        nft,
        auctionHouse,
        ahListing: listing,
      });

      if (!response) {
        return;
      }

      const { buyerReceiptTokenAccount } = response;

      if (router.pathname === '/nfts/[address]/details') {
        client.cache.updateQuery(
          {
            query: NftDetailsQuery,
            broadcast: false,
            overwrite: true,
            variables: {
              address: nft.mintAddress,
            },
          },
          (data) => {
            return {
              nft: {
                ...data.nft,
                owner: {
                  __typename: 'NftOwner',
                  address: publicKey?.toBase58(),
                  associatedTokenAccountAddress: buyerReceiptTokenAccount.toBase58(),
                  profile: null,
                },
              },
            };
          }
        );
      }

      client.cache.updateQuery(
        {
          query: NftMarketInfoQuery,
          broadcast: false,
          overwrite: true,
          variables: {
            address: nft.mintAddress,
          },
        },
        (data) => {
          const listings = data.nft.listings.filter((l: AhListing) => l.id !== listing.id);

          const nft = {
            ...data.nft,
            listings,
            lastSale: {
              __typename: 'LastSale',
              price: listing.price.toString(),
            },
            owner: {
              __typename: 'NftOwner',
              address: publicKey?.toBase58(),
              associatedTokenAccountAddress: buyerReceiptTokenAccount.toBase58(),
              profile: null,
            },
          };

          return {
            nft,
          };
        }
      );
    } catch (e: any) {}
  };

  const {
    listNft,
    handleSubmitListNft,
    registerListNft,
    onSubmitListNft,
    onListNftClick,
    onCancelListNftClick,
    listNftState,
  } = useListNft();

  const handleList = async ({ amount }: { amount: string }) => {
    if (!amount || !nft || !auctionHouse) {
      return;
    }
    await onSubmitListNft({ amount, nft, auctionHouse });
  };

  const { onCloseListing, closingListing } = useCloseListing({ listing, nft, auctionHouse });

  const {
    updateListing,
    updateListingState,
    registerUpdateListing,
    onUpdateListing,
    onCancelUpdateListing,
    handleSubmitUpdateListing,
    onSubmitUpdateListing,
  } = useUpdateListing({ listing });

  const handleUpdateListing = async ({ amount }: { amount: string }) => {
    if (!amount || !nft || !auctionHouse) {
      return;
    }
    await onSubmitUpdateListing({ amount, nft, auctionHouse });
  };

  const { onCloseOffer, closingOffer } = useCloseOffer(viewerOffer);

  const handleCloseOffer = async () => {
    if (!viewerOffer) {
      return;
    }

    try {
      await onCloseOffer({ nft, auctionHouse });

      client.cache.evict({
        id: client.cache.identify(viewerOffer),
      });
    } catch (e: any) {}
  };

  const { onAcceptOffer, acceptingOffer } = useAcceptOffer(highestOffer);

  const handleAcceptOffer = async () => {
    if (!auctionHouse || !nft || !highestOffer) {
      return;
    }

    try {
      const response = await onAcceptOffer({ auctionHouse, nft, listing });

      if (!response) {
        return;
      }

      const { buyerReceiptTokenAccount } = response;

      client.cache.modify({
        id: client.cache.identify({
          __typename: 'Wallet',
          address: data?.nft?.owner?.address as string,
        }),
        fields: {
          collectedCollections(collectedCollections, { readField }) {
            return collectedCollections.reduce((memo: any[], cc: any) => {
              const id = readField('id', cc.collection);
              if (id === data?.nft?.moonrankCollection?.id) {
                const trends: Readonly<CollectionTrend> | undefined = readField(
                  'trends',
                  cc.collection
                );

                const estimatedValue = (
                  parseInt(cc.estimatedValue) - parseInt(trends?.floor1d)
                ).toString();

                const update = {
                  ...cc,
                  estimatedValue,
                  nftsOwned: cc.nftsOwned - 1,
                };

                if (update.nftsOwned === 0) {
                  return memo;
                }

                return [...memo, update];
              }

              return [...memo, cc];
            }, []);
          },
          nftCounts(counts, { readField }) {
            let owned: number | undefined = readField('owned', counts);

            if (!owned) {
              return counts;
            }

            return {
              ...counts,
              owned: owned - 1,
            };
          },
        },
      });

      client.cache.updateQuery(
        {
          query: NftMarketInfoQuery,
          broadcast: false,
          overwrite: true,
          variables: {
            address: nft.mintAddress,
          },
        },
        (data) => {
          const offers = data.nft.offers.filter((o: Offer) => o.id !== highestOffer.id);

          const nft = {
            ...data.nft,
            offers,
            lastSale: {
              __typename: 'LastSale',
              price: highestOffer.price.toString(),
            },
            owner: {
              __typename: 'NftOwner',
              address: highestOffer.buyer,
              associatedTokenAccountAddress: buyerReceiptTokenAccount.toBase58(),
              profile: null,
            },
          };

          return {
            nft,
          };
        }
      );
    } catch (er: any) {}
  };

  const {
    onOpenUpdateOffer,
    registerUpdateOffer,
    onUpdateOffer,
    onCancelUpdateOffer,
    updateOfferFormState,
    handleSubmitUpdateOffer,
    updateOffer,
  } = useUpdateOffer(viewerOffer);

  const handleUpdateOffer = async ({ amount }: { amount: string }) => {
    if (!amount || !nft || !auctionHouse) {
      return;
    }

    await onUpdateOffer({ amount, nft, auctionHouse });
  };

  const activeForm = makeOffer || listNft || updateListing || buy || updateOffer;

  const [expanded, setExpanded] = useState(false);

  const expandedRef = useRef<HTMLDivElement>(null!);

  return (
    <main className="relative mx-auto mt-8 flex max-w-7xl flex-wrap justify-start px-4 pb-4 md:mt-12 md:px-8 md:pb-8">
      <Head>
        <title>{nft.name}</title>
        <meta name="description" content={nft.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="align-self-start relative mb-10 lg:w-1/2 lg:pr-10 ">
        <div className="relative">
          <img src={nft.image} alt="nft image" className="w-full rounded-lg object-cover" />
          <button
            onClick={() => setExpanded(true)}
            className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 bg-opacity-20 text-white backdrop-blur-sm transition ease-in-out hover:scale-110 md:bottom-6 md:right-6"
          >
            <ArrowsPointingOutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        role="dialog"
        onClick={() => setExpanded(false)}
        className={clsx(
          'fixed inset-0',
          'cursor-pointer bg-gray-800 bg-opacity-40 backdrop-blur-lg',
          'transition-opacity duration-500 ease-in-out',
          'z-50 flex flex-col items-center justify-center',
          {
            'opacity-100': expanded,
            'opacity-0': !expanded,
            'pointer-events-auto': expanded,
            'pointer-events-none': !expanded,
            'z-50': expanded,
          }
        )}
      >
        <div
          ref={expandedRef}
          className={clsx(
            `relative z-50 flex aspect-auto w-full flex-col overflow-x-auto overflow-y-auto rounded-lg text-white shadow-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-900 sm:h-auto `,
            'px-4 sm:h-auto sm:max-w-2xl'
          )}
        >
          <div>
            <div className={`relative`}>
              <img
                src={nft.image}
                className={`aspect-auto h-full w-full rounded-lg`}
                alt={nft.name + ' image'}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="top-10 w-full pt-0 lg:sticky lg:w-1/2 lg:pt-10 lg:pl-10">
        {loading ? (
          <div className="mb-4 flex animate-pulse flex-row items-center gap-2 transition">
            <div className="aspect-square w-10 rounded-md bg-gray-800" />
            <div className="h-6 w-40 rounded-md bg-gray-800" />
          </div>
        ) : (
          data?.nft.moonrankCollection && (
            <div className="mb-4 flex flex-row items-center justify-between gap-2">
              <Link
                className="flex flex-row items-center gap-2 transition hover:scale-[1.02]"
                href={`/collections/${data?.nft.moonrankCollection.id}/nfts`}
              >
                <img
                  src={data?.nft.moonrankCollection.image}
                  className="aspect-square w-10 rounded-md object-cover"
                  alt="collection image"
                />
                <h2 className="text-2xl">{data?.nft.moonrankCollection.name}</h2>
              </Link>
            </div>
          )
        )}
        <h1 className="mb-6 text-4xl lg:text-5xl">{nft.name}</h1>
        {buy && (
          <div className="fixed bottom-0 left-0 right-0 z-30 mb-0 rounded-t-md bg-gray-800 md:relative md:z-0 md:mb-10 md:rounded-md">
            <h2 className="border-b-2 border-b-gray-800 p-6 text-center text-lg font-semibold md:border-b-0 md:pb-0 md:text-left">
              {t('buy')}
            </h2>
            <div className="mt-4 flex flex-col gap-4 px-6 pt-8 pb-6 md:pt-0">
              <div>
                <div className="flex flex-row items-center justify-between rounded-md bg-primary-600 p-4">
                  <img
                    src="/images/nightmarket.svg"
                    className="h-5 w-auto object-fill"
                    alt="night market logo"
                  />
                  <p className="text-primary-700">+SAUCE</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {data?.nft.moonrankCollection?.trends && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('buyable.floorPrice', { ns: 'common' })}
                    </p>
                    <p className="flex flex-row items-center justify-center gap-1 text-base font-medium text-gray-300">
                      <Icon.Sol /> {data?.nft.moonrankCollection?.trends?.compactFloor1d}
                    </p>
                  </div>
                )}
                {listing && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('buyable.listPrice', { ns: 'common' })}
                    </p>
                    <p className="flex flex-row items-center justify-center gap-1 text-base font-medium text-gray-300">
                      <Icon.Sol /> {listing.solPrice}
                    </p>
                  </div>
                )}
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('buyable.marketplaceFee', { ns: 'common' })}
                  </p>
                  <p className="text-base font-medium text-gray-300">{auctionHouse.fee}%</p>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('buyable.currentBalance', { ns: 'common' })}
                  </p>
                  <p className="flex flex-row items-center justify-center gap-1 text-base font-medium text-gray-300">
                    <Icon.Sol /> {viewer?.solBalance}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {connected ? (
                  <>
                    <Button
                      block
                      htmlType="submit"
                      loading={buying}
                      disabled={buying}
                      onClick={handleBuy}
                    >
                      {t('buy')}
                    </Button>
                    <Button
                      block
                      onClick={() => {
                        onCloseBuy();
                      }}
                      background={ButtonBackground.Slate}
                      border={ButtonBorder.Gray}
                      color={ButtonColor.Gray}
                      disabled={buying}
                    >
                      {t('cancel', { ns: 'common' })}
                    </Button>
                  </>
                ) : (
                  <Button onClick={onLogin} className="font-semibold">
                    {t('connectToBuy')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {makeOffer && (
          <Form
            onSubmit={handleSubmitOffer(handleOffer)}
            className="fixed bottom-0 left-0 right-0 z-30 mb-0 rounded-t-md bg-gray-800 md:relative md:z-0 md:mb-10 md:rounded-md"
          >
            <h2 className="border-b-2 border-b-gray-800 p-6 text-center text-lg font-semibold text-white md:border-b-0 md:pb-0 md:text-left">
              {t('placeBid')}
            </h2>
            <div className="px-6 pt-8 pb-6 md:pt-0">
              <div className="flex flex-row justify-start gap-4 md:hidden">
                <img
                  src={nft.image}
                  alt="nft image"
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div className="flex flex-col justify-between">
                  <h6>{nft.name}</h6>
                  {data?.nft.moonrankCollection && <h4>{data?.nft.moonrankCollection.name}</h4>}
                </div>
              </div>
              <ul className="my-6 flex flex-grow flex-col gap-2 text-gray-300">
                {data?.nft.moonrankCollection?.trends && (
                  <li className="flex justify-between">
                    <span>{t('currentFloor')}</span>
                    <span className="flex flex-row items-center justify-center gap-1">
                      <Icon.Sol /> {data?.nft.moonrankCollection.trends?.compactFloor1d}
                    </span>
                  </li>
                )}
                {viewer && (
                  <li className="flex justify-between">
                    <span>{t('walletBalance')}</span>
                    <span className="flex flex-row items-center justify-center gap-1">
                      <Icon.Sol />
                      {viewer.solBalance}
                    </span>
                  </li>
                )}
              </ul>
              <Form.Label name={t('amount')}>
                <div
                  className={clsx(
                    'flex w-full flex-row items-center justify-start rounded-md border border-gray-800 bg-gray-800 p-2 text-white focus-within:border-white focus:ring-0 focus:ring-offset-0',
                    'input'
                  )}
                >
                  <Icon.Sol />
                  <input
                    {...registerOffer('amount', { required: true })}
                    autoFocus
                    className={clsx('w-full bg-transparent pl-2')}
                  />
                </div>
                {offerFormState.errors.amount?.message && (
                  <p className="whitespace-nowrap text-left text-xs text-red-500">
                    {offerFormState.errors.amount?.message}
                  </p>
                )}
              </Form.Label>
              <Button
                block
                className="mb-4"
                htmlType="submit"
                loading={offerFormState.isSubmitting}
              >
                {t('submitOffer')}
              </Button>
              <Button
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gray}
                color={ButtonColor.Gray}
                block
                onClick={onCancelMakeOffer}
              >
                {t('cancel', { ns: 'common' })}
              </Button>
            </div>
          </Form>
        )}
        {updateOffer && (
          <Form
            onSubmit={handleSubmitUpdateOffer(handleUpdateOffer)}
            className="fixed bottom-0 left-0 right-0 z-30 mb-0 rounded-t-md bg-gray-800 md:relative md:z-0 md:mb-10 md:rounded-md"
          >
            <h2 className="border-b-2 border-b-gray-800 p-6 text-center text-lg font-semibold text-white md:border-b-0 md:pb-0 md:text-left">
              {t('updateBid')}
            </h2>
            <div className="px-6 pt-8 pb-6 md:pt-0">
              <div className="flex flex-row justify-start gap-4 md:hidden">
                <img
                  src={nft.image}
                  alt="nft image"
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div className="flex flex-col justify-between">
                  <h6>{nft.name}</h6>
                  {data?.nft.moonrankCollection && <h4>{data?.nft.moonrankCollection.name}</h4>}
                </div>
              </div>
              <ul className="my-6 flex flex-grow flex-col gap-2 text-gray-300">
                {data?.nft.moonrankCollection && (
                  <li className="flex justify-between">
                    <span>{t('currentFloor')}</span>
                    <span className="flex flex-row items-center justify-center gap-1">
                      <Icon.Sol /> {data?.nft.moonrankCollection.trends?.compactFloor1d}
                    </span>
                  </li>
                )}
                {viewer && (
                  <li className="flex justify-between">
                    <span>{t('walletBalance')}</span>
                    <span className="flex flex-row items-center justify-center gap-1">
                      <Icon.Sol />
                      {viewer.solBalance}
                    </span>
                  </li>
                )}
              </ul>
              <Form.Label name={t('amount')}>
                <div
                  className={clsx(
                    'flex w-full flex-row items-center justify-start rounded-md border border-gray-800 bg-gray-800 p-2 text-white focus-within:border-white focus:ring-0 focus:ring-offset-0',
                    'input'
                  )}
                >
                  <Icon.Sol />
                  <input
                    {...registerUpdateOffer('amount', { required: true })}
                    autoFocus
                    className={clsx('w-full bg-transparent pl-2')}
                  />
                </div>
                {updateOfferFormState.errors.amount?.message && (
                  <p className="whitespace-nowrap text-left text-xs text-red-500">
                    {updateOfferFormState.errors.amount?.message}
                  </p>
                )}
              </Form.Label>
              <Button
                block
                htmlType="submit"
                className="mb-4"
                loading={updateOfferFormState.isSubmitting}
              >
                {t('update')}
              </Button>
              <Button
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gray}
                color={ButtonColor.Gray}
                block
                onClick={onCancelUpdateOffer}
              >
                {t('cancel', { ns: 'common' })}
              </Button>
            </div>
          </Form>
        )}
        {listNft && (
          <Form
            onSubmit={handleSubmitListNft(handleList)}
            className="fixed bottom-0 left-0 right-0 z-30 mb-0 rounded-t-md bg-gray-800 shadow-xl md:relative md:z-0 md:mb-10 md:rounded-md"
          >
            <h2 className="border-b-2 border-b-gray-800 p-6 text-center text-lg font-semibold md:border-b-0 md:pb-0 md:text-left">
              {t('listNft')}
            </h2>
            <div className="px-6 pt-8 pb-6 md:pt-0">
              <div className="flex flex-row justify-start gap-4 md:hidden">
                <img
                  src={nft.image}
                  alt="nft image"
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div className="flex flex-col justify-between">
                  <h6>{nft.name}</h6>
                  {data?.nft.moonrankCollection && <h4>{data?.nft.moonrankCollection.name}</h4>}
                </div>
              </div>
              <ul className="my-6 flex flex-grow flex-col gap-2 text-gray-300">
                {data?.nft.moonrankCollection?.trends && (
                  <li className="flex justify-between">
                    <span>{t('currentFloor')}</span>
                    <span className="flex flex-row items-center justify-center gap-1">
                      <Icon.Sol /> {data?.nft.moonrankCollection.trends?.compactFloor1d}
                    </span>
                  </li>
                )}
              </ul>
              <Form.Label name={t('amount')}>
                <div
                  className={clsx(
                    'flex w-full flex-row items-center justify-start rounded-md border border-gray-800 bg-gray-800 p-2 text-white focus-within:border-white focus:ring-0 focus:ring-offset-0',
                    'input'
                  )}
                >
                  <Icon.Sol />
                  <input
                    {...registerListNft('amount', { required: true })}
                    autoFocus
                    className="w-full bg-transparent pl-2"
                  />
                </div>
                {listNftState.errors.amount?.message && (
                  <p className="whitespace-nowrap text-left text-xs text-red-500">
                    {listNftState.errors.amount?.message}
                  </p>
                )}
              </Form.Label>
              <Button block htmlType="submit" className="mb-4" loading={listNftState.isSubmitting}>
                {t('listNft')}
              </Button>
              <Button
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gray}
                color={ButtonColor.Gray}
                block
                onClick={onCancelListNftClick}
              >
                {t('cancel', { ns: 'common' })}
              </Button>
            </div>
          </Form>
        )}
        {updateListing && (
          <Form
            onSubmit={handleSubmitUpdateListing(handleUpdateListing)}
            className="fixed bottom-0 left-0 right-0 z-30 mb-0 rounded-t-md bg-gray-800 shadow-xl md:relative md:z-0 md:mb-10 md:rounded-md"
          >
            <h2 className="border-b-2 border-b-gray-800 p-6 text-center text-lg font-semibold md:border-b-0 md:pb-0 md:text-left">
              {t('updateListing')}
            </h2>
            <div className="px-6 pt-8 pb-6 md:pt-0">
              <div className="flex flex-row justify-start gap-4 md:hidden">
                <img
                  src={nft.image}
                  alt="nft image"
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div className="flex flex-col justify-between">
                  <h6>{nft.name}</h6>
                  {data?.nft.moonrankCollection && <h4>{data?.nft.moonrankCollection.name}</h4>}
                </div>
              </div>
              <ul className="my-6 flex flex-grow flex-col gap-2 text-gray-300">
                {data?.nft.moonrankCollection?.trends && (
                  <li className="flex justify-between">
                    <span>{t('currentFloor')}</span>
                    <span className="flex flex-row items-center justify-center">
                      <Icon.Sol /> {data?.nft.moonrankCollection.trends?.compactFloor1d}
                    </span>
                  </li>
                )}
              </ul>
              <Form.Label name={t('newPrice')}>
                <div
                  className={clsx(
                    'flex w-full flex-row items-center justify-start rounded-md border border-gray-800 bg-gray-800 p-2 text-white focus-within:border-white focus:ring-0 focus:ring-offset-0',
                    'input'
                  )}
                >
                  <Icon.Sol />
                  <input
                    {...registerUpdateListing('amount', { required: true })}
                    autoFocus
                    className="w-full bg-transparent pl-2"
                  />
                </div>
                {updateListingState.errors.amount?.message && (
                  <p className="whitespace-nowrap text-left text-xs text-red-500">
                    {updateListingState.errors.amount?.message}
                  </p>
                )}
              </Form.Label>
              <Button
                block
                htmlType="submit"
                className="mb-4"
                loading={updateListingState.isSubmitting}
              >
                {t('update')}
              </Button>
              <Button
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gray}
                color={ButtonColor.Gray}
                block
                onClick={onCancelUpdateListing}
              >
                {t('cancel', { ns: 'common' })}
              </Button>
            </div>
          </Form>
        )}
        {loading ? (
          <>
            <div className="mb-10 grid animate-pulse rounded-lg bg-gray-800 transition">
              <div className="flex w-full flex-row items-center justify-between border-b-[1px] border-b-gray-900 py-4 px-6">
                <img
                  src="/images/nightmarket.svg"
                  className="h-5 w-auto object-fill"
                  alt="night market logo"
                />
                <div className="h-6 w-36 rounded-md bg-gray-700" />
              </div>
              <div className="grid w-full grid-cols-12 items-center justify-between p-6">
                <div className="col-span-6 flex flex-col gap-2">
                  <div className="h-6 w-24 rounded-md bg-gray-700" />
                  <div className="h-8 w-12 rounded-md bg-gray-700" />
                </div>
                <div className="col-span-6">
                  <div className="h-12 w-full rounded-full bg-gray-700" />
                </div>
              </div>
            </div>
            <div className="mb-10 grid animate-pulse rounded-lg bg-gray-800 transition">
              <div className="grid w-full grid-cols-12 items-center justify-between p-6">
                <div className="col-span-6 flex flex-col gap-2">
                  <div className="h-6 w-24 rounded-md bg-gray-700" />
                  <div className="h-8 w-12 rounded-md bg-gray-700" />
                </div>
                <div className="col-span-6">
                  <div className="h-12 w-full rounded-full bg-gray-700" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className={clsx('mb-10 flex flex-col gap-4 rounded-lg bg-gray-800', {
                'md:hidden': activeForm,
              })}
            >
              <div className="flex flex-col items-center justify-between">
                {listing && (
                  <div className="flex w-full flex-row items-center justify-between border-b-[1px] border-b-gray-900 py-4 px-6">
                    <img
                      src="/images/nightmarket.svg"
                      className="h-5 w-auto object-fill"
                      alt="night market logo"
                    />
                    <span className="flex flex-row gap-1">
                      <p className="font-semibold">{t(isOwner ? 'sellEarn' : 'buyEarn')}</p>
                      <p className="text-primary-700">+SAUCE</p>
                    </span>
                  </div>
                )}
                <div className={clsx('flex w-full flex-col gap-6 px-6 py-6')}>
                  <div className="grid w-full grid-cols-12 items-center">
                    <div className="col-span-6 flex flex-col gap-2 text-gray-300">
                      {listing && (
                        <div>
                          {t('listed')}
                          <div className="flex items-center gap-1">
                            <Icon.Sol className="h-5 w-5" />
                            <span className="text-2xl text-white">{listing?.solPrice}</span>
                          </div>
                        </div>
                      )}
                      {data?.nft.lastSale?.price ? (
                        <div className="flex flex-col gap-2 md:flex-row">
                          {t('lastSale')}
                          <span className="flex flex-row items-center justify-start gap-1">
                            <Icon.Sol />
                            {data?.nft.lastSale?.solPrice}
                          </span>
                        </div>
                      ) : (
                        <p className="text-semibold text-gray-300">{t('noSales')}</p>
                      )}
                    </div>
                    <div className="col-span-6 flex flex-col justify-center gap-6">
                      {isOwner ? (
                        listing ? (
                          <>
                            <Button block onClick={onUpdateListing}>
                              {t('updateListing')}
                            </Button>
                            <Button
                              block
                              loading={closingListing}
                              border={ButtonBorder.Gray}
                              color={ButtonColor.Gray}
                              onClick={onCloseListing}
                            >
                              {t('cancelListing')}
                            </Button>
                          </>
                        ) : (
                          <Button block onClick={onListNftClick}>
                            {t('listNft')}
                          </Button>
                        )
                      ) : (
                        listing && (
                          <Button block onClick={onOpenBuy}>
                            {t('buy')}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={clsx('mb-10 flex flex-col gap-4 rounded-lg  bg-gray-800', {
                'md:hidden': activeForm,
              })}
            >
              <div className="grid w-full grid-cols-12 items-center justify-start p-6">
                <div className="col-span-6 flex flex-col justify-center text-gray-300">
                  {highestOffer || viewerOffer ? (
                    <div className="flex h-full flex-col justify-between">
                      {highestOffer && (
                        <div>
                          <span>{t('highestOffer')}</span>
                          <span className="flex flex-row items-center justify-start gap-1 text-2xl">
                            <Icon.Sol className="h-5 w-5" />
                            <span className="text-white">{highestOffer.solPrice}</span>
                          </span>
                        </div>
                      )}
                      {viewerOffer && (
                        <div>
                          <span>{t('viewerOffer')}</span>
                          <span className="flex flex-row items-center justify-start gap-1">
                            <Icon.Sol />
                            <span className="text-white">{viewerOffer.solPrice}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-semibold">{t('noOffers')}</p>
                  )}
                </div>
                <div className="col-span-6 flex flex-col gap-4">
                  {isOwner && highestOffer && (
                    <Button block loading={acceptingOffer} onClick={handleAcceptOffer}>
                      {t('acceptOffer')}
                    </Button>
                  )}
                  {notOwner &&
                    (viewerOffer ? (
                      <Button onClick={onOpenUpdateOffer} block>
                        {t('updateOffer')}
                      </Button>
                    ) : (
                      <Button
                        onClick={onOpenOffer}
                        background={ButtonBackground.Slate}
                        border={ButtonBorder.Gradient}
                        color={ButtonColor.Gradient}
                        block
                      >
                        {t('bid')}
                      </Button>
                    ))}
                  {viewerOffer && (
                    <div className="col-span-12">
                      <Button
                        block
                        loading={closingOffer}
                        border={ButtonBorder.Gray}
                        color={ButtonColor.Gray}
                        onClick={handleCloseOffer}
                      >
                        {t('cancelOffer')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="align-self-start mb-10 w-full md:pr-10 lg:w-1/2">
        <div className="mb-10 flex flex-row items-center justify-center">
          <ButtonGroup value={router.pathname as NftPage} onChange={() => {}}>
            <Link href={`/nfts/${nft.mintAddress}/details`}>
              <ButtonGroup.Option value={NftPage.Details}>{t('details')}</ButtonGroup.Option>
            </Link>
            <Link href={`/nfts/${nft.mintAddress}/offers`}>
              <ButtonGroup.Option value={NftPage.Offers}>{t('offers')}</ButtonGroup.Option>
            </Link>
            <Link href={`/nfts/${nft.mintAddress}/activity`}>
              <ButtonGroup.Option value={NftPage.Activity}>{t('activity')}</ButtonGroup.Option>
            </Link>
          </ButtonGroup>
        </div>
        {children}
      </div>
    </main>
  );
}

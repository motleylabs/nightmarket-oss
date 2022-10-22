import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NftMarketInfoQuery } from './../queries/nft.graphql';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import clsx from 'clsx';
import { Marketplace, Nft } from '../graphql.types';
import { ButtonGroup } from './../components/ButtonGroup';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from './../components/Button';
import useMakeOffer from '../hooks/offer';
import useListNft from '../hooks/list';
import { Form } from '../components/Form';
import Head from 'next/head';
import { viewerVar } from './../cache';
import Icon from '../components/Icon';
import Share from '../components/Share';
import config from '../app.config';
import { useWallet } from '@solana/wallet-adapter-react';
import useBuyNow from '../hooks/buy';
import useLogin from '../hooks/login';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

interface NftLayoutProps {
  children: ReactNode;
  nft: Nft;
  marketplace: Marketplace;
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

export default function NftLayout({ children, nft, marketplace }: NftLayoutProps) {
  const { t } = useTranslation('nft');
  const router = useRouter();
  const onLogin = useLogin();
  const { publicKey, connected } = useWallet();
  const viewer = useReactiveVar(viewerVar);

  const { data, loading } = useQuery<NftMarketData, NftMarketVariables>(NftMarketInfoQuery, {
    variables: {
      address: router.query.address as string,
    },
  });

  const {
    makeOffer,
    registerOffer,
    onMakeOffer,
    onCancelOffer,
    handleSubmitOffer,
    onOpenOffer,
    onCloseOffer,
    offerFormState,
  } = useMakeOffer();

  const {
    buy,
    registerBuy,
    onBuyNow,
    onOpenBuy,
    onCloseBuy,
    handleSubmitBuy,
    buyFormState,
    setValue,
  } = useBuyNow();

  const handleBuy = async () => {
    if (nft && marketplace && listing) {
      onBuyNow({ nft, marketplace, ahListing: listing });
    }
  };

  const {
    listNft,
    handleSubmitListNft,
    registerListNft,
    onCancelListNftClick,
    onListNftClick,
    listNftState,
  } = useListNft({
    nft,
    marketplace,
  });

  const handleOffer = async ({ amount }: { amount: string }) => {
    if (amount && nft && marketplace) {
      onMakeOffer({ amount, nft, marketplace });
    }
  };

  const isOwner = viewer?.address === nft.owner?.address;
  const notOwner = !isOwner;

  const nightmarketListings = data?.nft.listings?.filter(
    (listing) => listing.auctionHouse?.address === process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS
  );
  const listing = nightmarketListings?.sort((a, b) => a.price - b.price)[0];

  useEffect(() => {
    setValue('amount', listing?.price.toString());
  }, [setValue, listing]);

  const activeForm = makeOffer || listNft;

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
      <div className="top-10 w-full pt-0 lg:sticky lg:w-1/2 lg:pt-20 lg:pl-10">
        <div className="mb-4 flex flex-row items-center justify-between gap-2">
          {nft.collection ? (
            // TODO: Update to collection id once nft is updated
            <Link href={`/collections/${nft.collection.nft.mintAddress}/nfts`}>
              <a className="flex flex-row items-center gap-2 transition hover:scale-[1.02]">
                <img
                  src={nft.collection.nft.image}
                  className="aspect-square w-10 rounded-md object-cover"
                  alt="collection image"
                />
                <h2 className="text-2xl">{nft.collection.nft.name}</h2>
              </a>
            </Link>
          ) : (
            <div />
          )}
          {/* Share Component */}
          {/* <Share
            address={nft.mintAddress}
            forceDirection="left"
            twitterParams={{
              text: t('twitterShareText'),
              hashtags: ['nightmarket'],
              url: `${config.baseUrl}/nfts/${nft.mintAddress}`,
            }}
          /> */}
        </div>
        <h1 className="mb-6 text-4xl lg:text-5xl">{nft.name}</h1>
        {buy && (
          <Form
            onSubmit={handleSubmitBuy(handleBuy)}
            className="fixed bottom-0 left-0 right-0 z-30 mb-0 rounded-t-md bg-gray-800 md:relative md:z-0 md:mb-10 md:rounded-md"
          >
            <h2 className="border-b-2 border-b-gray-725 p-6 text-center text-lg font-semibold md:border-b-0 md:pb-0 md:text-left">
              {t('buy')}
            </h2>
            <div className="mt-4 flex flex-col gap-4 px-6 pt-8 pb-6 md:pt-0">
              <div id={'rewards'}>
                <div className="flex flex-row items-center justify-between rounded-md bg-primary-600 p-4">
                  <img
                    src="/images/nightmarket.svg"
                    className="h-5 w-auto object-fill"
                    alt="night market logo"
                  />
                  <p className="text-primary-700">{400} SAUCE</p>
                </div>
              </div>
              <div id={'prices'} className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('buyable.floorPrice', { ns: 'common' })}
                  </p>
                  <p className="text-base font-medium text-gray-300">
                    {nft.collection?.floorPrice} SOL
                  </p>
                </div>
                {listing && (
                  <div className="flex flex-row justify-between">
                    <p className="text-base font-medium text-gray-300">
                      {t('buyable.listPrice', { ns: 'common' })}
                    </p>
                    {/* TODO: sort for lowest listing thats not expired */}
                    <p className="text-base font-medium text-gray-300">
                      {listing.previewPrice} SOL
                    </p>
                  </div>
                )}
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('buyable.marketplaceFee', { ns: 'common' })}
                  </p>
                  <p className="text-base font-medium text-gray-300">
                    {marketplace.auctionHouses[0].fee}%
                    {/* TODO: calculate based on listing price */}
                  </p>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="text-base font-medium text-gray-300">
                    {t('buyable.currentBalance', { ns: 'common' })}
                  </p>
                  <p className="text-base font-medium text-gray-300">
                    {viewer?.solBalance || '-'} SOL
                  </p>
                </div>
              </div>
              <div id={'buy-buttons'} className="flex flex-col gap-4">
                {connected ? (
                  <>
                    <Button
                      className="font-semibold"
                      block
                      htmlType="submit"
                      loading={buyFormState.isSubmitting}
                    >
                      {t('buyable.buyNowButton', { ns: 'common' })}
                    </Button>
                    <Button
                      className="font-semibold"
                      block
                      onClick={() => {
                        onCloseBuy();
                      }}
                      background={ButtonBackground.Slate}
                      border={ButtonBorder.Gray}
                      color={ButtonColor.Gray}
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
          </Form>
        )}
        {makeOffer && (
          <Form
            onSubmit={handleSubmitOffer(handleOffer)}
            className="fixed bottom-0 left-0 right-0 z-30 mb-0 rounded-t-md bg-gray-800 md:relative md:z-0 md:mb-10 md:rounded-md"
          >
            <h2 className="border-b-2 border-b-gray-725 p-6 text-center text-lg font-semibold text-white md:border-b-0 md:pb-0 md:text-left">
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
                  {nft.collection && <h4>{nft.collection.nft.name}</h4>}
                </div>
              </div>
              <ul className="my-6 flex flex-grow flex-col gap-2 text-gray-300">
                {nft.collection && (
                  <li className="flex justify-between">
                    <span>{t('currentFloor')}</span>
                    <span>{nft.collection.floorPrice} SOL</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span>{t('lastSold')}</span>
                  <span>48 SOL</span>
                </li>
                {viewer && (
                  <li className="flex justify-between">
                    <span>{t('walletBalance')}</span>
                    <span>{viewer.solBalance} SOL</span>
                  </li>
                )}
              </ul>
              <Form.Label name={t('amount')}>
                {/* Temporarily broke out of component to make it work*/}
                <div
                  className={clsx(
                    'flex w-full flex-row items-center justify-start rounded-md border border-gray-725 bg-gray-800 p-2 text-white focus-within:border-white focus:ring-0 focus:ring-offset-0',
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
                {/* <Form.Input
                  {...registerOffer('amount')}
                  autoFocus
                  error={offerFormState.errors.amount?.message}
                  className="input"
                  icon={<Icon.Sol className="h-6 w-6" />}
                /> */}
              </Form.Label>
              <Button
                block
                onClick={handleSubmitOffer(handleOffer)}
                className="mb-4"
                loading={offerFormState.isSubmitting}
              >
                {t('submitOffer')}
              </Button>
              <Button
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gray}
                color={ButtonColor.Gray}
                block
                onClick={onCloseOffer}
              >
                {t('cancel', { ns: 'common' })}
              </Button>
            </div>
          </Form>
        )}
        {listNft && (
          <Form
            onSubmit={handleSubmitListNft(() => {})}
            className="fixed bottom-0 left-0 right-0 z-30 mb-0 rounded-t-md bg-gray-800 shadow-xl md:relative md:z-0 md:mb-10 md:rounded-md"
          >
            <h2 className="border-b-2 border-b-gray-725 p-6 text-center text-lg font-semibold md:border-b-0 md:pb-0 md:text-left">
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
                  {nft.collection && <h4>{nft.collection.nft.name}</h4>}
                </div>
              </div>
              <div className="mt-6 flex flex-row items-center justify-between p-4">
                <div className="flex flex-col justify-between text-gray-300">
                  <span>{t('highestOffer')}</span>
                  <span>--</span>
                </div>
                <Button border={ButtonBorder.Gray} color={ButtonColor.Gray} onClick={() => {}}>
                  {t('accept')}
                </Button>
              </div>
              <ul className="my-6 flex flex-grow flex-col gap-2 text-gray-300">
                {nft.collection && (
                  <li className="flex justify-between">
                    <span>{t('currentFloor')}</span>
                    <span>{nft.collection.floorPrice} SOL</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span>{t('lastSold')}</span>
                  <span>48 SOL</span>
                </li>
              </ul>
              <Form.Label name={t('amount')}>
                <div
                  className={clsx(
                    'flex w-full flex-row items-center justify-start rounded-md border border-gray-725 bg-gray-800 p-2 text-white focus-within:border-white focus:ring-0 focus:ring-offset-0',
                    'input'
                  )}
                >
                  <Icon.Sol />
                  <input
                    // {...registerListNft('amount', { required: true })}
                    autoFocus
                    className={clsx('w-full bg-transparent pl-2')}
                  />
                </div>
                {listNftState.errors.amount?.message && (
                  <p className="whitespace-nowrap text-left text-xs text-red-500">
                    {listNftState.errors.amount?.message}
                  </p>
                )}
                {/* <Form.Input
                  {...registerListNft('amount')}
                  autoFocus
                  className="input"
                  icon={<Icon.Sol className="h-6 w-6" />}
                /> */}
              </Form.Label>
              <Button
                block
                htmlType="submit"
                className="mb-4"
                loading={offerFormState.isSubmitting}
              >
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
        <div
          className={clsx('mb-10 flex flex-col gap-4 rounded-md bg-black p-6', {
            'md:hidden': activeForm,
          })}
        >
          <div className="flex flex-row items-center justify-between gap-10 rounded-lg bg-gray-800 p-6">
            {listing && (
              <div className="flex flex-col justify-between text-gray-300">
                <span>{t('listed')}</span>
                <div className="flex items-center gap-2">
                  <Icon.Sol className="h-5 w-5" />
                  <span className="text-2xl text-white">{listing.previewPrice}</span>
                </div>
              </div>
            )}
            {!listing && (
              <div className="flex flex-col justify-between text-gray-300">
                <span>{t('neverSold')}</span>
                <span>--</span>
              </div>
            )}

            {notOwner && !listing && (
              <Button
                onClick={onOpenOffer}
                className="w-52"
                background={ButtonBackground.Slate}
                border={ButtonBorder.Gradient}
                color={ButtonColor.Gradient}
              >
                {t('bid')}
              </Button>
            )}

            {notOwner && listing && (
              <Button className="w-52" onClick={onOpenBuy}>
                {t('buy')}
              </Button>
            )}
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg bg-gray-800 p-6">
            <div className="flex flex-col justify-between text-gray-300">
              {/* TODO: Dont show if there is no data */}
              <span>{t('lastSale')}</span>
              <span>--</span>
            </div>
            {isOwner && <Button onClick={onListNftClick}>{t('listNft')}</Button>}
          </div>
        </div>
      </div>
      <div className="align-self-start mb-10 md:pr-10 lg:w-1/2">
        <div className="mb-10 flex flex-row items-center justify-center">
          <ButtonGroup value={router.pathname as NftPage} onChange={() => {}}>
            <Link href={`/nfts/${nft.mintAddress}/details`} passHref>
              <a>
                <ButtonGroup.Option value={NftPage.Details}>{t('details')}</ButtonGroup.Option>
              </a>
            </Link>
            <Link href={`/nfts/${nft.mintAddress}/offers`} passHref>
              <a>
                <ButtonGroup.Option value={NftPage.Offers}>{t('offers')}</ButtonGroup.Option>
              </a>
            </Link>
            <Link href={`/nfts/${nft.mintAddress}/activity`} passHref>
              <a>
                <ButtonGroup.Option value={NftPage.Activity}>{t('activity')}</ButtonGroup.Option>
              </a>
            </Link>
          </ButtonGroup>
        </div>
        {children}
      </div>
    </main>
  );
}

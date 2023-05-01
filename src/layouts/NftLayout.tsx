import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useState, useMemo, useEffect } from 'react';

import config from '../app.config';
import { NUMBER_REGEX } from '../components/BulkListing/BulkListModal';
import Flex, { FlexAlign, FlexDirection, FlexJustify } from '../components/Flex';
import { Form } from '../components/Form';
import { Row, Col } from '../components/Grid';
import Icon from '../components/Icon';
import Lightbox from '../components/Lightbox';
import { Paragraph, TextColor, FontWeight } from '../components/Typography';
import useBuyNow from '../hooks/buy';
import type { BuyListingResponse } from '../hooks/buy';
import { useDetail } from '../hooks/collection/useDetail';
import useHSBuyNow from '../hooks/hyperspace';
import { useListNft, useUpdateListing, useCloseListing } from '../hooks/list';
import useLogin from '../hooks/login';
import { useOffers } from '../hooks/nft';
import { useMakeOffer, useUpdateOffer, useCloseOffer, useAcceptOffer } from '../hooks/offer';
import { useAction } from '../hooks/useAction';
import { useAuctionHouseContext } from '../providers/AuctionHouseProvider';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { ActionInfo, ActivityEvent, Nft, Offer, OfferEvent } from '../typings';
import { getAssetURL, AssetSize } from '../utils/assets';
import { getMarketplace } from '../utils/marketplaces';
import type { Marketplace } from '../utils/marketplaces';
import { getSolFromLamports } from '../utils/price';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from './../components/Button';
import { ButtonGroup } from './../components/ButtonGroup';
import Image, { ImgBackdrop } from './../components/Image';
import { Overview } from './../components/Nft';
import { VerifiedBadge } from './CollectionLayout';

interface NftLayoutProps {
  children: ReactNode;
  nft: Nft;
}

enum NftPage {
  Details = '/nfts/[address]',
  Offers = '/nfts/[address]/offers',
  Activity = '/nfts/[address]/activity',
}

export default function NftLayout({ children, nft: serverNft }: NftLayoutProps) {
  const { t } = useTranslation(['nft', 'common']);
  const router = useRouter();
  const onLogin = useLogin();
  const { publicKey, connected, balance } = useWalletContext();
  const [expanded, setExpanded] = useState(false);
  const [nft, setNft] = useState<Nft>(serverNft);
  const { isLoading: auctionHouseLoading, auctionHouse } = useAuctionHouseContext();
  const { isLoading: collectionLoading, data: collection } = useDetail(nft.symbol);
  const { data: offers, isLoading, isValidating, mutate } = useOffers(nft.mintAddress);
  const { on, off, trigger } = useAction();

  const addOffer = (event: Event) => {
    const newOfferEvent: OfferEvent = (event as CustomEvent).detail;

    if (newOfferEvent.mint === nft.mintAddress) {
      if (!isLoading && !isValidating && !!offers) {
        const offerIndex = offers.findIndex((offer) => offer.buyer === newOfferEvent.offer.buyer);
        if (offerIndex > -1) {
          offers.splice(offerIndex, 1);
        }

        if (newOfferEvent.offer.activityType.toLowerCase() !== 'cancelbid') {
          mutate([newOfferEvent.offer, ...offers], { revalidate: false });
        } else {
          mutate([...offers], { revalidate: false });
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

  const isOwner = publicKey?.toBase58() === nft.owner;

  const notOwner = !isOwner;

  const marketplace: Marketplace | undefined = useMemo(() => {
    return getMarketplace(
      nft.latestListing?.auctionHouseProgram,
      nft.latestListing?.auctionHouseAddress
    );
  }, [nft.latestListing]);

  const isOwnMarket: boolean = useMemo(() => {
    return nft.latestListing?.auctionHouseAddress === config.auctionHouse;
  }, [nft.latestListing]);

  const listing: ActionInfo | null = useMemo(() => nft.latestListing, [nft.latestListing]);

  const highestOffer: Offer | null = useMemo(() => {
    const sorted = offers
      ?.filter((offer: Offer) => offer.auctionHouseAddress === config.auctionHouse)
      .sort((a: Offer, b: Offer) => {
        return getSolFromLamports(b.price) - getSolFromLamports(a.price);
      });

    if (!sorted) {
      return null;
    }

    return sorted[0] || null;
  }, [offers]);

  const viewerOffer: Offer | null = useMemo(() => {
    const offer = offers?.find(
      (offer: Offer) =>
        offer.buyer === publicKey?.toBase58() && offer.auctionHouseAddress === config.auctionHouse
    );

    return offer || null;
  }, [offers, publicKey]);

  const {
    makeOffer,
    registerOffer,
    onMakeOffer,
    handleSubmitOffer,
    onOpenOffer,
    offerFormState,
    onCancelMakeOffer,
  } = useMakeOffer(listing, collection?.statistics.floor1d);

  const handleOffer = async ({ amount }: { amount: number }) => {
    if (!amount || !nft || !auctionHouse || !auctionHouse.rewardCenter) {
      return;
    }

    try {
      const response = await onMakeOffer({ amount: Number(amount), nft, auctionHouse });

      if (!response) {
        return;
      }

      trigger('offer-add', {
        mint: nft.mintAddress,
        offer: {
          activityType: 'BID',
          buyer: publicKey?.toBase58() ?? '',
          blockTimestamp: Math.floor(new Date().getTime() / 1000),
          martketplaceProgramAddress: config.auctionHouseProgram ?? '',
          auctionHouseAddress: auctionHouse.address,
          price: `${response.buyerPrice}`,
          seller: null,
          signature: response.signature,
        },
      } as OfferEvent);
    } catch (e: unknown) {}
  };

  const onViewExternalListing = async () => {
    if (!nft || !marketplace) {
      return;
    }

    window.open(marketplace.link.replace('{}', nft.mintAddress), '_blank', 'noopener,noreferrer');
  };

  const { buy, onBuyNow, onOpenBuy, onCloseBuy, buying } = useBuyNow();
  const { buying: HSBuying, onHSBuyNow } = useHSBuyNow();

  const handleBuy = async () => {
    if (!nft || !auctionHouse || !listing) {
      return;
    }

    let response: BuyListingResponse | undefined = undefined;

    try {
      if (isOwnMarket) {
        response = await onBuyNow({
          nft,
          auctionHouse,
          listing,
        });
      } else {
        response = await onHSBuyNow({
          nft,
          listing,
        });
      }

      if (!response) {
        return;
      }

      setNft((oldNft) => ({
        ...oldNft,
        // eslint-disable-next-line
        owner: response!.buyAction ? response!.buyAction.userAddress : oldNft.owner,
        // eslint-disable-next-line
        lastSale: response!.buyAction,
        latestListing: null,
      }));

      if (!!response.buyAction) {
        trigger('activity', {
          mint: nft.mintAddress,
          activity: {
            activityType: 'TRANSACTION',
            buyer: response.buyAction.userAddress,
            blockTimestamp: response.buyAction.blockTimestamp,
            martketplaceProgramAddress: config.auctionHouseProgram ?? '',
            auctionHouseAddress: auctionHouse.address,
            price: response.buyAction.price,
            seller: publicKey?.toBase58() ?? '',
            signature: response.buyAction.signature,
          },
        } as ActivityEvent);
      }
    } catch (e: unknown) {}
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

    const newListing = await onSubmitListNft({ amount, nft, auctionHouse });

    if (!!newListing) {
      setNft((oldNft) => ({ ...oldNft, latestListing: newListing }));

      trigger('activity', {
        mint: nft.mintAddress,
        activity: {
          activityType: 'LISTING',
          buyer: null,
          blockTimestamp: newListing.blockTimestamp,
          martketplaceProgramAddress: config.auctionHouseProgram ?? '',
          auctionHouseAddress: auctionHouse.address,
          price: newListing.price,
          seller: publicKey?.toBase58() ?? '',
          signature: newListing.signature,
        },
      } as ActivityEvent);
    }
  };

  const { onCloseListing, closingListing } = useCloseListing({
    listing,
    nft,
    auctionHouse,
    setNft,
  });

  const handleCloseListing = async () => {
    const sig = await onCloseListing();

    if (!!sig && !!auctionHouse) {
      setNft((oldNft) => ({ ...oldNft, latestListing: null }));

      trigger('activity', {
        mint: nft.mintAddress,
        activity: {
          activityType: 'DELISTING',
          buyer: null,
          blockTimestamp: Math.floor(new Date().getTime() / 1000),
          martketplaceProgramAddress: config.auctionHouseProgram ?? '',
          auctionHouseAddress: auctionHouse.address,
          price: '0',
          seller: publicKey?.toBase58() ?? '',
          signature: sig,
        },
      } as ActivityEvent);
    }
  };

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

    const newListing = await onSubmitUpdateListing({ amount, nft, auctionHouse, setNft });

    if (!!newListing) {
      setNft((oldNft) => ({ ...oldNft, latestListing: newListing }));

      trigger('activity', {
        mint: nft.mintAddress,
        activity: {
          activityType: 'LISTING',
          buyer: null,
          blockTimestamp: newListing?.blockTimestamp,
          martketplaceProgramAddress: config.auctionHouseProgram ?? '',
          auctionHouseAddress: auctionHouse.address,
          price: newListing.price,
          seller: publicKey?.toBase58() ?? '',
          signature: newListing.signature,
        },
      } as ActivityEvent);
    }
  };

  const { onCloseOffer, closingOffer } = useCloseOffer(viewerOffer);

  const handleCloseOffer = async () => {
    if (!viewerOffer) {
      return;
    }

    try {
      const sig = await onCloseOffer({ nft, auctionHouse });

      if (!!sig && !!auctionHouse) {
        trigger('offer-add', {
          mint: nft.mintAddress,
          offer: {
            activityType: 'CANCELBID',
            buyer: publicKey?.toBase58() ?? '',
            blockTimestamp: Math.floor(new Date().getTime() / 1000),
            martketplaceProgramAddress: config.auctionHouseProgram ?? '',
            auctionHouseAddress: auctionHouse.address,
            price: '0',
            seller: null,
            signature: sig,
          },
        } as OfferEvent);
      }
    } catch (e: unknown) {}
  };

  const { onAcceptOffer, acceptingOffer } = useAcceptOffer(highestOffer);

  const handleAcceptOffer = async () => {
    if (!auctionHouse || !auctionHouse.rewardCenter || !nft || !highestOffer) {
      return;
    }

    try {
      const response = await onAcceptOffer({ auctionHouse, nft, listing });

      if (!response) {
        return;
      }

      setNft((oldNft) => ({
        ...oldNft,
        owner: response.acceptAction ? response.acceptAction.userAddress : oldNft.owner,
        lastSale: response.acceptAction,
        latestListing: null,
      }));

      if (!!response.acceptAction) {
        trigger('activity', {
          mint: nft.mintAddress,
          activity: {
            activityType: 'TRANSACTION',
            buyer: response.acceptAction.userAddress,
            blockTimestamp: response.acceptAction.blockTimestamp,
            martketplaceProgramAddress: config.auctionHouseProgram ?? '',
            auctionHouseAddress: auctionHouse.address,
            price: response.acceptAction.price,
            seller: publicKey?.toBase58() ?? '',
            signature: response.acceptAction.signature,
          },
        } as ActivityEvent);
        trigger('offer-clear');
      }
    } catch (er: unknown) {}
  };

  const {
    onOpenUpdateOffer,
    registerUpdateOffer,
    onUpdateOffer,
    onCancelUpdateOffer,
    updateOfferFormState,
    handleSubmitUpdateOffer,
    updateOffer,
  } = useUpdateOffer(viewerOffer, listing, nft, collection);

  const handleUpdateOffer = async ({ amount }: { amount: number }) => {
    if (!amount || !nft || !auctionHouse) {
      return;
    }

    const sig = await onUpdateOffer({ amount: Number(amount), nft, auctionHouse });

    if (!!sig) {
      trigger('offer-add', {
        mint: nft.mintAddress,
        offer: {
          activityType: 'BID',
          buyer: publicKey?.toBase58() ?? '',
          blockTimestamp: Math.floor(new Date().getTime() / 1000),
          martketplaceProgramAddress: config.auctionHouseProgram ?? '',
          auctionHouseAddress: auctionHouse.address,
          price: `${amount}`,
          seller: null,
          signature: sig,
        },
      } as OfferEvent);
    }
  };

  const activeForm = makeOffer || listNft || updateListing || buy || updateOffer;

  return (
    <Overview>
      <Head>
        {!!collection ? (
          <title>{`${nft.name} | ${collection.name} | ${t('header.title', {
            ns: 'common',
          })}`}</title>
        ) : (
          <title>{nft.name}</title>
        )}
        <meta name="description" content={nft.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Overview.Media>
        <Lightbox.Container>
          <Image
            src={getAssetURL(nft.image, AssetSize.Large)}
            alt="nft image"
            className="w-full rounded-lg object-cover"
            backdrop={ImgBackdrop.Cell}
          />
          <Lightbox.Show onClick={() => setExpanded(true)} />
        </Lightbox.Container>
      </Overview.Media>
      <Lightbox show={expanded} onDismiss={() => setExpanded(false)}>
        <Image
          src={getAssetURL(nft.image, AssetSize.Large)}
          className="aspect-auto h-full w-full rounded-lg"
          alt={`${nft.name} image`}
        />
      </Lightbox>
      <Overview.Aside>
        {collectionLoading ? (
          <div className="mb-4 flex animate-pulse flex-row items-center gap-2 transition">
            <div className="aspect-square w-10 rounded-md bg-gray-800" />
            <div className="h-6 w-40 rounded-md bg-gray-800" />
          </div>
        ) : (
          !!collection && (
            <div className="flex ">
              <Link
                className="group mb-4 flex flex-row items-center gap-2 transition"
                href={`/collections/${collection.slug}`}
              >
                <Image
                  src={getAssetURL(collection.image, AssetSize.XSmall)}
                  className="aspect-square w-10 rounded-md object-cover"
                  alt="collection image"
                />
                <h2 className="text-2xl transition group-hover:opacity-80">{collection.name}</h2>
              </Link>
              <VerifiedBadge isVerified={collection.isVerified} className="ml-0  mb-4" />
            </div>
          )
        )}
        <Overview.Title>{nft.name}</Overview.Title>
        {buy && (
          <div className="fixed bottom-0 left-0 right-0 z-30 mb-0 rounded-t-md bg-gray-800 md:relative md:z-0 md:mb-10 md:rounded-md">
            <Overview.Form.Title>{t('buy', { ns: 'nft' })}</Overview.Form.Title>
            <Flex direction={FlexDirection.Col} className="mt-4 px-6 pt-8 pb-6 md:pt-0">
              <div>
                <Flex align={FlexAlign.Center} className="rounded-md bg-primary-600 p-4 gap-1">
                  <img
                    src={marketplace?.logo}
                    className="h-5 w-auto object-fill"
                    alt={t('logo', { ns: 'nft', market: marketplace?.name })}
                  />
                  {!isOwnMarket && <h2>{marketplace?.name}</h2>}
                </Flex>
              </div>
              <Overview.Form.Points>
                {collection && (
                  <Overview.Form.Point label={t('buyable.floorPrice', { ns: 'common' })}>
                    <Icon.Sol /> {getSolFromLamports(collection.statistics.floor1d, 0, 3)}
                  </Overview.Form.Point>
                )}
                {listing && (
                  <Overview.Form.Point label={t('buyable.listPrice', { ns: 'common' })}>
                    <Icon.Sol /> {getSolFromLamports(listing.price, 0, 3)}
                  </Overview.Form.Point>
                )}
                {auctionHouse && (
                  <Overview.Form.Point label={t('buyable.marketplaceFee', { ns: 'common' })}>
                    {auctionHouse.sellerFeeBasisPoints / 100}%
                  </Overview.Form.Point>
                )}
                <Overview.Form.Point label={t('buyable.currentBalance', { ns: 'common' })}>
                  <Icon.Sol /> {balance ?? 0}
                </Overview.Form.Point>
              </Overview.Form.Points>
              <Flex direction={FlexDirection.Col} gap={4}>
                {connected ? (
                  <>
                    <Button
                      block
                      loading={buying || HSBuying}
                      disabled={buying || HSBuying}
                      onClick={handleBuy}
                    >
                      {t('buy', { ns: 'nft' })}
                    </Button>
                    <Button
                      block
                      onClick={() => {
                        onCloseBuy();
                      }}
                      background={ButtonBackground.Slate}
                      border={ButtonBorder.Gray}
                      color={ButtonColor.Gray}
                      disabled={buying || HSBuying}
                    >
                      {t('cancel', { ns: 'nft' })}
                    </Button>
                  </>
                ) : (
                  <Button onClick={onLogin} className="font-semibold">
                    {t('connectToBuy', { ns: 'nft' })}
                  </Button>
                )}
              </Flex>
            </Flex>
          </div>
        )}
        {makeOffer && (
          <Overview.Form
            onSubmit={handleSubmitOffer(handleOffer)}
            title={<Overview.Form.Title>{t('placeBid', { ns: 'nft' })}</Overview.Form.Title>}
          >
            <Overview.Form.Preview
              name={nft.name}
              image={getAssetURL(nft.image, AssetSize.Large)}
              collection={collection?.name}
            />
            <Overview.Form.Points>
              {listing && (
                <Overview.Form.Point label={t('listingPrice', { ns: 'nft' })}>
                  <Icon.Sol /> {getSolFromLamports(listing.price, 0, 3)}
                </Overview.Form.Point>
              )}
              {collection && (
                <Overview.Form.Point label={t('currentFloor', { ns: 'nft' })}>
                  <Icon.Sol /> {getSolFromLamports(collection.statistics.floor1d, 0, 3)}
                </Overview.Form.Point>
              )}
              {publicKey && (
                <Overview.Form.Point label={t('walletBalance', { ns: 'nft' })}>
                  <Icon.Sol />
                  {balance ?? 0}
                </Overview.Form.Point>
              )}
            </Overview.Form.Points>
            <Form.Label name={t('amount', { ns: 'nft' })}>
              <Form.Input
                icon={<Icon.Sol />}
                error={offerFormState.errors.amount}
                {...registerOffer('amount', { required: true })}
              />
              <Form.Error message={offerFormState.errors.amount?.message} />
            </Form.Label>
            <Button
              block
              className="mb-4"
              htmlType="submit"
              disabled={offerFormState.isSubmitting}
              loading={offerFormState.isSubmitting}
            >
              {t('submitOffer', { ns: 'nft' })}
            </Button>
            <Button
              background={ButtonBackground.Slate}
              border={ButtonBorder.Gray}
              color={ButtonColor.Gray}
              block
              disabled={offerFormState.isSubmitting}
              onClick={onCancelMakeOffer}
            >
              {t('cancel', { ns: 'nft' })}
            </Button>
          </Overview.Form>
        )}
        {updateOffer && (
          <Overview.Form
            onSubmit={handleSubmitUpdateOffer(handleUpdateOffer)}
            title={<Overview.Form.Title>{t('updateBid', { ns: 'nft' })}</Overview.Form.Title>}
          >
            <Overview.Form.Preview
              name={nft.name}
              image={getAssetURL(nft.image, AssetSize.Large)}
              collection={collection?.name}
            />
            <Overview.Form.Points>
              {collection && (
                <Overview.Form.Point label={t('currentFloor', { ns: 'nft' })}>
                  <Icon.Sol /> {getSolFromLamports(collection.statistics.floor1d, 0, 3)}
                </Overview.Form.Point>
              )}
              {publicKey && (
                <Overview.Form.Point label={t('walletBalance', { ns: 'nft' })}>
                  <Icon.Sol />
                  {balance ?? 0}
                </Overview.Form.Point>
              )}
            </Overview.Form.Points>
            <Form.Label name={t('amount', { ns: 'nft' })}>
              <Form.Input
                icon={<Icon.Sol />}
                error={updateOfferFormState.errors.amount}
                {...registerUpdateOffer('amount', { required: true })}
              />
              <Form.Error message={updateOfferFormState.errors.amount?.message} />
            </Form.Label>
            <Button
              block
              htmlType="submit"
              className="mb-4"
              loading={updateOfferFormState.isSubmitting}
              disabled={updateOfferFormState.isSubmitting}
            >
              {t('update', { ns: 'nft' })}
            </Button>
            <Button
              background={ButtonBackground.Slate}
              border={ButtonBorder.Gray}
              color={ButtonColor.Gray}
              block
              onClick={onCancelUpdateOffer}
              disabled={updateOfferFormState.isSubmitting}
            >
              {t('cancel', { ns: 'nft' })}
            </Button>
          </Overview.Form>
        )}
        {listNft && (
          <Overview.Form
            onSubmit={handleSubmitListNft(handleList)}
            title={<Overview.Form.Title>{t('listNft', { ns: 'nft' })}</Overview.Form.Title>}
          >
            <Overview.Form.Preview
              name={nft.name}
              image={getAssetURL(nft.image, AssetSize.Large)}
              collection={collection?.name}
            />
            <Overview.Form.Points>
              {collection && (
                <Overview.Form.Point label={t('currentFloor', { ns: 'nft' })}>
                  <Icon.Sol /> {getSolFromLamports(collection.statistics.floor1d, 0, 3)}
                </Overview.Form.Point>
              )}
            </Overview.Form.Points>
            <Form.Label name={t('amount', { ns: 'nft' })}>
              <Form.Input
                icon={<Icon.Sol />}
                autoFocus
                error={offerFormState.errors.amount}
                {...registerListNft('amount', {
                  required: true,
                  validate: (value) =>
                    Boolean(+value) && Boolean(value.match(NUMBER_REGEX)?.length),
                })}
              />
              <Form.Error message={listNftState.errors.amount?.message} />
            </Form.Label>
            <Button
              block
              htmlType="submit"
              className="mb-4"
              loading={listNftState.isSubmitting}
              disabled={listNftState.isSubmitting}
            >
              {t('listNft', { ns: 'nft' })}
            </Button>
            <Button
              block
              background={ButtonBackground.Slate}
              border={ButtonBorder.Gray}
              color={ButtonColor.Gray}
              onClick={onCancelListNftClick}
              disabled={listNftState.isSubmitting}
            >
              {t('cancel', { ns: 'nft' })}
            </Button>
          </Overview.Form>
        )}
        {updateListing && (
          <Overview.Form
            onSubmit={handleSubmitUpdateListing(handleUpdateListing)}
            title={<Overview.Form.Title>{t('updateListing', { ns: 'nft' })}</Overview.Form.Title>}
          >
            <Overview.Form.Preview
              name={nft.name}
              image={getAssetURL(nft.image, AssetSize.Large)}
              collection={collection?.name}
            />
            <Overview.Form.Points>
              {collection && (
                <Overview.Form.Point label={t('currentFloor', { ns: 'nft' })}>
                  <Icon.Sol /> {getSolFromLamports(collection.statistics.floor1d, 0, 3)}
                </Overview.Form.Point>
              )}
            </Overview.Form.Points>
            <Form.Label name={t('newPrice', { ns: 'nft' })}>
              <Form.Input
                icon={<Icon.Sol />}
                error={updateListingState.errors.amount}
                autoFocus
                {...registerUpdateListing('amount', {
                  required: true,
                  validate: (value) =>
                    Boolean(+value) && Boolean(value.match(NUMBER_REGEX)?.length),
                })}
              />
              <Form.Error message={updateListingState.errors.amount?.message} />
            </Form.Label>
            <Button
              block
              htmlType="submit"
              className="mb-4"
              loading={updateListingState.isSubmitting}
              disabled={updateListingState.isSubmitting}
            >
              {t('update', { ns: 'nft' })}
            </Button>
            <Button
              block
              background={ButtonBackground.Slate}
              border={ButtonBorder.Gray}
              color={ButtonColor.Gray}
              disabled={updateListingState.isSubmitting}
              onClick={onCancelUpdateListing}
            >
              {t('cancel', { ns: 'nft' })}
            </Button>
          </Overview.Form>
        )}
        {auctionHouseLoading ? (
          <Overview.Aside.Skeleton />
        ) : (
          <>
            <Overview.Card
              className={clsx({
                'md:hidden': activeForm,
              })}
            >
              <Flex
                direction={FlexDirection.Col}
                align={FlexAlign.Center}
                justify={FlexJustify.Between}
              >
                {listing && (
                  <Flex
                    block
                    align={FlexAlign.Center}
                    justify={FlexJustify.Start}
                    gap={2}
                    className="border-b-[1px] border-b-gray-900 py-4 px-6"
                  >
                    <img
                      src={marketplace?.logo}
                      className="h-5 w-auto object-fill"
                      alt={t('logo', { ns: 'nft', market: marketplace?.name })}
                    />
                    {!isOwnMarket && <h2>{marketplace?.name}</h2>}
                  </Flex>
                )}
                <Flex block direction={FlexDirection.Col} gap={6} className="p-6">
                  <Row block align={FlexAlign.Center}>
                    <Overview.Figures>
                      {listing && (
                        <Overview.Figure
                          label={t('listed', { ns: 'nft' })}
                          amount={getSolFromLamports(listing.price, 0, 3)}
                          size={Overview.Figure.Size.Large}
                        />
                      )}
                      {!!nft.lastSale ? (
                        <Overview.Figure
                          className="md:flex-row"
                          label={t('lastSale', { ns: 'common' })}
                          amount={getSolFromLamports(nft.lastSale.price, 0, 3)}
                        />
                      ) : (
                        <Paragraph weight={FontWeight.Semibold} color={TextColor.Gray}>
                          {t('noSales', { ns: 'nft' })}
                        </Paragraph>
                      )}
                    </Overview.Figures>
                    <Col
                      span={6}
                      direction={FlexDirection.Col}
                      justify={FlexJustify.Center}
                      gap={6}
                    >
                      {isOwner ? (
                        listing ? (
                          <>
                            <Button block onClick={onUpdateListing}>
                              {t('updateListing', { ns: 'nft' })}
                            </Button>
                            <Button
                              block
                              loading={closingListing}
                              border={ButtonBorder.Gray}
                              color={ButtonColor.Gray}
                              onClick={handleCloseListing}
                            >
                              {t('cancelListing', { ns: 'nft' })}
                            </Button>
                          </>
                        ) : (
                          <Button block onClick={onListNftClick}>
                            {t('listNft', { ns: 'nft' })}
                          </Button>
                        )
                      ) : (
                        listing && (
                          <Button
                            block
                            onClick={
                              !!marketplace && marketplace.buyNowEnabled
                                ? onOpenBuy
                                : onViewExternalListing
                            }
                          >
                            {t(!!marketplace && marketplace.buyNowEnabled ? 'buy' : 'view', {
                              ns: 'nft',
                              market: marketplace?.name,
                            })}
                          </Button>
                        )
                      )}
                    </Col>
                  </Row>
                </Flex>
              </Flex>
            </Overview.Card>
            <Overview.Card
              className={clsx({
                'md:hidden': activeForm,
              })}
            >
              <Row block align={FlexAlign.Center} justify={FlexJustify.Start} className="p-6">
                <Overview.Figures>
                  {!!highestOffer || !!viewerOffer ? (
                    <>
                      {highestOffer && (
                        <Overview.Figure
                          label={t('highestOffer', { ns: 'nft' })}
                          amount={getSolFromLamports(highestOffer.price, 0, 3)}
                          size={Overview.Figure.Size.Large}
                        />
                      )}
                      {viewerOffer && (
                        <Overview.Figure
                          label={t('viewerOffer', { ns: 'nft' })}
                          className="md:flex-row"
                          amount={getSolFromLamports(viewerOffer.price, 0, 3)}
                        />
                      )}
                    </>
                  ) : (
                    <Paragraph weight={FontWeight.Semibold}>
                      {t('noOffers', { ns: 'nft' })}
                    </Paragraph>
                  )}
                </Overview.Figures>
                <Col span={6} direction={FlexDirection.Col} gap={4}>
                  {isOwner && highestOffer && (
                    <Button block loading={acceptingOffer} onClick={handleAcceptOffer}>
                      {t('acceptOffer', { ns: 'nft' })}
                    </Button>
                  )}
                  {notOwner &&
                    (viewerOffer ? (
                      <Button onClick={onOpenUpdateOffer} block>
                        {t('updateOffer', { ns: 'nft' })}
                      </Button>
                    ) : (
                      <Button
                        onClick={onOpenOffer}
                        background={ButtonBackground.Slate}
                        border={ButtonBorder.Gradient}
                        color={ButtonColor.Gradient}
                        block
                      >
                        {t('bid', { ns: 'nft' })}
                      </Button>
                    ))}
                  {viewerOffer && (
                    <Button
                      block
                      loading={closingOffer}
                      border={ButtonBorder.Gray}
                      color={ButtonColor.Gray}
                      onClick={handleCloseOffer}
                    >
                      {t('cancelOffer', { ns: 'nft' })}
                    </Button>
                  )}
                </Col>
              </Row>
            </Overview.Card>
          </>
        )}
      </Overview.Aside>
      <Overview.Content>
        <Overview.Tabs>
          <ButtonGroup value={router.pathname as NftPage} onChange={() => null}>
            <Link href={`/nfts/${nft.mintAddress}`} scroll={false}>
              <ButtonGroup.Option value={NftPage.Details}>
                {t('details', { ns: 'nft' })}
              </ButtonGroup.Option>
            </Link>
            <Link href={`/nfts/${nft.mintAddress}/offers`} scroll={false}>
              <ButtonGroup.Option value={NftPage.Offers}>
                {t('offers', { ns: 'nft' })}
              </ButtonGroup.Option>
            </Link>
            <Link href={`/nfts/${nft.mintAddress}/activity`} scroll={false}>
              <ButtonGroup.Option value={NftPage.Activity}>
                {t('activity', { ns: 'nft' })}
              </ButtonGroup.Option>
            </Link>
          </ButtonGroup>
        </Overview.Tabs>
        {children}
      </Overview.Content>
    </Overview>
  );
}

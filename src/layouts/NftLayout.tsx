import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NftMarketInfoQuery, NftDetailsQuery } from './../queries/nft.graphql';
import { ReactNode, useState, useMemo } from 'react';
import { useApolloClient, useQuery, useReactiveVar } from '@apollo/client';
import clsx from 'clsx';
import { AuctionHouse, Nft, Offer, AhListing, CollectionTrend } from '../graphql.types';
import { Overview } from './../components/Nft';
import { ButtonGroup } from './../components/ButtonGroup';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from './../components/Button';
import { useMakeOffer, useUpdateOffer, useCloseOffer, useAcceptOffer } from '../hooks/offer';
import { useListNft, useUpdateListing, useCloseListing } from '../hooks/list';
import { Form } from '../components/Form';
import Head from 'next/head';
import { viewerVar } from './../cache';
import { Paragraph, TextColor, FontWeight } from '../components/Typography';
import Icon from '../components/Icon';
import { useWallet } from '@solana/wallet-adapter-react';
import useBuyNow from '../hooks/buy';
import useLogin from '../hooks/login';
import config from '../app.config';
import Image, { ImgBackdrop } from './../components/Image';
import Lightbox from '../components/Lightbox';
import { RewardCenterProgram } from '../modules/reward-center';
import Flex, { FlexAlign, FlexDirection, FlexJustify } from '../components/Flex';
import { Row, Col } from '../components/Grid';

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
  const [expanded, setExpanded] = useState(false);

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
    const offer = data?.nft.offers.find(
      (offer: Offer) =>
        offer.buyer === publicKey?.toBase58() && offer.auctionHouse?.address === config.auctionHouse
    );

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
  } = useMakeOffer(data?.nft);

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
                  parseFloat(cc.estimatedValue) - parseFloat(trends?.floor1d)
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
  } = useUpdateOffer(viewerOffer, data?.nft);

  const handleUpdateOffer = async ({ amount }: { amount: string }) => {
    if (!amount || !nft || !auctionHouse) {
      return;
    }

    await onUpdateOffer({ amount, nft, auctionHouse });
  };

  const activeForm = makeOffer || listNft || updateListing || buy || updateOffer;

  return (
    <Overview>
      <Head>
        <title>{nft.name}</title>
        <meta name="description" content={nft.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Overview.Media>
        <Lightbox.Container>
          <Image
            src={nft.image}
            alt="nft image"
            className="w-full rounded-lg object-cover"
            backdrop={ImgBackdrop.Cell}
          />
          <Lightbox.Show onClick={() => setExpanded(true)} />
        </Lightbox.Container>
      </Overview.Media>
      <Lightbox show={expanded} onDismiss={() => setExpanded(false)}>
        <Image
          src={nft.image}
          className="aspect-auto h-full w-full rounded-lg"
          alt={`${nft.name} image`}
        />
      </Lightbox>
      <Overview.Aside>
        {loading ? (
          <div className="mb-4 flex animate-pulse flex-row items-center gap-2 transition">
            <div className="aspect-square w-10 rounded-md bg-gray-800" />
            <div className="h-6 w-40 rounded-md bg-gray-800" />
          </div>
        ) : (
          data?.nft.moonrankCollection && (
            <Link
              className="group mb-4 flex flex-row items-center gap-2 transition"
              href={`/collections/${data?.nft.moonrankCollection.id}/nfts`}
            >
              <Image
                src={data?.nft.moonrankCollection.image}
                className="aspect-square w-10 rounded-md object-cover"
                alt="collection image"
              />
              <h2 className="text-2xl transition group-hover:opacity-80">
                {data?.nft.moonrankCollection.name}
              </h2>
            </Link>
          )
        )}
        <Overview.Title>{nft.name}</Overview.Title>
        {buy && (
          <div className="fixed bottom-0 left-0 right-0 z-30 mb-0 rounded-t-md bg-gray-800 md:relative md:z-0 md:mb-10 md:rounded-md">
            <Overview.Form.Title>{t('buy')}</Overview.Form.Title>
            <Flex direction={FlexDirection.Col} className="mt-4 px-6 pt-8 pb-6 md:pt-0">
              <div>
                <Flex
                  align={FlexAlign.Center}
                  justify={FlexJustify.Between}
                  className="rounded-md bg-primary-600 p-4"
                >
                  <img
                    src="/images/nightmarket-beta.svg"
                    className="h-5 w-auto object-fill"
                    alt="night market logo"
                  />
                  <Paragraph color={TextColor.Orange}>SAUCE</Paragraph>
                </Flex>
              </div>
              <Overview.Form.Points>
                {data?.nft.moonrankCollection?.trends && (
                  <Overview.Form.Point label={t('buyable.floorPrice', { ns: 'common' })}>
                    <Icon.Sol /> {data?.nft.moonrankCollection?.trends?.compactFloor1d}
                  </Overview.Form.Point>
                )}
                {listing && (
                  <Overview.Form.Point label={t('buyable.listPrice', { ns: 'common' })}>
                    <Icon.Sol /> {listing.solPrice}
                  </Overview.Form.Point>
                )}
                <Overview.Form.Point label={t('buyable.marketplaceFee', { ns: 'common' })}>
                  {auctionHouse.fee}%
                </Overview.Form.Point>
                <Overview.Form.Point label={t('buyable.currentBalance', { ns: 'common' })}>
                  <Icon.Sol /> {viewer?.solBalance}
                </Overview.Form.Point>
              </Overview.Form.Points>
              <Flex direction={FlexDirection.Col} gap={4}>
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
              </Flex>
            </Flex>
          </div>
        )}
        {makeOffer && (
          <Overview.Form
            onSubmit={handleSubmitOffer(handleOffer)}
            title={<Overview.Form.Title>{t('placeBid')}</Overview.Form.Title>}
          >
            <Overview.Form.Preview
              name={nft.name}
              image={nft.image}
              collection={data?.nft.moonrankCollection?.name}
            />
            <Overview.Form.Points>
              {data?.nft.moonrankCollection?.trends && (
                <Overview.Form.Point label={t('currentFloor')}>
                  <Icon.Sol /> {data?.nft.moonrankCollection.trends?.compactFloor1d}
                </Overview.Form.Point>
              )}
              {viewer && (
                <Overview.Form.Point label={t('walletBalance')}>
                  <Icon.Sol />
                  {viewer.solBalance}
                </Overview.Form.Point>
              )}
            </Overview.Form.Points>
            <Form.Label name={t('amount')}>
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
              {t('submitOffer')}
            </Button>
            <Button
              background={ButtonBackground.Slate}
              border={ButtonBorder.Gray}
              color={ButtonColor.Gray}
              block
              disabled={offerFormState.isSubmitting}
              onClick={onCancelMakeOffer}
            >
              {t('cancel', { ns: 'common' })}
            </Button>
          </Overview.Form>
        )}
        {updateOffer && (
          <Overview.Form
            onSubmit={handleSubmitUpdateOffer(handleUpdateOffer)}
            title={<Overview.Form.Title>{t('updateBid')}</Overview.Form.Title>}
          >
            <Overview.Form.Preview
              name={nft.name}
              image={nft.image}
              collection={data?.nft.moonrankCollection?.name}
            />
            <Overview.Form.Points>
              {data?.nft.moonrankCollection && (
                <Overview.Form.Point label={t('currentFloor')}>
                  <Icon.Sol /> {data?.nft.moonrankCollection.trends?.compactFloor1d}
                </Overview.Form.Point>
              )}
              {viewer && (
                <Overview.Form.Point label={t('walletBalance')}>
                  <Icon.Sol />
                  {viewer.solBalance}
                </Overview.Form.Point>
              )}
            </Overview.Form.Points>
            <Form.Label name={t('amount')}>
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
              {t('update')}
            </Button>
            <Button
              background={ButtonBackground.Slate}
              border={ButtonBorder.Gray}
              color={ButtonColor.Gray}
              block
              onClick={onCancelUpdateOffer}
              disabled={updateOfferFormState.isSubmitting}
            >
              {t('cancel', { ns: 'common' })}
            </Button>
          </Overview.Form>
        )}
        {listNft && (
          <Overview.Form
            onSubmit={handleSubmitListNft(handleList)}
            title={<Overview.Form.Title>{t('listNft')}</Overview.Form.Title>}
          >
            <Overview.Form.Preview
              name={nft.name}
              image={nft.image}
              collection={data?.nft.moonrankCollection?.name}
            />
            <Overview.Form.Points>
              {data?.nft.moonrankCollection?.trends && (
                <Overview.Form.Point label={t('currentFloor')}>
                  <Icon.Sol /> {data?.nft.moonrankCollection.trends?.compactFloor1d}
                </Overview.Form.Point>
              )}
            </Overview.Form.Points>
            <Form.Label name={t('amount')}>
              <Form.Input
                icon={<Icon.Sol />}
                autoFocus
                error={offerFormState.errors.amount}
                {...registerListNft('amount', { required: true })}
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
              {t('listNft')}
            </Button>
            <Button
              block
              background={ButtonBackground.Slate}
              border={ButtonBorder.Gray}
              color={ButtonColor.Gray}
              onClick={onCancelListNftClick}
              disabled={listNftState.isSubmitting}
            >
              {t('cancel', { ns: 'common' })}
            </Button>
          </Overview.Form>
        )}
        {updateListing && (
          <Overview.Form
            onSubmit={handleSubmitUpdateListing(handleUpdateListing)}
            title={<Overview.Form.Title>{t('updateListing')}</Overview.Form.Title>}
          >
            <Overview.Form.Preview
              name={nft.name}
              image={nft.image}
              collection={data?.nft.moonrankCollection?.name}
            />
            <Overview.Form.Points>
              {data?.nft.moonrankCollection?.trends && (
                <Overview.Form.Point label={t('currentFloor')}>
                  <Icon.Sol /> {data?.nft.moonrankCollection.trends?.compactFloor1d}
                </Overview.Form.Point>
              )}
            </Overview.Form.Points>
            <Form.Label name={t('newPrice')}>
              <Form.Input
                icon={<Icon.Sol />}
                error={updateListingState.errors.amount}
                autoFocus
                {...registerUpdateListing('amount', { required: true })}
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
              {t('update')}
            </Button>
            <Button
              block
              background={ButtonBackground.Slate}
              border={ButtonBorder.Gray}
              color={ButtonColor.Gray}
              disabled={updateListingState.isSubmitting}
              onClick={onCancelUpdateListing}
            >
              {t('cancel', { ns: 'common' })}
            </Button>
          </Overview.Form>
        )}
        {loading ? (
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
                    justify={FlexJustify.Between}
                    className="border-b-[1px] border-b-gray-900 py-4 px-6"
                  >
                    <img
                      src="/images/nightmarket-beta.svg"
                      className="h-5 w-auto object-fill"
                      alt="night market logo"
                    />
                    <Flex gap={1}>
                      <Paragraph weight={FontWeight.Semibold}>
                        {t(isOwner ? 'sellEarn' : 'buyEarn')}
                      </Paragraph>
                      <Paragraph color={TextColor.Orange}>SAUCE</Paragraph>
                    </Flex>
                  </Flex>
                )}
                <Flex block direction={FlexDirection.Col} gap={6} className="p-6">
                  <Row block align={FlexAlign.Center}>
                    <Overview.Figures>
                      {listing && (
                        <Overview.Figure
                          label={t('listed')}
                          amount={listing?.solPrice}
                          size={Overview.Figure.Size.Large}
                        />
                      )}
                      {data?.nft.lastSale?.price ? (
                        <Overview.Figure
                          className="md:flex-row"
                          label={t('lastSale')}
                          amount={data?.nft.lastSale?.solPrice}
                        />
                      ) : (
                        <Paragraph weight={FontWeight.Semibold} color={TextColor.Gray}>
                          {t('noSales')}
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
                  {highestOffer || viewerOffer ? (
                    <>
                      {highestOffer && (
                        <Overview.Figure
                          label={t('highestOffer')}
                          amount={highestOffer.solPrice}
                          size={Overview.Figure.Size.Large}
                        />
                      )}
                      {viewerOffer && (
                        <Overview.Figure
                          label={t('viewerOffer')}
                          className="md:flex-row"
                          amount={viewerOffer.solPrice}
                        />
                      )}
                    </>
                  ) : (
                    <Paragraph weight={FontWeight.Semibold}>{t('noOffers')}</Paragraph>
                  )}
                </Overview.Figures>
                <Col span={6} direction={FlexDirection.Col} gap={4}>
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
                    <Button
                      block
                      loading={closingOffer}
                      border={ButtonBorder.Gray}
                      color={ButtonColor.Gray}
                      onClick={handleCloseOffer}
                    >
                      {t('cancelOffer')}
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
          <ButtonGroup value={router.pathname as NftPage} onChange={() => {}}>
            <Link href={`/nfts/${nft.mintAddress}/details`} scroll={false}>
              <ButtonGroup.Option value={NftPage.Details}>{t('details')}</ButtonGroup.Option>
            </Link>
            <Link href={`/nfts/${nft.mintAddress}/offers`} scroll={false}>
              <ButtonGroup.Option value={NftPage.Offers}>{t('offers')}</ButtonGroup.Option>
            </Link>
            <Link href={`/nfts/${nft.mintAddress}/activity`} scroll={false}>
              <ButtonGroup.Option value={NftPage.Activity}>{t('activity')}</ButtonGroup.Option>
            </Link>
          </ButtonGroup>
        </Overview.Tabs>
        {children}
      </Overview.Content>
    </Overview>
  );
}

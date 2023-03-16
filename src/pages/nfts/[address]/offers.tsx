import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  AuctionHouse,
  Nft,
  Maybe,
  Offer as OfferType,
  AhListing,
  CollectionTrend,
} from '../../../graphql.types';
import client from './../../../client';
import { NftQuery } from './../../../queries/nft.graphql';
import { NftOffersQuery } from './../../../queries/offers.graphql';
import { GetServerSidePropsContext } from 'next';
import config from '../../../app.config';
import { useWallet } from '@solana/wallet-adapter-react';
import NftLayout from '../../../layouts/NftLayout';
import { ReactNode, useMemo } from 'react';
import { NftMarketInfoQuery } from './../../../queries/nft.graphql';
import { useQuery } from '@apollo/client';
import { Activity } from '../../../components/Activity';
import Offer from './../../../components/Offer';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'offers', 'nft']);

  const {
    data: { nft, auctionHouse },
  } = await client.query({
    query: NftQuery,
    fetchPolicy: 'network-only',
    variables: {
      address: params?.address,
      auctionHouse: config.auctionHouse,
    },
  });

  if (nft === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      nft,
      auctionHouse,
      ...i18n,
    },
  };
}

interface NFTOffersVariables {
  address: string;
}

interface NFTOffersData {
  nftOffers: Maybe<Nft> | undefined;
}

interface NftOfferPageProps {
  nft: Nft;
  auctionHouse: AuctionHouse;
}

export default function NftOffers({ nft, auctionHouse }: NftOfferPageProps) {
  const { t } = useTranslation('offers');
  const { publicKey } = useWallet();

  const { data, called, loading } = useQuery<NFTOffersData, NFTOffersVariables>(NftOffersQuery, {
    variables: {
      address: nft.mintAddress,
    },
  });

  const yourOffers = useMemo(
    () => data?.nftOffers?.offers?.filter((offer) => offer.buyer === publicKey?.toBase58()),
    [data?.nftOffers, publicKey]
  );

  const remainingOffers = useMemo(
    () => data?.nftOffers?.offers?.filter((offer) => offer.buyer !== publicKey?.toBase58()),
    [data?.nftOffers, publicKey]
  );

  if (loading) {
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
      {called && data?.nftOffers?.offers?.length === 0 && (
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
                    marketplace={offer.nftMarketplace}
                    source={<Activity.Wallet wallet={offer.buyerWallet} />}
                  />
                }
                offer={offer}
                key={offer.id}
                auctionHouse={auctionHouse}
                nft={data?.nftOffers}
                onAccept={() => {}}
                onCancel={() => {
                  client.cache.evict({
                    id: client.cache.identify(offer),
                  });
                }}
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
                    marketplace={offer.nftMarketplace}
                    source={<Activity.Wallet wallet={offer.buyerWallet} />}
                  />
                }
                offer={offer}
                key={offer.id}
                auctionHouse={auctionHouse}
                nft={data?.nftOffers}
                onAccept={({ buyerReceiptTokenAccount }) => {
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
                      const offers = data.nft.offers.filter((o: OfferType) => o.id !== offer.id);

                      const nft = {
                        ...data.nft,
                        offers,
                        lastSale: {
                          __typename: 'LastSale',
                          price: offer.price.toString(),
                        },
                        owner: {
                          __typename: 'NftOwner',
                          address: offer.buyer,
                          associatedTokenAccountAddress: buyerReceiptTokenAccount.toBase58(),
                          profile: null,
                        },
                      };

                      return {
                        nft,
                      };
                    }
                  );

                  client.cache.modify({
                    id: client.cache.identify({
                      __typename: 'Wallet',
                      address: nft.owner?.address as string,
                    }),
                    fields: {
                      collectedCollections(collectedCollections, { readField }) {
                        return collectedCollections.reduce((memo: any[], cc: any) => {
                          const id = readField('id', cc.collection);
                          if (id === data?.nftOffers?.moonrankCollection?.id) {
                            const trends: Readonly<CollectionTrend> | undefined = readField(
                              'trends',
                              cc.collection
                            );

                            const estimatedValue = (
                              parseFloat(cc.estimatedValue) - parseInt(trends?.floor1d)
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
                }}
                onCancel={() => {}}
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
  auctionHouse: AuctionHouse;
}

NftOffers.getLayout = function NftDetailsLayout({
  children,
  nft,
  auctionHouse,
}: NftDetailsLayoutProps): JSX.Element {
  return (
    <NftLayout nft={nft} auctionHouse={auctionHouse}>
      {children}
    </NftLayout>
  );
};

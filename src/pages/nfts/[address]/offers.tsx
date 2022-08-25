import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Marketplace, Nft, Offer } from '../../../graphql.types';
import client from './../../../client';
import NftQuery from './../../../queries/nft.graphql';
import NftOffersQuery from './../../../queries/offers.graphql';
import { GetServerSidePropsContext } from 'next';
import config from '../../../app.config';
import { useWallet } from '@solana/wallet-adapter-react';
import NftLayout from '../../../layouts/NftLayout';
import { ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import Avatar from '../../../components/Avatar';
import ActivityCard from '../../../components/ActivityCard';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'offers', 'nft']);

  const {
    data: { nft, marketplace },
  } = await client.query({
    query: NftQuery,
    variables: {
      address: params?.address,
      subdomain: config.marketplaceSubdomain,
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
      marketplace,
      ...i18n,
    },
  };
}

interface NFTOffersVariables {
  address: string;
}

interface NFTOffersData {
  nftOffers: Partial<Nft>;
}

interface NftOfferPageProps {
  nft: Nft;
  marketplace: Marketplace;
}

export default function NftOffers({ nft, marketplace }: NftOfferPageProps) {
  marketplace;
  const { t } = useTranslation('offers');

  const { publicKey } = useWallet();

  const isOwner = nft?.owner?.address === publicKey?.toBase58();

  const { data, refetch } = useQuery<NFTOffersData, NFTOffersVariables>(NftOffersQuery, {
    variables: {
      address: nft.mintAddress,
    },
  });

  const yourOffers = data?.nftOffers?.offers?.filter(
    (offer) => offer.buyer === publicKey?.toBase58()
  );

  return (
    <>
      {data?.nftOffers?.offers?.length === 0 && (
        <div className="flex w-full justify-center rounded-lg border border-gray-800 p-4">
          <h3 className="text-gray-300">{t('noOffers')}</h3>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {yourOffers && (
          <>
            <h6 className="m-0 mt-2 text-2xl font-medium  text-white">{t('yours')}</h6>
            {yourOffers.map((yourOffer, i) => (
              <ActivityCard
                key={`your-offer-${yourOffer.id}-${i}`}
                userAddress={yourOffer.buyer}
                isOwner={isOwner}
                description={
                  <ActivityCard.OfferDescription
                    price={yourOffer.price / LAMPORTS_PER_SOL}
                    userAddress={yourOffer.buyer}
                    marketplaceAddress={''}
                    variant={'buyer'}
                  />
                }
                action={
                  <ActivityCard.OfferAction
                    price={yourOffer.price / LAMPORTS_PER_SOL}
                    createdDate={yourOffer.createdAt}
                    variant={'buyer'}
                    onPrimaryAction={() => console.log('Update offer')}
                    onSecondaryAction={() => console.log('Cancel offer')}
                  />
                }
              />
            ))}
          </>
        )}
        {yourOffers && yourOffers?.length > 0 && (
          <h6 className="m-0 mt-2 text-2xl font-medium text-white">{t('all')}</h6>
        )}

        {data?.nftOffers?.offers?.map((offer, i) => (
          <ActivityCard
            hidden={offer.buyer === publicKey?.toBase58()}
            key={`offer-${offer.id}-${i}`}
            userAddress={offer.buyer}
            isOwner={isOwner}
            description={
              <ActivityCard.OfferDescription
                price={offer.price / LAMPORTS_PER_SOL}
                userAddress={offer.buyer}
                marketplaceAddress={''}
                variant={isOwner ? 'owner' : 'viewer'}
              />
            }
            action={
              <ActivityCard.OfferAction
                price={offer.price / LAMPORTS_PER_SOL}
                createdDate={offer.createdAt}
                variant={isOwner ? 'owner' : 'viewer'}
                isActionable={!offer.auctionHouse?.requiresSignOff}
                onPrimaryAction={
                  isOwner ? () => console.log('Accept offer or view') : () => console.log('None')
                }
              />
            }
          />
        ))}
      </div>
    </>
  );
}

interface NftDetailsLayoutProps {
  children: ReactNode;
  nft: Nft;
}

NftOffers.getLayout = function NftDetailsLayout({
  children,
  nft,
}: NftDetailsLayoutProps): JSX.Element {
  return <NftLayout nft={nft}>{children}</NftLayout>;
};

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Marketplace, Nft } from '../../../graphql.types';
import client from './../../../client';
import { NftQuery } from './../../../queries/nft.graphql';
import { NftOffersQuery } from './../../../queries/offers.graphql';
import { GetServerSidePropsContext } from 'next';
import config from '../../../app.config';
import { useWallet } from '@solana/wallet-adapter-react';
import NftLayout from '../../../layouts/NftLayout';
import { ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import { Offer } from '../../../components/Offer';

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

export default function NftOffers({ nft }: NftOfferPageProps) {
  const { t } = useTranslation('offers');
  const { publicKey } = useWallet();

  const isOwner = nft?.owner?.address === publicKey?.toBase58();

  const { data, called, loading } = useQuery<NFTOffersData, NFTOffersVariables>(NftOffersQuery, {
    variables: {
      address: nft.mintAddress,
    },
  });

  const yourOffers = data?.nftOffers?.offers?.filter(
    (offer) => offer.buyer === publicKey?.toBase58()
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Offer.Card.Skeleton />
        <Offer.Card.Skeleton />
        <Offer.Card.Skeleton />
        <Offer.Card.Skeleton />
      </div>
    );
  }

  return (
    <>
      {called && data?.nftOffers?.offers?.length === 0 && (
        <div className="flex w-full justify-center rounded-md border border-gray-800 p-4">
          <h3 className="text-gray-300">{t('noOffers')}</h3>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {yourOffers && yourOffers.length > 0 && (
          <>
            <h6 className="m-0 mt-2 text-2xl font-medium  text-white">{t('yours')}</h6>
            {yourOffers.map((yourOffer, i) => (
              <Offer.Card
                key={`your-offer-${yourOffer.id}-${i}`}
                userAddress={yourOffer.buyer}
                isOwner={isOwner}
                description={
                  <Offer.Card.Description
                    price={yourOffer.solPrice}
                    userAddress={yourOffer.buyer}
                    nftMarketplace={yourOffer.nftMarketplace}
                    variant="buyer"
                  />
                }
                action={
                  <Offer.Action
                    price={yourOffer.solPrice}
                    timeSince={yourOffer.timeSince}
                    variant="buyer"
                    onPrimaryAction={() => console.log('Update offer')}
                    onSecondaryAction={() => console.log('Cancel offer')}
                  />
                }
              />
            ))}
          </>
        )}
        {yourOffers && yourOffers.length > 0 && (
          <h6 className="m-0 mt-2 text-2xl font-medium text-white">{t('all')}</h6>
        )}
        {data?.nftOffers?.offers?.map((offer, i) => (
          <Offer.Card
            hidden={offer.buyer === publicKey?.toBase58()}
            key={`offer-${offer.id}-${i}`}
            userAddress={offer.buyer}
            isOwner={isOwner}
            description={
              <Offer.Card.Description
                price={offer.solPrice}
                userAddress={offer.buyer}
                nftMarketplace={offer.nftMarketplace}
                variant={isOwner ? 'owner' : 'viewer'}
              />
            }
            action={
              <Offer.Action
                price={offer.solPrice}
                timeSince={offer.timeSince || '--'}
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

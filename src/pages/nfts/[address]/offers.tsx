import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AuctionHouse, Nft } from '../../../graphql.types';
import client from './../../../client';
import { NftQuery } from './../../../queries/nft.graphql';
import { NftOffersQuery } from './../../../queries/offers.graphql';
import { GetServerSidePropsContext } from 'next';
import config from '../../../app.config';
import { useWallet } from '@solana/wallet-adapter-react';
import NftLayout from '../../../layouts/NftLayout';
import { ReactNode, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Activity } from '../../../components/Activity';
import Offer from './../../../components/Offer';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'offers', 'nft']);

  const {
    data: { nft, auctionHouse },
  } = await client.query({
    query: NftQuery,
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
  nftOffers: Partial<Nft>;
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
            {yourOffers.map((offer, i) => (
              <Offer offer={offer} key={offer.id} auctionHouse={auctionHouse} />
            ))}
          </>
        )}
        {remainingOffers && remainingOffers.length > 0 && (
          <h6 className="m-0 mt-2 text-2xl font-medium text-white">{t('all')}</h6>
        )}
        {remainingOffers?.map((offer, i) => (
          <Offer offer={offer} key={offer.id} auctionHouse={auctionHouse} />
        ))}
      </div>
    </>
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

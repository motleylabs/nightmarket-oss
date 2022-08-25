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

  return (
    <>
      {data?.nftOffers?.offers?.length === 0 && (
        <div className="flex w-full justify-center rounded-lg border border-gray-800 p-4">
          <h3 className="text-gray-300">{t('noOffers')}</h3>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {data?.nftOffers?.offers?.map((offer, i) => (
          <div
            key={`offer-${offer.id}-${i}`}
            className="flex gap-2 rounded-lg border border-gray-800 p-4"
          >
            <Avatar address={offer.buyer} />
            <div></div>
          </div>
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

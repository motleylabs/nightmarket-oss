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
import { Activity, ActivityType } from '../../../components/Activity';
import Link from 'next/link';
import { Avatar, AvatarSize } from '../../../components/Avatar';
import Button, { ButtonSize, ButtonType } from '../../../components/Button';

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
            {yourOffers.map((yourOffer, i) => (
              <Activity
                avatar={
                  <Link href={`/nfts/${yourOffer.nft?.mintAddress}/details`} passHref>
                    <a className="cursor-pointer transition hover:scale-[1.02]">
                      <Avatar src={yourOffer.nft?.image as string} size={AvatarSize.Standard} />
                    </a>
                  </Link>
                }
                type={ActivityType.Offer}
                key={yourOffer.id}
                meta={
                  <Activity.Meta
                    title={<Activity.Tag />}
                    marketplace={yourOffer.nftMarketplace}
                    source={<Activity.Wallet wallet={yourOffer.buyerWallet} />}
                  />
                }
                actionButton={
                  !publicKey ? null : yourOffer.buyer === publicKey ? (
                    <Button type={ButtonType.Secondary} size={ButtonSize.Small} onClick={() => {}}>
                      {t('accept')}
                    </Button>
                  ) : (
                    <Button type={ButtonType.Secondary} size={ButtonSize.Small} onClick={() => {}}>
                      {t('update')}
                    </Button>
                  )
                }
              >
                <Activity.Price amount={yourOffer.solPrice} />
                <Activity.Timestamp timeSince={yourOffer.timeSince} />
              </Activity>
            ))}
          </>
        )}
        {yourOffers && yourOffers.length > 0 && (
          <h6 className="m-0 mt-2 text-2xl font-medium text-white">{t('all')}</h6>
        )}
        {data?.nftOffers?.offers?.map((offer, i) => (
          <Activity
            avatar={
              <Link href={`/nfts/${offer.nft?.mintAddress}/details`} passHref>
                <a className="cursor-pointer transition hover:scale-[1.02]">
                  <Avatar src={offer.nft?.image as string} size={AvatarSize.Standard} />
                </a>
              </Link>
            }
            type={ActivityType.Offer}
            key={offer.id}
            meta={
              <Activity.Meta
                title={<Activity.Tag />}
                marketplace={offer.nftMarketplace}
                source={<Activity.Wallet wallet={offer.buyerWallet} />}
              />
            }
            actionButton={
              !publicKey ? null : offer.buyer === publicKey ? (
                <Button type={ButtonType.Secondary} size={ButtonSize.Small} onClick={() => {}}>
                  {t('profile:accept')}
                </Button>
              ) : (
                <Button type={ButtonType.Secondary} size={ButtonSize.Small} onClick={() => {}}>
                  {t('profile:update')}
                </Button>
              )
            }
          >
            <Activity.Price amount={offer.solPrice} />
            <Activity.Timestamp timeSince={offer.timeSince} />
          </Activity>
        ))}
      </div>
    </>
  );
}

interface NftDetailsLayoutProps {
  children: ReactNode;
  nft: Nft;
  marketplace: Marketplace;
}

NftOffers.getLayout = function NftDetailsLayout({
  children,
  nft,
  marketplace,
}: NftDetailsLayoutProps): JSX.Element {
  return (
    <NftLayout nft={nft} marketplace={marketplace}>
      {children}
    </NftLayout>
  );
};

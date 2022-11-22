import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import client from '../../../client';
import { NftQuery, NftActivitiesQuery } from './../../../queries/nft.graphql';
import { AuctionHouse, Nft } from '../../../graphql.types';
import { ReactNode } from 'react';
import NftLayout from '../../../layouts/NftLayout';
import config from '../../../app.config';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Activity, ActivityType } from '../../../components/Activity';
import Link from 'next/link';
import { Avatar, AvatarSize } from '../../../components/Avatar';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'nft']);

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

interface NftActivitiesData {
  nft: Nft;
}

interface NftActivitiesVariables {
  address: string;
}

export default function NftActivity() {
  const router = useRouter();

  const activitiesQuery = useQuery<NftActivitiesData, NftActivitiesVariables>(NftActivitiesQuery, {
    variables: {
      address: router.query.address as string,
    },
  });

  return (
    <div className="mt-4 flex flex-col">
      {activitiesQuery.loading ? (
        <>
          <Activity.Skeleton />
          <Activity.Skeleton />
          <Activity.Skeleton />
          <Activity.Skeleton />
        </>
      ) : (
        <>
          {activitiesQuery.data?.nft.activities.map((activity) => (
            <Activity
              avatar={
                <Link href={`/profiles/${activity.primaryWallet.address}/collected`}>
                  <a className="cursor-pointer transition hover:scale-[1.02]">
                    <Avatar
                      circle
                      src={activity.primaryWallet.previewImage as string}
                      size={AvatarSize.Standard}
                    />
                  </a>
                </Link>
              }
              type={activity.activityType as ActivityType}
              key={activity.id}
              meta={
                <Activity.Meta title={<Activity.Tag />} marketplace={activity.nftMarketplace} />
              }
            >
              <Activity.Price amount={activity.solPrice} />
              <Activity.Timestamp timeSince={activity.timeSince} />
            </Activity>
          ))}
        </>
      )}
    </div>
  );
}

interface NftDetailsLayoutProps {
  children: ReactNode;
  nft: Nft;
  auctionHouse: AuctionHouse;
}

NftActivity.getLayout = function NftDetailsLayout({
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

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

  if (activitiesQuery.loading) {
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
      {activitiesQuery.called && activitiesQuery.data?.nft.activities?.length === 0 && (
        <div className="flex w-full justify-center rounded-md border border-gray-800 p-4">
          <h3 className="text-gray-300">No activty</h3>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {activitiesQuery.data?.nft?.activities?.length !== 0 && (
          <>
            <h6 className="m-0 mt-2 text-2xl font-medium text-white">{'All activty'}</h6>
            {activitiesQuery.data?.nft.activities.map((activity) => (
              <Activity
                avatar={
                  <Link
                    className="cursor-pointer transition hover:scale-[1.02]"
                    href={`/profiles/${activity.primaryWallet.address}/collected`}
                  >
                    <Avatar
                      circle
                      src={activity.primaryWallet.previewImage as string}
                      size={AvatarSize.Standard}
                    />
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

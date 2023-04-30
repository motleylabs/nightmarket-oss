import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { InView } from 'react-intersection-observer';

import type { ActivityType } from '../../../components/Activity';
import { Activity } from '../../../components/Activity';
import { useActivities } from '../../../hooks/nft/useActivities';
import { createApiTransport } from '../../../infrastructure/api';
import NftLayout from '../../../layouts/NftLayout';
import type { Nft } from '../../../typings';

export async function getServerSideProps({ locale, params, req }: GetServerSidePropsContext) {
  try {
    const i18n = await serverSideTranslations(locale as string, ['common', 'nft']);

    const api = createApiTransport(req);

    const { data } = await api.get<Nft>(`/nfts/${params?.address}`);

    if (data == null) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        nft: data,
        ...i18n,
      },
    };
  } catch (err) {
    throw err;
  }
}

export default function NftActivity() {
  const { t } = useTranslation('common');

  const { data, isValidating, handleShowMoreActivities } = useActivities();

  const isLoading = !data && isValidating;

  const hasNextPage = Boolean(data?.every((d) => d.hasNextPage));
  const activities = useMemo(() => data?.flatMap((d) => d.activities) ?? [], [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Activity.Skeleton />
        <Activity.Skeleton />
        <Activity.Skeleton />s
        <Activity.Skeleton />
      </div>
    );
  }

  if (activities?.length === 0) {
    return (
      <div className="flex flex-col">
        <div className="flex w-full justify-center rounded-md border border-gray-800 p-4">
          <h3 className="text-gray-300">No activity</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4">
        <h6 className="m-0 mt-2 text-2xl font-medium text-white">{t('allActivity')}</h6>
        {activities.map((activity, i) => (
          <Activity
            type={activity.activityType as ActivityType}
            key={i}
            meta={
              <Activity.Meta
                title={<Activity.Tag />}
                marketplaceAddress={activity.martketplaceProgramAddress}
                auctionHouseAddress={activity.auctionHouseAddress}
              />
            }
            source={<Activity.Wallet seller={activity.seller} buyer={activity.buyer} />}
          >
            <Activity.Price amount={Number(activity.price)} />
            <Activity.Timestamp
              signature={activity.signature}
              timeSince={activity.blockTimestamp}
            />
          </Activity>
        ))}
        {hasNextPage && (
          <>
            <InView
              rootMargin="200px 0px"
              onChange={async (inView) => {
                if (!inView) {
                  return;
                }

                handleShowMoreActivities();
              }}
            >
              <Activity.Skeleton />
            </InView>
            <Activity.Skeleton />
            <Activity.Skeleton />
          </>
        )}
      </div>
    </div>
  );
}

interface NftDetailsLayoutProps {
  children: ReactNode;
  nft: Nft;
}

NftActivity.getLayout = function NftDetailsLayout({
  children,
  nft,
}: NftDetailsLayoutProps): JSX.Element {
  return <NftLayout nft={nft}>{children}</NftLayout>;
};

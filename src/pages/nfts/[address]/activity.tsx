import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';
import { useMemo, useEffect } from 'react';

import type { ActivityType } from '../../../components/Activity';
import { Activity } from '../../../components/Activity';
import { useActivities } from '../../../hooks/nft/useActivities';
import { useAction } from '../../../hooks/useAction';
import { api } from '../../../infrastructure/api';
import NftLayout from '../../../layouts/NftLayout';
import type { ActivityEvent, Nft } from '../../../typings';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  try {
    const i18n = await serverSideTranslations(locale as string, ['common', 'nft']);

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

interface NftActivityPageProps {
  nft: Nft;
}

export default function NftActivity({ nft }: NftActivityPageProps) {
  const { t } = useTranslation('common');

  const { data, isValidating, mutate } = useActivities();

  const isLoading = !data && isValidating;

  const activities = useMemo(() => data?.activities ?? [], [data?.activities]);

  const { on, off } = useAction();

  const addActivity = (event: Event) => {
    const newActivityEvent: ActivityEvent = (event as CustomEvent).detail;

    if (newActivityEvent.mint === nft.mintAddress) {
      if (!isLoading && !isValidating && !!data) {
        mutate(
          {
            activities: [newActivityEvent.activity, ...activities],
            hasNextPage: false,
          },
          { revalidate: false }
        );
      }
    }
  };

  useEffect(() => {
    on('activity', addActivity);

    return () => {
      off('activity', addActivity);
    };
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Activity.Skeleton />
        <Activity.Skeleton />
        <Activity.Skeleton />
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

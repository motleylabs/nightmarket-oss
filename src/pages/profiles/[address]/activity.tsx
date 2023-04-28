import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { InView } from 'react-intersection-observer';
import useSWRInfinite from 'swr/infinite';

import type { ActivityType } from '../../../components/Activity';
import { Activity } from '../../../components/Activity';
import { Avatar, AvatarSize } from '../../../components/Avatar';
import Select from '../../../components/Select';
import { Toolbar } from '../../../components/Toolbar';
import { createApiTransport } from '../../../infrastructure/api';
import ProfileLayout from '../../../layouts/ProfileLayout';
import type { UserActivitiesData, UserNfts } from '../../../typings';
import { getActivityTypes } from '../../../utils/activity';

export async function getServerSideProps({ locale, params, req }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'profile']);

  const api = createApiTransport(req);

  const { data } = await api.get<UserNfts>(`/users/nfts?address=${params?.address}`);

  if (data == null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...data,
      ...i18n,
    },
  };
}

const PAGE_LIMIT = 24;

enum ActivityFilter {
  Listings = 'listing',
  Offers = 'bid',
  Transaction = 'transaction',
}

export default function ProfileActivity(): JSX.Element {
  const { t } = useTranslation(['profile', 'common']);

  const activityFilterOptions = [
    { label: t('listings', { ns: 'profile' }), value: ActivityFilter.Listings },
    { label: t('offers', { ns: 'profile' }), value: ActivityFilter.Offers },
    { label: t('sales', { ns: 'profile' }), value: ActivityFilter.Transaction },
  ];

  const { watch, control } = useForm<{ type: `${ActivityFilter}` }>({
    defaultValues: { type: activityFilterOptions[0].value },
  });

  const { query } = useRouter();

  const selectedType = watch('type');

  const getKey = (pageIndex: number, previousPageData: UserActivitiesData) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;

    const typeQueryParam = encodeURIComponent(JSON.stringify(getActivityTypes(selectedType)));

    return `/users/activities?address=${query.address
      }&activity_types=${typeQueryParam}&limit=${PAGE_LIMIT}&offset=${pageIndex * PAGE_LIMIT}`;
  };

  const { data, size, setSize, isValidating } = useSWRInfinite<UserActivitiesData>(getKey, {
    revalidateOnFocus: false,
  });

  const onShowMoreActivities = () => {
    setSize(size + 1);
  };

  const isLoading = !data && isValidating;
  const hasNextPage = Boolean(data?.every((d) => d.hasNextPage));
  const activities = useMemo(() => data?.flatMap((d) => d.activities) ?? [], [data]);

  return (
    <>
      <Toolbar>
        <div className="block" />
        <div className="flex justify-end">
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Select
                value={value}
                onChange={onChange}
                options={activityFilterOptions}
                className="w-36"
              />
            )}
          />
        </div>
      </Toolbar>
      <div className="mt-4 flex flex-col gap-4 px-4 pt-4 md:px-8">
        {isLoading ? (
          <>
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
          </>
        ) : (
          <>
            {activities.map((activity) => (
              <Activity
                avatar={
                  <Link
                    className="cursor-pointer transition hover:scale-[1.02]"
                    href={`/nfts/${activity.mint}`}
                  >
                    <Avatar src={activity.image} size={AvatarSize.Standard} />
                  </Link>
                }
                type={activity.activityType as ActivityType}
                key={activity.mint}
                meta={
                  <Activity.Meta
                    title={<Activity.Tag />}
                    marketplaceAddress={activity.martketplaceProgramAddress}
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

                    onShowMoreActivities();
                  }}
                >
                  <Activity.Skeleton />
                </InView>
                <Activity.Skeleton />
                <Activity.Skeleton />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

interface ProfileActivityLayoutProps {
  children: ReactElement;
  nfts: UserNfts['nfts'];
  collections: UserNfts['collections'];
}

ProfileActivity.getLayout = function ProfileActivityLayout({
  children,
  ...restProps
}: ProfileActivityLayoutProps): JSX.Element {
  return <ProfileLayout {...restProps}>{children}</ProfileLayout>;
};

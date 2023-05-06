import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import InfiniteScroll from 'react-infinite-scroll-component';
import useSWRInfinite from 'swr/infinite';

import type { ActivityType } from '../../../components/Activity';
import { Activity } from '../../../components/Activity';
import { Avatar, AvatarSize } from '../../../components/Avatar';
import Select from '../../../components/Select';
import { Toolbar } from '../../../components/Toolbar';
import { api } from '../../../infrastructure/api';
import CollectionLayout from '../../../layouts/CollectionLayout';
import type { Collection, CollectionActivitiesData } from '../../../typings';
import { getActivityTypes } from '../../../utils/activity';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, [
    'common',
    'collection',
    'analytics',
  ]);

  const { data } = await api.get<Collection>(`/collections/${params?.slug}`);

  if (data === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      collection: data,
      ...i18n,
    },
  };
}

enum ActivityFilter {
  Listings = 'listing',
  Offers = 'bid',
  Transaction = 'transaction',
}

const PAGE_LIMIT = 24;

export default function CollectionActivity(): JSX.Element {
  const { t } = useTranslation(['collection', 'common']);
  const activityFilterOptions = [
    { label: t('listings', { ns: 'collection' }), value: ActivityFilter.Listings },
    { label: t('offers', { ns: 'collection' }), value: ActivityFilter.Offers },
    { label: t('sales', { ns: 'collection' }), value: ActivityFilter.Transaction },
  ];
  const { watch, control } = useForm<{ type: `${ActivityFilter}` }>({
    defaultValues: { type: activityFilterOptions[2].value },
  });
  const { query } = useRouter();

  const selectedType = watch('type');

  const getKey = (pageIndex: number, previousPageData: CollectionActivitiesData) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;

    const typeQueryParam = encodeURIComponent(JSON.stringify(getActivityTypes(selectedType)));

    return `/collections/activities?address=${
      query.slug
    }&activity_types=${typeQueryParam}&limit=${PAGE_LIMIT}&offset=${pageIndex * PAGE_LIMIT}`;
  };

  const { data, setSize, isValidating } = useSWRInfinite<CollectionActivitiesData>(getKey, {
    revalidateOnFocus: false,
  });

  const onShowMoreActivities = () => {
    setSize((oldSize) => oldSize + 1);
  };

  const isLoading = useMemo(() => !data && isValidating, [data, isValidating]);
  const hasNextPage = useMemo(() => Boolean(data?.every((d) => d.hasNextPage)), [data]);
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
                onChange={(value) => {
                  onChange(value);
                  setSize(1);
                }}
                options={activityFilterOptions}
                className="w-36"
              />
            )}
          />
        </div>
      </Toolbar>
      { activities.length === 0 ?
        isLoading &&
          <div className="flex flex-col gap-4 px-4">
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
          </div>
        : 
          <InfiniteScroll
            dataLength={activities.length}
            next={onShowMoreActivities}
            hasMore={hasNextPage}
            loader={
              <>
                <Activity.Skeleton />
                <Activity.Skeleton />
                <Activity.Skeleton />
                <Activity.Skeleton />
              </>
            }
            className="flex flex-col gap-4 px-4 pt-4 md:px-8"
          >
            {activities.map((activity, i) => (
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
                key={`${activity.mint}-${i}}`}
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
          </InfiniteScroll>
      }
    </>
  );
}

interface CollectionActivityLayout {
  children: ReactElement;
  collection: Collection;
}

CollectionActivity.getLayout = function CollectionActivityLayout({
  children,
  collection,
}: CollectionActivityLayout): JSX.Element {
  return <CollectionLayout collection={collection}>{children}</CollectionLayout>;
};

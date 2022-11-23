import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState, ReactNode } from 'react';
import { CollectionQuery, CollectionActivitiesQuery } from './../../../queries/collection.graphql';
import CollectionLayout from '../../../layouts/CollectionLayout';
import client from '../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Collection } from '../../../graphql.types';
import { Toolbar } from '../../../components/Toolbar';
import Select from '../../../components/Select';
import { Activity, ActivityType } from '../../../components/Activity';
import { Avatar, AvatarSize } from '../../../components/Avatar';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useForm, Controller } from 'react-hook-form';
import { InView } from 'react-intersection-observer';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'collection']);

  const {
    data: { collection },
  } = await client.query({
    query: CollectionQuery,
    variables: {
      id: params?.id,
    },
  });

  if (collection === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      collection,
      ...i18n,
    },
  };
}

interface CollectionActivitiesData {
  collection: Collection;
}

interface CollectionActivitiesVariables {
  offset: number;
  limit: number;
  id: string;
  eventTypes: string[] | null;
}

enum ActivityFilter {
  All = 'ALL',
  Listings = 'LISTINGS',
  Offers = 'OFFERS',
  Sales = 'PURCHASES',
}

interface CollectionActivityForm {
  type: ActivityFilter;
}

export default function CollectionActivity(): JSX.Element {
  const { t } = useTranslation(['collection', 'common']);
  const activityFilterOptions = [
    { label: t('all'), value: ActivityFilter.All },
    { label: t('listings'), value: ActivityFilter.Listings },
    { label: t('offers'), value: ActivityFilter.Offers },
    { label: t('sales'), value: ActivityFilter.Sales },
  ];
  const { watch, control } = useForm<CollectionActivityForm>({
    defaultValues: { type: activityFilterOptions[0].value },
  });
  const router = useRouter();
  const [hasMore, setHasMore] = useState(true);

  const activitiesQuery = useQuery<CollectionActivitiesData, CollectionActivitiesVariables>(
    CollectionActivitiesQuery,
    {
      variables: {
        offset: 0,
        limit: 24,
        id: router.query.id as string,
        eventTypes: null,
      },
    }
  );

  useEffect(() => {
    const subscription = watch(({ type }) => {
      let variables: CollectionActivitiesVariables = {
        offset: 0,
        limit: 24,
        id: router.query.id as string,
        eventTypes: null,
      };

      switch (type) {
        case ActivityFilter.All:
          break;
        case ActivityFilter.Listings:
          variables.eventTypes = [ActivityFilter.Listings];
          break;
        case ActivityFilter.Offers:
          variables.eventTypes = [ActivityFilter.Offers];
          break;
        case ActivityFilter.Sales:
          variables.eventTypes = [ActivityFilter.Sales];
          break;
      }

      activitiesQuery.refetch(variables).then(({ data: { collection } }) => {
        setHasMore(collection.activities.length > 0);
      });
    });

    return subscription.unsubscribe;
  }, [watch, router.query.address, activitiesQuery, router.query.id]);

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
      <div className="flex flex-col px-4 md:px-8">
        {activitiesQuery.loading ? (
          <>
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
          </>
        ) : (
          <>
            {activitiesQuery.data?.collection.activities.map((activity) => (
              <Activity
                avatar={
                  <Link
                    className="cursor-pointer transition hover:scale-[1.02]"
                    href={`/nfts/${activity.nft?.mintAddress}/details`}
                  >
                    <Avatar src={activity.nft?.image as string} size={AvatarSize.Standard} />
                  </Link>
                }
                type={activity.activityType as ActivityType}
                key={activity.id}
                meta={
                  <Activity.Meta
                    title={<Activity.Tag />}
                    marketplace={activity.nftMarketplace}
                    source={<Activity.Wallet wallet={activity.primaryWallet} />}
                  />
                }
              >
                <Activity.Price amount={activity.solPrice} />
                <Activity.Timestamp timeSince={activity.timeSince} />
              </Activity>
            ))}
            {hasMore && (
              <>
                <InView
                  onChange={async (inView) => {
                    if (!inView) {
                      return;
                    }

                    const {
                      data: { collection },
                    } = await activitiesQuery.fetchMore({
                      variables: {
                        ...activitiesQuery.variables,
                        offset: activitiesQuery.data?.collection.activities.length,
                      },
                    });

                    setHasMore(collection.activities.length > 0);
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

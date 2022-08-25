import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState, ReactNode } from 'react';
import { CollectionQuery, CollectionActivitiesQuery } from './../../../queries/collection.graphql';
import CollectionLayout from '../../../layouts/CollectionLayout';
import client from '../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Collection } from '../../../graphql.types';
import { Toolbar } from '../../../components/Toolbar';
import { ButtonGroup } from '../../../components/ButtonGroup';
import ActivityItem from '../../../components/ActivityItem';
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
      address: params?.address,
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
  address: string;
  eventTypes: string[] | null;
}

enum ActivityType {
  All = 'ALL',
  Listings = 'LISTINGS',
  Offers = 'OFFERS',
  Sales = 'PURCHASES',
}

interface CollectionActivityForm {
  type: ActivityType;
}

export default function CollectionActivity(): JSX.Element {
  const { t } = useTranslation(['collection', 'common']);
  const { watch, control } = useForm<CollectionActivityForm>({
    defaultValues: { type: ActivityType.All },
  });
  const router = useRouter();
  const [hasMore, setHasMore] = useState(true);

  const activitiesQuery = useQuery<CollectionActivitiesData, CollectionActivitiesVariables>(
    CollectionActivitiesQuery,
    {
      variables: {
        offset: 0,
        limit: 24,
        address: router.query.address as string,
        eventTypes: null,
      },
    }
  );

  useEffect(() => {
    const subscription = watch(({ type }) => {
      let variables: CollectionActivitiesVariables = {
        offset: 0,
        limit: 24,
        address: router.query.address as string,
        eventTypes: null,
      };

      switch (type) {
        case ActivityType.All:
          break;
        case ActivityType.Listings:
          variables.eventTypes = [ActivityType.Listings];
          break;
        case ActivityType.Offers:
          variables.eventTypes = [ActivityType.Offers];
          break;
        case ActivityType.Sales:
          variables.eventTypes = [ActivityType.Sales];
          break;
      }

      activitiesQuery.refetch(variables).then(({ data: { collection } }) => {
        setHasMore(collection.activities.length > 0);
      });
    });

    return subscription.unsubscribe;
  }, [watch, router.query.address, activitiesQuery]);

  return (
    <>
      <Toolbar>
        <div />
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <ButtonGroup value={value} onChange={onChange}>
              <ButtonGroup.Option value={ActivityType.All}>{t('all')}</ButtonGroup.Option>
              <ButtonGroup.Option value={ActivityType.Listings}>{t('listings')}</ButtonGroup.Option>
              <ButtonGroup.Option value={ActivityType.Offers}>{t('offers')}</ButtonGroup.Option>
              <ButtonGroup.Option value={ActivityType.Sales}>{t('sales')}</ButtonGroup.Option>
            </ButtonGroup>
          )}
        />
      </Toolbar>
      <div className="mt-4 flex flex-col px-4 md:px-8">
        {activitiesQuery.loading ? (
          <>
            <ActivityItem.Skeleton />
            <ActivityItem.Skeleton />
            <ActivityItem.Skeleton />
            <ActivityItem.Skeleton />
          </>
        ) : (
          <>
            {activitiesQuery.data?.collection.activities.map((activity) => (
              <ActivityItem activity={activity} key={activity.id} />
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
                  <ActivityItem.Skeleton />
                </InView>
                <ActivityItem.Skeleton />
                <ActivityItem.Skeleton />
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

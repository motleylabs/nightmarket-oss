import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import { WalletProfileQuery, ProfileActivitiesQuery } from './../../../queries/profile.graphql';
import client from '../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Wallet } from '../../../types';
import { Toolbar } from '../../../components/Toolbar';
import { ButtonGroup } from '../../../components/ButtonGroup';
import ActivityItem from '../../../components/ActivityItem';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useForm, Controller } from 'react-hook-form';
import { InView } from 'react-intersection-observer';
import ProfileLayout from '../../../layouts/ProfileLayout';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'profile']);

  const {
    data: { wallet },
  } = await client.query({
    query: WalletProfileQuery,
    variables: {
      address: params?.address,
    },
  });

  if (wallet === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      wallet,
      ...i18n,
    },
  };
}
interface ProfileActivitiesData {
  wallet: Wallet;
}

interface ProfileActivitiesVariables {
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

interface ProfileActivityForm {
  type: ActivityType;
}

export default function ProfileActivity(): JSX.Element {
  const { t } = useTranslation(['common', 'profile']);
  const { watch, control } = useForm<ProfileActivityForm>({
    defaultValues: { type: ActivityType.All },
  });
  const router = useRouter();
  const [hasMore, setHasMore] = useState(true);

  const activitiesQuery = useQuery<ProfileActivitiesData, ProfileActivitiesVariables>(
    ProfileActivitiesQuery,
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
      let variables: ProfileActivitiesVariables = {
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

      activitiesQuery.refetch(variables).then(({ data: { wallet } }) => {
        setHasMore(wallet.activities.length > 0);
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
            {activitiesQuery.data?.wallet.activities.map((activity) => (
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
                      data: { wallet },
                    } = await activitiesQuery.fetchMore({
                      variables: {
                        ...activitiesQuery.variables,
                        offset: activitiesQuery.data?.wallet.activities.length,
                      },
                    });

                    setHasMore(wallet.activities.length > 0);
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

interface ProfileActivityLayoutProps {
  children: ReactElement;
  wallet: Wallet;
}

ProfileActivity.getLayout = function ProfileActivityLayout({
  children,
  wallet,
}: ProfileActivityLayoutProps): JSX.Element {
  return <ProfileLayout wallet={wallet}>{children}</ProfileLayout>;
};

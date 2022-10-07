import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import { WalletProfileQuery, ProfileActivitiesQuery } from './../../../queries/profile.graphql';
import client from '../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Wallet } from '../../../graphql.types';
import { Toolbar } from '../../../components/Toolbar';
import { Activity, ActivityType } from '../../../components/Activity';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import { InView } from 'react-intersection-observer';
import ProfileLayout from '../../../layouts/ProfileLayout';
import { Avatar, AvatarSize } from '../../../components/Avatar';
import Select from '../../../components/Select';

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

enum ActivityFilter {
  All = 'ALL',
  Listings = 'LISTINGS',
  Offers = 'OFFERS',
  Sales = 'PURCHASES',
}

interface ProfileActivityForm {
  type: { value: ActivityFilter; label: string };
}

export default function ProfileActivity(): JSX.Element {
  const { t } = useTranslation(['common', 'profile']);
  const { watch, control } = useForm<ProfileActivityForm>({
    defaultValues: {
      type: {
        value: ActivityFilter.All,
        label: 'All',
      },
    },
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

      switch (type?.value) {
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

      activitiesQuery.refetch(variables).then(({ data: { wallet } }) => {
        setHasMore(wallet.activities.length > 0);
      });
    });

    return subscription.unsubscribe;
  }, [watch, router.query.address, activitiesQuery]);

  return (
    <>
      <Toolbar>
        <div className="hidden md:block" />
        <div className="col-span-2 md:col-span-1">
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Select
                value={value}
                onChange={onChange}
                options={[
                  { label: 'All activity', value: ActivityFilter.All },
                  { label: 'Offers', value: ActivityFilter.Offers },
                  { label: 'Sales', value: ActivityFilter.Sales },
                ]}
              />
            )}
          />
        </div>
      </Toolbar>
      <div className="mt-4 flex flex-col px-4 md:px-8">
        {activitiesQuery.loading ? (
          <>
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
            <Activity.Skeleton />
          </>
        ) : (
          <>
            {activitiesQuery.data?.wallet.activities.map((activity) => (
              <Activity
                avatar={
                  <Link href={`/nfts/${activity.nft?.mintAddress}/details`} passHref>
                    <a className="cursor-pointer transition hover:scale-[1.02]">
                      <Avatar src={activity.nft?.image as string} size={AvatarSize.Standard} />
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
  wallet: Wallet;
}

ProfileActivity.getLayout = function ProfileActivityLayout({
  children,
  wallet,
}: ProfileActivityLayoutProps): JSX.Element {
  return <ProfileLayout wallet={wallet}>{children}</ProfileLayout>;
};

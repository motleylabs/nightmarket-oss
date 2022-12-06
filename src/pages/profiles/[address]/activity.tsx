import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import { WalletProfileQuery, ProfileActivitiesQuery } from './../../../queries/profile.graphql';
import client from '../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ActivityType as EventTypes, AuctionHouse, Wallet } from '../../../graphql.types';
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
import config from '../../../app.config';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'profile']);

  const {
    data: { wallet, auctionHouse },
  } = await client.query({
    query: WalletProfileQuery,
    fetchPolicy: 'network-only',
    variables: {
      address: params?.address,
      auctionHouse: config.auctionHouse,
    },
  });

  if (wallet === null || auctionHouse === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      wallet,
      auctionHouse,
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
  eventTypes: EventTypes[] | null;
}

enum ActivityFilter {
  All = 'ALL',
  Listings = 'LISTING_CREATED',
  Offers = 'OFFER_CREATED',
  Sales = 'SALES',
}

interface ProfileActivityForm {
  type: ActivityFilter;
}

export default function ProfileActivity(): JSX.Element {
  const { t } = useTranslation(['common', 'profile']);

  const activityFilterOptions = [
    { label: t('allActivity'), value: ActivityFilter.All },
    { label: t('offers'), value: ActivityFilter.Offers },
    { label: t('sales'), value: ActivityFilter.Sales },
  ];

  const { watch, control } = useForm<ProfileActivityForm>({
    defaultValues: {
      type: activityFilterOptions[0].value,
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

      switch (type) {
        case ActivityFilter.All:
          variables.eventTypes = null;
          break;
        case ActivityFilter.Listings:
          variables.eventTypes = [EventTypes.ListingCreated];
          break;
        case ActivityFilter.Offers:
          variables.eventTypes = [EventTypes.OfferCreated];
          break;
        case ActivityFilter.Sales:
          variables.eventTypes = [EventTypes.Purchase];
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
  auctionHouse: AuctionHouse;
}

ProfileActivity.getLayout = function ProfileActivityLayout({
  children,
  wallet,
  auctionHouse,
}: ProfileActivityLayoutProps): JSX.Element {
  return (
    <ProfileLayout wallet={wallet} auctionHouse={auctionHouse}>
      {children}
    </ProfileLayout>
  );
};

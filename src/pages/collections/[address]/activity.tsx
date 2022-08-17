import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState, useMemo, SVGProps, ReactNode } from 'react';
import { CollectionQuery, CollectionActivitiesQuery } from './../../../queries/collection.graphql';
import CollectionLayout from '../../../layouts/CollectionLayout';
import client from '../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Activity, Collection } from '../../../types';
import { Toolbar } from '../../../components/Toolbar';
import { ButtonGroup } from '../../../components/ButtonGroup';
import { useTranslation } from 'next-i18next';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import { CurrencyDollarIcon, HandIcon, TagIcon } from '@heroicons/react/outline';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { InView } from 'react-intersection-observer';
import { shortenAddress } from '../../../modules/address';

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

function Table({ children }: { children: ReactNode }): JSX.Element {
  return <div className="flex flex-col px-4 md:px-8">{children}</div>;
}

function Header({ children }: { children: ReactNode }): JSX.Element {
  return <div className="mb-2 hidden grid-cols-8 gap-2 px-4 md:grid">{children}</div>;
}

Table.Header = Header;

function HeaderItem({ name, className }: { name: string; className?: string }): JSX.Element {
  return <span className={clsx('text-sm text-gray-300', className)}>{name}</span>;
}

Table.HeaderItem = HeaderItem;

function RowSkeleton(): JSX.Element {
  return <div className="mb-4 h-16 rounded bg-gray-800" />;
}

Table.RowSkeleton = RowSkeleton;

function Row({ activity }: { activity: Activity }): JSX.Element {
  const { t } = useTranslation('common');

  const multipleWallets = activity.wallets.length > 1;
  const [activityType, Icon] = useMemo<
    [] | [string, (props: SVGProps<SVGSVGElement>) => JSX.Element]
  >(() => {
    switch (activity.activityType) {
      case 'purchase':
        return [t('activity.purchase'), CurrencyDollarIcon];
      case 'listing':
        return [t('activity.listing'), TagIcon];
      case 'offer':
        return [t('activity.offer'), HandIcon];
      default:
        return [];
    }
  }, [activity.activityType, t]);

  return (
    <div
      key={activity.id}
      className="mb-4 grid grid-cols-8 gap-2 rounded border border-gray-700 px-2 py-2 text-white"
    >
      <div className="col-span-1 flex items-center gap-4 md:col-span-2">
        <Link href={`/nfts/${activity.nft?.address}`} passHref>
          <a className=" transition hover:scale-[1.02]">
            <img
              className="aspect-square w-full rounded object-cover md:w-12"
              src={activity.nft?.image}
              alt="nft"
            />
          </a>
        </Link>
        <div className="hidden font-medium md:inline-block">{activity.nft?.name}</div>
      </div>
      <div className="flex items-center">
        {Icon && <Icon className="mr-2 h-5 w-5 self-center text-gray-300" />}
        <div className="hidden md:inline-block">{activityType}</div>
      </div>
      <div className="hidden items-center text-xs md:flex md:text-base">
        {shortenAddress(activity.marketplaceProgramAddress)}
      </div>
      <div
        className={clsx('col-span-2 hidden items-center justify-center self-center md:flex', {
          '-ml-6': multipleWallets,
        })}
      >
        {multipleWallets && (
          <img src="/images/uturn.svg" className="mr-1 w-4 text-gray-300" alt="wallets" />
        )}
        <div className="flex flex-col gap-1">
          <Link href={`/profiles/${activity.wallets[0].address}/collected`} passHref>
            <a className="flex items-center gap-1 text-sm transition hover:scale-[1.02]">
              <img
                className="aspect-square w-4 rounded-full object-cover"
                src={activity.wallets[0].previewImage}
                alt={`wallet ${activity.wallets[0].address} avatar image`}
              />
              {activity.wallets[0].displayName}
            </a>
          </Link>
          {multipleWallets && (
            <Link href={`/profiles/${activity.wallets[1].address}/collected`} passHref>
              <a className="flex items-center gap-1 text-sm transition hover:scale-[1.02]">
                <img
                  className="aspect-square w-4 rounded-full object-cover"
                  src={activity.wallets[1].previewImage}
                  alt={`wallet ${activity.wallets[1].address} avatar image`}
                />
                {activity.wallets[1].displayName}
              </a>
            </Link>
          )}
        </div>
      </div>
      <div className="col-span-3 self-center text-xs sm:text-base md:col-span-1">
        {activity.solPrice} SOL
      </div>
      <div className="col-span-3 flex justify-end self-center text-xs sm:text-sm md:col-span-1 md:text-base">
        {formatDistanceToNow(parseISO(activity.createdAt), { addSuffix: true })}
      </div>
    </div>
  );
}
Table.Row = Row;

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
        <h3 className="hidden text-base text-white md:inline-block">{t('activity')}</h3>
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
      <Table>
        <Table.Header>
          <Table.HeaderItem name="Item" className="col-span-2" />
          <Table.HeaderItem name="Event" />
          <Table.HeaderItem name="Marketplace" />
          <Table.HeaderItem name="Parties" className="col-span-2 flex justify-center" />
          <Table.HeaderItem name="Amount" />
          <Table.HeaderItem name="Date" className="flex justify-end" />
        </Table.Header>
        {activitiesQuery.loading ? (
          <>
            <Table.RowSkeleton />
            <Table.RowSkeleton />
            <Table.RowSkeleton />
            <Table.RowSkeleton />
          </>
        ) : (
          <>
            {hasMore && (
              <>
                {activitiesQuery.data?.collection.activities.map((activity) => (
                  <Table.Row activity={activity} key={activity.id} />
                ))}
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
                  <Table.RowSkeleton />
                </InView>
                <Table.RowSkeleton />
                <Table.RowSkeleton />
              </>
            )}
          </>
        )}
      </Table>
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

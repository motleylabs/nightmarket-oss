import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import CollectionQuery from './../../../queries/collection.graphql';
import CollectionActivitiesQuery from './../../../queries/collectionActivities.graphql';
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
import { format } from 'timeago.js';
import { shortenAddress } from '../../../modules/address';
import { toSol } from '../../../modules/calculate';

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

function Table({ children }: { children: ReactElement }): JSX.Element {
  return <div className="flex flex-col px-8">{children}</div>;
}

function Header({ children }: { children: ReactElement }): JSX.Element {
  return <div className="mb-2 grid grid-cols-8 px-4">{children}</div>;
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
  const multipleWallets = activity.wallets.length > 1;
  let activityType: string;
  let ActivityIcon: any;
  switch (activity.activityType) {
    case 'listing':
      activityType = 'Listing';
      ActivityIcon = TagIcon;
      break;
    case 'offer':
      activityType = 'Offer';
      ActivityIcon = HandIcon;
      break;
    case 'purchase':
      activityType = 'Sold';
      ActivityIcon = CurrencyDollarIcon;
      break;
    default:
      activityType = '';
      ActivityIcon = null;
  }

  return (
    <article
      key={activity.id}
      className="mb-4 grid grid-cols-8 rounded border border-gray-700 px-2 py-2 text-white"
    >
      <Link href={`/nfts/${activity.nft?.address}`} passHref>
        <a className="col-span-2 flex items-center gap-4">
          <img className="h-12 w-12 rounded object-cover" src={activity.nft?.image} alt="nft" />
          <div className="font-medium">{activity.nft?.name}</div>
        </a>
      </Link>
      <div className="flex items-center">
        <ActivityIcon className="mr-2 h-5 w-5 self-center text-gray-300" />
        <div>{activityType}</div>
      </div>
      <div className="flex items-center text-xs">
        {shortenAddress(activity.marketplaceProgramAddress)}
      </div>
      <div
        className={clsx('col-span-2 flex items-center justify-center self-center ', {
          '-ml-6': multipleWallets,
        })}
      >
        {multipleWallets && (
          <img src="/images/uturn.svg" className="mr-2 w-4 text-gray-300" alt="wallets" />
        )}
        <div className="flex flex-col">
          {/* TODO: Add Avatar Component */}
          <Link href={`/profiles/${activity.wallets[0].address}`} passHref>
            <a>{shortenAddress(activity.wallets[0].address)}</a>
          </Link>
          {multipleWallets && (
            <Link href={`/profiles/${activity.wallets[1].address}`} passHref>
              <a>{shortenAddress(activity.wallets[1].address)}</a>
            </Link>
          )}
        </div>
      </div>
      <div className="self-center">{toSol(activity.price.toNumber())} Sol</div>
      <div className="flex justify-end self-center text-base">
        {format(activity.createdAt, 'en_US')}
      </div>
    </article>
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
  All = 'all',
  Listings = 'listings',
  Offers = 'offers',
  Sales = 'sales',
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
          variables.eventTypes = ['listing'];
          break;
        case ActivityType.Offers:
          variables.eventTypes = ['offer'];
          break;
        case ActivityType.Sales:
          variables.eventTypes = ['purchase'];
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
        <div className="text-base text-white">Activity</div>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <ButtonGroup value={value} onChange={onChange}>
              <ButtonGroup.Option value="all">{t('all')}</ButtonGroup.Option>
              <ButtonGroup.Option value="listings">{t('listings')}</ButtonGroup.Option>
              <ButtonGroup.Option value="offers">{t('offers')}</ButtonGroup.Option>
              <ButtonGroup.Option value="sales">{t('sales')}</ButtonGroup.Option>
            </ButtonGroup>
          )}
        />
      </Toolbar>
      <Table>
        <>
          <Table.Header>
            <>
              <Table.HeaderItem name="Item" className="col-span-2" />
              <Table.HeaderItem name="Event" />
              <Table.HeaderItem name="Marketplace" />
              <Table.HeaderItem name="Parties" className="col-span-2 flex justify-center" />
              <Table.HeaderItem name="Amount" />
              <Table.HeaderItem name="Date" className="flex justify-end" />
            </>
          </Table.Header>
          {activitiesQuery.loading ? (
            <>
              <Table.RowSkeleton />
              <Table.RowSkeleton />
              <Table.RowSkeleton />
              <Table.RowSkeleton />
            </>
          ) : (
            activitiesQuery.data?.collection.activities.map((activity) => (
              <Table.Row key={activity.id} activity={activity}></Table.Row>
            ))
          )}
        </>
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

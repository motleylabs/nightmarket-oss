import { useLazyQuery } from '@apollo/client';
import { formatISO, subDays, startOfDay } from 'date-fns';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Collection as CollectionUI } from '../../components/Collection';
import { List, ListGridSize } from '../../components/List';
import { Collection, OrderDirection } from '../../graphql.types';
import {
  CollectionsByVolumeQuery,
  CollectionsByMarketCapQuery,
} from './../../queries/collections.graphql';
import { useForm, Controller } from 'react-hook-form';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Select from '../../components/Select';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

interface CollectionsByVolumeData {
  collectionsFeaturedByVolume: Collection[];
}

interface CollectionsByMarketCapData {
  collectionsFeaturedByMarketCap: Collection[];
}

interface CollectionsVariables {
  term: string | null;
  orderDirection: OrderDirection;
  startDate: string;
  endDate: string;
  offset: number;
  limit: number;
}

enum CollectionsType {
  CollectionsByVolume,
  CollectionsByMarketCap,
}

interface SortOption {
  label: string;
  value: CollectionsType;
}

export async function getServerSideProps({ locale }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, [
    'common',
    'collections',
    'collection',
  ]);

  return {
    props: {
      ...i18n,
    },
  };
}

const Collections: NextPage = () => {
  const { t } = useTranslation('collections');
  const [hasMore, setHasMore] = useState(true);

  const sortOptions: SortOption[] = [
    { value: CollectionsType.CollectionsByVolume, label: t('topVolume') },
    {
      value: CollectionsType.CollectionsByMarketCap,
      label: t('topMarketcap'),
    },
  ];

  const [collectionsType, setCollectionsType] = useState<SortOption>(sortOptions[0]);

  const { control, watch, getValues } = useForm({
    defaultValues: {
      search: '',
      collectionTypeSelect: collectionsType,
    },
  });

  const [startDate, endDate] = useMemo(() => {
    const now = new Date();
    const nowUTC = formatISO(startOfDay(now));
    const dayAgo = startOfDay(subDays(now, 30));
    const dayAgoUTC = formatISO(dayAgo);

    return [dayAgoUTC, nowUTC];
  }, []);

  const variables: CollectionsVariables = useMemo(() => {
    const v = {
      term: getValues('search'),
      startDate,
      endDate,
      orderDirection: OrderDirection.Desc,
      offset: 0,
      limit: 24,
    };
    return v;
  }, [getValues, startDate, endDate]);

  const [, collectionsByVolumeQuery] = useLazyQuery<CollectionsByVolumeData, CollectionsVariables>(
    CollectionsByVolumeQuery,
    {
      variables,
    }
  );

  const [, collectionsByMarketCapQuery] = useLazyQuery<
    CollectionsByMarketCapData,
    CollectionsVariables
  >(CollectionsByMarketCapQuery, {
    variables,
  });

  useEffect(() => {
    const refetch = () => {
      if (collectionsType.value === CollectionsType.CollectionsByVolume) {
        collectionsByVolumeQuery
          .refetch(variables)
          .then(({ data: { collectionsFeaturedByVolume } }) => {
            setHasMore(collectionsFeaturedByVolume.length > 0);
          });
      } else {
        collectionsByMarketCapQuery
          .refetch(variables)
          .then(({ data: { collectionsFeaturedByMarketCap } }) => {
            setHasMore(collectionsFeaturedByMarketCap.length > 0);
          });
      }
    };

    const selectSubscription = watch(({ collectionTypeSelect }) => {
      if (collectionsType.value !== collectionTypeSelect?.value) {
        setCollectionsType(collectionTypeSelect as SortOption);
        refetch();
      }
    });

    const searchSubscription = watch(({ search }) => {
      refetch();
    });

    return () => {
      selectSubscription.unsubscribe();
      searchSubscription.unsubscribe();
    };
  }, [
    collectionsType.value,
    watch,
    collectionsByMarketCapQuery,
    collectionsByVolumeQuery,
    getValues,
    variables,
  ]);

  let onLoadMore: (inView: boolean) => Promise<void>;
  let data: Collection[] | undefined;
  let loading: boolean;

  if (collectionsType.value === CollectionsType.CollectionsByVolume) {
    onLoadMore = async (inView: boolean) => {
      if (!inView) {
        return;
      }

      const {
        data: { collectionsFeaturedByVolume },
      } = await collectionsByVolumeQuery.fetchMore({
        variables: {
          ...collectionsByVolumeQuery.variables,
          offset: collectionsByVolumeQuery.data?.collectionsFeaturedByVolume.length ?? 0,
        },
      });

      setHasMore(collectionsFeaturedByVolume.length > 0);
    };

    data = collectionsByVolumeQuery.data?.collectionsFeaturedByVolume;
    loading = collectionsByVolumeQuery.loading;
  } else {
    onLoadMore = async (inView: boolean) => {
      if (!inView) {
        return;
      }

      const {
        data: { collectionsFeaturedByMarketCap },
      } = await collectionsByMarketCapQuery.fetchMore({
        variables: {
          ...collectionsByMarketCapQuery.variables,
          offset: collectionsByMarketCapQuery.data?.collectionsFeaturedByMarketCap.length ?? 0,
        },
      });

      setHasMore(collectionsFeaturedByMarketCap.length > 0);
    };
    data = collectionsByMarketCapQuery.data?.collectionsFeaturedByMarketCap;
    loading = collectionsByMarketCapQuery.loading;
  }

  return (
    <>
      <Head>
        <title>{t('metadata.title')}</title>
        <meta name="description" content={t('metadata.description')} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto px-6 pb-6 lg:px-0">
        <section className="mt-12 text-center">
          <h1 className="text-3xl md:text-5xl">{t('hero.title')}</h1>
        </section>
        <section className="mt-14 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="group flex-grow text-white">
            <Controller
              name="search"
              control={control}
              render={({ field: { onChange, value } }) => {
                return (
                  <div className=" flex items-center justify-between rounded-md border border-gray-700 px-3 group-focus-within:border-white ">
                    <MagnifyingGlassIcon
                      className="h-5 w-5 text-gray-600 group-focus-within:text-white"
                      aria-hidden="true"
                    />
                    <input
                      autoFocus
                      placeholder={t('search.placeholder')}
                      className="w-full bg-gray-900 px-3 py-2 text-base text-gray-100 focus:outline-none"
                      value={value}
                      onChange={onChange}
                    />
                  </div>
                );
              }}
            />
          </div>
          <div className="flex-grow sm:w-72 sm:flex-grow-0">
            <Controller
              control={control}
              name="collectionTypeSelect"
              render={({ field: { onChange, value } }) => (
                <Select value={value} onChange={onChange} options={sortOptions} />
              )}
            />
          </div>
        </section>
        <section className="mt-4">
          <List
            data={data}
            loading={loading}
            hasMore={hasMore}
            gap={4}
            grid={{
              [ListGridSize.Default]: [1, 1],
              [ListGridSize.Small]: [2, 2],
              [ListGridSize.Medium]: [2, 3],
              [ListGridSize.Large]: [3, 4],
              [ListGridSize.ExtraLarge]: [3, 4],
              [ListGridSize.Jumbo]: [3, 4],
            }}
            skeleton={CollectionUI.Card.Skeleton}
            onLoadMore={onLoadMore}
            render={(collection, i) => (
              <Link
                href={`/collections/${collection.verifiedCollectionAddress}`}
                key={collection.verifiedCollectionAddress}
                passHref
              >
                <a>
                  <CollectionUI.Card
                    name={collection.name}
                    image={collection.image}
                    nftCount={collection.compactNftCount}
                    floorPrice={collection.compactFloorPrice}
                  />
                </a>
              </Link>
            )}
          />
        </section>
      </main>
    </>
  );
};

export default Collections;

import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  CollectionQuery,
  CollectionNFTsQuery,
  CollectionAttributeGroupsQuery,
} from './../../queries/collection.graphql';
import { useForm, Controller } from 'react-hook-form';
import CollectionLayout from '../../layouts/CollectionLayout';
import client from './../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AttributeFilter, Collection, OrderDirection, NftSort } from '../../graphql.types';
import { Toolbar } from '../../components/Toolbar';
import { PillItem, Sidebar } from '../../components/Sidebar';
import { useTranslation } from 'next-i18next';
import useSidebar from '../../hooks/sidebar';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Preview } from '../../components/Nft';
import { List, ListGridSize } from '../../components/List';
import { Disclosure } from '@headlessui/react';
import { Attribute } from '../../components/Attribute';
import { Offerable } from '../../components/Offerable';
import { useWallet } from '@solana/wallet-adapter-react';
import { Buyable } from '../../components/Buyable';
import Select from '../../components/Select';
import config from '../../app.config';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, [
    'common',
    'collection',
    'nft',
    'buyable',
    'analytics',
  ]);
  const { data } = await client.query({
    query: CollectionQuery,
    fetchPolicy: 'network-only',
    variables: {
      id: params?.id,
    },
  });

  const collection: Collection = data.collection;

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

interface CollectionNFTsData {
  collection: Collection;
}

interface CollectionNFTsVariables {
  offset: number;
  limit: number;
  id: string;
  attributes?: AttributeFilter[] | null;
  sortBy: NftSort;
  order: OrderDirection;
  auctionHouse: string;
}

interface CollectionAttributeGroupsData {
  collection: Collection;
}
interface CollectionAttributeGroupsVariables {
  id: string;
}

interface CollectionNFTForm {
  attributes: { [key: string]: string[] };
  sortBySelect: SortType;
}

enum SortType {
  PriceLowToHigh = 'PriceLowToHigh',
  PriceHighToLow = 'PriceHighToLow',
  RecentlyListed = 'RecentlyListed',
}
interface SortOption {
  label: string;
  value: SortType;
}

export default function CollectionNfts() {
  const { t } = useTranslation(['collection', 'common']);

  const { publicKey } = useWallet();

  const router = useRouter();
  const { open, toggleSidebar } = useSidebar();
  const [hasMore, setHasMore] = useState(true);

  const sortOptions: SortOption[] = [
    {
      value: SortType.PriceLowToHigh,
      label: t('sort.priceLowToHigh', { ns: 'collection' }),
    },
    {
      value: SortType.PriceHighToLow,
      label: t('sort.priceHighToLow', { ns: 'collection' }),
    },
    {
      value: SortType.RecentlyListed,
      label: t('sort.recentlyListed', { ns: 'collection' })
    },
  ];

  const { watch, control, setValue } = useForm<CollectionNFTForm>({
    defaultValues: { sortBySelect: sortOptions[0].value, attributes: {} },
  });

  const attributes = watch('attributes');

  const selectedAttributes: PillItem[] = useMemo(
    () =>
      Object.entries(attributes)
        .map(([group, attributes]) =>
          attributes?.map((a) => {
            return { key: `${group}:${a}`, label: a };
          })
        )
        .flat(),
    [attributes]
  );

  const attributeGroupsQuery = useQuery<
    CollectionAttributeGroupsData,
    CollectionAttributeGroupsVariables
  >(CollectionAttributeGroupsQuery, {
    variables: {
      id: router.query.id as string,
    },
  });

  const nftsQuery = useQuery<CollectionNFTsData, CollectionNFTsVariables>(CollectionNFTsQuery, {
    nextFetchPolicy: 'cache-and-network',
    variables: {
      offset: 0,
      limit: 24,
      id: router.query.id as string,
      order: OrderDirection.Asc,
      sortBy: NftSort.Price,
      auctionHouse: config.auctionHouse,
    },
  });

  const onClearPills = useCallback(() => {
    setValue('attributes', {});
  }, [setValue]);

  const onRemovePill = useCallback(
    (item: PillItem) => {
      const [group, attribute] = item.key.split(':', 2);
      setValue('attributes', {
        ...attributes,
        [group]: attributes[group].filter((a) => a !== attribute),
      });
    },
    [attributes, setValue]
  );

  useEffect(() => {
    const subscription = watch(({ attributes, sortBySelect }) => {
      let variables: CollectionNFTsVariables = {
        offset: 0,
        limit: 24,
        id: router.query.id as string,
        sortBy: sortBySelect === SortType.RecentlyListed ? NftSort.ListedAt : NftSort.Price,
        order: sortBySelect === SortType.PriceHighToLow ? OrderDirection.Desc : OrderDirection.Asc,
        auctionHouse: config.auctionHouse,
      };

      const nextAttributes = Object.entries(attributes || {}).reduce(
        (memo: AttributeFilter[], [traitType, values]) => {
          if (!values || values?.length === 0) {
            return [...memo];
          }

          return [...memo, { traitType: traitType, values: values }] as AttributeFilter[];
        },
        []
      );

      variables.attributes = nextAttributes;

      nftsQuery.refetch(variables).then(({ data: { collection } }) => {
        setHasMore(collection.nfts.length > 0);
      });
    });

    return subscription.unsubscribe;
  }, [watch, router.query.id, nftsQuery]);

  return (
    <>
      <Toolbar>
        <Sidebar.Control label={t('filters', { ns: 'collection' })} open={open} onChange={toggleSidebar} />
        <Controller
          control={control}
          name="sortBySelect"
          render={({ field: { onChange, value } }) => (
            <Select
              value={value}
              onChange={onChange}
              options={sortOptions}
              className="w-full md:w-40 lg:w-52"
            />
          )}
        />
      </Toolbar>
      <Sidebar.Page open={open}>
        <Sidebar.Panel onChange={toggleSidebar}>
          <div className="mt-4 flex w-full flex-col gap-6">
            <div className="flex flex-col gap-2">
              {attributeGroupsQuery.loading ? (
                <>
                  <Attribute.Skeleton />
                  <Attribute.Skeleton />
                  <Attribute.Skeleton />
                  <Attribute.Skeleton />
                  <Attribute.Skeleton />
                </>
              ) : (
                <>
                  {attributeGroupsQuery.data?.collection?.attributeGroups.map((group, index) => (
                    <div key={group.name} className=" w-full rounded-2xl bg-gray-800 p-4">
                      <Disclosure>
                        {({ open }) => (
                          <>
                            <Disclosure.Button className="flex w-full items-center justify-between">
                              <Attribute.Header group={group} isOpen={open} />
                            </Disclosure.Button>
                            <Disclosure.Panel className={'mt-6 space-y-4'}>
                              {group.variants.map((variant) => (
                                <Attribute.Option
                                  key={variant.name}
                                  variant={variant}
                                  selected={attributes[group.name]?.includes(variant.name)}
                                  onClick={() => {
                                    setValue('attributes', {
                                      ...attributes,
                                      [group.name]: attributes[group.name]?.includes(variant.name)
                                        ? attributes[group.name]?.filter((a) => a !== variant.name)
                                        : [...(attributes[group.name] ?? []), variant.name],
                                    });
                                  }}
                                />
                              ))}
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </Sidebar.Panel>
        <Sidebar.Content>
          <>
            {selectedAttributes.length > 0 && (
              <Sidebar.Pills
                items={selectedAttributes}
                onRemove={onRemovePill}
                onClear={onClearPills}
              />
            )}
            <Offerable connected={Boolean(publicKey)}>
              {({ makeOffer }) => (
                <Buyable connected={Boolean(publicKey)}>
                  {({ buyNow }) => (
                    <List
                      expanded={open}
                      data={nftsQuery.data?.collection.nfts}
                      loading={nftsQuery.loading}
                      hasMore={hasMore}
                      gap={6}
                      grid={{
                        [ListGridSize.Default]: [2, 2],
                        [ListGridSize.Small]: [2, 2],
                        [ListGridSize.Medium]: [2, 3],
                        [ListGridSize.Large]: [3, 4],
                        [ListGridSize.ExtraLarge]: [4, 6],
                        [ListGridSize.Jumbo]: [6, 8],
                      }}
                      skeleton={Preview.Skeleton}
                      onLoadMore={async (inView: boolean) => {
                        if (!inView) {
                          return;
                        }

                        const {
                          data: { collection },
                        } = await nftsQuery.fetchMore({
                          variables: {
                            offset: nftsQuery.data?.collection.nfts.length,
                          },
                        });

                        setHasMore(collection.nfts.length > 0);
                      }}
                      render={(nft, i) => (
                        <Preview
                          key={`${nft.mintAddress}-${i}`}
                          link={`/nfts/${nft.mintAddress}`}
                          onMakeOffer={() => makeOffer(nft.mintAddress)}
                          onBuy={() => buyNow(nft.mintAddress)}
                          nft={nft}
                          showCollectionThumbnail={false}
                        />
                      )}
                    />
                  )}
                </Buyable>
              )}
            </Offerable>
          </>
        </Sidebar.Content>
      </Sidebar.Page>
    </>
  );
}

interface CollectionNftsLayout {
  children: ReactElement;
  collection: Collection;
}

CollectionNfts.getLayout = function CollectionNftsLayout({
  children,
  collection,
}: CollectionNftsLayout): JSX.Element {
  return <CollectionLayout collection={collection}>{children}</CollectionLayout>;
};

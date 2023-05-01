import { Disclosure } from '@headlessui/react';
import { useWallet } from '@solana/wallet-adapter-react';

import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import useSWRInfinite from 'swr/infinite';

import config from '../../app.config';
import { Attribute } from '../../components/Attribute';
import { Buyable } from '../../components/Buyable';
import { List, ListGridSize } from '../../components/List';
import { Preview } from '../../components/Nft';
import { Offerable } from '../../components/Offerable';
import Select from '../../components/Select';
import type { PillItem } from '../../components/Sidebar';
import { Sidebar } from '../../components/Sidebar';
import { Toolbar } from '../../components/Toolbar';
import useSidebar from '../../hooks/sidebar';
import { api } from '../../infrastructure/api';
import CollectionLayout from '../../layouts/CollectionLayout';
import type { Collection, CollectionNftsData } from '../../typings';
import type { Nft } from '../../typings';
import { OrderDirection } from '../../typings/index.d';

const PAGE_LIMIT = 24;

export async function getServerSideProps({ locale, params, res }: GetServerSidePropsContext) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate');

  const start1 = Date.now();
  const i18n = await serverSideTranslations(locale as string, [
    'common',
    'collection',
    'nft',
    'buyable',
    'analytics',
  ]);
  console.log('i18n', Date.now() - start1);

  const start2 = Date.now();
  console.log('api', Date.now() - start2);

  const start3 = Date.now();
  const { data } = await api.get<Collection>(`/collections/${params?.slug}`);
  console.log('data', Date.now() - start3);

  if (data == null) {
    return {
      notFound: true,
    };
  }

  const start4 = Date.now();
  data.attributes?.map((attribute) => {
    if (attribute.values.length > 0) {
      const total = attribute.values.reduce((acc, item) => acc + item.counts, 0);
      attribute.values.map((valueItem) => {
        valueItem.percent = Math.round((valueItem.counts / total) * 10000) / 100;
      });
    }
  });
  console.log('data.attributes', Date.now() - start4);

  return {
    props: {
      collection: data,
      ...i18n,
    },
  };
}

enum SortType {
  PriceLowToHigh = 'price',
  RecentlyListed = 'timestamp',
}

interface CollectionNFTForm {
  attributes: { [key: string]: { type: string; values: string[] } };
  sortBySelect: SortType;
}

interface SortOption {
  label: string;
  value: SortType;
}

type CollectionNftsProps = {
  collection: Collection;
};

export default function CollectionNfts({ collection }: CollectionNftsProps) {
  const { t } = useTranslation(['collection', 'common']);

  const sortOptions: SortOption[] = [
    {
      value: SortType.PriceLowToHigh,
      label: t('sort.priceLowToHigh', { ns: 'collection' }),
    },
    {
      value: SortType.RecentlyListed,
      label: t('sort.recentlyListed', { ns: 'collection' }),
    },
  ];

  const miniCollection = useMemo(
    () => ({
      slug: collection.slug,
      name: collection.name,
      floorPrice: collection.statistics.floor1d,
    }),
    [collection.name, collection.slug, collection.statistics.floor1d]
  );

  const { watch, control, setValue } = useForm<CollectionNFTForm>({
    defaultValues: { sortBySelect: sortOptions[0].value, attributes: {} },
  });

  const attributes = watch('attributes');
  const selectedSort = watch('sortBySelect');

  const selectedAttributes: PillItem[] = useMemo(
    () =>
      Object.entries(attributes)
        .map(([group, attributes]) =>
          attributes.values?.map((a) => {
            return { key: `${group}:${a}`, label: `${group}: ${a}` };
          })
        )
        .flat(),
    [attributes]
  );

  const querySelectedAttributes = useMemo(
    () =>
      Object.entries(attributes)
        .map(([name, { type, values }]) => ({
          name,
          type,
          values,
        }))
        .flat(),
    [attributes]
  );

  const { publicKey } = useWallet();

  const { query } = useRouter();
  const { open, toggleSidebar } = useSidebar();

  const getKey = (pageIndex: number, previousPageData: CollectionNftsData) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;

    const attributesQueryParam = encodeURIComponent(JSON.stringify(querySelectedAttributes));

    return `/collections/nfts?sort_by=${selectedSort}&order=${
      selectedSort === SortType.PriceLowToHigh ? OrderDirection.Asc : OrderDirection.Desc
    }&limit=${PAGE_LIMIT}&offset=${
      pageIndex * PAGE_LIMIT
    }&attributes=${attributesQueryParam}&address=${query.slug}&auction_house=${
      config.auctionHouse
    }`;
  };

  const { data, size, setSize, isValidating } = useSWRInfinite<CollectionNftsData>(getKey, {
    revalidateOnFocus: false,
  });

  const isLoading = !data && isValidating;
  const hasNextPage = Boolean(data?.every((d) => d.hasNextPage));

  const onShowMoreNfts = () => {
    setSize(size + 1);
  };

  const onClearPills = useCallback(() => {
    setValue('attributes', {});
  }, [setValue]);

  const onRemovePill = useCallback(
    (item: PillItem) => {
      const [group, attribute] = item.key.split(':', 2);
      setValue('attributes', {
        ...attributes,
        [group]: {
          type: attributes[group].type,
          values: attributes[group].values.filter((a) => a !== attribute),
        },
      });
    },
    [attributes, setValue]
  );

  const nfts: Nft[] = useMemo(() => data?.flatMap((pageData) => pageData.nfts) ?? [], [data]);

  return (
    <>
      <Toolbar>
        <Sidebar.Control
          label={t('filters', { ns: 'collection' })}
          open={open}
          onChange={toggleSidebar}
        />
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
              {collection.attributes.length == 0 ? (
                <>
                  <Attribute.Skeleton />
                  <Attribute.Skeleton />
                  <Attribute.Skeleton />
                  <Attribute.Skeleton />
                  <Attribute.Skeleton />
                </>
              ) : (
                collection.attributes.map((group) => (
                  <div
                    key={`attribute-group-${group.name}`}
                    className=" w-full rounded-2xl bg-gray-800 p-4"
                  >
                    <Disclosure>
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="flex w-full items-center justify-between">
                            <Attribute.Header group={group} isOpen={open} />
                          </Disclosure.Button>
                          <Disclosure.Panel className={'mt-6 space-y-4'}>
                            {group.values.map((valueItem) => (
                              <Attribute.Option
                                key={`attribute-${group.name}-${valueItem.value}`}
                                variant={valueItem.value}
                                count={valueItem.counts}
                                percent={valueItem.percent}
                                selected={attributes[group.name]?.values?.includes(valueItem.value)}
                                onClick={() => {
                                  setValue('attributes', {
                                    ...attributes,
                                    [group.name]: {
                                      type: group.type,
                                      values: attributes[group.name]?.values?.includes(
                                        valueItem.value
                                      )
                                        ? attributes[group.name]?.values?.filter(
                                            (a) => a !== valueItem.value
                                          )
                                        : [
                                            ...(attributes[group.name]?.values ?? []),
                                            valueItem.value,
                                          ],
                                    },
                                  });
                                }}
                              />
                            ))}
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  </div>
                ))
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
                      data={nfts}
                      loading={isLoading}
                      hasMore={hasNextPage}
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

                        onShowMoreNfts();
                      }}
                      render={(nft, i) => (
                        <Preview
                          key={`${nft.mintAddress}-${i}`}
                          link={`/nfts/${nft.mintAddress}`}
                          onMakeOffer={() => makeOffer(nft, miniCollection)}
                          onBuy={() => buyNow(nft, miniCollection)}
                          nft={nft}
                          showCollectionThumbnail={false}
                          bulkSelectEnabled={false}
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

import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import {
  CollectionQuery,
  CollectionNFTsQuery,
  CollectionAttributeGroupsQuery,
} from './../../../queries/collection.graphql';
import { useForm, Controller } from 'react-hook-form';
import CollectionLayout from '../../../layouts/CollectionLayout';
import client from './../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AttributeFilter, Collection, OrderDirection, Sort } from '../../../graphql.types';
import { Toolbar } from '../../../components/Toolbar';
import { Sidebar } from '../../../components/Sidebar';
import { useTranslation } from 'next-i18next';
import useSidebar from '../../../hooks/sidebar';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { NftCard } from '../../../components/NftCard';
import { List, ListGridSize } from '../../../components/List';
import { Listbox } from '@headlessui/react';
import { Attribute } from '../../../components/Attribute';
import { Offerable } from '../../../components/Offerable';
import { useWallet } from '@solana/wallet-adapter-react';
import { Buyable } from '../../../components/Buyable';
import { ControlledSelect } from '../../../components/Select';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'collection']);

  const { data } = await client.query({
    query: CollectionQuery,
    variables: {
      address: params?.address,
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
  address: string;
  //listed: boolean | null;
  attributes: AttributeFilter[] | null;
  sortBy: Sort;
  order: OrderDirection;
}

interface CollectionAttributeGroupsData {
  collection: Collection;
}
interface CollectionAttributeGroupsVariables {
  address: string;
}

enum ListedStatus {
  All = 'all',
  Listed = 'listed',
  Unlisted = 'unlisted',
}

interface CollectionNFTForm {
  listed: ListedStatus;
  attributes: { [key: string]: string[] };
  sortBySelect: SortOption;
}

enum SortType {
  RecentlyListed,
  PriceLowToHigh,
  PriceHighToLow,
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
      value: SortType.PriceHighToLow,
      label: t('sort.priceHighToLow'),
    },
    {
      value: SortType.PriceLowToHigh,
      label: t('sort.priceLowToHigh'),
    },
    { value: SortType.RecentlyListed, label: t('sort.recentlyListed') },
  ];

  const [sortOption, setSortOption] = useState<SortOption>(sortOptions[0]);

  const { watch, control, getValues } = useForm<CollectionNFTForm>({
    defaultValues: { listed: ListedStatus.All, sortBySelect: sortOption },
  });

  const attributeGroupsQuery = useQuery<
    CollectionAttributeGroupsData,
    CollectionAttributeGroupsVariables
  >(CollectionAttributeGroupsQuery, {
    variables: {
      address: router.query.address as string,
    },
  });

  const nftsQuery = useQuery<CollectionNFTsData, CollectionNFTsVariables>(CollectionNFTsQuery, {
    variables: {
      offset: 0,
      limit: 24,
      //listed: null,
      address: router.query.address as string,
      attributes: null,
      order:
        sortOption?.value === SortType.PriceLowToHigh ? OrderDirection.Asc : OrderDirection.Desc,
      sortBy: sortOption?.value === SortType.RecentlyListed ? Sort.ListedAt : Sort.Price,
    },
  });

  useEffect(() => {
    const subscription = watch(({ attributes, sortBySelect }) => {
      let variables: CollectionNFTsVariables = {
        offset: 0,
        limit: 24,
        address: router.query.address as string,
        //listed,
        attributes: null,
        sortBy: sortBySelect?.value === SortType.RecentlyListed ? Sort.ListedAt : Sort.Price,
        order:
          sortBySelect?.value === SortType.PriceLowToHigh
            ? OrderDirection.Asc
            : OrderDirection.Desc,
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

      if (nextAttributes.length > 0) {
        variables.attributes = nextAttributes;
      }

      // if (listed === ListedStatus.Listed) {
      //   variables.listed = true;
      // } else if (listed === ListedStatus.Unlisted) {
      //   variables.listed = false;
      // }

      nftsQuery.refetch(variables).then(({ data: { collection } }) => {
        setHasMore(collection.nfts.length > 0);
      });
    });

    return subscription.unsubscribe;
  }, [watch, router.query.address, nftsQuery]);

  return (
    <>
      <Toolbar>
        <Sidebar.Control open={open} onChange={toggleSidebar} />
        {/* <Controller
          control={control}
          name="listed"
          render={({ field: { onChange, value } }) => (
            <ButtonGroup value={value} onChange={onChange}>
              <ButtonGroup.Option value={ListedStatus.All}>
                {t('all', { ns: 'common' })}
              </ButtonGroup.Option>
              <ButtonGroup.Option value={ListedStatus.Listed}>
                {t('listed', { ns: 'common' })}
              </ButtonGroup.Option>
              <ButtonGroup.Option value={ListedStatus.Unlisted}>
                {t('unlisted', { ns: 'common' })}
              </ButtonGroup.Option>
            </ButtonGroup>
          )}
        /> */}
        <ControlledSelect control={control} id="sortBySelect" options={sortOptions} />
      </Toolbar>
      <Sidebar.Page open={open}>
        <Sidebar.Panel onChange={toggleSidebar}>
          <div className="mt-6 flex flex-col px-2">
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
                  <Controller
                    key={group.name}
                    control={control}
                    name={`attributes.${group.name}`}
                    render={({ field: { onChange, value } }) => (
                      <Listbox
                        multiple
                        value={value || []}
                        onChange={(e) => {
                          onChange(e);
                        }}
                      >
                        {({ open }) => (
                          <>
                            <Listbox.Button>
                              <Attribute.Header group={group} isOpen={open} />
                            </Listbox.Button>
                            <Listbox.Options>
                              {group.variants.map((variant) => (
                                <Listbox.Option key={variant.name} value={variant.name}>
                                  {({ selected }) => (
                                    <Attribute.Option variant={variant} selected={selected} />
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </>
                        )}
                      </Listbox>
                    )}
                  />
                ))}
              </>
            )}
          </div>
        </Sidebar.Panel>
        <Sidebar.Content>
          <Offerable connected={Boolean(publicKey)}>
            {({ makeOffer }) => (
              <Buyable connected={Boolean(publicKey)}>
                {({ buyNow }) => (
                  <List
                    expanded={open}
                    data={nftsQuery.data?.collection.nfts}
                    loading={nftsQuery.loading}
                    hasMore={hasMore}
                    gap={4}
                    grid={{
                      [ListGridSize.Default]: [1, 1],
                      [ListGridSize.Small]: [2, 2],
                      [ListGridSize.Medium]: [2, 3],
                      [ListGridSize.Large]: [3, 4],
                      [ListGridSize.ExtraLarge]: [4, 6],
                      [ListGridSize.Jumbo]: [6, 8],
                    }}
                    skeleton={NftCard.Skeleton}
                    onLoadMore={async (inView: boolean) => {
                      if (!inView) {
                        return;
                      }

                      const {
                        data: { collection },
                      } = await nftsQuery.fetchMore({
                        variables: {
                          ...nftsQuery.variables,
                          offset: nftsQuery.data?.collection.nfts.length,
                        },
                      });

                      setHasMore(collection.nfts.length > 0);
                    }}
                    render={(nft, i) => (
                      <NftCard
                        key={`${nft.mintAddress}-${i}`}
                        link={`/nfts/${nft.mintAddress}/details`}
                        onMakeOffer={() => makeOffer(nft.mintAddress)}
                        onBuy={() => buyNow(nft.mintAddress)}
                        nft={nft}
                      />
                    )}
                  />
                )}
              </Buyable>
            )}
          </Offerable>
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

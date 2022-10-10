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
import { AttributeFilter, Collection, OrderDirection, NftSort } from '../../../graphql.types';
import { Toolbar } from '../../../components/Toolbar';
import { Sidebar } from '../../../components/Sidebar';
import { useTranslation } from 'next-i18next';
import useSidebar from '../../../hooks/sidebar';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { NftCard } from '../../../components/NftCard';
import { List, ListGridSize } from '../../../components/List';
import { Listbox, Switch } from '@headlessui/react';
import { Attribute } from '../../../components/Attribute';
import { Offerable } from '../../../components/Offerable';
import { useWallet } from '@solana/wallet-adapter-react';
import { Buyable } from '../../../components/Buyable';
import { ControlledSelect } from '../../../components/Select';
import { ButtonGroup } from '../../../components/ButtonGroup';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'collection']);

  const { data } = await client.query({
    query: CollectionQuery,
    variables: {
      address: params?.address,
    },
  });
  console.log(data);
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
  sortBy: NftSort;
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

  const { watch, control, getValues, setValue } = useForm<CollectionNFTForm>({
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
      address: router.query.address as string,
      attributes: null,
      order:
        sortOption?.value === SortType.PriceLowToHigh ? OrderDirection.Asc : OrderDirection.Desc,
      sortBy: sortOption?.value === SortType.RecentlyListed ? NftSort.ListedAt : NftSort.Price,
    },
  });

  useEffect(() => {
    const subscription = watch(({ attributes, sortBySelect }) => {
      let variables: CollectionNFTsVariables = {
        offset: 0,
        limit: 24,
        address: router.query.address as string,
        attributes: null,
        sortBy: sortBySelect?.value === SortType.RecentlyListed ? NftSort.ListedAt : NftSort.Price,
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

      nftsQuery.refetch(variables).then(({ data: { collection } }) => {
        setHasMore(collection.nfts.length > 0);
      });
    });

    return subscription.unsubscribe;
  }, [watch, router.query.address, nftsQuery]);

  return (
    <>
      <Toolbar>
        <Sidebar.Control label={t('filters')} open={open} onChange={toggleSidebar} />
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
          <div className="mt-4 flex  w-full flex-col gap-2 ">
            <div className="flex w-full justify-between rounded-2xl bg-gray-800 p-4 font-semibold ">
              Show unlisted{' '}
              <Controller
                control={control}
                name="listed"
                render={({ field: { onChange, value: enabled } }) => (
                  <Switch
                    checked={enabled === ListedStatus.All}
                    onChange={() =>
                      setValue('listed', enabled ? ListedStatus.Listed : ListedStatus.All)
                    }
                    className={`${
                      enabled ? 'bg-orange-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full`}
                  >
                    <span className="sr-only">Show unlisted NFTs in collection</span>
                    <span
                      className={`${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                )}
              />
            </div>
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
                              <Listbox.Button className=" flex w-full items-center justify-between">
                                <Attribute.Header group={group} isOpen={open} />
                              </Listbox.Button>
                              <Listbox.Options className={'mt-6 space-y-4'}>
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
                  </div>
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
                    gap={6}
                    grid={{
                      [ListGridSize.Default]: [2, 2],
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

import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  CollectionQuery,
  CollectionNFTsQuery,
  CollectionAttributeGroupsQuery,
} from './../../../queries/collection.graphql';
import { useForm, Controller } from 'react-hook-form';
import CollectionLayout from '../../../layouts/CollectionLayout';
import client from './../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  AttributeFilter,
  AttributeGroup,
  AttributeVariant,
  Collection,
  Nft,
} from '../../../graphql.types';
import { Toolbar } from '../../../components/Toolbar';
import { Sidebar } from '../../../components/Sidebar';
import { ButtonGroup } from '../../../components/ButtonGroup';
import { useTranslation } from 'next-i18next';
import useSidebar from '../../../hooks/sidebar';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NftCard } from '../../../components/NftCard';
import { List, ListGridSize } from '../../../components/List';
import { Listbox } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import { CheckIcon } from '@heroicons/react/solid';

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
  nfts: Nft[];
}

interface CollectionNFTsVariables {
  offset: number;
  limit: number;
  collection: string;
  listed: boolean | null;
  attributes: AttributeFilter[] | null;
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
}

function SidebarFilterHeader({
  group,
  isOpen,
}: {
  group: AttributeGroup;
  isOpen: boolean;
}): JSX.Element {
  const totalCount = useMemo(
    () =>
      group.variants.reduce((count, item) => {
        return count + item.count;
      }, 0),
    [group.variants]
  );
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="text-lg text-white">{group.name}</span>
      <div className="flex items-center gap-4">
        <span className="rounded bg-gray-800 px-1 text-sm text-white">{totalCount}</span>
        {isOpen ? (
          <ChevronUpIcon width={24} height={24} className="text-white" />
        ) : (
          <ChevronDownIcon width={24} height={24} className="text-white" />
        )}
      </div>
    </div>
  );
}

function SidebarFilterItem({
  variant,
  isSelected,
}: {
  variant: AttributeVariant;
  isSelected: boolean;
}): JSX.Element {
  return (
    <div className="mb-6 flex items-center justify-between">
      <span className="text-sm text-white">{variant.name}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-white">{variant.count}</span>
        {isSelected ? (
          <CheckIcon
            width={24}
            height={24}
            className="rounded-md border border-gray-400 bg-white px-0.5"
          />
        ) : (
          <div className="h-6 w-6 rounded-md border border-gray-400 bg-gray-700 px-0.5" />
        )}
      </div>
    </div>
  );
}

function SidebarFilterSkeleton(): JSX.Element {
  return <span className="mb-4 h-8 w-full rounded bg-gray-800" />;
}

export default function CollectionNfts() {
  const { t } = useTranslation(['collection', 'common']);
  const { watch, control, getValues } = useForm<CollectionNFTForm>({
    defaultValues: { listed: ListedStatus.All },
  });
  const router = useRouter();
  const { open, toggleSidebar } = useSidebar();
  const [hasMore, setHasMore] = useState(true);

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
      listed: null,
      collection: router.query.address as string,
      attributes: null,
    },
  });

  const getGroupSelectedAttributes = (groupName: string) => {
    const variants = getValues().attributes[groupName];
    return variants ? variants : [];
  };

  useEffect(() => {
    const subscription = watch(({ listed, attributes }) => {
      let variables: CollectionNFTsVariables = {
        offset: 0,
        limit: 24,
        collection: router.query.address as string,
        listed: null,
        attributes: null,
      };

      if (attributes) {
        const attributesFilters: AttributeFilter[] = new Array<AttributeFilter>();
        for (let [key, value] of Object.entries(attributes)) {
          if (value) {
            const attributeFilter: AttributeFilter = {
              traitType: key,
              values: value,
            };
            attributesFilters.push(attributeFilter);
          }
        }
        if (attributesFilters.length > 0) {
          variables.attributes = attributesFilters;
        }
      }

      if (listed === ListedStatus.Listed) {
        variables.listed = true;
      } else if (listed === ListedStatus.Unlisted) {
        variables.listed = false;
      }

      nftsQuery.refetch(variables).then(({ data: { nfts } }) => {
        setHasMore(nfts.length > 0);
      });
    });

    return subscription.unsubscribe;
  }, [watch, router.query.address, nftsQuery]);

  return (
    <>
      <Toolbar>
        <Sidebar.Control open={open} onChange={toggleSidebar} />
        <Controller
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
        />
      </Toolbar>
      <Sidebar.Page open={open}>
        <Sidebar.Panel>
          <div className="mt-6 flex flex-col px-2">
            {attributeGroupsQuery.loading ? (
              <>
                <SidebarFilterSkeleton />
                <SidebarFilterSkeleton />
                <SidebarFilterSkeleton />
                <SidebarFilterSkeleton />
                <SidebarFilterSkeleton />
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
                        value={getGroupSelectedAttributes(group.name)}
                        onChange={(e) => {
                          onChange(e);
                        }}
                      >
                        {({ open }) => (
                          <>
                            <Listbox.Button>
                              <SidebarFilterHeader group={group} isOpen={open} />
                            </Listbox.Button>
                            <Listbox.Options>
                              {group.variants.map((variant) => (
                                <Listbox.Option key={variant.name} value={variant.name}>
                                  {({ selected }) => (
                                    <SidebarFilterItem variant={variant} isSelected={selected} />
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
          <List
            expanded={open}
            data={nftsQuery.data?.nfts}
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
                data: { nfts },
              } = await nftsQuery.fetchMore({
                variables: {
                  ...nftsQuery.variables,
                  offset: nftsQuery.data?.nfts.length,
                },
              });

              setHasMore(nfts.length > 0);
            }}
            render={(nft, i) => (
              <Link
                href={`/nfts/${nft.mintAddress}/details`}
                key={`${nft.mintAddress}-${i}`}
                passHref
              >
                <a>
                  <NftCard nft={nft} />
                </a>
              </Link>
            )}
          />
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

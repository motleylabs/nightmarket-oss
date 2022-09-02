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
import { AttributeFilter, Collection, Nft, Scalars } from '../../../graphql.types';
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
import { Attribute } from '../../../components/Attribute';

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

  useEffect(() => {
    const subscription = watch(({ listed, attributes }) => {
      let variables: CollectionNFTsVariables = {
        offset: 0,
        limit: 24,
        collection: router.query.address as string,
        listed: null,
        attributes: null,
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

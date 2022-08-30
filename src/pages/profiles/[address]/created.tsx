import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Wallet, Nft } from '../../../graphql.types';
import {
  WalletProfileQuery,
  CreatedNFTsQuery,
  CreatedCollectionsQuery,
} from './../../../queries/profile.graphql';
import ProfileLayout from '../../../layouts/ProfileLayout';
import client from '../../../client';
import { useForm, Controller } from 'react-hook-form';
import { Toolbar } from '../../../components/Toolbar';
import { Sidebar } from '../../../components/Sidebar';
import { ButtonGroup } from '../../../components/ButtonGroup';
import useSidebar from '../../../hooks/sidebar';
import { NftCard } from '../../../components/NftCard';
import { List, ListGridSize } from './../../../components/List';
import { Collection } from '../../../components/Collection';
import { Listbox } from '@headlessui/react';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'profile']);

  const {
    data: { wallet },
  } = await client.query({
    query: WalletProfileQuery,
    variables: {
      address: params?.address,
    },
  });

  if (wallet === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      wallet,
      ...i18n,
    },
  };
}

enum ListedStatus {
  All = 'all',
  Listed = 'listed',
  Unlisted = 'unlisted',
}

interface CollectionNFTForm {
  listed: ListedStatus;
  collections: (string | undefined)[] | null | undefined;
}

interface CreatedNftsData {
  createdNfts: Nft[];
}

interface CreatedNFTsVariables {
  offset: number;
  limit: number;
  listed: boolean | null;
  creator: string;
  collections?: (string | undefined)[] | null | undefined;
}

interface CreatedCollectionsData {
  wallet: Wallet;
}
interface CreatedCollectionsVariables {
  address: string;
}

export default function ProfileCollected() {
  const { t } = useTranslation(['collection', 'common']);
  const { watch, control } = useForm<CollectionNFTForm>({
    defaultValues: { listed: ListedStatus.All },
  });
  const router = useRouter();
  const { open, toggleSidebar } = useSidebar();
  const [hasMore, setHasMore] = useState(true);

  const nftsQuery = useQuery<CreatedNftsData, CreatedNFTsVariables>(CreatedNFTsQuery, {
    variables: {
      offset: 0,
      limit: 24,
      listed: null,
      creator: router.query.address as string,
    },
  });

  const createdCollectionsQuery = useQuery<CreatedCollectionsData, CreatedCollectionsVariables>(
    CreatedCollectionsQuery,
    {
      variables: {
        address: router.query.address as string,
      },
    }
  );

  useEffect(() => {
    const subscription = watch(({ listed, collections }) => {
      let variables: CreatedNFTsVariables = {
        offset: 0,
        limit: 24,
        creator: router.query.address as string,
        listed: null,
        collections,
      };

      if (variables?.collections?.length === 0) {
        variables.collections = null;
      }

      if (listed === ListedStatus.Listed) {
        variables.listed = true;
      } else if (listed === ListedStatus.Unlisted) {
        variables.listed = false;
      }

      nftsQuery.refetch(variables).then(({ data: { createdNfts } }) => {
        setHasMore(createdNfts.length > 0);
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
          <div className="mt-4 flex flex-col gap-2">
            {createdCollectionsQuery.loading ? (
              <>
                <Collection.Option.Skeleton />
                <Collection.Option.Skeleton />
                <Collection.Option.Skeleton />
                <Collection.Option.Skeleton />
                <Collection.Option.Skeleton />
              </>
            ) : (
              <Controller
                control={control}
                name="collections"
                render={({ field: { onChange, value } }) => (
                  <Listbox value={value} onChange={onChange} multiple>
                    <Listbox.Options static>
                      {createdCollectionsQuery.data?.wallet?.createdCollections.map((cc) => (
                        <Listbox.Option
                          key={cc.collection?.nft.mintAddress}
                          value={cc.collection?.nft.mintAddress}
                        >
                          {({ selected }) => (
                            <Collection.Option
                              selected={selected}
                              avatar={
                                <Collection.Option.Avatar
                                  src={cc.collection?.nft.image as string}
                                  figure={cc.collection?.nftCount}
                                />
                              }
                              header={
                                <Collection.Option.Title>
                                  {cc.collection?.nft.name}
                                </Collection.Option.Title>
                              }
                              floorPrice={cc.collection?.floorPrice}
                            ></Collection.Option>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Listbox>
                )}
              />
            )}
          </div>
        </Sidebar.Panel>
        <Sidebar.Content>
          <List
            expanded={open}
            hasMore={hasMore}
            data={nftsQuery.data?.createdNfts}
            loading={nftsQuery.loading}
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
                data: { createdNfts },
              } = await nftsQuery.fetchMore({
                variables: {
                  ...nftsQuery.variables,
                  offset: nftsQuery.data?.createdNfts.length,
                },
              });

              setHasMore(createdNfts.length > 0);
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
  wallet: Wallet;
}

ProfileCollected.getLayout = function ProfileCollectedLayout({
  children,
  wallet,
}: CollectionNftsLayout): JSX.Element {
  return <ProfileLayout wallet={wallet}>{children}</ProfileLayout>;
};

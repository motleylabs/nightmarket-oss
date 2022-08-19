import type { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import {
  WalletProfileQuery,
  CollectedNFTsQuery,
  CollectedCollectionsQuery,
} from './../../../queries/profile.graphql';
import ProfileLayout from '../../../layouts/ProfileLayout';
import client from './../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Wallet } from '../../../types';
import { ReactElement, useEffect, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { useForm, Controller } from 'react-hook-form';
import { Toolbar } from '../../../components/Toolbar';
import { Sidebar } from '../../../components/Sidebar';
import { ButtonGroup } from '../../../components/ButtonGroup';
import { useTranslation } from 'next-i18next';
import useSidebar from '../../../hooks/sidebar';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NftCard } from '../../../components/NftCard';
import { List, ListGridSize } from './../../../components/List';
import clsx from 'clsx';
import { Nft } from '../../../types';
import CollectedCollectionItem from '../../../components/CollectedCollectionItem';

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
  collections: string[] | null;
}

interface CollectionNFTsData {
  collectedNfts: Nft[];
}

interface CollectionNFTsVariables {
  offset: number;
  limit: number;
  listed: boolean | null;
  owner: string;
  collections: string[] | null;
}

interface CollectedCollectionsData {
  wallet: Wallet;
}
interface CollectedCollectionsVariables {
  address: string;
}

export default function ProfileCollected() {
  const { t } = useTranslation(['collection', 'common']);
  const { watch, control, setValue, getValues } = useForm<CollectionNFTForm>({
    defaultValues: { listed: ListedStatus.All, collections: null },
  });
  const router = useRouter();
  const { open, toggleSidebar } = useSidebar();
  const [hasMore, setHasMore] = useState(true);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const nftsQuery = useQuery<CollectionNFTsData, CollectionNFTsVariables>(CollectedNFTsQuery, {
    variables: {
      offset: 0,
      limit: 24,
      listed: null,
      owner: router.query.address as string,
      collections: null,
    },
  });

  const collectedCollectionsQuery = useQuery<
    CollectedCollectionsData,
    CollectedCollectionsVariables
  >(CollectedCollectionsQuery, {
    variables: {
      address: router.query.address as string,
    },
  });

  const updateSelectedCollections = (collection: string) => {
    const selected = getValues().collections;
    if (selected === null) {
      setValue('collections', [collection]);
    } else {
      if (selected.includes(collection)) {
        setValue(
          'collections',
          selected.filter((c) => c !== collection)
        );
      } else {
        setValue('collections', [...selected, collection]);
      }
    }
  };

  useEffect(() => {
    const subscription = watch(({ listed, collections }) => {
      let variables: CollectionNFTsVariables = {
        offset: 0,
        limit: 24,
        owner: router.query.address as string,
        listed: null,
        collections: collections,
      };
      if (listed === ListedStatus.Listed) {
        variables.listed = true;
      } else if (listed === ListedStatus.Unlisted) {
        variables.listed = false;
      }

      nftsQuery.refetch(variables).then(({ data: { collectedNfts } }) => {
        setHasMore(collectedNfts.length > 0);
      });
      setSelectedCollections(collections);
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
            {collectedCollectionsQuery.loading ? (
              <>
                <CollectedCollectionItem.Skeleton />
                <CollectedCollectionItem.Skeleton />
                <CollectedCollectionItem.Skeleton />
                <CollectedCollectionItem.Skeleton />
                <CollectedCollectionItem.Skeleton />
              </>
            ) : (
              collectedCollectionsQuery.data?.wallet?.collectedCollections.map(
                (collectedCollection) => (
                  <div
                    key={collectedCollection.collection.nft.address}
                    onClick={() =>
                      updateSelectedCollections(collectedCollection.collection.nft.mintAddress)
                    }
                  >
                    <CollectedCollectionItem
                      collectedCollection={collectedCollection}
                      selected={selectedCollections.includes(
                        collectedCollection.collection.nft.mintAddress
                      )}
                    />
                  </div>
                )
              )
            )}
          </div>
        </Sidebar.Panel>
        <Sidebar.Content>
          <List
            expanded={open}
            data={nftsQuery.data?.collectedNfts}
            loading={nftsQuery.loading}
            gap={4}
            hasMore={hasMore}
            grid={{
              [ListGridSize.Default]: [1, 1],
              [ListGridSize.Small]: [2, 1],
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
                data: { collectedNfts },
              } = await nftsQuery.fetchMore({
                variables: {
                  ...nftsQuery.variables,
                  offset: nftsQuery.data?.collectedNfts.length,
                },
              });

              setHasMore(collectedNfts.length > 0);
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

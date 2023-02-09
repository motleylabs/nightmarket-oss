import type { GetServerSidePropsContext } from 'next';
import { WalletProfileQuery, CollectedNFTsQuery } from './../../../queries/profile.graphql';
import ProfileLayout, {
  WalletProfileData,
  WalletProfileVariables,
} from '../../../layouts/ProfileLayout';
import client from './../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AuctionHouse, Wallet } from '../../../graphql.types';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Toolbar } from '../../../components/Toolbar';
import { PillItem, Sidebar } from '../../../components/Sidebar';
import { useTranslation } from 'next-i18next';
import useSidebar from '../../../hooks/sidebar';
import { QueryResult, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Preview } from '../../../components/Nft';
import { List, ListGridSize } from './../../../components/List';
import { Collection } from './../../../components/Collection';
import { Listbox } from '@headlessui/react';
import { Offerable } from '../../../components/Offerable';
import { Buyable } from '../../../components/Buyable';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import config from '../../../app.config';
import BulkListBottomDrawer from '../../../components/BulkListing/BottomDrawer';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, [
    'common',
    'profile',
    'collection',
    'nft',
    'buyable',
  ]);

  const {
    data: { wallet, auctionHouse },
  } = await client.query({
    query: WalletProfileQuery,
    fetchPolicy: 'network-only',
    variables: {
      address: params?.address,
      auctionHouse: config.auctionHouse,
    },
  });

  if (wallet === null || auctionHouse === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      wallet,
      auctionHouse,
      ...i18n,
    },
  };
}

interface CollectionNFTForm {
  collections: (string | undefined)[] | null | undefined;
  listedFilter: string;
}

interface CollectionNFTsData {
  wallet: Wallet;
}

interface CollectionNFTsVariables {
  address: string;
  offset: number;
  limit: number;
  auctionHouse: string;
  collections?: (string | undefined)[] | null | undefined;
}

interface ProfileCollectedPageProps {
  walletProfileClientQuery: QueryResult<WalletProfileData, WalletProfileVariables>;
  auctionHouse: AuctionHouse;
}
export default function ProfileCollected({
  walletProfileClientQuery,
  auctionHouse
}: ProfileCollectedPageProps) {
  const { t } = useTranslation(['collection', 'common']);

  const { watch, control, setValue } = useForm<CollectionNFTForm>({
    defaultValues: {
      collections: [],
    },
  });
  
  const { publicKey } = useWallet();
  const router = useRouter();
  const { open, toggleSidebar } = useSidebar();
  const [hasMore, setHasMore] = useState(true);

  const nftsQuery = useQuery<CollectionNFTsData, CollectionNFTsVariables>(CollectedNFTsQuery, {
    nextFetchPolicy: 'cache-and-network',
    variables: {
      offset: 0,
      limit: 24,
      address: router.query.address as string,
      auctionHouse: config.auctionHouse,
    },
  });

  const collections = watch('collections');

  const pillItems: PillItem[] = useMemo(
    () =>
      collections?.reduce(
        (arr, id) =>
          id
            ? [
                ...arr,
                {
                  key: id,
                  label:
                    walletProfileClientQuery.data?.wallet?.collectedCollections.find(
                      (c) => c.collection?.id === id
                    )?.collection?.name || id,
                },
              ]
            : [...arr],
        [] as PillItem[]
      ) || [],
    [walletProfileClientQuery.data?.wallet?.collectedCollections, collections]
  );

  const onClearPills = useCallback(() => {
    setValue('collections', []);
  }, [setValue]);

  const onRemovePill = useCallback(
    (item: PillItem) =>
      setValue(
        'collections',
        pillItems.filter((c) => c.key !== item.key).map((c) => c.key)
      ),
    [pillItems, setValue]
  );

  useEffect(() => {
    const subscription = watch(({ collections }) => {
      let variables: CollectionNFTsVariables = {
        offset: 0,
        limit: 24,
        address: router.query.address as string,
        auctionHouse: config.auctionHouse,
        collections,
      };

      if (variables?.collections?.length === 0) {
        variables.collections = null;
      }

      nftsQuery.refetch(variables).then(({ data: { wallet } }) => {
        setHasMore(wallet.nfts.length > 0);
      });
    });

    return subscription.unsubscribe;
  }, [watch, router.query.address, nftsQuery]);

  return (
    <>
      <Toolbar>
        <Sidebar.Control
          label={t('filters', { ns: 'collection' })}
          open={open}
          onChange={toggleSidebar}
          disabled={walletProfileClientQuery.data?.wallet?.collectedCollections.length === 0}
        />
      </Toolbar>
      <Sidebar.Page open={open}>
        <Sidebar.Panel
          onChange={toggleSidebar}
          disabled={walletProfileClientQuery.data?.wallet?.collectedCollections.length === 0}
        >
          <div className="mt-4 flex w-full flex-col gap-2">
            {walletProfileClientQuery.loading ? (
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
                      {walletProfileClientQuery.data?.wallet?.collectedCollections.map((cc) => (
                        <Listbox.Option key={cc.collection?.id} value={cc.collection?.id}>
                          {({ selected }) => (
                            <Collection.Option
                              selected={selected}
                              avatar={
                                <Link
                                  className="group relative"
                                  href={`/collections/${cc.collection?.id}/nfts`}
                                >
                                  <Collection.Option.Avatar
                                    src={cc.collection?.image as string}
                                    figure={cc.nftsOwned.toString()}
                                  />
                                  <div className="invisible absolute inset-0 rounded-lg  bg-opacity-40 backdrop-blur-sm group-hover:visible"></div>
                                  <ArrowTopRightOnSquareIcon className="invisible absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 group-hover:visible" />
                                </Link>
                              }
                              header={
                                <Collection.Option.Title>
                                  {cc.collection?.name}
                                </Collection.Option.Title>
                              }
                              floorPrice={cc.collection?.trends?.compactFloor1d}
                            >
                              <Collection.Option.EstimatedValue amount={cc.estimatedValue} />
                            </Collection.Option>
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
          <>
            {pillItems.length > 0 && (
              <Sidebar.Pills items={pillItems} onRemove={onRemovePill} onClear={onClearPills} />
            )}

            <Offerable connected={Boolean(publicKey)}>
              {({ makeOffer }) => (
                <Buyable connected={Boolean(publicKey)}>
                  {({ buyNow }) => (
                    <List
                      expanded={open}
                      data={nftsQuery.data?.wallet.nfts}
                      loading={nftsQuery.loading}
                      gap={6}
                      hasMore={hasMore}
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
                          data: { wallet },
                        } = await nftsQuery.fetchMore({
                          variables: {
                            ...nftsQuery.variables,
                            offset: nftsQuery.data?.wallet.nfts.length,
                          },
                        });

                        setHasMore(wallet.nfts.length > 0);
                      }}
                      render={(nft, i) => (
                        <Preview
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
          </>
        </Sidebar.Content>
      </Sidebar.Page>
      <BulkListBottomDrawer
        ownedNfts={nftsQuery.data?.wallet.nfts}
        auctionHouse={auctionHouse}
        openDrawer={Boolean(collections?.length)} //open bulk drawer if one or more collections are selected
      />
    </>
  );
}

interface CollectionNftsLayout {
  children: ReactElement;
  wallet: Wallet;
  auctionHouse: AuctionHouse;
}

ProfileCollected.getLayout = function ProfileCollectedLayout({
  children,
  wallet,
  auctionHouse,
}: CollectionNftsLayout): JSX.Element {
  return (
    <ProfileLayout wallet={wallet} auctionHouse={auctionHouse}>
      {children}
    </ProfileLayout>
  );
};

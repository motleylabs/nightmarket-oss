import { Listbox } from '@headlessui/react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import useSWR from 'swr';

import BulkListBottomDrawer from '../../components/BulkListing/BottomDrawer';
import { Buyable } from '../../components/Buyable';
import { Preview } from '../../components/Nft';
import { Offerable } from '../../components/Offerable';
import type { PillItem } from '../../components/Sidebar';
import { Sidebar } from '../../components/Sidebar';
import { Toolbar } from '../../components/Toolbar';
import useSidebar from '../../hooks/sidebar';
import { createApiTransport } from '../../infrastructure/api';
import ProfileLayout from '../../layouts/ProfileLayout';
import { useWalletContext } from '../../providers/WalletContextProvider';
import type { UserNfts, Offer, UserOffersData, MiniCollection } from '../../typings';
import { getSolFromLamports } from '../../utils/price';
import { Collection } from './../../components/Collection';
import { List, ListGridSize } from './../../components/List';

export async function getServerSideProps({ locale, params, req }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, [
    'common',
    'profile',
    'collection',
    'nft',
    'buyable',
  ]);

  const api = createApiTransport(req);

  const [{ data: nfts }, { data: offersData }] = await Promise.all([
    api.get<UserNfts>(`/users/nfts?address=${params?.address}`),
    api.get<UserOffersData>(`/users/offers?address=${params?.address}&limit=100&offset=0`),
  ]);

  if (nfts == null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...nfts,
      ...i18n,
      offers: offersData.activities ?? null,
    },
  };
}

type Props = {
  offers: Offer[];
  nfts: UserNfts['nfts'];
  collections: UserNfts['collections'];
};
export default function ProfileCollected({ offers }: Props) {
  const { t } = useTranslation(['collection', 'common']);
  const { query } = useRouter();
  const [showDrawer, setShowDrawer] = useState(false);

  const { data, isValidating } = useSWR<UserNfts>(`/users/nfts?address=${query.address}`);

  const { nfts: nftsData, collections: collectionsData } = data || {};

  const isLoading = !data && isValidating;

  const { watch, control, setValue } = useForm<{ collections: string[] }>({
    defaultValues: {
      collections: [],
    },
  });

  const miniCollection = (projectID: string): MiniCollection | null => {
    const collection = collectionsData?.find((collectionData) => collectionData.id === projectID);
    if (!collection) {
      return null;
    }

    return {
      slug: collection.slug,
      name: collection.name,
      floorPrice: collection.floorPrice,
    };
  };

  const { address } = useWalletContext();
  const { open, toggleSidebar } = useSidebar();
  const selectedCollections = watch('collections');

  const pillItems: PillItem[] = useMemo(
    () =>
      selectedCollections?.reduce(
        (arr, col) =>
          col
            ? [
                ...arr,
                {
                  key: col,
                  label: collectionsData?.find((c) => c.id === col)?.name || col,
                },
              ]
            : [...arr],
        [] as PillItem[]
      ) || [],
    [collectionsData, selectedCollections]
  );

  const onClearPills = useCallback(() => {
    setValue('collections', []);
  }, [setValue]);

  const onRemovePill = useCallback(
    (item: PillItem) =>
      setValue(
        'collections',
        pillItems.filter((p) => p.key !== item.key).map((c) => c.key)
      ),
    [pillItems, setValue]
  );

  useEffect(() => {
    setShowDrawer(Boolean(selectedCollections.length) && address === query.address);
  }, [selectedCollections, address, query.address]);

  return (
    <>
      <Toolbar>
        <Sidebar.Control
          label={t('filters', { ns: 'collection' })}
          open={open}
          onChange={toggleSidebar}
          show={Boolean(collectionsData && collectionsData?.length > 0)}
        />
      </Toolbar>
      <Sidebar.Page open={open}>
        <Sidebar.Panel onChange={toggleSidebar} disabled={collectionsData?.length === 0}>
          <div className="mt-4 flex w-full flex-col gap-2">
            {isLoading ? (
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
                render={({ field: { value, onChange } }) => (
                  <Listbox value={value} onChange={onChange} multiple>
                    <Listbox.Options static>
                      {collectionsData?.map((cc) => (
                        <Listbox.Option key={cc?.id} value={cc?.id}>
                          {({ selected }) => (
                            <Collection.Option
                              selected={selected}
                              avatar={
                                <Link className="group relative" href={`/collections/${cc?.id}`}>
                                  <Collection.Option.Avatar
                                    src={cc?.image as string}
                                    figure={`${cc.nftsOwned}`}
                                  />
                                  <div className="invisible absolute inset-0 rounded-lg  bg-opacity-40 backdrop-blur-sm group-hover:visible"></div>
                                  <ArrowTopRightOnSquareIcon className="invisible absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 group-hover:visible" />
                                </Link>
                              }
                              header={<Collection.Option.Title>{cc?.name}</Collection.Option.Title>}
                              floorPrice={getSolFromLamports(cc.floorPrice, 0, 2)}
                            >
                              <Collection.Option.EstimatedValue
                                amount={getSolFromLamports(cc.estimatedValue, 0, 2)}
                              />
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

            <Offerable connected={Boolean(address)}>
              {({ makeOffer }) => (
                <Buyable connected={Boolean(address)}>
                  {({ buyNow }) => {
                    const filteredNfts = selectedCollections.length
                      ? nftsData?.filter((nft) => selectedCollections.includes(nft.projectId))
                      : nftsData;

                    return (
                      <List
                        expanded={open}
                        data={filteredNfts}
                        loading={isLoading}
                        gap={6}
                        hasMore={false}
                        grid={{
                          [ListGridSize.Default]: [2, 2],
                          [ListGridSize.Small]: [2, 2],
                          [ListGridSize.Medium]: [2, 3],
                          [ListGridSize.Large]: [3, 4],
                          [ListGridSize.ExtraLarge]: [4, 6],
                          [ListGridSize.Jumbo]: [6, 8],
                        }}
                        skeleton={Preview.Skeleton}
                        render={(nft, i) => (
                          <Preview
                            key={`${nft.mintAddress}-${i}`}
                            link={`/nfts/${nft.mintAddress}`}
                            onMakeOffer={() => makeOffer(nft, miniCollection(nft.projectId))}
                            onBuy={() => buyNow(nft, miniCollection(nft.projectId))}
                            nft={nft}
                            offers={offers}
                            onSelect={setShowDrawer}
                          />
                        )}
                      />
                    );
                  }}
                </Buyable>
              )}
            </Offerable>
          </>
        </Sidebar.Content>
      </Sidebar.Page>
      <BulkListBottomDrawer ownedNfts={nftsData} openDrawer={showDrawer} />
    </>
  );
}

interface CollectionNftsLayout {
  children: ReactElement;
  nfts: UserNfts['nfts'];
  collections: UserNfts['collections'];
}

ProfileCollected.getLayout = function ProfileCollectedLayout({
  children,
  ...restProps
}: CollectionNftsLayout): JSX.Element {
  return <ProfileLayout {...restProps}>{children}</ProfileLayout>;
};

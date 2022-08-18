import type { GetServerSidePropsContext } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { CollectionQuery, CollectionNFTsQuery } from './../../../queries/collection.graphql';
import { useForm, Controller } from 'react-hook-form';
import CollectionLayout from '../../../layouts/CollectionLayout';
import client from './../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Collection, Nft } from '../../../types';
import { Toolbar } from '../../../components/Toolbar';
import { Sidebar } from '../../../components/Sidebar';
import { ButtonGroup } from '../../../components/ButtonGroup';
import { useTranslation } from 'next-i18next';
import useSidebar from '../../../hooks/sidebar';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NftCard } from '../../../components/NftCard';
import clsx from 'clsx';

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
}

enum ListedStatus {
  All = 'all',
  Listed = 'listed',
  Unlisted = 'unlisted',
}

interface CollectionNFTForm {
  listed: ListedStatus;
}

export default function CollectionNfts() {
  const { t } = useTranslation(['collection', 'common']);
  const { watch, control } = useForm<CollectionNFTForm>({
    defaultValues: { listed: ListedStatus.All },
  });
  const router = useRouter();
  const { open, toggleSidebar } = useSidebar();
  const [hasMore, setHasMore] = useState(true);

  const nftsQuery = useQuery<CollectionNFTsData, CollectionNFTsVariables>(CollectionNFTsQuery, {
    variables: {
      offset: 0,
      limit: 24,
      listed: null,
      collection: router.query.address as string,
    },
  });

  useEffect(() => {
    const subscription = watch(({ listed }) => {
      let variables: CollectionNFTsVariables = {
        offset: 0,
        limit: 24,
        collection: router.query.address as string,
        listed: null,
      };

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
        <Sidebar.Panel>The sidebar</Sidebar.Panel>
        <Sidebar.Content
          className={clsx(
            'grid grid-cols-1 gap-4 pt-4',
            open
              ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8'
          )}
        >
          {nftsQuery.loading ? (
            <>
              <NftCard.Skeleton />
              <NftCard.Skeleton />
              <NftCard.Skeleton />
              <NftCard.Skeleton />
              <NftCard.Skeleton />
              <NftCard.Skeleton />
              <NftCard.Skeleton />
              <NftCard.Skeleton />
              <NftCard.Skeleton />
              <NftCard.Skeleton />
              <NftCard.Skeleton />
              <NftCard.Skeleton />
            </>
          ) : (
            <>
              {nftsQuery.data?.nfts.map((nft, i) => (
                <Link
                  href={`/nfts/${nft.mintAddress}/details`}
                  key={`${nft.mintAddress}-${i}`}
                  passHref
                >
                  <a>
                    <NftCard nft={nft} />
                  </a>
                </Link>
              ))}
              {hasMore && (
                <>
                  <InView
                    onChange={async (inView) => {
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
                  >
                    <NftCard.Skeleton />
                  </InView>
                  <NftCard.Skeleton className="hidden sm:inline-block" />
                  <NftCard.Skeleton className={clsx('hidden', { 'md:inline-block': !open })} />
                  <NftCard.Skeleton className={clsx('hidden lg:inline-block')} />
                  <NftCard.Skeleton className="hidden xl:inline-block" />
                  <NftCard.Skeleton className={clsx('hidden', { 'xl:inline-block': !open })} />
                </>
              )}
            </>
          )}
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

import type { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { WalletProfileQuery, CreatedNFTsQuery } from './../../../queries/profile.graphql';
import ProfileLayout from '../../../layouts/ProfileLayout';
import client from '../../../client';
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
import clsx from 'clsx';
import { Nft } from '../../../types';

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
}

interface CreatedNftsData {
  createdNfts: Nft[];
}

interface CreatedNFTsVariables {
  offset: number;
  limit: number;
  listed: boolean | null;
  creator: string;
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

  useEffect(() => {
    const subscription = watch(({ listed }) => {
      let variables: CreatedNFTsVariables = {
        offset: 0,
        limit: 24,
        creator: router.query.address as string,
        listed: null,
      };

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
        <Sidebar.Panel>The sidebar</Sidebar.Panel>
        <Sidebar.Content
          className={clsx(
            'grid grid-cols-1 gap-4 pt-4',
            open
              ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
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
              <NftCard.Skeleton className={clsx('hidden', { '2xl:inline-block': !open })} />
              <NftCard.Skeleton className={clsx('hidden', { '2xl:inline-block': !open })} />
              <NftCard.Skeleton className={clsx('hidden', { '2xl:inline-block': !open })} />
              <NftCard.Skeleton className={clsx('hidden', { '2xl:inline-block': !open })} />
            </>
          ) : (
            <>
              {nftsQuery.data?.createdNfts.map((nft, i) => (
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
                        data: { createdNfts },
                      } = await nftsQuery.fetchMore({
                        variables: {
                          ...nftsQuery.variables,
                          offset: nftsQuery.data?.createdNfts.length,
                        },
                      });

                      setHasMore(createdNfts.length > 0);
                    }}
                  >
                    <NftCard.Skeleton />
                  </InView>
                  <NftCard.Skeleton className="hidden sm:inline-block" />
                  <NftCard.Skeleton className={clsx('hidden', { 'md:inline-block': !open })} />
                  <NftCard.Skeleton className={clsx('hidden lg:inline-block')} />
                  <NftCard.Skeleton className="hidden xl:inline-block" />
                  <NftCard.Skeleton className={clsx('hidden', { 'xl:inline-block': !open })} />
                  <NftCard.Skeleton className={clsx('hidden 2xl:inline-block')} />
                  <NftCard.Skeleton className={clsx('hidden 2xl:inline-block')} />
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
  wallet: Wallet;
}

ProfileCollected.getLayout = function ProfileCollectedLayout({
  children,
  wallet,
}: CollectionNftsLayout): JSX.Element {
  return <ProfileLayout wallet={wallet}>{children}</ProfileLayout>;
};

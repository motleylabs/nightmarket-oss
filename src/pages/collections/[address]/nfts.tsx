import type { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { ReactElement } from 'react';
import { CollectionQuery, CollectionNFTsQuery } from './../../../queries/collection.graphql';
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

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'collection']);

  const {
    data: { collection },
  } = await client.query({
    query: CollectionQuery,
    variables: {
      address: params?.address,
    },
  });

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
  nfts: Nft[]
}

interface CollectionNFTsVariables {
  offset: number;
  limit: number;
  collection: string;
}

export default function CollectionNfts() {
  const { t } = useTranslation(['collection', 'common']);
  const router = useRouter();
  const { open, toggleSidebar } = useSidebar();

  const nftsQuery = useQuery<CollectionNFTsData, CollectionNFTsVariables>(
    CollectionNFTsQuery,
    { 
      variables: {
        offset: 0,
        limit: 18,
        collection: router.query.address as string
      }
    });

  return (
    <>
      <Toolbar>
        <Sidebar.Control open={open} onChange={toggleSidebar} />
        <ButtonGroup value="all" onChange={(s) => {}}>
          <ButtonGroup.Option value="all">{t('all')}</ButtonGroup.Option>
          <ButtonGroup.Option value="listed">{t('listed')}</ButtonGroup.Option>
          <ButtonGroup.Option value="unlisted">{t('unlisted')}</ButtonGroup.Option>
        </ButtonGroup>
      </Toolbar>
      <Sidebar.Page open={open}>
        <Sidebar.Panel>The sidebar</Sidebar.Panel>
        <Sidebar.Content>The page content</Sidebar.Content>
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

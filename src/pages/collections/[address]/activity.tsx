import type { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { ReactElement } from 'react';
import CollectionActivitiesQuery from './../../../queries/collection.graphql';
import CollectionLayout from '../../../layouts/CollectionLayout';
import client from '../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Collection } from '../../../types';
import { Toolbar } from '../../../components/Toolbar';
import { ButtonGroup } from '../../../components/ButtonGroup';
import { useTranslation } from 'next-i18next';
import clsx from 'clsx';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'collection']);

  const {
    data: { collection },
  } = await client.query({
    query: CollectionActivitiesQuery,
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

function Table({ children }: { children: ReactElement }): JSX.Element {
  return <div className="flex flex-col px-8">{children}</div>;
}

function Header({ children }: { children: ReactElement }): JSX.Element {
  return <div className="mb-2 grid grid-cols-8">{children}</div>;
}

Table.Header = Header;

function HeaderItem({ name, className }: { name: string; className?: string }): JSX.Element {
  return <span className={clsx('text-base text-gray-300', className)}>{name}</span>;
}

Table.HeaderItem = HeaderItem;

export default function CollectionNfts() {
  const { t } = useTranslation(['collection', 'common']);

  return (
    <>
      <Toolbar>
        <div className="text-base text-white">Activity</div>
        <ButtonGroup value="all" onChange={(s) => {}}>
          <ButtonGroup.Option value="all">{t('all')}</ButtonGroup.Option>
          <ButtonGroup.Option value="listings">{t('listings')}</ButtonGroup.Option>
          <ButtonGroup.Option value="offers">{t('offers')}</ButtonGroup.Option>
          <ButtonGroup.Option value="sales">{t('sales')}</ButtonGroup.Option>
        </ButtonGroup>
      </Toolbar>
      <Table>
        <Table.Header>
          <>
            <Table.HeaderItem name="Item" className="col-span-2" />
            <Table.HeaderItem name="Event" />
            <Table.HeaderItem name="Marketplace" />
            <Table.HeaderItem name="Parties" className="col-span-2 flex justify-center" />
            <Table.HeaderItem name="Amount" />
            <Table.HeaderItem name="Date" className="flex justify-end" />
          </>
        </Table.Header>
      </Table>
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

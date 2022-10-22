import { ReactElement } from 'react';
import CollectionLayout from '../../../layouts/CollectionLayout';
import { Collection, NftCreator } from '../../../graphql.types';
import { CollectionQuery } from './../../../queries/collection.graphql';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import client from '../../../client';

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

export default function CollectionAboutPage(props: { collection: Collection }) {
  const { t } = useTranslation(['collection', 'common']);

  return (
    <div className="  py-6 px-10 text-white">
      <section className="space-y-4">
        <h2 className="font-semibold">{t('descriptionTitle')}</h2>
        <p className="text-gray-300">{props.collection.description}</p>
      </section>
      <div className="my-6 border border-gray-800" />
      <section className="space-y-4">
        <h2 className="font-semibold">{t('creatorsTitle')}</h2>
        {/* TODO: Add creators when available in api*/}
        {/* <div>
          {props.collection.nft.creators.map((c) => (
            <CreatorRow key={c.address} creator={c} />
          ))}
        </div> */}
      </section>
    </div>
  );
}

function CreatorRow(props: { creator: NftCreator }) {
  const { t } = useTranslation(['collection', 'common']);

  return (
    <div className="flex w-full items-center">
      <img
        className="h-8 w-8 rounded-full"
        src={props.creator.previewImage as string}
        alt="creator profile picture"
      />
      <div className="ml-4 text-base font-medium">{props.creator.displayName}</div>
    </div>
  );
}

interface CollectionAboutPageLayout {
  children: ReactElement;
  collection: Collection;
}

CollectionAboutPage.getLayout = function CollectionNftsLayout({
  children,
  collection,
}: CollectionAboutPageLayout): JSX.Element {
  return <CollectionLayout collection={collection}>{children}</CollectionLayout>;
};

import type { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { ReactElement } from 'react';
import CollectionQuery from './../../../queries/collection.graphql';
import CollectionLayout from '../../../layouts/CollectionLayout';
import client from './../../../client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Collection } from '../../../types';
import { Toolbar } from '../../../components/Toolbar';
import { Sidebar } from '../../../components/Sidebar';
import { ButtonGroup } from '../../../components/ButtonGroup';
import { useTranslation } from 'next-i18next';
import useSidebar from '../../../hooks/sidebar';
import { getCollectionServerSideProps } from '../../../modules/collections';
import { shortenAddress } from '../../../modules/address';

export const getServerSideProps = getCollectionServerSideProps;

// export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
//   const i18n = await serverSideTranslations(locale as string, ['common', 'collection']);

//   const {
//     data: { collection },
//   } = await client.query({
//     query: CollectionQuery,
//     variables: {
//       address: params?.address,
//     },
//   });

//   if (collection === null) {
//     return {
//       notFound: true,
//     };
//   }

//   return {
//     props: {
//       collection,
//       ...i18n,
//     },
//   };
// }

export default function CollectionAboutPage(props: { collection: Collection }) {
  const { t } = useTranslation(['collection', 'common']);

  return (
    <div className="  py-6 px-10 text-white">
      <section>
        <strong className="mb-4">{t('aboutPage.collectionDescription')}</strong>
        <p className="text-gray-300">{props.collection.nft.description}</p>
      </section>
      <div className="my-6 border border-gray-800" />
      <section className="">
        <strong className="mb-4">{t('aboutPage.creators')}</strong>
        <div>
          {props.collection.nft.creators.map((c) => (
            <div key={c.address} className="flex">
              <div>img</div>
              <div className="ml-4">{c.twitterHandle || shortenAddress(c.address)}</div>
              <button className="ml-auto">Follow</button>
            </div>
          ))}
        </div>
      </section>
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

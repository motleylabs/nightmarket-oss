import type { NextPage, GetStaticPropsContext } from 'next'
import { ReactElement } from 'react';

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      locales: (await import(`./../../../../locales/${locale}.json`)).default
    }
  };
}

function CollectionNfts() {

}

interface CollectionNftsLayout {
  children: ReactElement
}
CollectionNfts.getLayout = function CollectionNftsLayout({ children }: NextPage) {
  return <OverviewLayout>{children}</OverviewLayout>
}

export default CollectionNfts
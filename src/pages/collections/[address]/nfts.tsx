import type { GetStaticPropsContext } from 'next'
import { ReactElement } from 'react'
import OverviewLayout from '../../../layouts/OverviewLayout'

export default function CollectionNfts() {
  return <div />
}

interface CollectionNftsLayout {
  children: ReactElement
}

CollectionNfts.getLayout = function CollectionNftsLayout({ children }: CollectionNftsLayout) {
  return <OverviewLayout>{children}</OverviewLayout>
}
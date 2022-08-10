import { ReactElement } from "react"
import { Collection } from "../types"
import { PlusIcon, DownloadIcon, RefreshIcon } from "@heroicons/react/outline"
import { useTranslation } from 'next-i18next'
import Tab from './../components/Tab'
import Button, { ButtonSize, ButtonType } from "../components/Button"
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from "next/router"

interface CollectionLayoutProps {
  children: ReactElement
  collection: Collection
}

function CollectionLayout({ children, collection }: CollectionLayoutProps) {
  const { t } = useTranslation(['collection', 'common'])

  const address = collection.nft.mintAddress

  return (
    <>
      <Head>
        <title>{t('metadata.title', { name: collection.nft.name })}</title>
        <meta name="description" content={collection.nft.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mt-8 md:mt-12">
        <section className="flex flex-col lg:flex-row justify-center md:justify-between items-center md:items-start px-4 md:px-8">
          <div className="flex flex-col items-center md:flex-row md:items-end gap-4 md:gap-6">
            <img src={collection.nft.image} className="inline-block h-36 w-36 rounded-lg border-4 border-gray-900 shadow-xl" />
            <div className="flex flex-col items-center md:items-start gap-8">
              <h1 className="text-5xl text-white">{collection.nft.name}</h1>
              <div className="flex flex-col items-center md:flex-row md:items-center gap-2">
                <div className="flex flex-row gap-2">
                  <Button icon={<PlusIcon width={14} height={14} />} size={ButtonSize.Small}>{t('follow', { ns: 'common' })}</Button>
                  <Button circle icon={<DownloadIcon width={14} height={14} />} size={ButtonSize.Small} type={ButtonType.Secondary} />
                </div>
                <ul className="md:border-l md:border-gray-800 flex flex-row gap-4 mt-4 md:mt-0 items-center md:pl-4 md:ml-2">
                  <li className="flex gap-2 text-white">{collection.nftCount}<span className="text-gray-300">{t('supply')}</span></li>
                  <li className="flex gap-2 text-white">{collection.listedCount}<span className="text-gray-300">{t('listings')}</span></li>
                  <li className="flex gap-2 text-white">{collection.holderCount}<span className="text-gray-300">{t('holders')}</span></li>
                </ul>
              </div>
            </div>
          </div>
          <aside className="flex flex-row gap-8 rounded-lg flex-none mt-4 lg:mt-0 bg-gray-800 p-4 text-white">
            <div className="flex flex-col gap-4">
              <span className="text-gray-300">{t('floor')}</span>
              <span className="text-xl">{collection.floorPrice} SOL</span>
              <span>$3,792.46</span>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-gray-300">{t('volume')}</span>
              <span className="text-xl">{collection.totalVolume} SOL</span>
              <span>$77,480,462.15</span>
            </div>
            <div className="flex flex-col justify-between">
              <Button circle icon={<RefreshIcon width={14} height={14} className="stroke-gray-300" />} size={ButtonSize.Small} type={ButtonType.Secondary} />
            </div>
          </aside>
        </section>
        <nav className="flex flex-row justify-center md:justify-start sm:ml-4 md:ml-8 mt-10">
          <Tab
            href={`/collections/${address}/nfts`}
          >
            {t('nfts')}
            <span className="hidden md:line-block mr-1">{collection.nftCount}</span>
          </Tab>
          <Tab href={`/collections/${address}/activity`}>
            {t('activity')}
          </Tab>
          <Tab href={`/collections/${address}/analytics`}>
            {t('analytics')}
          </Tab>
          <Tab href={`/collections/${address}/about`}>
            {t('about')}
          </Tab>
        </nav>
        <div className="h-[1px] -mt-[1px] -z-10 bg-gray-800" />
        {children}
      </main>
    </>
  )
}

export default CollectionLayout
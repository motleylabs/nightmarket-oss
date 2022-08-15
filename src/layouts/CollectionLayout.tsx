import { ReactElement } from 'react';
import { Collection } from '../types';
import { PlusIcon, DownloadIcon, RefreshIcon } from '@heroicons/react/outline';
import { useTranslation } from 'next-i18next';
import { Overview } from './../components/Overview';
import Button, { ButtonSize, ButtonType } from '../components/Button';
import Head from 'next/head';

interface CollectionLayoutProps {
  children: ReactElement;
  collection: Collection;
}

function CollectionLayout({ children, collection }: CollectionLayoutProps): JSX.Element {
  const { t } = useTranslation(['collection', 'common']);

  const address = collection.nft.mintAddress;

  return (
    <>
      <Head>
        <title>{t('metadata.title', { name: collection.nft.name })}</title>
        <meta name="description" content={collection.nft.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Overview>
        <Overview.Hero>
          <Overview.Info
            avatar={<Overview.Avatar src={collection.nft.image} />}
            title={<Overview.Title>{collection.nft.name}</Overview.Title>}
          >
            <Overview.Actions>
              <Button icon={<PlusIcon width={14} height={14} />} size={ButtonSize.Small}>
                {t('follow', { ns: 'common' })}
              </Button>
              <Button
                circle
                icon={<DownloadIcon width={14} height={14} />}
                size={ButtonSize.Small}
                type={ButtonType.Secondary}
              />
            </Overview.Actions>
            <Overview.Figures>
              <Overview.Figure figure={collection.nftCount} label={t('supply')} />
              <Overview.Figure figure={collection.listedCount} label={t('listings')} />
              <Overview.Figure figure={collection.holderCount} label={t('holders')} />
            </Overview.Figures>
          </Overview.Info>
          <Overview.Aside>
            <div className="flex flex-col gap-4 md:gap-6 xl:gap-4">
              <span className="text-gray-300">{t('floor')}</span>
              <span className="text-xl md:text-lg lg:text-xl">{collection.floorPrice} SOL</span>
              <span>$3,792.46</span>
            </div>
            <div className="flex flex-col gap-4 md:gap-6 xl:gap-4">
              <span className="text-gray-300">{t('volume')}</span>
              <span className="text-xl md:text-lg lg:text-xl">{collection.totalVolume} SOL</span>
              <span>$77,480,462.15</span>
            </div>
            <div className="flex flex-col justify-between">
              <Button
                circle
                icon={<RefreshIcon width={14} height={14} className="stroke-gray-300" />}
                size={ButtonSize.Small}
                type={ButtonType.Secondary}
              />
            </div>
          </Overview.Aside>
        </Overview.Hero>
        <Overview.Tabs>
          <Overview.Tab href={`/collections/${address}/nfts`}>{t('nfts')}</Overview.Tab>
          <Overview.Tab href={`/collections/${address}/activity`}>{t('activity')}</Overview.Tab>
          <Overview.Tab href={`/collections/${address}/analytics`}>{t('analytics')}</Overview.Tab>
          <Overview.Tab href={`/collections/${address}/about`}>{t('about')}</Overview.Tab>
        </Overview.Tabs>
        <Overview.Divider />
        {children}
      </Overview>
    </>
  );
}

export default CollectionLayout;

import { ReactElement, ReactNode } from 'react';
import Head from 'next/head';
import { Collection } from '../graphql.types';
import { ArrowUpTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { Overview } from './../components/Overview';
import Button, { ButtonSize, ButtonType } from '../components/Button';
import { useCurrencies } from '../hooks/currencies';
import clsx from 'clsx';
import config from '../app.config';
import Share from '../components/Share';
import { useRouter } from 'next/router';
import Icon from '../components/Icon';

interface CollectionLayoutProps {
  children: ReactElement;
  collection: Collection;
}

function CollectionFigure(props: { label: string; children: ReactNode }) {
  return (
    <div className="text-center">
      <div className="text-sm font-medium text-gray-300">{props.label}</div>
      <div className="flex items-center justify-center font-semibold ">{props.children}</div>
    </div>
  );
}

function CollectionLayout({ children, collection }: CollectionLayoutProps): JSX.Element {
  const { t } = useTranslation(['collection', 'common']);
  const { initialized: currenciesReady, solToUsdString } = useCurrencies();
  const address = collection.nft.mintAddress;
  const router = useRouter();

  const loading = !currenciesReady;
  return (
    <>
      <Head>
        <title>{t('metadata.title', { name: collection.nft.name })}</title>
        <meta name="description" content={collection.nft.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Overview>
        <div className="mx-4 mb-10 flex flex-col items-center justify-center text-white md:mx-10 md:flex-row md:items-start md:justify-start">
          <div className="mb-4 flex flex-shrink-0 rounded-lg border-8 border-gray-900 md:mb-0">
            <img
              src={collection.nft.image}
              className={clsx('inline-block h-36 w-36  rounded-md shadow-xl md:h-36 md:w-36')}
              alt="overview avatar"
            />
          </div>

          <div className="mb-10 space-y-4 md:ml-10 md:mb-0">
            <Overview.Title>{collection.nft.name}</Overview.Title>
            <p className={clsx('max-w-sm text-center text-white md:text-left ', 'line-clamp-3')}>
              {collection.nft.description}
            </p>
          </div>

          <div className=" grid w-full max-w-md grid-cols-3 grid-rows-2 gap-4 rounded-2xl bg-gray-800 p-6 md:ml-auto">
            <CollectionFigure label="Floor price">
              <Icon.Sol noGradient /> {collection.compactFloorPrice}
            </CollectionFigure>
            <CollectionFigure label="30 Day Volume">
              <Icon.Sol /> {collection.compactVolumeTotal}
            </CollectionFigure>
            <CollectionFigure label="Est. Marketcap">$XXX</CollectionFigure>
            <CollectionFigure label="Listings">{collection.listedCount}</CollectionFigure>
            <CollectionFigure label="Holders">{collection.holderCount}</CollectionFigure>
            <CollectionFigure label="Supply">{collection.compactNftCount}</CollectionFigure>
          </div>
        </div>
        <Overview.Tabs>
          <Overview.Tab
            label={t('nfts')}
            href={`/collections/${address}/nfts`}
            active={router.pathname.includes('nfts')}
          />
          <Overview.Tab
            label="Activity"
            href={`/collections/${address}/activity`}
            active={router.pathname.includes('activity')}
          />
          <Overview.Tab
            label={t('analytics')}
            href={`/collections/${address}/analytics`}
            active={router.pathname.includes('analytics')}
          />
        </Overview.Tabs>
        {children}
      </Overview>
    </>
  );
}

export default CollectionLayout;

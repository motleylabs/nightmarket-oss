import { ReactElement, ReactNode } from 'react';
import Head from 'next/head';
import { Collection } from '../graphql.types';
import { useTranslation } from 'next-i18next';
import { Overview } from './../components/Overview';
import { useCurrencies } from '../hooks/currencies';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import Icon from '../components/Icon';
import { Chart } from '../components/Chart';

interface CollectionLayoutProps {
  children: ReactElement;
  collection: Collection;
}

function CollectionFigure(props: { label: string; children: ReactNode }) {
  return (
    <div className="text-center">
      <div className="truncate text-sm text-gray-300">{props.label}</div>
      <div className="flex items-center justify-center font-semibold">{props.children}</div>
    </div>
  );
}

function CollectionLayout({ children, collection }: CollectionLayoutProps): JSX.Element {
  const { t } = useTranslation(['collection', 'common']);
  const { initialized: currenciesReady, solToUsdString } = useCurrencies();
  const address = collection.verifiedCollectionAddress;
  const router = useRouter();

  const loading = !currenciesReady;
  return (
    <>
      <Head>
        <title>{t('metadata.title', { name: collection.name })}</title>
        <meta name="description" content={collection.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Overview>
        <div className="mx-4 mb-12 flex flex-col items-center justify-center gap-10 text-white md:mx-10 lg:flex-row lg:items-start lg:justify-between">
          {/* Image, [Title, Description] */}
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start xl:gap-10">
            <div className="flex flex-shrink-0 rounded-lg border-8 border-gray-900">
              <img
                src={collection.image}
                className="inline-block h-36 w-36 rounded-md shadow-xl md:h-36 md:w-36"
                alt="overview avatar"
              />
            </div>
            <div className="space-y-4">
              <Overview.Title>{collection.name}</Overview.Title>
              <p
                className={clsx(
                  'max-w-sm text-center text-gray-300 md:text-left',
                  'line-clamp-2 md:line-clamp-4'
                )}
              >
                {collection.description}
              </p>
            </div>
          </div>

          {/* [Charts], Data */}
          <div className="flex w-full flex-col-reverse items-center justify-center gap-4 md:w-min md:flex-row md:items-start md:justify-start">
            <div className="flex w-full gap-4 md:w-min">
              <Chart.Preview
                className="h-40 w-full md:w-36 xl:w-40"
                title={t('floorPrice')}
                dateRange={t('timeInterval.day')}
                chart={
                  <Chart.TinyLineChart
                    data={Array.from({ length: 10 }, (v, i) => ({
                      label: i > 5 ? i - 5 : i,
                      price: Math.floor(Math.random() * 40) + 10,
                    }))}
                  />
                }
              />
              <Chart.Preview
                className="h-40 w-full md:w-36 xl:w-40"
                title={t('listings')}
                dateRange={t('timeInterval.day')}
                chart={
                  <Chart.TinyLineChart
                    data={Array.from({ length: 10 }, (v, i) => ({
                      label: i > 5 ? i - 5 : i,
                      price: Math.floor(Math.random() * 40) + 10,
                    }))}
                  />
                }
              />
            </div>
            <div className="grid h-40 w-full grid-cols-3 grid-rows-2 gap-4 rounded-2xl bg-gray-800 p-6 md:ml-auto md:w-80 xl:w-96">
              <CollectionFigure label="Floor price">
                <Icon.Sol /> {collection.compactFloorPrice}
              </CollectionFigure>
              <CollectionFigure label="30 Day Volume">
                <Icon.Sol /> {collection.compactVolumeTotal}
              </CollectionFigure>
              <CollectionFigure label="Est. Marketcap">$XXX</CollectionFigure>
              {/* TODO: Add listedCount when available in api */}
              {/* <CollectionFigure label="Listings">{collection.listedCount}</CollectionFigure> */}
              <CollectionFigure label="Holders">{collection.holderCount}</CollectionFigure>
              <CollectionFigure label="Supply">{collection.compactNftCount}</CollectionFigure>
            </div>
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

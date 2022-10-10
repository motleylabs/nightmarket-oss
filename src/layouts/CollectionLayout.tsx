import { ReactElement } from 'react';
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

function CollectionFigure(props) {
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
        <div className="mx-4  mb-10 flex flex-col  items-center justify-center text-white md:flex-row md:items-start md:justify-start">
          <div className="mb-4 flex flex-shrink-0 rounded-lg border-8 border-gray-900 md:mb-0">
            <img
              src={collection.nft.image}
              className={clsx('inline-block h-36 w-36  shadow-xl md:h-36 md:w-36', 'rounded-md  ')}
              alt="overview avatar"
            />
          </div>

          <div className="mb-10 space-y-4 md:ml-10 md:mb-0 ">
            <Overview.Title>{collection.nft.name}</Overview.Title>
            <p
              className={clsx(
                'max-w-sm text-center text-white md:text-left ',
                'line-clamp-3' // fill in later
              )}
            >
              {collection.nft.description}
            </p>
          </div>

          <div className=" grid w-full max-w-md grid-cols-3 grid-rows-2 gap-4 rounded-2xl bg-gray-800 p-6 md:ml-auto">
            <CollectionFigure label="Floor price">
              <Icon.Sol noGradient /> 80
            </CollectionFigure>
            <CollectionFigure label="30 Day Volume">
              <Icon.Sol /> 97.2K
            </CollectionFigure>
            <CollectionFigure label="Est. Marketcap">$8.1M</CollectionFigure>
            <CollectionFigure label="Listings">43</CollectionFigure>
            <CollectionFigure label="Holders">176</CollectionFigure>
            <CollectionFigure label="Supply">5.5K</CollectionFigure>
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
        <Overview.Hero>
          <Overview.Info
            avatar={<Overview.Avatar src={collection.nft.image} />}
            title={<Overview.Title>{collection.nft.name}</Overview.Title>}
          >
            <div>
              <p className="max-w-sm text-white ">{collection.nft.description}</p>
            </div>
            <Overview.Actions>
              <Share
                address={address}
                twitterParams={{
                  text: t('twitterShareText'),
                  hashtags: ['nightmarket'],
                  url: `${config.baseUrl}/collections/${address}`,
                }}
              />
            </Overview.Actions>
            <Overview.Figures>
              <Overview.Figure figure={collection.nftCount} label={t('supply')} />
              <Overview.Figure figure={collection.listedCount} label={t('listings')} />
              <Overview.Figure figure={collection.holderCount} label={t('holders')} />
            </Overview.Figures>
          </Overview.Info>
          <Overview.Aside>
            <div className="flex flex-col gap-4  md:gap-6 xl:gap-4 ">
              <span className="text-gray-300">{t('floor')}</span>
              <span className="text-xl md:text-lg lg:text-xl">
                {collection.compactFloorPrice} SOL
              </span>
              <span className={clsx({ 'h-4 w-full rounded-sm bg-gray-800 transition': loading })}>
                {currenciesReady && solToUsdString(collection.floorPrice)}
              </span>
            </div>
            <div className="flex flex-col gap-4 md:gap-6 xl:gap-4">
              <span className="text-gray-300">{t('volume')}</span>
              <span className="text-xl md:text-lg lg:text-xl">
                {collection.compactVolumeTotal} SOL
              </span>
              <span className={clsx({ 'h-4 w-full rounded-sm bg-gray-800 transition': loading })}>
                {currenciesReady && solToUsdString(collection.volumeTotal)}
              </span>
            </div>
            <div className="flex flex-col justify-between">
              <Button
                circle
                icon={<ArrowPathIcon width={14} height={14} className="stroke-gray-300" />}
                size={ButtonSize.Small}
                type={ButtonType.Tertiary}
              />
            </div>
          </Overview.Aside>
        </Overview.Hero>
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
        <Overview.Divider />
        {children}
      </Overview>
    </>
  );
}

export default CollectionLayout;

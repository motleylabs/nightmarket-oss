import { cloneElement, ReactElement, useMemo } from 'react';
import { Wallet } from '../graphql.types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { WalletProfileClientQuery } from './../queries/profile.graphql';
import { useTranslation } from 'next-i18next';
import { Overview } from './../components/Overview';

import Button, { ButtonSize, ButtonType } from '../components/Button';
import Head from 'next/head';
import Share from '../components/Share';
import config from '../app.config';
import { useQuery } from '@apollo/client';
import { useCurrencies } from '../hooks/currencies';
import clsx from 'clsx';
import Icon from '../components/Icon';

export interface WalletProfileData {
  wallet: Wallet;
}

export interface WalletProfileVariables {
  address: string;
}

interface ProfileLayout {
  children: ReactElement;
  wallet: Wallet;
}

function ProfileLayout({ children, wallet }: ProfileLayout): JSX.Element {
  const { t } = useTranslation(['profile', 'common']);
  const address = wallet.address;

  const { initialized: currenciesReady, solToUsdString } = useCurrencies();

  const walletProfileClientQuery = useQuery<WalletProfileData, WalletProfileVariables>(
    WalletProfileClientQuery,
    {
      variables: {
        address: address as string,
      },
    }
  );

  const loading = !currenciesReady || walletProfileClientQuery.loading;

  const portfolioValue = useMemo(() => {
    const total = walletProfileClientQuery.data?.wallet.collectedCollections.reduce(
      (total, current) => total + Number.parseFloat(current.estimatedValue),
      0
    );

    if (!total) {
      return undefined;
    }

    const multiplier = Math.pow(10, 2);
    return Math.round((total * multiplier) / multiplier);
  }, [walletProfileClientQuery.data?.wallet.collectedCollections]);

  return (
    <>
      <Head>
        <title>{t('metadata.title', { name: wallet.displayName })}</title>
        <meta
          name="description"
          content={t('metadata.description', { name: wallet.displayName })}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Overview>
        <Overview.Hero>
          <Overview.Info
            avatar={<Overview.Avatar src={wallet.previewImage as string} circle />}
            title={<Overview.Title>{wallet.displayName}</Overview.Title>}
          >
            <Overview.Actions>
              <Share
                address={address}
                twitterParams={{
                  text: t('twitterShareText'),
                  hashtags: ['nightmarket'],
                  url: `${config.baseUrl}/profiles/${address}`,
                }}
              />
            </Overview.Actions>
            <Overview.Figures>
              <Overview.Figure figure={wallet.compactCreatedCount} label={t('created')} />
              <Overview.Figure figure={wallet.compactOwnedCount} label={t('collected')} />
            </Overview.Figures>
          </Overview.Info>
          <Overview.Aside>
            <div className="flex flex-col gap-4 md:gap-6 xl:gap-4">
              <span className="text-gray-300">{t('portfolioValue')}</span>
              {loading ? (
                <span
                  className={clsx('h-7 w-20 animate-pulse rounded-md bg-gray-800 transition')}
                />
              ) : (
                <span className={clsx('text-xl md:text-lg lg:text-xl')}>
                  {currenciesReady && portfolioValue && solToUsdString(portfolioValue)}
                </span>
              )}
              {loading ? (
                <span
                  className={clsx('h-4 w-20 animate-pulse rounded-md bg-gray-800 transition')}
                />
              ) : (
                <span>
                  {portfolioValue} <Icon.Sol />
                </span>
              )}
            </div>
            <div className="flex flex-col justify-between">
              <Button
                circle
                icon={<ArrowPathIcon width={14} height={14} className="stroke-gray-300" />}
                size={ButtonSize.Small}
                type={ButtonType.Secondary}
              />
            </div>
          </Overview.Aside>
        </Overview.Hero>
        <Overview.Tabs>
          <Overview.Tab href={`/profiles/${address}/collected`}>{t('collected')}</Overview.Tab>
          <Overview.Tab href={`/profiles/${address}/created`}>{t('created')}</Overview.Tab>
          <Overview.Tab href={`/profiles/${address}/activity`}>{t('activity')}</Overview.Tab>
          <Overview.Tab href={`/profiles/${address}/analytics`}>{t('analytics')}</Overview.Tab>
        </Overview.Tabs>
        <Overview.Divider />
        {cloneElement(children, { walletProfileClientQuery })}
      </Overview>
    </>
  );
}

export default ProfileLayout;

import { cloneElement, ReactElement, useCallback, useMemo, useState } from 'react';
import { Wallet } from '../graphql.types';
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';
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
import { shortenAddress } from '../modules/address';
import useClipboard from '../hooks/clipboard';

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

function ProfileFigure(props: { figure: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold">{props.figure}</span>
      <div className="">{props.label}</div>
    </div>
  );
}

function ProfileLayout({ children, wallet }: ProfileLayout): JSX.Element {
  const { t } = useTranslation(['profile', 'common']);
  const address = wallet.address;

  const { copied, copyText } = useClipboard(address);
  const { initialized: currenciesReady, solToUsdString } = useCurrencies();

  const walletProfileClientQuery = useQuery<WalletProfileData, WalletProfileVariables>(
    WalletProfileClientQuery,
    {
      variables: {
        address: address as string,
      },
    }
  );

  const portfolioValue = useMemo(() => {
    const total = walletProfileClientQuery.data?.wallet.collectedCollections.reduce(
      (total, current) => total + Number.parseFloat(current.estimatedValue),
      0
    );

    if (!total) {
      return 0;
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
      <section className="flex flex-col gap-8 pt-20">
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row  md:gap-6">
          <Overview.Avatar src={wallet.previewImage as string} circle />
          <div className="flex flex-col items-center gap-6 md:items-start">
            <h1 className=" text-center text-3xl text-white md:text-left md:text-5xl">
              {wallet.displayName}
            </h1>
            <div className="flex flex-col items-center gap-2 md:flex-row md:items-center">
              <Overview.Figure figure={wallet.compactCreatedCount} label={'Created'} />
              <Overview.Figure figure={wallet.compactOwnedCount} label={'Collected'} />
              {/* <Overview.Figure figure={wallet.compactFollowerCount} label={'Followers'} /> */}
              {/* <Overview.Figure figure={wallet.compactFollowingCount} label={'Following'} />  */}

              <Overview.Actions>
                {/* <Button>Follow</Button> */}
                <Share
                  address={address}
                  twitterParams={{
                    text: t('twitterShareText'),
                    hashtags: ['nightmarket'],
                    url: `${config.baseUrl}/profiles/${address}`,
                  }}
                />
              </Overview.Actions>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-6 text-white">
          <div className="group flex cursor-pointer gap-2 rounded-full border border-white py-1 px-2 text-xs">
            {shortenAddress(wallet.address)}
            <button
              onClick={copyText}
              className="ml-auto flex cursor-pointer items-center text-base duration-200 ease-in-out group-hover:scale-110 "
            >
              {copied ? <CheckIcon className="h-4 w-4 " /> : <Icon.Copy className="h-4 w-4" />}
            </button>
          </div>

          <a href={'https://twitter.com/' + wallet.displayName} target="_blank" rel="noreferrer">
            <div className="flex cursor-pointer gap-2 rounded-full border border-white py-1 px-2 text-xs">
              <Icon.Twitter className="h-4 w-4" />
              {wallet.displayName}
            </div>
          </a>
        </div>
        <div className="flex justify-center gap-10 text-white">
          <ProfileFigure
            figure={(currenciesReady && portfolioValue && solToUsdString(portfolioValue)) || '0'}
            label="Portfolio value"
          />
          <ProfileFigure figure="79" label="Total NFTs" />
          <ProfileFigure figure="23" label="Listed NFTs" />
          <ProfileFigure figure="56" label="Unlisted NFTs" />
        </div>
      </section>
      <Overview.Tabs>
        <Overview.Tab href={`/profiles/${address}/collected`}>{t('collected')}</Overview.Tab>
        {/* <Overview.Tab href={`/profiles/${address}/created`}>{t('created')}</Overview.Tab> */}
        <Overview.Tab href={`/profiles/${address}/activity`}>{t('activity')}</Overview.Tab>
        <Overview.Tab href={`/profiles/${address}/analytics`}>{t('analytics')}</Overview.Tab>
      </Overview.Tabs>
      <Overview.Divider />
      {cloneElement(children, { walletProfileClientQuery })}
    </>
  );
}

export default ProfileLayout;

import { CheckIcon } from '@heroicons/react/24/outline';

import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { ReactElement, ReactNode } from 'react';
import { cloneElement, useMemo } from 'react';

import Icon from '../components/Icon';
import Tooltip from '../components/Tooltip';
import useClipboard from '../hooks/clipboard';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { UserNfts } from '../typings';
import { getSolFromLamports } from '../utils/price';
import { hideTokenDetails } from '../utils/tokens';
import { Overview } from './../components/Overview';

interface ProfileLayout {
  children: ReactElement;
  nfts: UserNfts['nfts'];
  collections: UserNfts['collections'];
}

enum ProfilePath {
  Collected = '/profiles/[address]',
  Offers = '/profiles/[address]/offers',
  Activity = '/profiles/[address]/activity',
  Affiliate = '/profiles/[address]/affiliate',
}

function ProfileFigure(props: { figure: ReactNode; label: string | ReactNode; loading: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-medium text-gray-300">{props.label}</div>
      {props.loading ? (
        <div className="h-6 w-14 animate-pulse rounded-md bg-gray-700 transition" />
      ) : (
        <span className="font-semibold">{props.figure}</span>
      )}
    </div>
  );
}

function ProfileLayout({ children, nfts, collections }: ProfileLayout): JSX.Element {
  const { t } = useTranslation(['profile', 'common']);
  const { query, pathname } = useRouter();
  const { publicKey, address } = useWalletContext();

  const { copied, copyText } = useClipboard(address as string);

  const portfolioValue = useMemo(() => {
    const total = collections?.reduce(
      (total, current) => total + Number.parseFloat(current.estimatedValue),
      0
    );

    if (!total) {
      return 0;
    }

    return total;
  }, [collections]);

  const nftsOwnedCount = useMemo(() => {
    return collections?.reduce((total, current) => total + current.nftsOwned, 0);
  }, [collections]);

  const nftsListedCount = useMemo(() => {
    return nfts?.filter((nft) => nft.owner === address).length;
  }, [nfts, address]);

  const walletAddress = query.address
    ? hideTokenDetails((query.address as string) ?? address)
    : null;

  return (
    <>
      <Head>
        <title>{`${t('metadata.title', { ns: 'profile', name: walletAddress })} | ${t(
          'header.title',
          { ns: 'common' }
        )}`}</title>
        <meta
          name="description"
          content={t('metadata.description', { ns: 'profile', name: walletAddress })}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="mx-4 my-8 flex flex-col">
        <div className="mb-8 flex  items-center justify-center gap-4  md:flex-row md:gap-6 ">
          <Overview.Avatar src="/images/placeholder.png" circle />
          <div className="flex flex-col items-center gap-6 md:items-start">
            {walletAddress && (
              <h1 className=" text-center text-3xl font-semibold text-white md:text-left md:text-4xl">
                {walletAddress}
              </h1>
            )}
            {walletAddress && (
              <div className="flex items-center gap-4 text-gray-300  md:items-center">
                <div
                  onClick={copyText}
                  className="group flex cursor-pointer gap-1 text-sm  font-medium"
                >
                  {walletAddress}
                  <button type="button" className="ml-auto flex cursor-pointer items-center">
                    {copied ? (
                      <CheckIcon className="h-3 w-3 " />
                    ) : (
                      <Icon.Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 justify-center gap-10 rounded-lg bg-gray-800 py-4 px-6 text-white md:mx-auto md:mb-10 md:grid-cols-3">
          <Tooltip
            placement="bottom"
            content={<p>{t('portfolioDisclaimer', { ns: 'profile' })}</p>}
            className="max-w-[12rem] text-center"
          >
            <ProfileFigure
              figure={
                <div className="flex items-center">
                  <Icon.Sol />
                  <span className="ml-1">{getSolFromLamports(portfolioValue, 0, 2)}</span>
                </div>
              }
              label={
                <div className="relative flex items-center">
                  <span>{t('portfolioValue', { ns: 'profile' })}</span>
                  <Icon.Info className="absolute -right-5 ml-1 h-4" />
                </div>
              }
              loading={false}
            />
          </Tooltip>
          <ProfileFigure
            label={t('totalNFTs', { ns: 'profile' })}
            figure={nftsOwnedCount || 0}
            loading={false}
          />
          <ProfileFigure
            label={t('listedNFTs', { ns: 'profile' })}
            figure={nftsListedCount || 0}
            loading={false}
          />
        </div>
      </section>
      <div className="w-full overflow-auto md:overflow-visible">
        <Overview.Tabs mode="profile" className="md:min-w-auto min-w-[384px] grid-cols-auto-85">
          <Overview.Tab
            label={t('nfts', { ns: 'profile' })}
            href={`/profiles/${query.address}`}
            active={pathname === ProfilePath.Collected}
          />
          <Overview.Tab
            label={t('activity', { ns: 'profile' })}
            href={`/profiles/${query.address}/activity`}
            active={pathname === ProfilePath.Activity}
          />
          <Overview.Tab
            label={t('offers', { ns: 'profile' })}
            href={`/profiles/${query.address}/offers`}
            active={pathname === ProfilePath.Offers}
          />
          {address === publicKey?.toString() ? (
            <Overview.Tab
              label={t('affiliate', { ns: 'profile' })}
              href={`/profiles/${query.address}/affiliate`}
              active={pathname === ProfilePath.Affiliate}
            />
          ) : null}
        </Overview.Tabs>
      </div>
      {cloneElement(children, { nfts, collections })}
    </>
  );
}

export default ProfileLayout;

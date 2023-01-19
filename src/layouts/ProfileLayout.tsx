import { cloneElement, ReactElement, ReactNode, useMemo } from 'react';
import { AuctionHouse, SolanaNetwork, Wallet } from '../graphql.types';
import { CheckIcon } from '@heroicons/react/24/outline';
import { WalletProfileClientQuery } from './../queries/profile.graphql';
import { SolanaNetworkQuery } from './../queries/solananetwork.graphql';

import { useTranslation } from 'next-i18next';
import { Overview } from './../components/Overview';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import Icon from '../components/Icon';
import useClipboard from '../hooks/clipboard';
import { useRouter } from 'next/router';

export interface WalletProfileData {
  wallet: Wallet;
}

export interface WalletProfileVariables {
  address: string;
  rewardCenter: string;
}
export interface SolanaNetworkData {
  solanaNetwork: SolanaNetwork;
}
interface ProfileLayout {
  children: ReactElement;
  wallet: Wallet;
  auctionHouse: AuctionHouse;
}

enum ProfilePath {
  Collected = '/profiles/[address]/collected',
  Offers = '/profiles/[address]/offers',
  Activity = '/profiles/[address]/activity',
}

function ProfileFigure(props: { figure: ReactNode; label: string; loading: boolean }) {
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

function ProfileLayout({ children, wallet, auctionHouse }: ProfileLayout): JSX.Element {
  const { t } = useTranslation(['profile', 'common']);
  const address = wallet.address;
  const router = useRouter();

  const { copied, copyText } = useClipboard(address);

  const walletProfileClientQuery = useQuery<WalletProfileData, WalletProfileVariables>(
    WalletProfileClientQuery,
    {
      variables: {
        address: address as string,
        rewardCenter: auctionHouse.rewardCenter?.address as string,
      },
    }
  );

  const solanaNetworkQuery = useQuery<SolanaNetworkData, {}>(SolanaNetworkQuery);

  const portfolioValue = useMemo(() => {
    const total = walletProfileClientQuery.data?.wallet.collectedCollections.reduce(
      (total, current) => total + Number.parseFloat(current.estimatedValue),
      0
    );

    const solanaPrice = solanaNetworkQuery.data?.solanaNetwork.price;

    if (!total || !solanaPrice) {
      return 0;
    }

    const multiplier = Math.pow(10, 2);
    return Math.round((total * multiplier) / multiplier) * solanaPrice;
  }, [
    solanaNetworkQuery.data?.solanaNetwork.price,
    walletProfileClientQuery.data?.wallet.collectedCollections,
  ]);

  const loading = walletProfileClientQuery.loading || solanaNetworkQuery.loading;

  return (
    <>
      <Head>
        <title>{t('metadata.title', { name: wallet.displayName })}</title>
        <meta
          name="description"
          content={t('metadata.description', { name: wallet.displayName })}
        />
        <link rel="icon" href="/favicon.ico" />
        <script defer data-domain="nightmarket.io" src="https://plausible.io/js/script.js"></script>
      </Head>
      <section className="mx-4 my-8 flex flex-col">
        <div className="mb-8 flex  items-center justify-center gap-4  md:flex-row md:gap-6 ">
          <Overview.Avatar src={wallet.previewImage as string} circle />
          <div className="flex flex-col items-center gap-6 md:items-start">
            <h1 className=" text-center text-3xl font-semibold text-white md:text-left md:text-4xl">
              {wallet.displayName}
            </h1>
            <div className="flex items-center gap-4 text-gray-300  md:items-center">
              <div
                onClick={copyText}
                className="group flex cursor-pointer gap-1 text-sm  font-medium"
              >
                {wallet.shortAddress}
                <button className="ml-auto flex cursor-pointer items-center">
                  {copied ? <CheckIcon className="h-3 w-3 " /> : <Icon.Copy className="h-3 w-3" />}
                </button>
              </div>

              <a
                href={`https://twitter.com/${wallet.displayName}`}
                target="_blank"
                rel="noreferrer"
              >
                <div className="flex cursor-pointer items-center gap-1 rounded-full text-sm">
                  {wallet.displayName}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3">
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                      fill="currentColor"
                      d="M15.3 5.55a2.9 2.9 0 0 0-2.9 2.847l-.028 1.575a.6.6 0 0 1-.68.583l-1.561-.212c-2.054-.28-4.022-1.226-5.91-2.799-.598 3.31.57 5.603 3.383 7.372l1.747 1.098a.6.6 0 0 1 .034.993L7.793 18.17c.947.059 1.846.017 2.592-.131 4.718-.942 7.855-4.492 7.855-10.348 0-.478-1.012-2.141-2.94-2.141zm-4.9 2.81a4.9 4.9 0 0 1 8.385-3.355c.711-.005 1.316.175 2.669-.645-.335 1.64-.5 2.352-1.214 3.331 0 7.642-4.697 11.358-9.463 12.309-3.268.652-8.02-.419-9.382-1.841.694-.054 3.514-.357 5.144-1.55C5.16 15.7-.329 12.47 3.278 3.786c1.693 1.977 3.41 3.323 5.15 4.037 1.158.475 1.442.465 1.973.538z"
                    />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 justify-center gap-10 rounded-lg bg-gray-800 py-4 px-6 text-white md:mx-auto md:mb-10 md:grid-cols-4 ">
          <ProfileFigure figure={portfolioValue} label="Net Worth" loading={loading} />
          <ProfileFigure
            label="Total NFTs"
            figure={walletProfileClientQuery.data?.wallet.nftCounts.owned}
            loading={loading}
          />
          <ProfileFigure
            label="Listed NFTs"
            figure={walletProfileClientQuery.data?.wallet.nftCounts.listed || 0}
            loading={loading}
          />
          <ProfileFigure
            label="BONK earned"
            loading={loading}
            figure={
              <div className="flex items-center gap-2">
                <Icon.Sauce />
                {walletProfileClientQuery.data?.wallet.totalRewards}
              </div>
            }
          />
        </div>
      </section>
      <Overview.Tabs>
        <Overview.Tab
          label="NFTs"
          href={`/profiles/${router.query.address}/collected`}
          active={router.pathname === ProfilePath.Collected}
        />
        <Overview.Tab
          label={t('activity')}
          href={`/profiles/${router.query.address}/activity`}
          active={router.pathname === ProfilePath.Activity}
        />
        <Overview.Tab
          label={t('offers')}
          href={`/profiles/${router.query.address}/offers`}
          active={router.pathname === ProfilePath.Offers}
        />
      </Overview.Tabs>
      {cloneElement(children, { walletProfileClientQuery })}
    </>
  );
}

export default ProfileLayout;

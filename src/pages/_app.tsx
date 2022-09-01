import { useCallback, useMemo, ReactElement } from 'react';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import clsx from 'clsx';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { ArrowPathIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { ApolloProvider } from '@apollo/client';
import Link from 'next/link';
import useNavigation from './../hooks/nav';
import useLogin from '../hooks/login';
import ViewerProvider from '../providers/ViewerProvider';
import Button from './../components/Button';
import client from './../client';
import './../../styles/globals.css';
import { Wallet, Nft, MetadataJson } from './../graphql.types';
import config from './../app.config';
import useViewer from './../hooks/viewer';
import Search from '../components/Search';
import useGlobalSearch from './../hooks/globalsearch';
import CurrencyProvider from '../providers/CurrencyProvider';
import Popover from '../components/Popover';

function clusterApiUrl(network: WalletAdapterNetwork) {
  if (network == WalletAdapterNetwork.Mainnet) {
    return config.solanaRPCUrl;
  }

  throw new Error(`The ${network} is not supported`);
}

interface AppComponentProps {
  children: JSX.Element;
}

function App({ children }: AppComponentProps) {
  const [showNav, setShowNav] = useNavigation();
  const onLogin = useLogin();
  const { setVisible } = useWalletModal();

  const { connecting, disconnect } = useWallet();
  const viewerQueryResult = useViewer();

  const { t } = useTranslation('common');

  const { updateSearch, searchTerm, results, searching, hasResults, previousResults } =
    useGlobalSearch();

  const loading = viewerQueryResult.loading || connecting;

  return (
    <>
      <header className="relative flex flex-row items-center justify-between px-4 py-2 md:px-8 md:py-4">
        <div className="flex flex-shrink justify-start md:w-1/4">
          <Link href="/" passHref>
            <a className="flex flex-row gap-2 whitespace-nowrap text-2xl font-bold">
              <img
                src="/images/nightmarket-stacked.svg"
                className="h-[42px] w-auto object-fill"
                alt="night market logo"
              />
            </a>
          </Link>
        </div>
        <div className=" flex-grow items-center px-6 sm:flex md:px-0">
          <Search>
            <Search.Input onChange={updateSearch} value={searchTerm} />
            <Search.Results
              searching={searching}
              hasResults={Boolean(previousResults)}
              enabled={searchTerm.length > 2}
            >
              <Search.Group<MetadataJson[]>
                title={t('search.collection')}
                result={results?.collections}
              >
                {({ result }) => {
                  return result?.map((collection, i) => (
                    <Search.Collection
                      value={collection}
                      key={`search-collection-${collection.mintAddress}-${i}`}
                      image={collection.image || '/images/placeholder.png'}
                      name={collection.name}
                      address={collection.mintAddress}
                    />
                  ));
                }}
              </Search.Group>
              <Search.Group<Wallet[]> title={t('search.profiles')} result={results?.profiles}>
                {({ result }) => {
                  return result?.map((wallet, i) => (
                    <Search.Profile
                      value={wallet}
                      profile={wallet}
                      key={`search-profile-${wallet.address}-${i}`}
                      image={wallet.previewImage || '/images/placeholder.png'}
                      name={wallet.displayName}
                      address={wallet.address}
                    />
                  ));
                }}
              </Search.Group>
              <Search.Group<Wallet> title={t('search.wallet')} result={results?.wallet}>
                {({ result }) => {
                  if (!result) {
                    return null;
                  }

                  return (
                    <Search.Profile
                      value={result}
                      profile={result}
                      key={`search-wallet-${result?.address}`}
                      image={result.previewImage || '/images/placeholder.png'}
                      name={result.displayName}
                      address={result.address}
                    />
                  );
                }}
              </Search.Group>
              <Search.Group<Nft[]> title={t('search.nfts')} result={results?.nfts}>
                {({ result }) => {
                  return result?.map((nft, i) => (
                    <Search.MintAddress
                      value={nft}
                      nft={nft}
                      key={`search-mintAddress-${nft.address}-${i}`}
                      image={nft.image}
                      address={nft.mintAddress}
                      name={nft.name}
                      creator={nft.creators[0]}
                    />
                  ));
                }}
              </Search.Group>
            </Search.Results>
          </Search>
        </div>
        <div className="flex flex-shrink justify-end md:w-1/4">
          {loading ? (
            <div className="hidden h-10 w-10 rounded-full bg-gray-800 md:inline-block" />
          ) : viewerQueryResult.data ? (
            <Popover
              panelClassNames="-translate-x-80 translate-y-12"
              content={
                <div className=" overflow-hidden rounded-md bg-gray-800  text-white shadow-lg sm:w-96">
                  <div className="flex items-center p-4 ">
                    <img
                      className="hidden h-6 w-6 cursor-pointer rounded-full transition md:inline-block"
                      src={viewerQueryResult.data.wallet.previewImage as string}
                      alt="profile image"
                    />
                    <span className="ml-2">{viewerQueryResult.data.wallet.displayName}</span>

                    <Link
                      href={'/profiles/' + viewerQueryResult.data.wallet.address + '/collected'}
                      passHref
                    >
                      <a className="ml-auto flex cursor-pointer items-center text-base text-orange-600 hover:text-gray-300 ">
                        <span className="">{t('viewProfile')}</span>
                      </a>
                    </Link>
                  </div>
                  <div
                    className="flex cursor-pointer items-center p-4 text-xs hover:bg-gray-700 "
                    onClick={async () => {
                      await disconnect();
                      setVisible(true);
                    }}
                  >
                    <ArrowPathIcon className="mr-2 h-4 w-4" />
                    {t('switchWallet')}
                  </div>
                  <div
                    onClick={disconnect}
                    className="flex cursor-pointer items-center p-4 text-xs hover:bg-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="mr-2 h-4 w-4"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path
                        fill="currentColor"
                        d="M6.265 3.807l1.147 1.639a8 8 0 1 0 9.176 0l1.147-1.639A9.988 9.988 0 0 1 22 12c0 5.523-4.477 10-10 10S2 17.523 2 12a9.988 9.988 0 0 1 4.265-8.193zM11 12V2h2v10h-2z"
                      />
                    </svg>
                    {t('disconnectWallet')}
                  </div>
                </div>
              }
            >
              <img
                className="hidden h-10 w-10 cursor-pointer rounded-full transition md:inline-block"
                src={viewerQueryResult.data.wallet.previewImage as string}
                alt="profile image"
              />
            </Popover>
          ) : (
            <Button onClick={onLogin} className="hidden h-[42px] md:inline-block">
              {t('connect')}
            </Button>
          )}
          <button
            className="rounded-full bg-transparent p-3 shadow-lg transition hover:bg-gray-800 md:hidden"
            onClick={useCallback(() => {
              setShowNav(true);
            }, [setShowNav])}
          >
            <Bars3Icon color="#fff" width={16} height={16} />
          </button>
          <div
            className={clsx(
              'fixed left-0 right-0 top-0 bottom-0 z-50 bg-gray-900 px-4 py-2 md:hidden',
              showNav ? 'block' : 'hidden'
            )}
          >
            <div className="flex w-full flex-row items-center justify-between md:hidden">
              <span className="text-2xl font-bold text-white">{t('header.title')}</span>
              <button
                className="rounded-full bg-transparent bg-white p-3 transition hover:bg-gray-100"
                onClick={useCallback(() => {
                  setShowNav(false);
                }, [setShowNav])}
              >
                <XMarkIcon color="#171717" width={16} height={16} />
              </button>
            </div>
            <nav></nav>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}

type NextPageWithLayout = NextPage & {
  getLayout?: (props: { children: ReactElement }) => ReactElement;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function AppPage({ Component, pageProps }: AppPropsWithLayout): JSX.Element {
  const network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new GlowWalletAdapter(),
      new TorusWalletAdapter({ params: { network } }),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
    ],
    [network]
  );

  const PageLayout = Component.getLayout ?? ((props: { children: ReactElement }) => props.children);

  return (
    <ApolloProvider client={client}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider className="wallet-modal-theme">
            <ViewerProvider>
              <CurrencyProvider>
                <App>
                  <PageLayout {...pageProps}>
                    <Component {...pageProps} />
                  </PageLayout>
                </App>
              </CurrencyProvider>
            </ViewerProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ApolloProvider>
  );
}

export default appWithTranslation(AppPage);

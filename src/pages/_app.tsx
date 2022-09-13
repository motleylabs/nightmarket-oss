import { useCallback, useMemo, ReactElement, useState, Fragment, useRef } from 'react';
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
import { Bars3Icon, XMarkIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { ApolloProvider } from '@apollo/client';
import Link from 'next/link';
import useNavigation from './../hooks/nav';
import useLogin from '../hooks/login';
import ViewerProvider from '../providers/ViewerProvider';
import Button, { ButtonType } from './../components/Button';
import client from './../client';
import './../../styles/globals.css';
import { Wallet, Nft, MetadataJson } from './../graphql.types';
import config from './../app.config';
import useViewer from './../hooks/viewer';
import Search from '../components/Search';
import useGlobalSearch from './../hooks/globalsearch';
import CurrencyProvider from '../providers/CurrencyProvider';
import Icon from '../components/Icon';
import { Popover, Transition } from '@headlessui/react';
import useMobileSearch from '../hooks/mobilesearch';
import { useOutsideAlert } from '../hooks/outsidealert';

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

  const { searchExpanded, setSearchExpanded, setShowMobileSearch, showMobileSearch } =
    useMobileSearch();

  const expandedSearchRef = useRef<HTMLDivElement>(null!);
  const mobileSearchRef = useRef<HTMLDivElement>(null!);
  useOutsideAlert(
    expandedSearchRef,
    useCallback(() => {
      setSearchExpanded(false);
    }, [setSearchExpanded])
  );
  useOutsideAlert(
    mobileSearchRef,
    useCallback(() => {
      setShowMobileSearch(false);
    }, [setShowMobileSearch])
  );

  const onLogin = useLogin();
  const { setVisible } = useWalletModal();

  const [copied, setCopied] = useState(false);

  const { connecting, disconnect, publicKey } = useWallet();
  const viewerQueryResult = useViewer();

  const { t } = useTranslation('common');

  const { updateSearch, searchTerm, results, searching, hasResults, previousResults } =
    useGlobalSearch();

  const loading = viewerQueryResult.loading || connecting;

  const copyWallet = useCallback(async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [publicKey]);

  return (
    <>
      <header className="sticky top-0 z-30 flex w-full flex-row items-center justify-between px-4 py-2 backdrop-blur-sm md:px-8 md:py-4">
        <div
          className={clsx('flex flex-shrink justify-start md:w-1/4', {
            hidden: searchExpanded,
          })}
        >
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
        {/* mobile search UI */}
        <div
          className={clsx(
            'flex flex-grow items-center sm:hidden',
            searchExpanded ? 'justify-start' : 'justify-center'
          )}
        >
          <button
            className={clsx(
              'rounded-full bg-transparent p-3 shadow-lg transition hover:bg-gray-800 md:hidden',
              { hidden: searchExpanded }
            )}
            onClick={useCallback(() => {
              setSearchExpanded(true);
            }, [setSearchExpanded])}
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-white" aria-hidden="true" />
          </button>
          <div ref={expandedSearchRef} className={clsx(searchExpanded ? 'block w-full' : 'hidden')}>
            <Search>
              <Search.Input
                onChange={(e) => {
                  updateSearch(e);
                  setShowMobileSearch(true);
                }}
                value={searchTerm}
              />
              <div
                className={clsx(
                  showMobileSearch
                    ? 'fixed left-0 right-0 top-2 bottom-0 z-40 block h-[95%] sm:hidden'
                    : 'hidden'
                )}
              >
                <div ref={mobileSearchRef}>
                  <Search.Results
                    searching={searching}
                    hasResults={Boolean(previousResults) || hasResults}
                    enabled={searchTerm.length > 2}
                  >
                    <Search.Group<MetadataJson[]>
                      title={t('search.collection')}
                      result={results?.collections as MetadataJson[]}
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
                    <Search.Group<Nft[]> title={t('search.nfts')} result={results?.nfts as Nft[]}>
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
                </div>
              </div>
            </Search>
          </div>
        </div>

        <div className="hidden flex-grow items-center px-6 sm:flex md:px-0">
          <Search>
            <Search.Input onChange={updateSearch} value={searchTerm} />
            <Search.Results
              searching={searching}
              hasResults={Boolean(previousResults) || hasResults}
              enabled={searchTerm.length > 2}
            >
              <Search.Group<MetadataJson[]>
                title={t('search.collection')}
                result={results?.collections as MetadataJson[]}
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
              <Search.Group<Nft[]> title={t('search.nfts')} result={results?.nfts as Nft[]}>
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
        <div className="flex flex-shrink items-center justify-end gap-6 md:w-1/4">
          <Link href={'/collections'}>
            <a className="hidden text-base font-semibold text-gray-300 duration-200 ease-in-out hover:text-white lg:inline-block">
              {t('navigation.collections')}
            </a>
          </Link>
          {loading ? (
            <div className="hidden h-10 w-10 rounded-full bg-gray-900 md:inline-block" />
          ) : viewerQueryResult.data ? (
            <Popover className={'relative'}>
              <Popover.Button>
                <img
                  className={clsx(
                    'hidden h-10 w-10 cursor-pointer rounded-full transition md:inline-block',
                    'animate-draw-border border-2 border-orange-600 duration-100'
                  )}
                  src={viewerQueryResult.data.wallet.previewImage as string}
                  alt="profile image"
                />
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Popover.Panel
                  className={'absolute z-40 translate-y-2 sm:-translate-x-[calc(384px-40px)]'}
                >
                  {({ close }) => (
                    <div className=" hidden overflow-hidden rounded-md bg-gray-900 pb-4 text-white shadow-lg shadow-black sm:w-96 md:inline-block">
                      <div className="flex items-center p-4 ">
                        <img
                          className="hidden h-6 w-6 cursor-pointer rounded-full transition md:inline-block"
                          src={viewerQueryResult.data?.wallet.previewImage as string}
                          alt="profile image"
                        />
                        <span className="ml-2">{viewerQueryResult.data?.wallet.displayName}</span>

                        <button
                          onClick={copyWallet}
                          className="ml-auto flex cursor-pointer items-center text-base duration-200 ease-in-out hover:scale-110 "
                        >
                          {copied ? (
                            <CheckIcon className="h-4 w-4 text-gray-300" />
                          ) : (
                            <Icon.Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div onClick={() => close()} className="flex flex-col pb-4">
                        <Link
                          href={`/profiles/${viewerQueryResult.data?.wallet.address}/collected`}
                          passHref
                        >
                          <a className="flex cursor-pointer px-4 py-2 text-xs hover:bg-gray-800">
                            {t('profileMenu.collected')}
                          </a>
                        </Link>
                        <Link
                          href={`/profiles/${viewerQueryResult.data?.wallet.address}/created`}
                          passHref
                        >
                          <a className="flex cursor-pointer px-4 py-2 text-xs hover:bg-gray-800">
                            {t('profileMenu.created')}
                          </a>
                        </Link>
                        <Link
                          href={`/profiles/${viewerQueryResult.data?.wallet.address}/activity`}
                          passHref
                        >
                          <a className="flex cursor-pointer px-4 py-2 text-xs hover:bg-gray-800">
                            {t('profileMenu.activity')}
                          </a>
                        </Link>
                        <Link
                          href={`/profiles/${viewerQueryResult.data?.wallet.address}/analytics`}
                          passHref
                        >
                          <a className="flex cursor-pointer px-4 py-2 text-xs hover:bg-gray-800">
                            {t('profileMenu.analytics')}
                          </a>
                        </Link>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex px-4">
                          <Link
                            href={`/profiles/${viewerQueryResult.data?.wallet.address}/collected`}
                            passHref
                          >
                            <a className="flex w-full">
                              <Button onClick={() => close()} className="w-full">
                                {t('viewProfile')}
                              </Button>
                            </a>
                          </Link>
                        </div>
                        <div className="flex w-full px-4">
                          <Button
                            onClick={async () => {
                              await disconnect();
                              close();
                              setVisible(true);
                            }}
                            type={ButtonType.Secondary}
                            className="w-full"
                          >
                            {t('switchWallet')}
                          </Button>
                        </div>
                        <div className="flex w-full px-4">
                          <Button
                            onClick={() => {
                              disconnect();
                              close();
                            }}
                            type={ButtonType.Ghost}
                            className="w-full"
                          >
                            {t('disconnectWallet')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Popover.Panel>
              </Transition>
            </Popover>
          ) : (
            <Button onClick={onLogin} className="hidden h-[42px] font-semibold md:inline-block">
              {t('connect')}
            </Button>
          )}
          <button
            className={clsx(
              'rounded-full bg-transparent p-3 shadow-lg transition hover:bg-gray-800 md:hidden',
              searchExpanded && 'hidden'
            )}
            onClick={useCallback(() => {
              setShowNav(true);
            }, [setShowNav])}
          >
            <Bars3Icon color="#fff" width={20} height={20} />
          </button>
          <div
            className={clsx(
              'fixed left-0 right-0 top-0 bottom-0 z-50 bg-gray-900 px-4 py-2 md:hidden',
              showNav ? 'block' : 'hidden'
            )}
          >
            <div className="flex w-full flex-row items-center justify-between md:hidden">
              <Link href="/" passHref>
                <a className="flex flex-row gap-2 whitespace-nowrap text-2xl font-bold">
                  <img
                    src="/images/nightmarket-stacked.svg"
                    className="h-8 w-auto object-fill"
                    alt="night market logo"
                  />
                </a>
              </Link>
              <button
                className="rounded-full bg-transparent bg-white p-3 transition hover:bg-gray-100"
                onClick={useCallback(() => {
                  setShowNav(false);
                }, [setShowNav])}
              >
                <XMarkIcon color="#171717" width={20} height={20} />
              </button>
            </div>
            {/* mobile nav */}
            <nav className="flex h-screen flex-col bg-gray-900 py-2 md:p-2">
              {loading ? (
                <div className="h-10 w-10 rounded-full bg-gray-900 md:inline-block" />
              ) : viewerQueryResult.data ? (
                <div className="flex h-full flex-col gap-4 text-white">
                  <section className="flex flex-col" id="wallet-profile-viewer-mobile">
                    <div className="flex items-center p-4 ">
                      <img
                        className="inline-block h-8 w-8 rounded-full border-2 border-orange-600 transition"
                        src={viewerQueryResult.data.wallet.previewImage as string}
                        alt="profile image"
                      />
                      <span className="ml-2">{viewerQueryResult.data.wallet.displayName}</span>

                      <button
                        onClick={copyWallet}
                        className="ml-auto flex cursor-pointer items-center text-base duration-200 ease-in-out hover:scale-110 "
                      >
                        {copied ? (
                          <CheckIcon className="h-4 w-4 text-gray-300" />
                        ) : (
                          <Icon.Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <Link
                      href={'/profiles/' + viewerQueryResult.data.wallet.address + '/collected'}
                      passHref
                    >
                      <a className="flex cursor-pointer px-4 py-2 text-xs hover:bg-gray-800">
                        {t('profileMenu.collected')}
                      </a>
                    </Link>
                    <Link
                      href={'/profiles/' + viewerQueryResult.data.wallet.address + '/created'}
                      passHref
                    >
                      <a className="flex cursor-pointer px-4 py-2 text-xs hover:bg-gray-800">
                        {t('profileMenu.created')}
                      </a>
                    </Link>
                    <Link
                      href={'/profiles/' + viewerQueryResult.data.wallet.address + '/activity'}
                      passHref
                    >
                      <a className="flex cursor-pointer px-4 py-2 text-xs hover:bg-gray-800">
                        {t('profileMenu.activity')}
                      </a>
                    </Link>
                    <Link
                      href={'/profiles/' + viewerQueryResult.data.wallet.address + '/analytics'}
                      passHref
                    >
                      <a className="flex cursor-pointer px-4 py-2 text-xs hover:bg-gray-800">
                        {t('profileMenu.analytics')}
                      </a>
                    </Link>
                  </section>
                  <section className="flex flex-col" id="mobile-nav">
                    <Link href={'/collections'}>
                      <a className="flex w-full transform rounded-md p-4 text-base font-semibold text-white hover:bg-gray-800">
                        {t('navigation.collections')}
                      </a>
                    </Link>
                  </section>

                  <section
                    className="mt-auto flex flex-col justify-end gap-4"
                    id="wallet-action-buttons-mobile"
                  >
                    <Link
                      href={'/profiles/' + viewerQueryResult.data.wallet.address + '/collected'}
                      passHref
                    >
                      <a className="flex w-full">
                        <Button className="w-full font-semibold">{t('viewProfile')}</Button>
                      </a>
                    </Link>

                    <Button
                      onClick={async () => {
                        await disconnect();
                        setVisible(true);
                      }}
                      type={ButtonType.Secondary}
                      className="w-full font-semibold"
                    >
                      {t('switchWallet')}
                    </Button>

                    <Button
                      onClick={disconnect}
                      type={ButtonType.Ghost}
                      className="w-full font-semibold"
                    >
                      {t('disconnectWallet')}
                    </Button>
                  </section>
                </div>
              ) : (
                <div className="flex h-full flex-col gap-4 text-white">
                  <section className="flex flex-col" id="mobile-nav">
                    <Link href={'/collections'}>
                      <a className="flex w-full transform rounded-md p-4 text-base font-semibold text-white hover:bg-gray-800">
                        {t('navigation.collections')}
                      </a>
                    </Link>
                  </section>
                  <section className="mt-auto flex" id="wallet-connect-action-mobile">
                    <Button className="w-full font-semibold" onClick={onLogin}>
                      {t('connect')}
                    </Button>
                  </section>
                </div>
              )}
            </nav>
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

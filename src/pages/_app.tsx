import React, { useMemo, ReactElement, useEffect } from 'react';
import { appWithTranslation } from 'next-i18next';
import nextI18NextConfig from '../../next-i18next.config.js';
import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
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
import { useReactiveVar, ApolloProvider, QueryResult, useQuery } from '@apollo/client';
import ViewerProvider from '../providers/ViewerProvider';
import client from './../client';
import './../../styles/globals.css';
import config from './../app.config';
import { Popover, Transition } from '@headlessui/react';
import { Bars3Icon, CheckIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { Dispatch, Fragment, SetStateAction, useCallback, useRef, useState } from 'react';
import { AuctionHouse, CollectionDocument, Nft, SolanaNetwork, Wallet } from '../graphql.types';
import useGlobalSearch from '../hooks/globalsearch';
import useLogin from '../hooks/login';
import useMobileSearch from '../hooks/mobilesearch';
import useNavigation from '../hooks/nav';
import { useOutsideAlert } from '../hooks/outsidealert';
import useViewer from '../hooks/viewer';
import Search from '../components/Search';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from '../components/Button';
import Icon from '../components/Icon';
import { ToastContainer } from 'react-toastify';
import { viewerVar } from '../cache';
import { BriceFont, HauoraFont } from '../fonts';
import { start } from '../modules/bugsnag';
import ReportQuery from './../queries/report.graphql';
import { DateRangeOption, getDateTimeRange } from '../modules/time';
import BulkListProvider from '../providers/BulkListProvider';
import CurrencyProvider from '../providers/CurrencyProvider';

start();

function clusterApiUrl(network: WalletAdapterNetwork) {
  if (network == WalletAdapterNetwork.Mainnet) {
    return config.solanaRPCUrl;
  }

  throw new Error(`The ${network} is not supported`);
}

interface ReportHeaderVariables {
  reportQuery: QueryResult<ReportQueryData, ReportQueryVariables>;
}

const EmptyBox = () => <div className="h-6 w-14 animate-pulse rounded-md bg-white transition" />;

function ReportHeader({ reportQuery }: ReportHeaderVariables) {
  const loading = reportQuery.loading;

  return (
    <div className="hidden items-center justify-center gap-12 bg-gradient-primary py-2 px-4 md:flex">
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">24h volume</span>
        {loading ? (
          <EmptyBox />
        ) : (
          <div className="flex items-center gap-2">
            <Icon.Sol defaultColor="#FFFFFF" />
            <span className="font-semibold text-white">
              {reportQuery.data?.auctionHouse.volume}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">SOL price</span>
        {loading ? (
          <EmptyBox />
        ) : (
          <span className="font-semibold text-white">{`$${reportQuery.data?.solanaNetwork.price}`}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">SOL TPS</span>
        {loading ? (
          <EmptyBox />
        ) : (
          <span className="font-semibold text-white">{reportQuery.data?.solanaNetwork.tps}</span>
        )}
      </div>
    </div>
  );
}

interface ReportQueryData {
  auctionHouse: AuctionHouse;
  solanaNetwork: SolanaNetwork;
}

interface ReportQueryVariables {
  address: string;
  startDate: string;
  endDate: string;
}

function NavigationBar() {
  const [showNav, setShowNav] = useNavigation();

  const { searchExpanded, setSearchExpanded } = useMobileSearch();

  const expandedSearchRef = useRef<HTMLDivElement>(null!);
  const mobileSearchRef = useRef<HTMLDivElement>(null!);
  useOutsideAlert(
    expandedSearchRef,
    useCallback(() => {
      setSearchExpanded(false);
    }, [setSearchExpanded])
  );

  const onLogin = useLogin();

  const { connecting } = useWallet();
  const viewerQueryResult = useViewer();

  const { t } = useTranslation('common');

  const { updateSearch, searchTerm, results, searching, hasResults, previousResults } =
    useGlobalSearch();
  const oneDayRange = getDateTimeRange(DateRangeOption.DAY);

  const reportQuery = useQuery<ReportQueryData, ReportQueryVariables>(ReportQuery, {
    variables: {
      address: config.auctionHouse,
      startDate: oneDayRange.startTime,
      endDate: oneDayRange.endTime,
    },
  });

  const loading = viewerQueryResult.loading || connecting;

  return (
    <>
      <ReportHeader reportQuery={reportQuery} />
      <header
        className={clsx(
          'sticky top-0 z-30 w-full px-4 py-2 backdrop-blur-sm md:px-8 md:py-4',
          'grid grid-cols-4',
          'h-14 md:h-20',
          'bg-black bg-opacity-90'
        )}
      >
        {/* Night Market logo */}
        <div
          className={clsx('flex items-center justify-start ', {
            hidden: searchExpanded,
          })}
        >
          <Link
            href="/"
            passHref
            className="flex flex-row gap-2 whitespace-nowrap text-2xl font-bold"
          >
            <img
              src="/images/nightmarket-stacked-beta.svg"
              className="h-8 w-auto object-fill md:h-11"
              alt="night market logo"
            />
          </Link>
        </div>
        {/* Search */}
        <div className="col-span-2 flex justify-center">
          <button
            className={clsx(
              'rounded-full bg-transparent p-3 shadow-lg transition hover:bg-gray-800 md:hidden ',
              {
                hidden: searchExpanded,
              }
            )}
            onClick={() => {
              setSearchExpanded(true);
            }}
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
          </button>
          <Search>
            <div
              ref={expandedSearchRef}
              className={clsx(
                'fixed w-full md:relative',
                searchExpanded ? ' inset-0  h-14  px-4 py-2' : ''
              )}
            >
              <Search.Input
                onChange={(e) => {
                  updateSearch(e);
                }}
                value={searchTerm}
                className="mx-auto hidden w-full max-w-4xl md:block"
                autofocus={false}
              />

              {searchExpanded && (
                <Search.Input
                  onChange={(e) => {
                    updateSearch(e);
                  }}
                  value={searchTerm}
                  autofocus={true}
                  className="md:hidden"
                />
              )}

              <div
                ref={mobileSearchRef}
                className={clsx(
                  'fixed left-0 right-0 top-12 bottom-0 z-40 mx-auto  block max-w-4xl ',
                  searching || results ? 'block' : 'hidden'
                )}
              >
                <Search.Results
                  searching={searching}
                  hasResults={Boolean(previousResults) || hasResults}
                  enabled={searchTerm.length > 2}
                >
                  <Search.Group<CollectionDocument[]>
                    title={t('search.collection')}
                    result={results?.collections as CollectionDocument[]}
                  >
                    {({ result }) => {
                      return result?.map((collection, i) => (
                        <Search.Collection
                          value={collection}
                          key={`search-collection-${collection.id}-${i}`}
                          image={collection.image || '/images/placeholder.png'}
                          name={collection.name}
                          slug={collection.id}
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
                          slug={wallet.address}
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
                          slug={result.address}
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
                          slug={nft.mintAddress}
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
        {/* Connect and Mobile Menu */}
        <div className="flex items-center justify-end space-x-6">
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

          {loading ? (
            <div className="hidden h-10 w-10 rounded-full bg-gray-900 md:inline-block" />
          ) : viewerQueryResult.data ? (
            <ProfilePopover wallet={viewerQueryResult.data.wallet} />
          ) : (
            <Button onClick={onLogin} className="hidden font-semibold md:inline-block">
              {t('connect')}
            </Button>
          )}

          {/* mobile nav */}
        </div>
        <MobileNavMenu showNav={showNav} setShowNav={setShowNav} />
      </header>
    </>
  );
}

function ProfilePopover(props: { wallet: Wallet }) {
  const { disconnect, publicKey } = useWallet();
  const viewer = useReactiveVar(viewerVar);
  const { t } = useTranslation('common');

  const [copied, setCopied] = useState(false);
  const copyWallet = useCallback(async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [publicKey]);

  const { setVisible } = useWalletModal();

  return (
    <Popover className={'relative'}>
      <Popover.Button>
        <img
          className={clsx(
            'hidden h-10 w-10 cursor-pointer rounded-full transition md:inline-block',
            'animate-draw-border border-2 border-primary-100 duration-100'
          )}
          src={props.wallet.previewImage as string}
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
        <Popover.Panel className={'absolute z-50 translate-y-2 sm:-translate-x-[calc(384px-40px)]'}>
          {({ close }) => (
            <div className=" hidden overflow-hidden rounded-md bg-gray-900 pb-4 text-white shadow-lg shadow-black sm:w-96 md:inline-block">
              <div className="flex items-center p-4 ">
                <img
                  className="hidden h-6 w-6 cursor-pointer rounded-full transition md:inline-block"
                  src={props.wallet.previewImage as string}
                  alt="profile image"
                />
                <span className="ml-2">{props.wallet.displayName}</span>

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
              <div className="flex flex-row items-center gap-2 p-4">
                <Icon.Sol className="h-4 w-4" />
                {viewer?.solBalance}
              </div>
              <div onClick={() => close()} className="flex flex-col pb-4">
                <Link
                  className="flex cursor-pointer px-4 py-2 text-sm hover:bg-gray-800"
                  href={`/profiles/${props.wallet.address}/collected`}
                >
                  {t('profileMenu.collected')}
                </Link>
                <Link
                  className="flex cursor-pointer px-4 py-2 text-sm hover:bg-gray-800"
                  href={`/profiles/${props.wallet.address}/activity`}
                >
                  {t('profileMenu.activity')}
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex px-4">
                  <Link
                    className="flex w-full"
                    href={`/profiles/${props.wallet.address}/collected`}
                  >
                    <Button onClick={() => close()} className="w-full">
                      {t('viewProfile')}
                    </Button>
                  </Link>
                </div>
                <div className="flex w-full px-4">
                  <Button
                    onClick={async () => {
                      await disconnect();
                      close();
                      setVisible(true);
                    }}
                    background={ButtonBackground.Cell}
                    border={ButtonBorder.Gradient}
                    color={ButtonColor.Gradient}
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
                    border={ButtonBorder.Gray}
                    color={ButtonColor.Gray}
                    background={ButtonBackground.Cell}
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
  );
}

function MobileNavMenu({
  showNav,
  setShowNav,
}: {
  showNav: boolean;
  setShowNav: Dispatch<SetStateAction<boolean>>;
}) {
  const { connecting, disconnect, publicKey } = useWallet();
  const viewerQueryResult = useViewer();
  const viewer = useReactiveVar(viewerVar);
  const { setVisible } = useWalletModal();
  const onLogin = useLogin();

  const { t } = useTranslation('common');
  const loading = viewerQueryResult.loading || connecting;

  const [copied, setCopied] = useState(false);
  const copyWallet = useCallback(async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [publicKey]);

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 bg-gray-900 py-2 md:hidden',
        showNav ? 'block' : 'hidden'
      )}
    >
      <div className="flex w-full flex-row items-center justify-between px-4 md:hidden">
        <Link className="flex flex-row gap-2 whitespace-nowrap text-2xl font-bold" href="/">
          <img
            src="/images/nightmarket-stacked-beta.svg"
            className="h-8 w-auto object-fill"
            alt="night market logo"
          />
        </Link>
        <button
          className="rounded-full bg-white p-3 transition hover:bg-gray-100"
          onClick={useCallback(() => {
            setShowNav(false);
          }, [setShowNav])}
        >
          <XMarkIcon color="#171717" width={20} height={20} />
        </button>
      </div>
      <nav className="flex flex-col bg-gray-900 py-2 md:p-2">
        <div className="flex h-[calc(100vh-58px)] flex-col gap-4 px-6 text-white">
          {loading ? (
            <div className="h-10 w-10 rounded-full bg-gray-900 md:inline-block" />
          ) : viewerQueryResult.data ? (
            <>
              <section className="flex flex-col" id="wallet-profile-viewer-mobile">
                <div className="flex items-center py-4 ">
                  <img
                    className="inline-block h-8 w-8 rounded-full border-2 border-primary-100 transition"
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
                <div className="flex flex-row items-center gap-2 py-4">
                  <Icon.Sol className="h-4 w-4" />
                  {viewer?.solBalance}
                </div>
                <Link
                  href={'/profiles/' + viewerQueryResult.data.wallet.address + '/collected'}
                  className="flex cursor-pointer py-2 text-sm hover:bg-gray-800"
                >
                  {t('profileMenu.collected')}
                </Link>
                <Link
                  href={'/profiles/' + viewerQueryResult.data.wallet.address + '/activity'}
                  className="flex cursor-pointer py-2 text-sm hover:bg-gray-800"
                >
                  {t('profileMenu.activity')}
                </Link>
              </section>

              <section
                className="mt-auto mb-4 flex flex-col justify-end gap-4"
                id="wallet-action-buttons-mobile"
              >
                <Link
                  href={'/profiles/' + viewerQueryResult.data.wallet.address + '/collected'}
                  className="flex w-full"
                >
                  <Button className="w-full font-semibold">{t('viewProfile')}</Button>
                </Link>

                <Button
                  onClick={async () => {
                    await disconnect();
                    setVisible(true);
                  }}
                  background={ButtonBackground.Slate}
                  border={ButtonBorder.Gradient}
                  color={ButtonColor.Gradient}
                  className="w-full font-semibold"
                >
                  {t('switchWallet')}
                </Button>

                <Button
                  onClick={disconnect}
                  border={ButtonBorder.Gray}
                  color={ButtonColor.Gray}
                  className="w-full font-semibold"
                >
                  {t('disconnectWallet')}
                </Button>
              </section>
            </>
          ) : (
            <>
              <section className="mt-auto flex py-4" id="wallet-connect-action-mobile">
                <Button className="w-full font-semibold" onClick={onLogin}>
                  {t('connect')}
                </Button>
              </section>
            </>
          )}
        </div>
      </nav>
    </div>
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

  const links = [
    [{ href: config.website, title: 'About the DAO', popout: true }],
    [{ href: config.status, title: 'Status', popout: true }],
    [{ href: '#', title: 'Terms of Service', popout: true }, { href: '#', title: 'Privacy Policy', popout: true }],
  ];

  return (
    <div className={`${BriceFont.variable} ${HauoraFont.variable} font-sans `}>
      <ApolloProvider client={client}>
        <ToastContainer theme="dark" />
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider
              className={`${BriceFont.variable} ${HauoraFont.variable} wallet-modal-theme font-sans`}
            >
              <ViewerProvider>
                <CurrencyProvider>
                  <BulkListProvider>
                    <NavigationBar />
                    <PageLayout {...pageProps}>
                      <Component {...pageProps} />
                    </PageLayout>
                    <Footer links={links} />
                  </BulkListProvider>
                </CurrencyProvider>
              </ViewerProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ApolloProvider>
    </div>
  );
}

export default appWithTranslation(AppPage, nextI18NextConfig);

interface FooterProps {
  links: {
    href: string;
    title: string;
    popout: boolean;
  }[][];
}

function Footer({ links }: FooterProps) {
  const socials = useCallback(() => {
    return (
      <div className={clsx('flex gap-6 text-[#A8A8A8] lg:justify-end')}>
        {/* Social media */}
        {config.socialMedia.twitter && (
          <Link
            target="_blank"
            rel="nofollow noreferrer"
            className="hover:text-white"
            href={config.socialMedia.twitter}
          >
            <Icon.Twitter />
          </Link>
        )}
        {config.socialMedia.discord && (
          <Link
            target="_blank"
            rel="nofollow noreferrer"
            className="hover:text-white"
            href={config.socialMedia.discord}
          >
            <Icon.Discord />
          </Link>
        )}
        {config.socialMedia.medium && (
          <Link
            target="_blank"
            rel="nofollow noreferrer"
            className="hover:text-white"
            href={config.socialMedia.medium}
          >
            <Icon.Medium />
          </Link>
        )}
      </div>
    );
  }, []);

  return (
    <footer className="mt-16 bg-gray-900 py-20 px-6 md:mt-28">
      <div className={clsx(`flex h-full w-full items-stretch justify-around`)}>
        <div className="flex flex-col justify-between lg:block">
          <div>
            <Link
              className="flex flex-row gap-2 whitespace-nowrap pb-6 text-2xl font-bold"
              href="/"
            >
              <img
                src="/images/nightmarket-stacked-beta.svg"
                className="h-8 w-auto object-fill md:h-20"
                alt="night market logo"
              />
            </Link>
            <div>
              <Icon.Motley />
            </div>
          </div>
          <div className="mt-8 block lg:hidden">{socials()}</div>
        </div>
        <div className="lg:flex lg:w-1/2 lg:items-center lg:justify-evenly">
          {links.map((col, colKey) => {
            return (
              <div
                className={`flex flex-col text-right text-white lg:text-center`}
                key={`footer-col-${colKey}`}
              >
                {col.map((link, linkKey) => {
                  return (
                    <Link
                      className="pb-2 hover:underline lg:pb-1"
                      target={link.popout ? '_blank' : '_self'}
                      href={link.href}
                      key={`footer-col-${colKey}-${linkKey}`}
                    >
                      {link.title}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="hidden items-center lg:flex">{socials()}</div>
      </div>
    </footer>
  );
}

/* eslint-disable react/jsx-no-useless-fragment */
import { Popover, Transition } from '@headlessui/react';
import { Bars3Icon, CheckIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';

import clsx from 'clsx';
import type { NextPage } from 'next';
import { appWithTranslation } from 'next-i18next';
import { useTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Script from 'next/script';
import type { ReactElement } from 'react';
import React, { useMemo, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Fragment, useCallback, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { SWRConfig, useSWRConfig } from 'swr';
import useSWR from 'swr';

import nextI18NextConfig from '../../next-i18next.config.js';
import Button, { ButtonBackground, ButtonBorder, ButtonColor } from '../components/Button';
import Icon from '../components/Icon';
import Img from '../components/Image';
import Search from '../components/Search';
import { BriceFont, HauoraFont } from '../fonts';
import useGlobalSearch from '../hooks/globalsearch';
import useLogin from '../hooks/login';
import useMobileSearch from '../hooks/mobilesearch';
import useNavigation from '../hooks/nav';
import { useOutsideAlert } from '../hooks/outsidealert';
import { fetcher } from '../infrastructure/api/fetcher';
import { start } from '../modules/bugsnag';
import { AuctionHouseContextProvider } from '../providers/AuctionHouseProvider';
import BulkListProvider from '../providers/BulkListProvider';
import CurrencyProvider from '../providers/CurrencyProvider';
import { WalletContextProvider, useWalletContext } from '../providers/WalletContextProvider';
import type { OverallStat, RPCReport, StatSearch } from '../typings/index.js';
import { getCookie, setCookie } from '../utils/cookies';
import { getSolFromLamports } from '../utils/price';
import { hideTokenDetails } from '../utils/tokens';
import './../../styles/globals.css';
import config from './../app.config';

start();

const DEFAULT_IMAGE = '/images/placeholder.png';

function clusterApiUrl(network: WalletAdapterNetwork) {
  if (network == WalletAdapterNetwork.Mainnet) {
    return config.solanaRPCUrl;
  }

  throw new Error(`The ${network} is not supported`);
}

const EmptyBox = () => <div className="h-6 w-14 animate-pulse rounded-md bg-white transition" />;

function ReportHeader() {
  const {
    data: rpcReport,
    isLoading: isReportLoading,
    isValidating: isReportValidating,
  } = useSWR<RPCReport>(`/rpc/report?address=${config.auctionHouse}`, {
    revalidateOnFocus: false,
  });

  const {
    data: overallStat,
    isLoading: isStatLoading,
    isValidating: isStatValidating,
  } = useSWR<OverallStat>(`/stat/overall`, {
    revalidateOnFocus: false,
  });

  const loading = useMemo(
    () => isReportLoading || isReportValidating || isStatLoading || isStatValidating,
    [isReportLoading, isReportValidating, isStatLoading, isStatValidating]
  );

  return (
    <div className="hidden items-center justify-center gap-12 bg-gradient-primary py-2 px-4 md:flex">
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">Market cap</span>
        {loading || !rpcReport || !overallStat || !overallStat.marketCap ? (
          <EmptyBox />
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{`$${(
              overallStat.marketCap / 1000000
            ).toFixed(2)}M`}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">24h volume</span>
        {loading || !rpcReport || !overallStat || !overallStat.volume1d || !rpcReport.solPrice ? (
          <EmptyBox />
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{`${(
              overallStat.volume1d /
              rpcReport.solPrice /
              1000
            ).toFixed(2)}K SOL`}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">SOL price</span>
        {loading || !rpcReport || !rpcReport.solPrice ? (
          <EmptyBox />
        ) : (
          <span className="font-semibold text-white">${`${rpcReport.solPrice?.toFixed(2)}`}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">SOL TPS</span>
        {loading || !rpcReport || !rpcReport.tps ? (
          <EmptyBox />
        ) : (
          <span className="font-semibold text-white">
            {`${rpcReport.tps}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
          </span>
        )}
      </div>
    </div>
  );
}

function NavigationBar() {
  const [showNav, setShowNav] = useNavigation();

  useEffect(() => {
    const html = document.documentElement;
    html.style.overflow = showNav ? 'hidden' : '';
    return (): void => {
      html.style.overflow = '';
    };
  }, [showNav]);

  const { searchExpanded, setSearchExpanded } = useMobileSearch();
  const [showMode, setShowMode] = useState<string>('collection');

  const expandedSearchRef = useRef<HTMLDivElement | null>(null);
  useOutsideAlert(
    expandedSearchRef,
    useCallback(() => {
      setSearchExpanded(false);
    }, [setSearchExpanded])
  );

  const onLogin = useLogin();

  const { publicKey, connecting } = useWalletContext();

  const { t } = useTranslation('common');

  const { updateSearch, searchTerm, setSearchTerm, results, searching, hasResults } =
    useGlobalSearch();

  return (
    <>
      <ReportHeader />
      <header>
        <div
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
              type="button"
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
              {(comboOpened) => (
                <div
                  ref={expandedSearchRef}
                  className={clsx(
                    'fixed w-full md:relative',
                    searchExpanded ? ' inset-0  h-14  px-4 py-2' : ''
                  )}
                >
                  <Search.Input
                    comboOpened={comboOpened}
                    onChange={(e) => {
                      updateSearch(e);
                    }}
                    value={searchTerm}
                    setValue={setSearchTerm}
                    className="mx-auto hidden w-full max-w-4xl md:block"
                    autofocus={false}
                    placeholder={t(`search.placeholder`, { ns: 'common' })}
                  />

                  {searchExpanded && (
                    <Search.Input
                      comboOpened={comboOpened}
                      onChange={(e) => {
                        updateSearch(e);
                      }}
                      value={searchTerm}
                      setValue={setSearchTerm}
                      autofocus={true}
                      className="md:hidden"
                      placeholder={t(`search.placeholder`, { ns: 'common' })}
                    />
                  )}

                  <Search.Results
                    searching={searching}
                    hasResults={hasResults}
                    mode={showMode}
                    setMode={setShowMode}
                  >
                    {showMode === 'collection' && (
                      <>
                        {!results.collections ||
                          (results.collections.length === 0 && (
                            <div className="my-3 sm:flex block px-2">
                              <div className="text-md text-white">
                                {t('search.collectionLabel', { ns: 'common' })}
                              </div>
                              <div className="text-md text-white sm:ml-1 truncate">
                                {searchTerm}
                              </div>
                            </div>
                          ))}
                        <Search.Group<StatSearch[]> result={results.collections}>
                          {({ result }) => {
                            if (!result) return null;

                            return result.map((collection, i) => (
                              <Search.Collection
                                value={collection}
                                key={`search-collection-${collection.slug}-${i}`}
                                image={collection.imgURL || DEFAULT_IMAGE}
                                name={collection.name ?? 'Unknown'}
                                slug={collection.slug ?? 'Unknown'}
                                isVerified={collection.isVerified ?? false}
                              />
                            ));
                          }}
                        </Search.Group>
                      </>
                    )}
                    {showMode === 'profile' && (
                      <>
                        {!results.profiles ||
                          (results.profiles.length === 0 && (
                            <div className="my-3 sm:flex block px-2">
                              <div className="text-md text-white">
                                {t('search.profileLabel', { ns: 'common' })}
                              </div>
                              <div className="text-md text-white sm:ml-1 truncate">
                                {searchTerm}
                              </div>
                            </div>
                          ))}

                        <Search.Group<StatSearch[]> result={results.profiles}>
                          {({ result }) => {
                            if (!result) return null;

                            return result.map((profile, i) => (
                              <Search.Profile
                                value={profile}
                                key={`search-profile-${profile.address}-${i}`}
                                name={profile.twitter as string}
                                slug={profile.address ?? ''}
                              />
                            ));
                          }}
                        </Search.Group>
                      </>
                    )}
                    {showMode === 'nft' && (
                      <>
                        {!results.nft ? (
                          <div className="my-3 sm:flex block px-2">
                            <div className="text-md text-white">
                              {t('search.nftLabel', { ns: 'common' })}
                            </div>
                            <div className="text-md text-white sm:ml-1 truncate">{searchTerm}</div>
                          </div>
                        ) : (
                          <>
                            <Search.MintAddress
                              value={results.nft}
                              image={results.nft.image}
                              slug={results.nft.mintAddress}
                              name={results.nft.name}
                              creator={results.nft.owner ? hideTokenDetails(results.nft.owner) : ''}
                            />
                          </>
                        )}
                      </>
                    )}
                  </Search.Results>
                </div>
              )}
            </Search>
          </div>
          {/* Connect and Mobile Menu */}
          <div className="flex items-center justify-end space-x-6">
            <button
              type="button"
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

            {connecting ? (
              <div className="hidden h-10 w-10 rounded-full bg-gray-900 md:inline-block" />
            ) : publicKey ? (
              <ProfilePopover />
            ) : (
              <Button onClick={onLogin} className="hidden font-semibold md:inline-block">
                {t('connect', { ns: 'common' })}
              </Button>
            )}

            {/* mobile nav */}
          </div>
        </div>
        <MobileNavMenu showNav={showNav} setShowNav={setShowNav} />
      </header>
    </>
  );
}

function ProfilePopover() {
  const { disconnect, address, balance } = useWalletContext();

  const { t } = useTranslation('common');

  const [copied, setCopied] = useState(false);
  const copyWallet = useCallback(async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

  const { setVisible } = useWalletModal();

  if (!address) return null;

  return (
    <Popover className={'relative'}>
      <Popover.Button>
        <Img
          src={DEFAULT_IMAGE}
          className={clsx(
            'hidden h-10 w-10 cursor-pointer rounded-full transition md:inline-block',
            'animate-draw-border border-2 border-primary-100 duration-100'
          )}
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
                <Img
                  src={DEFAULT_IMAGE}
                  className="hidden h-6 w-6 cursor-pointer rounded-full transition md:inline-block"
                  alt="profile image"
                />
                <span className="ml-2">{hideTokenDetails(address)}</span>

                <button
                  type="button"
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
                {getSolFromLamports(balance ?? 0, 0, 3)}
              </div>
              <div onClick={() => close()} className="flex flex-col pb-4">
                <Link
                  className="flex cursor-pointer px-4 py-2 text-sm hover:bg-gray-800"
                  href={`/profiles/${address}`}
                >
                  {t('profileMenu.collected', { ns: 'common' })}
                </Link>
                <Link
                  className="flex cursor-pointer px-4 py-2 text-sm hover:bg-gray-800"
                  href={`/profiles/${address}/activity`}
                >
                  {t('profileMenu.activity', { ns: 'common' })}
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex px-4">
                  <Link className="flex w-full" href={`/profiles/${address}`}>
                    <Button onClick={() => close()} className="w-full">
                      {t('viewProfile', { ns: 'common' })}
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
                    {t('switchWallet', { ns: 'common' })}
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
                    {t('disconnectWallet', { ns: 'common' })}
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
  const { connecting, disconnect, address, balance } = useWalletContext();
  const { setVisible } = useWalletModal();
  const onLogin = useLogin();

  const { t } = useTranslation('common');

  const [copied, setCopied] = useState(false);
  const copyWallet = useCallback(async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-gray-900 py-2 md:hidden',
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
            type="button"
            className="rounded-full bg-white p-3 transition hover:bg-gray-100"
            onClick={() => setShowNav(false)}
          >
            <XMarkIcon color="#171717" width={20} height={20} />
          </button>
        </div>
        <nav className="flex flex-col bg-gray-900 py-2 md:p-2">
          <div className="flex h-[calc(100vh-58px)] flex-col gap-4 px-6 text-white">
            {connecting ? (
              <div className="h-10 w-10 rounded-full bg-gray-900 md:inline-block" />
            ) : address ? (
              <section className="flex flex-col" id="wallet-profile-viewer-mobile">
                <div className="flex items-center py-4 ">
                  <Img
                    src={DEFAULT_IMAGE}
                    className="inline-block h-8 w-8 rounded-full border-2 border-primary-100 transition"
                    alt="profile image"
                  />
                  <span className="ml-2">{hideTokenDetails(address)}</span>

                  <button
                    type="button"
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
                  {getSolFromLamports(balance ?? 0, 0, 3)}
                </div>
                <Link
                  href={`/profiles/${address}`}
                  className="flex cursor-pointer py-2 text-sm hover:bg-gray-800"
                >
                  {t('profileMenu.collected', { ns: 'common' })}
                </Link>
                <Link
                  href={`/profiles/${address}/activity`}
                  className="flex cursor-pointer py-2 text-sm hover:bg-gray-800"
                >
                  {t('profileMenu.activity', { ns: 'common' })}
                </Link>
              </section>
            ) : (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <></>
            )}
          </div>
        </nav>
      </div>
      <div className={clsx('fixed bottom-0 z-40 w-full px-4', showNav ? 'block' : 'hidden')}>
        {!connecting ? (
          address ? (
            <section
              className="mt-auto mb-4 flex flex-col justify-end gap-4"
              id="wallet-action-buttons-mobile"
            >
              <Link href={`/profiles/${address}`} className="flex w-full">
                <Button className="w-full font-semibold" onClick={() => setShowNav(false)}>
                  {t('viewProfile', { ns: 'common' })}
                </Button>
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
                {t('switchWallet', { ns: 'common' })}
              </Button>

              <Button
                onClick={disconnect}
                border={ButtonBorder.Gray}
                color={ButtonColor.Gray}
                className="w-full !bg-black font-semibold"
              >
                {t('disconnectWallet', { ns: 'common' })}
              </Button>
            </section>
          ) : (
            <section className="mt-auto flex py-4" id="wallet-connect-action-mobile">
              <Button className="w-full font-semibold" onClick={onLogin}>
                {t('connect', { ns: 'common' })}
              </Button>
            </section>
          )
        ) : null}
      </div>
    </>
  );
}

type NextPageWithLayout = NextPage & {
  getLayout?: (props: { children: ReactElement }) => ReactElement;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export const COOKIE_REF = 'ref';
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
    [
      { href: config.website, title: 'About the DAO', popout: true },
      { href: config.status, title: 'Status', popout: true },
    ],
    [
      { href: '/legal/motley_dao-terms_of_service.pdf', title: 'Terms of Service', popout: true },
      { href: '/legal/motley_dao-privacy_policy.pdf', title: 'Privacy Policy', popout: true },
    ],
  ];

  const router = useRouter();

  useEffect(() => {
    if (router.query?.[COOKIE_REF]) {
      const hasCookie = getCookie(COOKIE_REF);
      if (!hasCookie) {
        setCookie(COOKIE_REF, (router.query?.[COOKIE_REF] as string).toLowerCase(), 60);
      }
    }
  }, [router.query?.[COOKIE_REF]]);

  const { cache } = useSWRConfig();

  // Clean cache for every request on server
  if (typeof window === 'undefined') {
    cache.clear();
  }

  return (
    <div className={`${BriceFont.variable} ${HauoraFont.variable} font-sans `}>
      <Script defer data-domain="nightmarket.io" src="https://plausible.io/js/script.js"></Script>
      <SWRConfig value={{ fetcher }}>
        <ToastContainer theme="dark" />
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider
              className={`${BriceFont.variable} ${HauoraFont.variable} wallet-modal-theme font-sans`}
            >
              <WalletContextProvider>
                <CurrencyProvider>
                  <BulkListProvider>
                    <AuctionHouseContextProvider>
                      <NavigationBar />
                      <PageLayout {...pageProps}>
                        <Component {...pageProps} />
                      </PageLayout>
                      <Footer links={links} />
                    </AuctionHouseContextProvider>
                  </BulkListProvider>
                </CurrencyProvider>
              </WalletContextProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </SWRConfig>
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
            <Link target="_blank" rel="nofollow noreferrer" href={`https://motleydao.com/`}>
              <Icon.Motley />
            </Link>
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

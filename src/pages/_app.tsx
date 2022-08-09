import { useCallback, useMemo, ReactElement } from 'react'
import { appWithTranslation } from 'next-i18next'
import type { AppProps } from 'next/app'
import { NextPage } from 'next'
import clsx from 'clsx'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import { useTranslation } from 'next-i18next'
import { ApolloProvider, useQuery } from '@apollo/client'
import Link from 'next/link'
import useNavigation from './../hooks/nav'
import useLogin from '../hooks/login'
import ViewerProvider from '../providers/ViewerProvider'
import Button, { ButtonSize } from './../components/Button'
import client from './../client'
import './../../styles/globals.css'
import { Viewer, Wallet } from './../types'
import config from './../app.config'
import GetViewerQuery from './../queries/viewer.graphql'

function clusterApiUrl(network: WalletAdapterNetwork) {
  if (network == WalletAdapterNetwork.Mainnet) {
    return config.solanaRPCUrl
  }

  throw new Error(`The ${network} is not supported`)
}

interface AppComponentProps {
  children: JSX.Element
}

interface GetViewerData {
  viewer: Viewer
  wallet: Wallet
}

function App({ children }: AppComponentProps) {
  const [showNav, setShowNav] = useNavigation()
  const onLogin = useLogin()
  const { connected, publicKey, disconnect, connecting } = useWallet()
  const viewerQueryResult = useQuery<GetViewerData>(GetViewerQuery, {
    variables: {
      address: publicKey?.toBase58(),
    }
  })

  const { t } = useTranslation('common')

  const loading = viewerQueryResult.loading || connecting

  return (
    <>
      <header className="flex flex-row justify-between items-center px-4 py-2 md:px-8 md:py-4">
        <Link href="/" passHref>
          <a className="text-2xl font-bold flex flex-row gap-2">
            👋
            <span className="hidden md:inline-block text-white">{t('header.title')}</span>
          </a>
        </Link>
        {loading ? (
          <div className="hidden md:inline-block rounded-full h-10 w-10 bg-gray-800" />
        ) : (
          viewerQueryResult.data?.viewer ? (
            <img className="hidden md:inline-block rounded-full h-10 w-10 transition cursor-pointer" src={viewerQueryResult.data?.wallet.profile?.profileImageUrlHighres} />
          ) : (
            <Button onClick={onLogin} size={ButtonSize.Small} className="hidden md:inline-block">
              {t('connect')}
            </Button>
          )
        )}
        <button
          className="rounded-full p-3 bg-transparent shadow-lg transition md:hidden hover:bg-gray-800"
          onClick={useCallback(() => {
            setShowNav(true)
          }, [setShowNav])}
        >
          <MenuIcon color="#fff" width={16} height={16} />
        </button>
        <div className={clsx('fixed left-0 right-0 top-0 bottom-0 z-50 px-4 py-2 bg-gray-900 md:hidden', showNav ? 'block' : 'hidden')}>
          <div className="w-full flex flex-row justify-between items-center md:hidden">
            <span className="text-2xl">👋</span>
            <button
              className="rounded-full p-3 bg-transparent bg-white transition hover:bg-gray-100"
              onClick={useCallback(() => {
                setShowNav(false)
              }, [setShowNav])}
            >
              <XIcon color="#171717" width={16} height={16} />
            </button>
          </div>
          <nav>

          </nav>
        </div>
      </header>
      {children}
    </>
  )
}

type NextPageWithLayout = NextPage & {
  getLayout?: (props: { children: ReactElement }) => ReactElement;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function AppPage({ Component, pageProps }: AppPropsWithLayout) {
  const network = WalletAdapterNetwork.Mainnet

  const endpoint = useMemo(() => clusterApiUrl(network), [])

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
  )

  const PageLayout = Component.getLayout ?? ((props: { children: ReactElement }) => props.children);

  return (
    <ApolloProvider client={client}>
      <ConnectionProvider
        endpoint={endpoint}
      >
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider className="wallet-modal-theme">
            <ViewerProvider>
              <App>
                <PageLayout {...pageProps}>
                  <Component {...pageProps} />
                </PageLayout>
              </App>
            </ViewerProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ApolloProvider>
  )
}

export default appWithTranslation(AppPage)

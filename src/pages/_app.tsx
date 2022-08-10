import { useCallback, useMemo, ReactElement } from "react";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import { NextPage } from "next";
import clsx from "clsx";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useTranslation } from "next-i18next";
import { ApolloProvider, useQuery } from "@apollo/client";
import Link from "next/link";
import useNavigation from "./../hooks/nav";
import useLogin from "../hooks/login";
import ViewerProvider from "../providers/ViewerProvider";
import Button, { ButtonSize } from "./../components/Button";
import client from "./../client";
import "./../../styles/globals.css";
import { Viewer, Wallet } from "./../types";
import config from "./../app.config";
import GetViewerQuery from "./../queries/viewer.graphql";
import { Search } from "../components/Search";
import useGlobalSearch from "../hooks/globalsearch";
import { shortenAddress } from "../util";

function clusterApiUrl(network: WalletAdapterNetwork) {
  if (network == WalletAdapterNetwork.Mainnet) {
    return config.solanaRPCUrl;
  }

  throw new Error(`The ${network} is not supported`);
}

interface AppComponentProps {
  children: JSX.Element;
}

interface GetViewerData {
  viewer: Viewer;
  wallet: Wallet;
}

function App({ children }: AppComponentProps) {
  const [showNav, setShowNav] = useNavigation()
  const onLogin = useLogin()
  const { publicKey, connecting } = useWallet()
  const viewerQueryResult = useQuery<GetViewerData>(GetViewerQuery, {
    variables: {
      address: publicKey?.toBase58(),
    },
  });

  const { t } = useTranslation("common");

  const { updateSearch, searchTerm, results, searching, hasResults } =
    useGlobalSearch();

  const loading = viewerQueryResult.loading || connecting;

  return (
    <>
      <header className="flex flex-row justify-between items-center px-4 py-2 md:px-8 md:py-4">
        <section className={"flex items-center gap-2 w-full"}>
          <Link href="/" passHref>
            <a className="text-2xl font-bold flex flex-row gap-2 whitespace-nowrap">
              👋
              <span className="hidden md:inline-block text-white">
                {t("header.title")}
              </span>
            </a>
          </Link>
          <Search>
            <Search.Input onChange={updateSearch} value={searchTerm} />
            <Search.Results searching={searching} hasResults={hasResults}>
              <Search.Group
                title={"Collections"}
                results={results?.collections}
              >
                {results?.collections.map((collection, i) => (
                  <Search.Collection
                    key={`search-collection-${collection.mintAddress}-${i}`}
                    image={collection.image}
                    name={collection.name}
                    address={collection.mintAddress}
                  />
                ))}
              </Search.Group>
              <Search.Group title={"Profiles"} results={results?.profiles}>
                {results?.profiles.map((profile, i) => (
                  <Search.Profile
                    profile={profile}
                    key={`search-profile-${profile.address}-${i}`}
                    image={profile.profile?.profileImageUrlLowres || ""}
                    name={
                      profile.profile?.handle || shortenAddress(profile.address)
                    }
                    handle={
                      profile.profile?.handle || shortenAddress(profile.address)
                    }
                    address={profile.address}
                  />
                ))}
              </Search.Group>
              <Search.Group title={"Wallet"} results={results?.wallet}>
                <Search.Profile
                  profile={results?.wallet}
                  key={`search-wallet-${results?.wallet}`}
                  image={results?.wallet?.profile?.profileImageUrlLowres || ""}
                  name={
                    results?.wallet?.profile?.handle ||
                    shortenAddress(results?.wallet?.address)
                  }
                  handle={
                    results?.wallet?.profile?.handle ||
                    shortenAddress(results?.wallet?.address)
                  }
                  address={results?.wallet?.address || ""}
                />
              </Search.Group>
              <Search.Group title={"NFTs"} results={results?.nfts}>
                {results?.nfts.map((nft, i) => (
                  <Search.MintAddress
                    nft={nft}
                    key={`search-mintAddress-${nft.address}-${i}`}
                    image={nft.image}
                    address={nft.mintAddress}
                    name={nft.name}
                    creatorHandle={nft.creators[0].profile?.handle}
                    creatorAddress={nft.creators[0].address}
                  />
                ))}
              </Search.Group>
            </Search.Results>
          </Search>
        </section>
        {loading ? (
          <div className="hidden md:inline-block rounded-full h-10 w-10 bg-gray-800" />
        ) : viewerQueryResult.data?.viewer ? (
          <img
            className="hidden md:inline-block rounded-full h-10 w-10 transition cursor-pointer"
            src={viewerQueryResult.data?.wallet.profile?.profileImageUrlHighres}
          />
        ) : (
          <Button
            onClick={onLogin}
            size={ButtonSize.Small}
            className="hidden md:inline-block"
          >
            {t("connect")}
          </Button>
        )}
        <button
          className="rounded-full p-3 bg-transparent shadow-lg transition md:hidden hover:bg-gray-800"
          onClick={useCallback(() => {
            setShowNav(true);
          }, [setShowNav])}
        >
          <MenuIcon color="#fff" width={16} height={16} />
        </button>
        <div
          className={clsx(
            "fixed left-0 right-0 top-0 bottom-0 z-50 px-4 py-2 bg-gray-900 md:hidden",
            showNav ? "block" : "hidden"
          )}
        >
          <div className="w-full flex flex-row justify-between items-center md:hidden">
            <span className="text-2xl">👋</span>
            <button
              className="rounded-full p-3 bg-transparent bg-white transition hover:bg-gray-100"
              onClick={useCallback(() => {
                setShowNav(false);
              }, [setShowNav])}
            >
              <XIcon color="#171717" width={16} height={16} />
            </button>
          </div>
          <nav></nav>
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
  const network = WalletAdapterNetwork.Mainnet

  const endpoint = useMemo(() => clusterApiUrl(network), []);

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

  const PageLayout =
    Component.getLayout ??
    ((props: { children: ReactElement }) => props.children);

  return (
    <ApolloProvider client={client}>
      <ConnectionProvider endpoint={endpoint}>
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
  );
}

export default appWithTranslation(AppPage);

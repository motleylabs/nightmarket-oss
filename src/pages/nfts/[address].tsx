import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import client from './../../client';
import { NftQuery, NftDetailsQuery } from './../../queries/nft.graphql';
import { Nft, AuctionHouse, NftOwner, Maybe } from './../../graphql.types';
import { ReactNode, useMemo } from 'react';
import NftLayout from '../../layouts/NftLayout';
import { useTranslation } from 'next-i18next';
import config from './../../app.config';
import Icon from './../../components/Icon';
import Img from "./../../components/Image"
import { useQuery } from '@apollo/client';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'nft']);

  const {
    data: { nft, auctionHouse },
  } = await client.query({
    query: NftQuery,
    fetchPolicy: 'network-only',
    variables: {
      address: params?.address,
      auctionHouse: config.auctionHouse,
    },
  });

  if (nft === null) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      nft,
      auctionHouse,
      ...i18n,
    },
  };
}

interface NftDetailPageProps {
  nft: Nft;
  auctionHouse: AuctionHouse;
}

interface NftDetailsQueryData {
  nft: Nft;
}

interface NftDetailsQueryVariables {
  address: string;
}

export default function NftDetails({ nft, auctionHouse }: NftDetailPageProps) {
  const { t } = useTranslation('nft');
  const nftQuery = useQuery<NftDetailsQueryData, NftDetailsQueryVariables>(NftDetailsQuery, {
    variables: { address: nft.mintAddress },
  });

  const owner: Maybe<NftOwner> | undefined = useMemo(() => {
    if (nftQuery.data) {
      return nftQuery.data.nft.owner;
    }

    return nft.owner;
  }, [nftQuery.data, nft]);

  return (
    <>
      {(nft.attributes || []).length > 0 && (
        <>
          <h3 className="mb-4 text-xl">{t('attributes', { ns: 'nft' })}</h3>
          <div className="mb-6 grid grid-cols-2 gap-2 lg:grid-cols-3">
            {nft.attributes?.map((attribute) => (
              <div
                className="flex flex-col justify-between gap-2 rounded-lg bg-gray-800 p-4"
                key={attribute.traitType}
              >
                <span className=" text-sm text-gray-300">{attribute.traitType}</span>
                <span className="truncate text-white">{attribute.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <h3 className="mb-4 text-xl text-white">{t('details', { ns: 'nft' })}</h3>
      <ul className="mb-6 grid grid-cols-1 gap-2 text-sm text-gray-300">
        <li className="flex items-center justify-between">
          <div>{t('mintAddress', { ns: 'nft' })}</div>
          <div className="flex flex-row items-center gap-1">
            <a
              target="_blank"
              rel="nofollow noreferrer"
              href={`https://explorer.solana.com/address/${nft.mintAddress}`}
            >
              <Icon.Sol className="h-3.5 w-3.5" />
            </a>
            <a
              target="_blank"
              rel="nofollow noreferrer"
              href={`https://solscan.io/token/${nft.mintAddress}`}
            >
              <Icon.SolScan width={12} height={12} className="cursor-pointer fill-gray-500" />
            </a>
            {nft.shortMintAddress}
          </div>
        </li>
        <li className="flex items-center justify-between">
          <div>{t('tokenAddress', { ns: 'nft' })}</div>
          <div className="flex flex-row items-center gap-1">
            <a
              target="_blank"
              rel="nofollow noreferrer"
              href={`https://explorer.solana.com/address/${nft.address}`}
            >
              <Icon.Sol className="h-3.5 w-3.5" />
            </a>
            <a
              target="_blank"
              rel="nofollow noreferrer"
              href={`https://solscan.io/token/${nft.address}`}
            >
              <Icon.SolScan width={12} height={12} className="cursor-pointer fill-white" />
            </a>
            {nft.shortAddress}
          </div>
        </li>
        {nftQuery.data?.nft.moonrankCollection?.verifiedCollectionAddress && (
          <li className="flex items-center justify-between">
            <div>{t('collectionAddress', { ns: 'nft' })}</div>
            <div className="flex flex-row items-center gap-1">
              <a
                target="_blank"
                rel="nofollow noreferrer"
                href={`https://explorer.solana.com/address/${nftQuery.data?.nft.moonrankCollection?.verifiedCollectionAddress}`}
              >
                <Icon.Sol className="h-3.5 w-3.5" />
              </a>
              <a
                target="_blank"
                rel="nofollow noreferrer"
                href={`https://solscan.io/token/${nftQuery.data?.nft.moonrankCollection?.verifiedCollectionAddress}`}
              >
                <Icon.SolScan width={12} height={12} className="cursor-pointer fill-white" />
              </a>
              {nftQuery.data?.nft.moonrankCollection?.shortVerifiedCollectionAddress}
            </div>
          </li>
        )}
        <li className="flex items-center justify-between">
          <div>{t('owner', { ns: 'nft' })}</div>
          <Link
            className="flex flex-row items-center gap-1"
            href={`/profiles/${owner?.address}`}
          >
            <Img
              fallbackSrc="/images/placeholder.png"
              src={owner?.previewImage as string}
              className="h-6 w-6 rounded-full border border-gray-800 object-cover"
              alt="nft owner avatar image"
            />
            <span>{owner?.displayName}</span>
          </Link>
        </li>
        <li className="flex items-center justify-between">
          <div>{t('enforcement', { ns: 'nft' })}</div>
          <div>{nft.tokenStandard === "PROGRAMMABLE_NON_FUNGIBLE" ? "Yes" : "No"}</div>
        </li>
        <li className="flex items-center justify-between">
          <div>{t('royalties', { ns: 'nft' })}</div>
          <div>{`${nft.royalties}%`}</div>
        </li>
        <li className="flex items-center justify-between">
          <div>{t('fee', { ns: 'nft' })}</div>
          <div>{`${auctionHouse?.fee}%`}</div>
        </li>
      </ul>
      {nftQuery.data?.nft.moonrankCollection && (
        <>
          <h3 className="mb-4 text-xl text-white">{t('collection', { ns: 'nft' })}</h3>
          <p className="text-gray-300">{nftQuery.data?.nft?.moonrankCollection.description}</p>
        </>
      )}
    </>
  );
}

interface NftDetailsLayoutProps {
  children: ReactNode;
  nft: Nft;
  auctionHouse: AuctionHouse;
}

NftDetails.getLayout = function NftDetailsLayout({
  children,
  nft,
  auctionHouse,
}: NftDetailsLayoutProps): JSX.Element {
  return (
    <NftLayout auctionHouse={auctionHouse} nft={nft}>
      {children}
    </NftLayout>
  );
};

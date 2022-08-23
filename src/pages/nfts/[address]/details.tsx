import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import client from './../../../client';
import { NftQuery } from './../../../queries/nft.graphql';
import { Nft, Marketplace } from '../../../types';
import { ReactNode } from 'react';
import NftLayout from '../../../layouts/NftLayout';
import { useTranslation } from 'next-i18next';
import config from './../../../app.config';
import Icon from './../../../components/Icon';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  const i18n = await serverSideTranslations(locale as string, ['common', 'nft']);

  const {
    data: { nft, marketplace },
  } = await client.query({
    query: NftQuery,
    variables: {
      address: params?.address,
      subdomain: config.marketplaceSubdomain,
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
      marketplace,
      ...i18n,
    },
  };
}

interface NftDetailPageProps {
  nft: Nft;
  marketplace: Marketplace;
}

export default function NftDetails({ nft, marketplace }: NftDetailPageProps) {
  const { t } = useTranslation('nft');
  const auctionHouse = marketplace.auctionHouses[0];

  return (
    <>
      {(nft.attributes || []).length > 0 && (
        <>
          <h3 className="mb-4 text-xl">{t('attributes')}</h3>
          <div className="mb-6 grid grid-cols-2 gap-2 lg:grid-cols-3">
            {nft.attributes?.map((attribute) => (
              <div
                className="flex flex-col justify-between gap-2 rounded-lg border border-gray-800 p-2"
                key={attribute.traitType}
              >
                <span className=" text-sm text-gray-300">{attribute.traitType}</span>
                <span className="text-white">{attribute.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <h3 className="mb-4 text-xl">{t('details')}</h3>
      <ul className="mb-6 grid grid-cols-1 gap-2 text-sm text-gray-300">
        <li className="flex items-center justify-between">
          <div>{t('mintAddress')}</div>
          <div className="flex flex-row items-center gap-1">
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://explorer.solana.com/address/${nft.mintAddress}`}
            >
              <Icon.Solana width={12} height={10} className="cursor-pointer fill-white" />
            </a>
            <a target="_blank" rel="noreferrer" href={`https://solscan.io/token/${nft.mintAddress}`}>
              <Icon.SolScan width={12} height={12} className="cursor-pointer fill-white" />
            </a>
            {nft.shortMintAddress}
          </div>
        </li>
        <li className="flex items-center justify-between">
          <div>{t('tokenAddress')}</div>
          <div className="flex flex-row items-center gap-1">
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://explorer.solana.com/address/${nft.address}`}
            >
              <Icon.Solana width={12} height={10} className="cursor-pointer fill-white" />
            </a>
            <a target="_blank" rel="nofollow" href={`https://solscan.io/token/${nft.address}`}>
              <Icon.SolScan width={12} height={12} className="cursor-pointer fill-white" />
            </a>
            {nft.shortAddress}
          </div>
        </li>
        {nft.collection && (
          <li className="flex items-center justify-between">
            <div>{t('collectionAddress')}</div>
            <div className="flex flex-row items-center gap-1">
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://explorer.solana.com/address/${nft.collection?.nft?.mintAddress}`}
              >
                <Icon.Solana width={12} height={10} className="cursor-pointer fill-white" />
              </a>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://solscan.io/token/${nft.collection?.nft?.mintAddress}`}
              >
                <Icon.SolScan width={12} height={12} className="cursor-pointer fill-white" />
              </a>
              {nft.collection?.nft?.shortMintAddress}
            </div>
          </li>
        )}
        <li className="flex items-center justify-between">
          <div>{t('owner')}</div>
          <Link href={`/profiles/${nft.owner.address}/collected`} passHref>
            <a className="flex flex-row items-center gap-1">
              <img
                src={nft.owner.previewImage}
                className="h-6 w-6 rounded-full border border-gray-800 object-cover"
                alt="nft owner avatar image"
              />
              <span>{nft.owner.displayName}</span>
            </a>
          </Link>
        </li>
        <li className="flex items-center justify-between">
          <div>{t('royalties')}</div>
          <div>{`${nft.royalties}%`}</div>
        </li>
        <li className="flex items-center justify-between">
          <div>{t('fee')}</div>
          <div>{`${auctionHouse.fee}%`}</div>
        </li>
      </ul>
      {nft.collection && (
        <>
          <h3 className="mb-4 text-xl">{t('collection')}</h3>
          <p className="text-gray-300">{nft?.collection?.nft.description}</p>
        </>
      )}
    </>
  );
}

interface NftDetailsLayoutProps {
  children: ReactNode;
  nft: Nft;
}

NftDetails.getLayout = function NftDetailsLayout({
  children,
  nft,
}: NftDetailsLayoutProps): JSX.Element {
  return <NftLayout nft={nft}>{children}</NftLayout>;
};

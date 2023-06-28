import type { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { api } from '../../infrastructure/api';
import NftLayout from '../../layouts/NftLayout';
import type { Nft, NftDetail } from '../../typings';
import { hideTokenDetails } from '../../utils/tokens';
import Icon from './../../components/Icon';

export async function getServerSideProps({ locale, params }: GetServerSidePropsContext) {
  try {
    const i18n = await serverSideTranslations(locale as string, ['common', 'nft']);

    const { data } = await api.get<Nft>(`/nfts/${params?.address}`);

    if (data == null) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        nft: data,
        ...i18n,
      },
    };
  } catch (err) {
    return {
      redirect: {
        destination: `/`,
      },
    };
  }
}

type NftDetailPageProps = NftDetail;

export default function NftDetails({ nft }: NftDetailPageProps) {
  const { t } = useTranslation('nft');

  return (
    <>
      {(nft.traits || []).length > 0 && (
        <>
          <h3 className="mb-4 text-xl">{t('attributes', { ns: 'nft' })}</h3>
          <div className="mb-6 grid grid-cols-2 gap-2 lg:grid-cols-3">
            {nft.traits?.map((attribute) => (
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
            <Link
              target="_blank"
              rel="nofollow noreferrer"
              href={`https://explorer.solana.com/address/${nft.mintAddress}`}
            >
              <Icon.Sol className="h-3.5 w-3.5" />
            </Link>
            <Link
              target="_blank"
              rel="nofollow noreferrer"
              href={`https://solscan.io/token/${nft.mintAddress}`}
            >
              <Icon.SolScan width={12} height={12} className="cursor-pointer fill-gray-500" />
            </Link>
            {hideTokenDetails(nft.mintAddress)}
          </div>
        </li>
        {!!nft.owner && (
          <li className="flex items-center justify-between">
            <div>{t('owner', { ns: 'nft' })}</div>
            <Link className="flex flex-row items-center gap-1" href={`/profiles/${nft.owner}`}>
              <span>{hideTokenDetails(nft.owner)}</span>
            </Link>
          </li>
        )}
        <li className="flex items-center justify-between">
          <div>{t('enforcement', { ns: 'nft' })}</div>
          <div>{nft.tokenStandard === 'ProgrammableNonFungible' ? 'Yes' : 'No'}</div>
        </li>
        <li className="flex items-center justify-between">
          <div>{t('royalties', { ns: 'nft' })}</div>
          <div>{`${nft.sellerFeeBasisPoints / 100}%`}</div>
        </li>
      </ul>
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

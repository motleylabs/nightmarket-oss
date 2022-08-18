import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useCallback } from 'react';
import { Nft } from '../types';
import { ButtonGroup } from './../components/ButtonGroup';
import Button, { ButtonSize, ButtonType } from './../components/Button';
import { UploadIcon } from '@heroicons/react/outline';
import Head from 'next/head';

interface NftLayoutProps {
  children: ReactNode;
  nft: Nft;
}

enum NftPage {
  Details = '/nfts/[address]/details',
  Offers = '/nfts/[address]/offers',
  Activity = '/nfts/[address]/activity',
}

export default function NftLayout({ children, nft }: NftLayoutProps) {
  const { t } = useTranslation('nft');
  const router = useRouter();

  return (
    <main className="relative mx-auto mt-8 grid max-w-7xl grid-cols-12 px-4 pb-4 md:mt-12 md:px-8 md:pb-8">
      <Head>
        <title>{t('metadata.title', { address: nft.shortMintAddress })}</title>
        <meta name="description" content={nft.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="col-span-12 mb-10 md:col-span-6 md:pr-10 lg:col-span-7">
        <img src={nft.image} alt="nft image" className="w-full rounded-lg object-cover" />
      </div>
      <div className="top-0 z-10 col-span-12 bg-gray-900 pt-20 md:sticky md:col-span-6 md:pl-10 lg:col-span-5">
        <div className="mb-4 flex flex-row items-center justify-between gap-2">
          {nft.collection && (
            <Link href={`/collections/${nft.collection.nft.mintAddress}/nfts`}>
              <a className="flex flex-row items-center gap-2 transition hover:scale-[1.02]">
                <img
                  src={nft.collection.nft.image}
                  className="aspect-square w-10 rounded-md object-cover"
                  alt="collection image"
                />
                <h2 className="text-xl">{nft.collection.nft.name}</h2>
              </a>
            </Link>
          )}
          <Button
            circle
            className="justify-self-end"
            type={ButtonType.Secondary}
            size={ButtonSize.Small}
            icon={<UploadIcon width={12} height={12} />}
          />
        </div>
        <h1 className="mb-6 text-4xl font-semibold">{nft.name}</h1>
        <div className="mb-10 rounded-lg p-6 shadow-xl">
          <div className="flex flex-row items-center justify-between rounded-lg bg-gradient-radial from-gray-900 to-gray-800 p-4">
            <div className="flex flex-col justify-between text-gray-300">
              <span>{t('neverSold')}</span>
              <span>--</span>
            </div>
            <Button type={ButtonType.Primary} size={ButtonSize.Large}>
              {t('bid')}
            </Button>
          </div>
        </div>
      </div>
      <div className="col-span-12 flex flex-col md:col-span-6 md:pr-10 lg:col-span-7">
        <div className="mb-10 flex flex-row items-center justify-center">
          <ButtonGroup value={router.pathname as NftPage} onChange={() => {}}>
            <Link href={`/nfts/${nft.mintAddress}/details`} passHref>
              <a>
                <ButtonGroup.Option value={NftPage.Details}>{t('details')}</ButtonGroup.Option>
              </a>
            </Link>
            <Link href={`/nfts/${nft.mintAddress}/offers`} passHref>
              <a>
                <ButtonGroup.Option value={NftPage.Offers}>{t('offers')}</ButtonGroup.Option>
              </a>
            </Link>
            <Link href={`/nfts/${nft.mintAddress}/activity`} passHref>
              <a>
                <ButtonGroup.Option value={NftPage.Activity}>{t('activity')}</ButtonGroup.Option>
              </a>
            </Link>
          </ButtonGroup>
        </div>
        {children}
      </div>
    </main>
  );
}

import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useCallback } from "react"
import { Nft } from "../types";
import { ButtonGroup } from './../components/ButtonGroup';
import Button, { ButtonSize, ButtonType } from './../components/Button';
import { UploadIcon } from "@heroicons/react/outline";

interface NftLayoutProps {
  children: ReactNode;
  nft: Nft;
}

enum NftPage {
  Details = '/nfts/[address]/details',
  Offers = '/nfts/[address]/offers',
  Activity = '/nfts/[address]/activity'
}

export default function NftLayout({ children, nft }: NftLayoutProps) {
  const { t } = useTranslation('nft');
  const router = useRouter();

  return (
    <main className="mt-8 md:mt-12 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-12">
      <div className="col-span-12 grid grid-cols-12">
        <div className="col-span-12 md:col-span-6 lg:col-span-7 md:pr-10 mb-10">
          <img
            src={nft.image}
            alt="nft image"
            className="w-full object-cover rounded-lg"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-5 pt-20 md:pl-10">
          <div className="flex flex-row items-center justify-between gap-2 mb-4">
            {nft.collection && (
              <Link href={`/collections/${nft.collection.nft.mintAddress}/nfts`}>
                <a className="flex flex-row gap-2 items-center transition hover:scale-[1.02]">
                  <img
                    src={nft.collection.nft.image}
                    className="aspect-square w-10 object-cover rounded-md"
                    alt="collection image"
                  />
                  <h3>{nft.collection.nft.name}</h3>
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
          <h1 className="font-semibold text-4xl mb-6">{nft.name}</h1>
          <div className="shadow-xl rounded-lg p-6 mb-10">
            <div className="flex flex-row items-center justify-between rounded-lg bg-gradient-radial from-gray-900 to-gray-800 p-4">
              <div className="flex flex-col justify-between text-gray-300">
                <span>{t('neverSold')}</span>
                <span>--</span>
              </div>
              <Button
                type={ButtonType.Primary}
                size={ButtonSize.Large}
              >
                {t('bid')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-7 md:pr-10 flex flex-col gap-4 justify-start items-center">
        <ButtonGroup
          value={router.pathname as NftPage}
          onChange={() => { }}
        >
          <Link href={`/nfts/${nft.mintAddress}/details`} passHref>
            <a>
              <ButtonGroup.Option value={NftPage.Details}>
                {t('details')}
              </ButtonGroup.Option>
            </a>
          </Link>
          <Link href={`/nfts/${nft.mintAddress}/offers`} passHref>
            <a>
              <ButtonGroup.Option value={NftPage.Offers}>
                {t('offers')}
              </ButtonGroup.Option>
            </a>
          </Link>
          <Link href={`/nfts/${nft.mintAddress}/activity`} passHref>
            <a>
              <ButtonGroup.Option value={NftPage.Activity}>
                {t('activity')}
              </ButtonGroup.Option>
            </a>
          </Link>
        </ButtonGroup>
        {children}
      </div>
    </main>
  )
}
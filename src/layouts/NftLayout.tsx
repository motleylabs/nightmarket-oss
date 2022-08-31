import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NftMarketInfoQuery } from './../queries/nft.graphql';
import { ReactNode } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import clsx from 'clsx';
import { Nft } from '../graphql.types';
import { ButtonGroup } from './../components/ButtonGroup';
import Button, { ButtonSize, ButtonType } from './../components/Button';
import { UploadIcon } from '@heroicons/react/outline';
import useMakeOffer from '../hooks/offer';
import useListNft from '../hooks/list';
import { Form } from '../components/Form';
import Head from 'next/head';
import { viewerVar } from './../cache';
import Icon from '../components/Icon';

interface NftLayoutProps {
  children: ReactNode;
  nft: Nft;
}

interface NftMarketData {
  nft: Nft;
}

interface NftMarketVariables {
  address: string;
}

enum NftPage {
  Details = '/nfts/[address]/details',
  Offers = '/nfts/[address]/offers',
  Activity = '/nfts/[address]/activity',
}

export default function NftLayout({ children, nft }: NftLayoutProps) {
  const { t } = useTranslation('nft');
  const router = useRouter();
  const viewer = useReactiveVar(viewerVar);

  const nftMarketInfoQuery = useQuery<NftMarketData, NftMarketVariables>(NftMarketInfoQuery, {
    variables: {
      address: router.query.address as string,
    },
  });

  const {
    makeOffer,
    registerOffer,
    onMakeOffer,
    handleSubmitOffer,
    onCancelOffer,
    offerFormState,
  } = useMakeOffer();
  const { listNft, onListNft, onCancelListNft, handleSubmitListNft, registerListNft } =
    useListNft();

  const isOwner = viewer?.address === nft.owner?.address;
  const notOwner = !isOwner;

  const activeForm = makeOffer || listNft;

  return (
    <main className="relative mx-auto mt-8 grid max-w-7xl grid-cols-12 justify-start px-4 pb-4 md:mt-12 md:px-8 md:pb-8">
      <Head>
        <title>{nft.name}</title>
        <meta name="description" content={nft.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="align-self-start col-span-12 mb-10 md:col-span-6 md:pr-10 lg:col-span-7">
        <img src={nft.image} alt="nft image" className=" top-10 z-10 md:sticky w-full rounded-lg object-cover" />
      </div>
      <div className="col-span-12 bg-gray-900 pt-0 md:col-span-6 md:pl-10 md:pt-20 lg:col-span-5">
        <div className="mb-4 flex flex-row items-center justify-between gap-2">
          {nft.collection ? (
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
          ) : (
            <div />
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
        {makeOffer && (
          <Form
            onSubmit={handleSubmitOffer(({ amount }) => {})}
            className="fixed bottom-0 left-0 right-0 z-50 mb-0 rounded-t-md bg-gray-900 shadow-xl md:relative md:z-0 md:mb-10 md:rounded-md"
          >
            <h2 className="border-b-2 border-b-gray-800 p-6 text-center text-lg font-semibold md:border-b-0 md:pb-0 md:text-left">
              {t('placeBid')}
            </h2>
            <div className="px-6 pt-8 pb-6 md:pt-0">
              <div className="flex flex-row justify-start gap-4 md:hidden">
                <img
                  src={nft.image}
                  alt="nft image"
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div className="flex flex-col justify-between">
                  <h6>{nft.name}</h6>
                  {nft.collection && <h4>{nft.collection.nft.name}</h4>}
                </div>
              </div>
              <ul className="my-6 flex flex-grow flex-col gap-2 text-gray-300">
                {nft.collection && (
                  <li className="flex justify-between">
                    <span>{t('currentFloor')}</span>
                    <span>{nft.collection.floorPrice} SOL</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span>{t('lastSold')}</span>
                  <span>48 SOL</span>
                </li>
                {viewer && (
                  <li className="flex justify-between">
                    <span>{t('walletBalance')}</span>
                    <span>{viewer.solBalance} SOL</span>
                  </li>
                )}
              </ul>
              <Form.Label name={t('amount')}>
                <Form.Input
                  {...registerOffer('amount')}
                  autoFocus
                  className="input"
                  icon={<Icon.Solana height={20} width={24} gradient />}
                />
              </Form.Label>
              <Button
                block
                htmlType="submit"
                className="mb-4"
                loading={offerFormState.isSubmitting}
              >
                {t('submitOffer')}
              </Button>
              <Button type={ButtonType.Secondary} block onClick={onCancelOffer}>
                {t('cancel', { ns: 'common' })}
              </Button>
            </div>
          </Form>
        )}
        {listNft && (
          <Form
            onSubmit={handleSubmitListNft(({ amount }) => {})}
            className="fixed bottom-0 left-0 right-0 z-50 mb-0 rounded-t-md bg-gray-900 shadow-xl md:relative md:z-0 md:mb-10 md:rounded-md"
          >
            <h2 className="border-b-2 border-b-gray-800 p-6 text-center text-lg font-semibold md:border-b-0 md:pb-0 md:text-left">
              {t('listNft')}
            </h2>
            <div className="px-6 pt-8 pb-6 md:pt-0">
              <div className="flex flex-row justify-start gap-4 md:hidden">
                <img
                  src={nft.image}
                  alt="nft image"
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div className="flex flex-col justify-between">
                  <h6>{nft.name}</h6>
                  {nft.collection && <h4>{nft.collection.nft.name}</h4>}
                </div>
              </div>
              <div className="mt-6 flex flex-row items-center justify-between p-4">
                <div className="flex flex-col justify-between text-gray-300">
                  <span>{t('highestOffer')}</span>
                  <span>--</span>
                </div>
                <Button type={ButtonType.Ghost} size={ButtonSize.Large} onClick={() => {}}>
                  {t('accept')}
                </Button>
              </div>
              <ul className="my-6 flex flex-grow flex-col gap-2 text-gray-300">
                {nft.collection && (
                  <li className="flex justify-between">
                    <span>{t('currentFloor')}</span>
                    <span>{nft.collection.floorPrice} SOL</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span>{t('lastSold')}</span>
                  <span>48 SOL</span>
                </li>
              </ul>
              <Form.Label name={t('amount')}>
                <Form.Input
                  {...registerListNft('amount')}
                  autoFocus
                  className="input"
                  icon={<Icon.Solana height={20} width={24} gradient />}
                />
              </Form.Label>
              <Button
                block
                htmlType="submit"
                className="mb-4"
                loading={offerFormState.isSubmitting}
              >
                {t('listNft')}
              </Button>
              <Button type={ButtonType.Secondary} block onClick={onCancelListNft}>
                {t('cancel', { ns: 'common' })}
              </Button>
            </div>
          </Form>
        )}
        <div
          className={clsx('mb-10 flex flex-col gap-4 rounded-md p-6 shadow-xl', {
            'md:hidden': activeForm,
          })}
        >
          <div className="flex flex-row items-center justify-between p-4">
            <div className="flex flex-col justify-between text-gray-300">
              <span>{t('neverSold')}</span>
              <span>--</span>
            </div>
            {notOwner && (
              <Button type={ButtonType.Primary} size={ButtonSize.Large} onClick={onMakeOffer}>
                {t('bid')}
              </Button>
            )}
          </div>
          <div className="flex flex-row items-center justify-between p-4">
            <div className="flex flex-col justify-between text-gray-300">
              <span>{t('lastSale')}</span>
              <span>--</span>
            </div>
            {isOwner && (
              <Button type={ButtonType.Primary} size={ButtonSize.Large} onClick={onListNft}>
                {t('listNft')}
              </Button>
            )}
          </div>
        </div>
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
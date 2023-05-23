import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import type { FormEventHandler } from 'react';
import React from 'react';
import { useState } from 'react';

import config from '../app.config';
import { useCloseListing } from '../hooks/list';
import { useAuctionHouseContext } from '../providers/AuctionHouseProvider';
import { useBulkListContext } from '../providers/BulkListProvider';
import { useWalletContext } from '../providers/WalletContextProvider';
import type { ActionInfo, Nft, Offer } from '../typings';
import { getAssetURL, AssetSize } from '../utils/assets';
import { formatToNow } from '../utils/date';
import type { Marketplace } from '../utils/marketplaces';
import { getMarketplace } from '../utils/marketplaces';
import { getSolFromLamports } from '../utils/price';
import Button, { ButtonBackground, ButtonBorder, ButtonColor, ButtonSize } from './Button';
import CheckBox from './CheckBox';
import { Form } from './Form';
import Icon from './Icon';
import Img from './Image';

/* eslint-disable react/jsx-no-useless-fragment */

interface PreviewProps {
  nft: Nft;
  link: string;
  offers?: Offer[];
  cardType: string;
  showCollectionThumbnail?: boolean;
  bulkSelectEnabled: boolean;
  onMakeOffer: () => void;
  onBuy: () => void;
  onSelect?: (val: boolean) => void;
}

export function Preview({
  nft: previewNft,
  offers,
  showCollectionThumbnail = true,
  link,
  cardType,
  bulkSelectEnabled,
  onBuy,
  onSelect,
}: PreviewProps): JSX.Element {
  const { t } = useTranslation(['common', 'home']);
  const router = useRouter();
  const { selected, setSelected } = useBulkListContext();
  const { address } = useWalletContext();
  const { auctionHouse } = useAuctionHouseContext();
  const [nft, setNft] = useState<Nft>(previewNft);
  const isOwner = address === nft.owner;

  const listing: ActionInfo | null = useMemo(() => nft.latestListing, [nft.latestListing]);
  const marketplace: Marketplace | undefined = useMemo(() => {
    return getMarketplace(
      nft.latestListing?.auctionHouseProgram,
      nft.latestListing?.auctionHouseAddress
    );
  }, [nft.latestListing]);

  const isOwnMarket: boolean = useMemo(() => {
    return nft.latestListing?.auctionHouseAddress === config.auctionHouse;
  }, [nft.latestListing]);

  const myOffer = offers?.find((offer) => {
    return offer.buyer === address;
  });

  const { onCloseListing, closingListing } = useCloseListing({
    listing,
    nft,
    auctionHouse,
    setNft,
  });

  const handleClosing = async () => {
    if (!closingListing) {
      const sig = await onCloseListing();

      if (!!sig && !!auctionHouse) {
        setNft((oldNft) => ({ ...oldNft, latestListing: null }));
      }
    }
  };

  const handleBulkSelect = () => {
    setSelected((selectedList) => {
      const index = selectedList.findIndex((selected) => selected.mintAddress === nft.mintAddress);
      const copyList = [...selectedList]; // don't mutate original
      if (index < 0) {
        //not found so add nft
        copyList.push(nft);
      } else {
        //already selected, remove from selected list
        copyList.splice(index, 1);
      }
      return copyList;
    });
  };

  const onViewExternalListing = async () => {
    if (!nft || !marketplace) {
      return;
    }

    window.open(marketplace.link.replace('{}', nft.mintAddress), '_blank', 'noopener,noreferrer');
  };

  const isBulkSelected = selected.includes(nft);

  useEffect(() => {
    onSelect?.(isBulkSelected);
  }, [isBulkSelected, onSelect]);

  return (
    <>
      {!cardType.includes('list') ? (
        <div className="group overflow-clip rounded-2xl bg-gray-800 pb-4 text-white shadow-lg transition">
          <Link href={link}>
            <div className="relative block overflow-hidden">
              <Img
                src={getAssetURL(nft.image, AssetSize.XSmall)}
                alt={`${nft.name} detail image`}
                className={clsx(
                  'aspect-square w-full object-cover',
                  'transition duration-100 ease-in-out group-hover:origin-center group-hover:scale-105 group-hover:ease-in'
                )}
              />
              {Boolean(nft.moonrankRank) && (
                <span className="absolute left-0 top-0 z-10 m-2 flex items-center gap-1 rounded-full bg-gray-800 py-1 px-2 text-sm">
                  <img
                    src="/images/moonrank-logo.svg"
                    className="h-2.5 w-auto object-cover"
                    alt="moonrank logo"
                  />
                  {nft.moonrankRank}
                </span>
              )}
              {!!listing && !!marketplace && (
                <div className="absolute right-0 top-1 z-10 m-2 items-center justify-start my-1 gap-1 text-lg">
                  <img
                    src={isOwnMarket ? '/images/moon.svg' : marketplace.logo}
                    className="h-5 w-auto object-fill"
                    alt={t('logo', { ns: 'nft', market: marketplace.name })}
                    title={t('listedOn', { ns: 'nft', market: marketplace.name })}
                  />
                </div>
              )}
            </div>
            <div className="z-20 py-4 sm:px-4 px-3">
              <div className="flex h-6 flex-row items-center justify-start gap-2 text-white">
                {nft?.image && showCollectionThumbnail && (
                  <Img
                    fallbackSrc="/images/moon.svg"
                    src={getAssetURL(nft.image, AssetSize.XSmall)}
                    alt={`Collection NFT image ${nft.name}`}
                    className="aspect-square w-4 rounded-sm object-cover"
                  />
                )}
                <span className="truncate sm:block hidden">{nft.name}</span>
                <span className="truncate sm:hidden block">
                  {nft.name.split('#').length > 1 ? ` #${nft.name.split('#')[1]}` : nft.name}
                </span>
              </div>
            </div>
          </Link>

          <div className="relative flex max-h-[38px] flex-row items-center justify-between sm:px-4 px-3">
            {isOwner ? (
              !!listing ? (
                <>
                  <span className="flex items-center justify-center gap-1 text-lg">
                    <Icon.Sol /> {getSolFromLamports(listing.price, 0, 3)}
                  </span>
                  <Button
                    onClick={handleClosing}
                    size={ButtonSize.Small}
                    background={ButtonBackground.Slate}
                    border={ButtonBorder.Gradient}
                    color={ButtonColor.Gradient}
                  >
                    {t('cancel')}
                  </Button>
                </>
              ) : null // not listed
            ) : !!listing ? (
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Icon.Sol /> {getSolFromLamports(listing.price, 0, 3)}
                  </span>
                  {marketplace && marketplace.buyNowEnabled ? (
                    <Button
                      onClick={onBuy}
                      size={ButtonSize.Small}
                      background={ButtonBackground.Slate}
                      border={ButtonBorder.Gradient}
                      color={ButtonColor.Gradient}
                    >
                      {t('buy', { ns: 'common' })}
                    </Button>
                  ) : (
                    <Button
                      onClick={onViewExternalListing}
                      size={ButtonSize.Small}
                      background={ButtonBackground.Slate}
                      border={ButtonBorder.Gradient}
                      color={ButtonColor.Gradient}
                    >
                      {t('View', { ns: 'common' })}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between gap-1">
                {myOffer ? (
                  <span className="flex flex-wrap items-center gap-1 text-sm text-gray-300">
                    {t('offerable.yourOffer', { ns: 'common' })}
                    <div className="flex flex-row items-center gap-1">
                      <Icon.Sol />
                      {getSolFromLamports(myOffer.price, 0, 3)}
                    </div>
                  </span>
                ) : (
                  <div />
                )}
                {!myOffer && (
                  <Link href={link}>
                    <Button
                      size={ButtonSize.Small}
                      background={ButtonBackground.Slate}
                      border={ButtonBorder.Gradient}
                      color={ButtonColor.Gradient}
                    >
                      {t('View', { ns: 'common' })}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {!!nft.lastSale ? (
            <div className="relative flex max-h-[38px] flex-row items-center justify-between sm:px-4 px-3 pt-1">
              <div className="w-full">
                <span className="flex flex-wrap items-center gap-1 text-sm text-gray-300">
                  {t('lastSale', { ns: 'common' })}
                  <div className="flex flex-row items-center gap-1">
                    <Icon.Sol className="flex h-3 w-3" />
                    {getSolFromLamports(nft.lastSale.price, 0, 3)}
                  </div>
                </span>
              </div>
            </div>
          ) : null}

          {isOwner && !listing && bulkSelectEnabled ? (
            <div className="px-4">
              <CheckBox
                label="Select for Bulk Listing"
                selected={isBulkSelected}
                onClick={handleBulkSelect}
                containerClass="justify-center my-2"
              />
            </div>
          ) : null}
        </div>
      ) : (
        <tr className="text-white whitespace-nowrap p-2 rounded-lg text-[14px]">
          <td
            onClick={() => router.push(link)}
            className="flex items-center py-2 px-3 cursor-pointer overflow-hidden"
          >
            <div className="nft-image w-[48px] h-[48px] mr-2">
              <Img
                src={getAssetURL(nft.image, AssetSize.XSmall)}
                alt={`${nft.name} detail image`}
                className={clsx(
                  'aspect-square w-full object-cover',
                  'transition duration-100 ease-in-out group-hover:origin-center group-hover:scale-105 group-hover:ease-in'
                )}
              />
            </div>
            <span className="sm:block hidden">{nft.name}</span>
            <span className="sm:hidden block max-w-[120px] truncate">
              {nft.name.split('#').length > 1 ? ` #${nft.name.split('#')[1]}` : nft.name}
            </span>
          </td>
          <td className="xl:table-cell hidden">{nft.moonrankRank}</td>
          <td>
            {!!listing ? (
              <>
                <span className="flex items-center gap-1">
                  <Icon.Sol /> {getSolFromLamports(listing.price, 0, 3)}
                  {!!marketplace ? (
                    <div className="sm:hidden block items-center justify-start my-1">
                      <img
                        src={isOwnMarket ? '/images/moon.svg' : marketplace.logo}
                        className="h-5 w-auto object-fill"
                        alt={t('logo', { ns: 'nft', market: marketplace.name })}
                        title={t('listedOn', { ns: 'nft', market: marketplace.name })}
                      />
                    </div>
                  ) : (
                    '-'
                  )}
                </span>
              </>
            ) : (
              '-'
            )}
          </td>
          <td className="sm:table-cell hidden">
            {!!listing && !!marketplace ? (
              <div className="items-center justify-start my-1 gap-1 text-lg">
                <img
                  src={isOwnMarket ? '/images/moon.svg' : marketplace.logo}
                  className="h-5 w-auto object-fill"
                  alt={t('logo', { ns: 'nft', market: marketplace.name })}
                  title={t('listedOn', { ns: 'nft', market: marketplace.name })}
                />
              </div>
            ) : (
              '-'
            )}
          </td>
          <td className="lg:table-cell hidden">
            {!!nft.lastSale ? (
              <span className="flex items-center gap-1">
                <Icon.Sol /> {getSolFromLamports(nft.lastSale.price, 0, 3)}
              </span>
            ) : (
              '-'
            )}
          </td>
          <td className="hidden 2xl:table-cell">{!!nft.owner ? nft.owner.slice(0, 5) : '-'}</td>
          <td className="lg:table-cell hidden">
            {!!listing ? formatToNow(listing.blockTimestamp) : '-'}
          </td>
          <td>
            {isOwner ? (
              !!listing ? (
                <Button
                  onClick={handleClosing}
                  size={ButtonSize.Small}
                  background={ButtonBackground.Slate}
                  border={ButtonBorder.Gradient}
                  color={ButtonColor.Gradient}
                >
                  {t('cancel')}
                </Button>
              ) : null // not listed
            ) : !!listing ? (
              marketplace && marketplace.buyNowEnabled ? (
                <Button
                  onClick={onBuy}
                  size={ButtonSize.Small}
                  background={ButtonBackground.Slate}
                  border={ButtonBorder.Gradient}
                  color={ButtonColor.Gradient}
                >
                  {t('buy', { ns: 'common' })}
                </Button>
              ) : (
                <Button
                  onClick={onViewExternalListing}
                  size={ButtonSize.Small}
                  background={ButtonBackground.Slate}
                  border={ButtonBorder.Gradient}
                  color={ButtonColor.Gradient}
                >
                  {t('View', { ns: 'common' })}
                </Button>
              )
            ) : (
              <div className="flex w-full items-center justify-between gap-1">
                {myOffer ? (
                  <span className="flex flex-wrap items-center gap-1 text-sm text-gray-300">
                    {t('offerable.yourOffer', { ns: 'common' })}
                    <div className="flex flex-row items-center gap-1">
                      <Icon.Sol />
                      {getSolFromLamports(myOffer.price, 0, 3)}
                    </div>
                  </span>
                ) : (
                  <Link href={link}>
                    <Button
                      size={ButtonSize.Small}
                      background={ButtonBackground.Slate}
                      border={ButtonBorder.Gradient}
                      color={ButtonColor.Gradient}
                    >
                      {t('View', { ns: 'common' })}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export interface PreviewSkeletonProps {
  className?: string;
  key?: unknown;
}

function PreviewSkeleton({ className }: PreviewSkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse overflow-clip rounded-2xl text-white shadow-lg transition',
        className
      )}
    >
      <div className="aspect-square w-full bg-gray-800 object-cover" />
      <div className="p-4">
        <div className="mb-4 flex flex-row items-center justify-start gap-2 text-white">
          <div className="aspect-square w-6 rounded-sm bg-gray-800 object-cover" />
          <span className="h-4 w-20 truncate rounded-md bg-gray-800" />
        </div>
        <div className="flex flex-row items-center justify-between">
          <span className="h-6 w-16 rounded-md bg-gray-800" />
          <div className="h-8 w-16 rounded-full bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

Preview.Skeleton = PreviewSkeleton;

interface OverviewProps {
  children: JSX.Element[];
}

export function Overview({ children }: OverviewProps): JSX.Element {
  return (
    <main className="relative mx-auto mt-8 flex max-w-7xl flex-wrap justify-start px-4 md:mt-12 md:px-8">
      {children}
    </main>
  );
}

interface NftDetalMediaProps {
  children: JSX.Element;
}
function OverviewMedia({ children }: NftDetalMediaProps): JSX.Element {
  return <div className="align-self-start relative mb-10 lg:w-1/2 lg:pr-10 ">{children}</div>;
}

Overview.Media = OverviewMedia;

interface OverviewAsideProps {
  children: (JSX.Element | false | null | undefined)[];
}
function OverviewAside({ children }: OverviewAsideProps): JSX.Element {
  return (
    <aside className="relative w-full pt-0 lg:sticky lg:top-20 lg:w-1/2 lg:pt-20 lg:pl-10">
      <div className="relative lg:absolute lg:top-20 lg:left-10 lg:right-0">{children}</div>
    </aside>
  );
}

Overview.Aside = OverviewAside;

function OverviewAsideSkeleton(): JSX.Element {
  return (
    <>
      <div className="mb-10 grid animate-pulse rounded-lg bg-gray-800 transition">
        <div className="flex w-full flex-row items-center justify-between border-b-[1px] border-b-gray-900 py-4 px-6">
          <img
            src="/images/nightmarket-beta.svg"
            className="h-5 w-auto object-fill"
            alt="night market logo"
          />
          <div className="h-6 w-36 rounded-md bg-gray-700" />
        </div>
        <div className="grid w-full grid-cols-12 items-center justify-between p-6">
          <div className="col-span-6 flex flex-col gap-2">
            <div className="h-6 w-24 rounded-md bg-gray-700" />
            <div className="mb-2 h-8 w-12 rounded-md bg-gray-700" />
            <div className="h-6 w-32 rounded-md bg-gray-700" />
          </div>
          <div className="col-span-6">
            <div className="h-12 w-full rounded-full bg-gray-700" />
          </div>
        </div>
      </div>
      <div className="mb-10 grid animate-pulse rounded-lg bg-gray-800 transition">
        <div className="grid w-full grid-cols-12 items-center justify-between p-6">
          <div className="col-span-6 flex flex-col gap-2">
            <div className="h-6 w-24 rounded-md bg-gray-700" />
            <div className="h-8 w-12 rounded-md bg-gray-700" />
          </div>
          <div className="col-span-6">
            <div className="h-12 w-full rounded-full bg-gray-700" />
          </div>
        </div>
      </div>
    </>
  );
}

OverviewAside.Skeleton = OverviewAsideSkeleton;

interface OverviewContentProps {
  children: JSX.Element | (JSX.Element | React.ReactNode)[];
}

function OverviewContent({ children }: OverviewContentProps): JSX.Element {
  return <div className="align-self-start mb-10 w-full md:pr-10 lg:w-1/2">{children}</div>;
}

Overview.Content = OverviewContent;

interface OverviewTabsProps {
  children: JSX.Element;
}

function OverviewTabs({ children }: OverviewTabsProps): JSX.Element {
  return <div className="mb-10 flex flex-row items-center justify-center">{children}</div>;
}

Overview.Tabs = OverviewTabs;

interface OverviewTitleProps {
  children: string;
}
function OverviewTitle({ children }: OverviewTitleProps): JSX.Element {
  return <h1 className="mb-6 text-4xl lg:text-5xl">{children}</h1>;
}

Overview.Title = OverviewTitle;

interface OverviewCardProps {
  children: JSX.Element;
  className: string;
}
function OverviewCard({ className, children }: OverviewCardProps) {
  return (
    <section className={clsx('mb-10 flex flex-col gap-4 rounded-lg bg-gray-800', className)}>
      {children}
    </section>
  );
}

Overview.Card = OverviewCard;

enum FigureDirection {
  Col = 'flex-col',
  Row = 'flex-row',
}

enum FigureSize {
  Small,
  Large,
}
interface OverviewFigureProps {
  direction?: FigureDirection;
  size?: FigureSize;
  amount?: number;
  label: string;
  className?: string;
}
function OverviewFigure({
  direction = FigureDirection.Col,
  size = FigureSize.Small,
  label,
  amount,
  className,
}: OverviewFigureProps): JSX.Element {
  return (
    <div className={clsx('flex gap-1', direction, className)}>
      {label}
      <span className="flex flex-row items-center justify-start gap-1">
        <Icon.Sol
          className={clsx({
            'h-5 w-5': size === FigureSize.Large,
            'h-4 w-4': size === FigureSize.Small,
          })}
        />
        <span className={clsx('text-white', { 'text-2xl': size === FigureSize.Large })}>
          {amount}
        </span>
      </span>
    </div>
  );
}

OverviewFigure.Direction = FigureDirection;

OverviewFigure.Size = FigureSize;

Overview.Figure = OverviewFigure;

interface OverviewFiguresProps {
  children: JSX.Element | (JSX.Element | undefined | null)[];
}

function OverviewFigures({ children }: OverviewFiguresProps): JSX.Element {
  return (
    <div className="col-span-6 flex flex-col justify-center gap-2 text-gray-300">{children}</div>
  );
}

Overview.Figures = OverviewFigures;

interface OverviewFormProps {
  title: JSX.Element;
  onSubmit: FormEventHandler<HTMLFormElement> | undefined;
  children: (JSX.Element | undefined | null)[];
}
function OverviewForm({ title, children, onSubmit }: OverviewFormProps) {
  return (
    <Form
      onSubmit={onSubmit}
      className="fixed bottom-0 left-0 right-0 z-30 mb-0 rounded-t-md bg-gray-800 shadow-xl md:relative md:z-0 md:mb-10 md:rounded-md"
    >
      {title}
      <div className="px-6 pt-8 pb-6 md:pt-0">{children}</div>
    </Form>
  );
}

Overview.Form = OverviewForm;

interface OverviewFormPointsProps {
  children: JSX.Element | undefined | null | (JSX.Element | undefined | null)[];
}

function OverviewFormPoints({ children }: OverviewFormPointsProps): JSX.Element {
  return <ul className="my-6 flex flex-grow flex-col gap-2 text-gray-300">{children}</ul>;
}

OverviewForm.Points = OverviewFormPoints;

interface OverviewFormPointProps {
  label: string;
  className?: string;
  children: JSX.Element | (JSX.Element | number | string | undefined)[];
}

function OverviewFormPoint({ label, className, children }: OverviewFormPointProps): JSX.Element {
  return (
    <li className={clsx('flex justify-between', className)}>
      <span>{label}</span>
      <span className="flex flex-row items-center justify-center gap-1">{children}</span>
    </li>
  );
}

OverviewForm.Point = OverviewFormPoint;

interface OverviewFormTitleProps {
  children: string;
}

function OverviewFormTitle({ children }: OverviewFormTitleProps): JSX.Element {
  return (
    <h2 className="border-b-[1px] border-b-gray-900 p-6 text-center text-lg font-semibold md:border-b-0 md:pb-0 md:text-left">
      {children}
    </h2>
  );
}

OverviewForm.Title = OverviewFormTitle;

interface OverviewFormPreviewProps {
  name: string;
  image: string;
  collection?: string;
}

function OverviewFormPreview({ name, image, collection }: OverviewFormPreviewProps) {
  return (
    <div className="flex flex-row justify-start gap-4 md:hidden">
      <Img
        fallbackSrc="/images/moon.svg"
        src={image}
        alt="nft image"
        className="h-12 w-12 rounded-md object-cover"
      />
      <div className="flex flex-col justify-between">
        <h6>{name}</h6>
        {collection && <h4>{collection}</h4>}
      </div>
    </div>
  );
}

OverviewForm.Preview = OverviewFormPreview;

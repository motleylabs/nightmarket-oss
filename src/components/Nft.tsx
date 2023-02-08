import { useQuery, useReactiveVar } from '@apollo/client';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { FormEventHandler } from 'react';
import Link from 'next/link';
import React from 'react';
import config from '../app.config';
import { viewerVar } from '../cache';

import { Nft, Maybe, AuctionHouse } from '../graphql.types';
import useViewer from '../hooks/viewer';
import Button, { ButtonBackground, ButtonBorder, ButtonColor, ButtonSize } from './Button';
import Icon from './Icon';
import { Form } from './Form';
import Img from './Image';
import CheckBox from './CheckBox';
import { useBulkListContext } from '../providers/BulkListProvider';
import { useCloseListing } from '../hooks/list';
import client from '../client';

interface PreviewProps {
  nft: Nft;
  link: string;
  showCollectionThumbnail?: boolean;
  auctionHouse: AuctionHouse;
  onMakeOffer: () => void;
  onBuy: () => void;
}

export function Preview({
  nft,
  showCollectionThumbnail = true,
  link,
  auctionHouse,
  onMakeOffer,
  onBuy,
}: PreviewProps): JSX.Element {
  const { t } = useTranslation(['common', 'offerable']);
  const { selected, setSelected } = useBulkListContext();
  const { data } = useViewer();

  const listing = nft.listings?.find((listing) => {
    return listing.auctionHouse?.address === config.auctionHouse;
  });

  const myOffer = nft.offers?.find((offer) => {
    return offer.buyer === data?.wallet.address;
  });

  const viewer = useReactiveVar(viewerVar);

  const isOwner = viewer ? viewer?.address === nft.owner?.address : false;

  const { onCloseListing, closingListing } = useCloseListing({ listing, nft, auctionHouse });

  const handleClosing = async () => {
    if (!closingListing) await onCloseListing();
  };

  const handleBulkSelect = () => {
    setSelected((selectedList) => {
      const index = selectedList.findIndex((selected) => selected.address === nft.address);
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
  const isBulkSelected = selected.includes(nft);

  return (
    <>
      <div className="group overflow-clip rounded-2xl bg-gray-800 pb-4 text-white shadow-lg transition">
        <Link href={link}>
          <div className="relative block overflow-hidden">
            <Img
              src={nft.image}
              alt={`${nft.name} detail image`}
              className={clsx(
                'aspect-square w-full object-cover',
                'transition duration-100 ease-in-out group-hover:origin-center group-hover:scale-105 group-hover:ease-in'
              )}
            />
            {nft.moonrankRank && (
              <span className="absolute left-0 top-0 z-10 m-2 flex items-center gap-1 rounded-full bg-gray-800 py-1 px-2 text-sm">
                <img
                  src="/images/moonrank-logo.svg"
                  className="h-2.5 w-auto object-cover"
                  alt="moonrank logo"
                />
                {nft.moonrankRank}
              </span>
            )}
          </div>
          <div className="z-20 p-4">
            <div className="flex h-6 flex-row items-center justify-start gap-2 text-white">
              {nft.moonrankCollection?.image && showCollectionThumbnail && (
                <Img
                  fallbackSrc="/images/moon.svg"
                  src={nft.moonrankCollection?.image}
                  alt={`Collection NFT image ${nft.moonrankCollection?.id}`}
                  className="aspect-square w-4 rounded-sm object-cover"
                />
              )}
              <span className="truncate">{nft.name}</span>
            </div>
          </div>
        </Link>

        <div className="relative flex h-[28px] flex-row items-center justify-between px-4">
          {isOwner ? (
            <>
              {
                listing ? (
                  <>
                    <span className="flex items-center justify-center gap-1 text-lg">
                      <Icon.Sol /> {listing?.solPrice}
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
                ) : nft.lastSale?.price ? (
                  <span className="flex flex-wrap items-center gap-1 text-sm text-gray-300">
                    {t('lastSale')}
                    <div className="flex flex-row items-center gap-1">
                      <Icon.Sol className="flex h-3 w-3 pt-0.5" />
                      {nft.lastSale?.solPrice}
                    </div>
                  </span>
                ) : null //no last sale and not listed
              }
            </>
          ) : (
            <>
              {listing ? (
                <>
                  <span className="flex items-center justify-start gap-1 text-lg">
                    <Icon.Sol /> {listing?.solPrice}
                  </span>
                  <Button
                    onClick={onBuy}
                    size={ButtonSize.Small}
                    background={ButtonBackground.Slate}
                    border={ButtonBorder.Gradient}
                    color={ButtonColor.Gradient}
                  >
                    {t('buy')}
                  </Button>
                </>
              ) : (
                <div className="flex w-full items-center justify-between gap-1">
                  {myOffer ? (
                    <span className="flex flex-wrap items-center gap-1 text-sm text-gray-300">
                      {t('offerable.yourOffer')}
                      <div className="flex flex-row items-center gap-1">
                        <Icon.Sol />
                        {myOffer.solPrice}
                      </div>
                    </span>
                  ) : nft.lastSale?.price ? (
                    <span className="flex flex-wrap items-center gap-1 text-sm text-gray-300">
                      {t('offerable.lastSoldPrice', { ns: 'common' })}
                      <div className="flex flex-row items-center gap-1">
                        <Icon.Sol className="flex h-3 w-3 pt-0.5" />
                        {nft.lastSale?.solPrice}
                      </div>
                    </span>
                  ) : (
                    <div />
                  )}
                  {!myOffer && (
                    <Button
                      onClick={onMakeOffer}
                      border={ButtonBorder.Gray}
                      color={ButtonColor.Gray}
                      size={ButtonSize.Small}
                    >
                      {t('offer')}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {isOwner && !listing ? (
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
    </>
  );
}

export interface PreviewSkeletonProps {
  className?: string;
  key?: any;
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
  amount: number | Maybe<number> | undefined;
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
  children: JSX.Element | (JSX.Element | Maybe<number> | Maybe<string> | undefined)[];
}

function OverviewFormPoint({ label, children }: OverviewFormPointProps): JSX.Element {
  return (
    <li className="flex justify-between">
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
      <Img src={image} alt="nft image" className="h-12 w-12 rounded-md object-cover" />
      <div className="flex flex-col justify-between">
        <h6>{name}</h6>
        {collection && <h4>{collection}</h4>}
      </div>
    </div>
  );
}

OverviewForm.Preview = OverviewFormPreview;

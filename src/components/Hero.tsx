import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Nft, Purchase, RewardPayout } from '../graphql.types';
import clsx from 'clsx';
import { Transition } from '@headlessui/react';
import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns';
import Icon from './Icon';
import Link from 'next/link';

interface HeroProps {
  children: React.ReactNode;
}

export default function Hero({ children }: HeroProps): JSX.Element {
  return <article className="mt-8 flex gap-20 md:mt-32">{children}</article>;
}

interface HeroMainProps {
  children: React.ReactNode;
}

function HeroMain({ children }: HeroMainProps): JSX.Element {
  return <section className="flex w-full flex-col  text-left md:w-1/2">{children}</section>;
}

Hero.Main = HeroMain;

interface HeroTitleProps {
  children: React.ReactNode;
}

function HeroTitle({ children }: HeroTitleProps): JSX.Element {
  return <h1 className="mb-4 font-serif text-3xl lg:text-5xl ">{children}</h1>;
}

Hero.Title = HeroTitle;

interface HeroSubTitleProps {
  children: React.ReactNode;
}

function HeroSubTitle({ children }: HeroSubTitleProps): JSX.Element {
  return <h2 className="text-base text-gray-400 lg:text-2xl ">{children}</h2>;
}

Hero.SubTitle = HeroSubTitle;

interface HeroActionsProps {
  children: React.ReactNode;
}

function HeroActions({ children }: HeroActionsProps): JSX.Element {
  return <div className="mt-16 flex gap-6 lg:gap-8">{children}</div>;
}

Hero.Actions = HeroActions;

function HeroPreviewSkeleton(props: {
  className: string;
  hPosition: 'left' | 'right';
  vPosition: 'top' | 'bottom';
}) {
  return (
    <>
      <div className={clsx('animate-pulse', props.className)}>
        <div className="h-32 w-32 rounded-2xl bg-gray-800 lg:h-48 lg:w-48"></div>
        <div
          className={clsx(
            'absolute flex h-14 w-28 animate-pulse flex-col rounded-2xl bg-gray-700 py-1.5 px-3 lg:h-16 lg:w-36 lg:py-2 lg:px-4',
            {
              '-ml-16': props.hPosition === 'left',
              'right-0 -mr-20': props.hPosition === 'right',
              'top-16': props.vPosition === 'top',
              'bottom-4': props.vPosition === 'bottom',
            }
          )}
        ></div>
      </div>
    </>
  );
}

interface HeroAsideProps {
  payouts: RewardPayout[] | undefined;
  loading: boolean;
}

function HeroAside({ payouts, loading }: HeroAsideProps): JSX.Element {
  console.log('payouts', payouts);
  return (
    <aside className="hidden md:w-1/2 md:justify-center lg:flex">
      <div className="relative h-72 w-72 lg:h-[300px] lg:w-[450px] ">
        {payouts && payouts?.length >= 3 && !loading ? (
          <>
            <Hero.Preview
              payout={payouts[0]}
              className="absolute bottom-0 right-1/2 z-10 -mr-16 lg:-mr-24"
              hPosition="left"
              vPosition="bottom"
            />
            <Hero.Preview
              payout={payouts[1]}
              className="absolute bottom-1/2 left-0 -mb-14 lg:-mb-4"
              hPosition="left"
              vPosition="top"
            />
            <Hero.Preview
              payout={payouts[2]}
              className="absolute bottom-1/2 right-0 -mb-20 lg:-mb-14"
              hPosition="right"
              vPosition="bottom"
            />
          </>
        ) : (
          <>
            <HeroPreviewSkeleton
              className="absolute bottom-0 right-1/2 z-10 -mr-16 lg:-mr-24"
              hPosition="left"
              vPosition="bottom"
            />
            <HeroPreviewSkeleton
              className="absolute bottom-1/2 left-0 -mb-14 lg:-mb-4"
              hPosition="left"
              vPosition="top"
            />
            <HeroPreviewSkeleton
              className="absolute bottom-1/2 right-0 -mb-20 lg:-mb-14"
              hPosition="right"
              vPosition="bottom"
            />
          </>
        )}
      </div>
    </aside>
  );
}

Hero.Aside = HeroAside;

interface HeroPreviewProps {
  payout?: RewardPayout;
  className?: string;
  hPosition: 'left' | 'right';
  vPosition: 'top' | 'bottom';
}

const HeroPreview = ({
  payout,
  className,
  hPosition,
  vPosition,
}: HeroPreviewProps): JSX.Element => {
  return (
    <Transition
      as={Fragment}
      appear={true}
      show={true}
      enter="transition ease-out duration-500"
      enterFrom="transform rotate-[-120deg] scale-50"
      enterTo="transform rotate-0 scale-100"
      leave="transition ease-in duration-500"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <div className={clsx('realtive', className)}>
        <Link href={`/nfts/${payout?.nft?.mintAddress}`}>
          <img
            className="aspect-square h-32 w-32 rounded-2xl object-cover lg:h-48 lg:w-48"
            alt="nft name"
            src={payout?.nft?.image}
          />
          <div
            className={clsx(
              'absolute flex h-20 w-28 flex-col rounded-2xl bg-gray-800 py-1.5 px-3 lg:h-20 lg:w-56 lg:py-2 lg:px-4',
              {
                '-ml-16': hPosition === 'left',
                'right-0 -mr-20': hPosition === 'right',
                'top-16': vPosition === 'top',
                'bottom-4': vPosition === 'bottom',
              }
            )}
          >
            <span className="flex items-center  text-white">
              Sold for <Icon.Sol className="mx-1 h-4 w-4" /> {payout?.purchase?.solPrice}
            </span>
            <span className=" truncate text-gray-500">
              <span className="text-sm text-orange-600">+SAUCE </span>
              to buyer and seller
            </span>
            <span className="flex items-center text-sm text-gray-500">
              {formatDistanceToNowStrict(new Date(payout?.createdAt))} ago
            </span>
            {/* <span className="truncate text-sm text-gray-500">
              Sold {formatDistanceToNowStrict(new Date(payout?.createdAt))} ago
            </span>
            <span className="flex items-center text-white">
              for <Icon.Sol /> {payout?.purchase?.solPrice}
            </span>
            <span className=" truncate text-sm text-gray-500">
              <span className="text-sm text-orange-600"> +SAUCE</span>
              to buyer and seller
            </span> */}
          </div>
        </Link>
      </div>
    </Transition>
  );
};

Hero.Preview = HeroPreview;

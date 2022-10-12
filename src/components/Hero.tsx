import React from 'react';
import { Nft } from '../graphql.types';
import clsx from 'clsx';

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
  return <h2 className="text-base text-gray-450 lg:text-2xl ">{children}</h2>;
}

Hero.SubTitle = HeroSubTitle;

interface HeroActionsProps {
  children: React.ReactNode;
}

function HeroActions({ children }: HeroActionsProps): JSX.Element {
  return <div className="mt-16 flex gap-6 lg:gap-8">{children}</div>;
}

Hero.Actions = HeroActions;

interface HeroAsideProps {
  children: React.ReactNode;
}

function HeroAside({ children }: HeroAsideProps): JSX.Element {
  return (
    <aside className="hidden w-1/2 md:flex md:justify-center">
      <div className="relative h-72 w-72 lg:h-[300px] lg:w-[450px]">{children}</div>
    </aside>
  );
}

Hero.Aside = HeroAside;

interface HeroPreviewProps {
  nft?: Nft;
  classname?: string;
  imgUrlTemp: string; // to be removed once live data arrives
  hPosition: 'left' | 'right';
  vPosition: 'top' | 'bottom';
}

const HeroPreview = ({
  nft,
  imgUrlTemp,
  classname,
  hPosition,
  vPosition,
}: HeroPreviewProps): JSX.Element => {
  return (
    <div className={clsx('realtive', classname)}>
      <img
        className="h-32 w-32 rounded-2xl object-contain lg:h-48 lg:w-48"
        alt="nft name"
        src={imgUrlTemp}
      />
      <div
        className={clsx(
          'absolute flex h-14 w-28 flex-col rounded-2xl bg-gray-800 py-1.5 px-3 lg:h-16 lg:w-36 lg:py-2 lg:px-4',
          {
            '-ml-16': hPosition === 'left',
            'right-0 -mr-20': hPosition === 'right',
            'top-16': vPosition === 'top',
            'bottom-4': vPosition === 'bottom',
          }
        )}
      >
        <span className="truncate text-xs text-gray-500">Sold 1min ago</span>
        <span className=" text-xs text-orange-600 lg:text-sm ">+22 $SAUCE</span>
        <span className=" truncate text-xs text-gray-500">to buyer and seller</span>
      </div>
    </div>
  );
};

Hero.Preview = HeroPreview;

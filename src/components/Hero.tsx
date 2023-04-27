import React from 'react';

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

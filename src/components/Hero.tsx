import React from 'react';

interface HeroProps {
  children: React.ReactNode;
}

export default function Hero({ children }: HeroProps): JSX.Element {
  return (
    <article className="flex flex-col md:flex-row mt-4 gap-0 rounded-2xl bg-gray-800">
      {children}
    </article>
  );
}

interface HeroMainProps {
  children: React.ReactNode;
}

function HeroMain({ children }: HeroMainProps): JSX.Element {
  return (
    <section className="flex order-last md:order-first w-full flex-col md:w-1/2 items-center justify-center p-8">
      {children}
    </section>
  );
}

Hero.Main = HeroMain;

interface HeroTitleProps {
  children: React.ReactNode;
}

function HeroTitle({ children }: HeroTitleProps): JSX.Element {
  return <h1 className="mb-4 md:mb-10 font-serif text-3xl lg:text-5xl ">{children}</h1>;
}

Hero.Title = HeroTitle;

interface HeroSubTitleProps {
  children: React.ReactNode;
}

function HeroSubTitle({ children }: HeroSubTitleProps): JSX.Element {
  return <h2 className="text-lg text-gray-400 lg:text-xl ">{children}</h2>;
}

Hero.SubTitle = HeroSubTitle;

interface HeroActionsProps {
  children: React.ReactNode;
}

function HeroActions({ children }: HeroActionsProps): JSX.Element {
  return <div className="flex flex-col w-full md:flex-row mt-8 md:mt-16 gap-6 lg:gap-8">{children}</div>;
}

Hero.Actions = HeroActions;

interface HeroImageProps {
  children: React.ReactNode;
}

function HeroImage({ children }: HeroImageProps): JSX.Element {
  return (
    <section className="flex order-first md:order-last w-full flex-col md:w-1/2">
      {children}
    </section>
  );
}

Hero.Image = HeroImage;

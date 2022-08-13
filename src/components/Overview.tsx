import React, { ReactNode } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface OverviewProps {
  children: ReactNode;
}

function Container({ children }: OverviewProps): JSX.Element {
  return <main className="mt-8 md:mt-12">{children}</main>;
}

function Hero({ children }: OverviewProps): JSX.Element {
  return (
    <section className="flex flex-col items-center justify-center px-4 md:items-start md:justify-between md:px-8 lg:flex-row">
      {children}
    </section>
  );
}

interface OverviewInfoProps extends OverviewProps {
  title: ReactNode;
  avatar: ReactNode;
}

function Info({ children, title, avatar }: OverviewInfoProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-6">
      {avatar}
      <div className="flex flex-col items-center gap-8 md:items-start">
        {title}
        <div className="flex flex-col items-center gap-2 md:flex-row md:items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

interface OverviewAvatarProps {
  src: string;
  circle?: boolean;
}

function Avatar({ src, circle }: OverviewAvatarProps): JSX.Element {
  return (
    <img
      src={src}
      className={clsx(
        'inline-block h-24 w-24 border-4 border-gray-900 shadow-xl md:h-36 md:w-36',
        circle ? 'rounded-full' : 'rounded-lg'
      )}
      alt="overview avatar"
    />
  );
}

function Title({ children }: OverviewProps): JSX.Element {
  return (
    <h1 className="max-w-[500px] text-center text-3xl text-white md:text-left md:text-4xl">
      {children}
    </h1>
  );
}

function Figures({ children }: OverviewProps): JSX.Element {
  return (
    <ul className="mt-4 flex flex-row items-center gap-4 text-sm md:mt-0 md:ml-2 md:border-l md:border-gray-800 md:pl-4 md:text-base">
      {children}
    </ul>
  );
}

interface OverviewFigureProps {
  figure: string;
  label: string;
}

function Figure({ figure, label }: OverviewFigureProps): JSX.Element {
  return (
    <li className="flex gap-2 text-white">
      {figure}
      <span className="text-gray-300">{label}</span>
    </li>
  );
}

function Actions({ children }: OverviewProps): JSX.Element {
  return <div className="flex flex-row gap-2">{children}</div>;
}

function Aside({ children }: OverviewProps): JSX.Element {
  return (
    <aside className="mt-4 flex flex-none flex-row gap-8 rounded-lg bg-gradient-radial from-gray-900 to-gray-800 p-4 text-white md:text-xs lg:mt-0 xl:text-base">
      {children}
    </aside>
  );
}

function Tabs({ children }: OverviewProps): JSX.Element {
  return (
    <nav className="mt-10 flex flex-row justify-start  overflow-scroll sm:ml-4 md:ml-8 md:justify-start">
      {children}
    </nav>
  );
}

interface TabProps {
  href: string;
  children: ReactNode;
  icon?: (props: { className: string }) => JSX.Element;
}

function Tab({ href, children, icon: Icon }: TabProps): JSX.Element {
  const router = useRouter();

  return (
    <Link href={href} passHref>
      <a
        className={clsx(
          'flex flex-none flex-row justify-center border-b px-6 py-2.5 text-center text-sm font-medium text-white',
          router.asPath === href
            ? ' border-white'
            : 'border-gray-800  text-gray-300 hover:text-white'
        )}
      >
        {Icon && <Icon className="mr-4 h-5 w-5" />}
        {children}
      </a>
    </Link>
  );
}

function Divider(): JSX.Element {
  return <div className="-z-10 -mt-[1px] h-[1px] bg-gray-800" />;
}

const Overview = {
  Container,
  Hero,
  Info,
  Avatar,
  Title,
  Figures,
  Figure,
  Actions,
  Aside,
  Tabs,
  Tab,
  Divider,
};

export default Overview;

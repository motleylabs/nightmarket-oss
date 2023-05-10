import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import type { ReactNode } from 'react';

import Img from './Image';

interface OverviewProps {
  children: ReactNode;
}

export function Overview({ children }: OverviewProps): JSX.Element {
  return <main className="mt-8 md:mt-12">{children}</main>;
}

function Hero({ children }: OverviewProps): JSX.Element {
  return (
    <section className="flex flex-col items-center justify-center px-4 md:items-start md:justify-between md:px-8 lg:flex-row">
      {children}
    </section>
  );
}

Overview.Hero = Hero;

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

Overview.Info = Info;

interface OverviewAvatarProps {
  src: string;
  circle?: boolean;
}

function Avatar({ src, circle }: OverviewAvatarProps): JSX.Element {
  return (
    <Img
      fallbackSrc="/images/placeholder.png"
      src={src}
      className={clsx(
        'inline-block h-24 w-24 border-4 border-gray-900 shadow-xl md:h-36 md:w-36',
        circle ? 'rounded-full' : 'rounded-md'
      )}
      alt="overview avatar"
    />
  );
}

Overview.Avatar = Avatar;

function Title({ children }: OverviewProps): JSX.Element {
  return (
    <h1 className="max-w-[500px] text-center text-3xl text-white md:text-left md:text-4xl">
      {children}
    </h1>
  );
}

Overview.Title = Title;

function Figures({ children }: OverviewProps): JSX.Element {
  return (
    <ul className="mt-4 flex flex-row items-center gap-4 text-sm md:mt-0 md:ml-2 md:border-l md:border-gray-800 md:pl-4 md:text-base">
      {children}
    </ul>
  );
}

Overview.Figures = Figures;

interface OverviewFigureProps {
  figure?: string;
  label: string;
}

function Figure({ figure, label }: OverviewFigureProps): JSX.Element {
  return (
    <li className="flex gap-2 text-sm text-white sm:text-sm md:text-base">
      {figure}
      <span className="text-gray-300">{label}</span>
    </li>
  );
}

Overview.Figure = Figure;

function Actions({ children }: OverviewProps): JSX.Element {
  return <div className="flex flex-row gap-2">{children}</div>;
}

Overview.Actions = Actions;

function Aside({ children }: OverviewProps): JSX.Element {
  return (
    <aside className="mt-4 flex flex-none flex-row gap-8 rounded-lg bg-gradient-radial from-gray-900 to-gray-800 p-4 text-white md:text-sm lg:mt-0 xl:text-base">
      {children}
    </aside>
  );
}

Overview.Aside = Aside;

interface OverviewTabsProps {
  children: (JSX.Element | null)[];
  className?: string;
  mode: string;
}

function Tabs({ children, className = '', mode }: OverviewTabsProps) {
  const length = children.filter((child) => child !== null).length;
  return (
    <nav
      className={clsx(
        'relative mx-4 grid items-center justify-center gap-2 rounded-full border border-gray-800 px-1 py-1 md:mx-auto md:max-w-sm',
        `grid-cols-${length}`,
        mode === 'profile' ? 'md:mb-[-75px]' : '',
        className
      )}
    >
      {children}
    </nav>
  );
}

Overview.Tabs = Tabs;

function Tab(props: { href: string; label: string; active: boolean }) {
  return (
    <Link href={props.href} scroll={false}>
      <div
        className={clsx(
          'flex h-12  flex-row items-center justify-center rounded-full  font-semibold',
          props.active
            ? 'rounded-full bg-gray-800 text-white'
            : 'cursor-pointer bg-black text-gray-300 hover:bg-gray-800 hover:text-gray-200'
        )}
      >
        {props.label}
      </div>
    </Link>
  );
}
Overview.Tab = Tab;

function Divider(): JSX.Element {
  return <div className="-z-10 -mt-[1px] h-[1px] bg-gray-800" />;
}

Overview.Divider = Divider;

import React, { ReactNode } from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface OverviewProps {
  children: ReactNode
}

function Container({ children }: OverviewProps): JSX.Element {
  return (
    <main className="mt-8 md:mt-12">{children}</main>
  )
}

function Hero({ children }: OverviewProps): JSX.Element {
  return (
    <section className="flex flex-col lg:flex-row justify-center md:justify-between items-center md:items-start px-4 md:px-8">
      {children}
    </section>
  )
}

interface OverviewInfoProps extends OverviewProps {
  title: ReactNode
  avatar: ReactNode
}

function Info({ children, title, avatar }: OverviewInfoProps): JSX.Element {
  return (
    <div className="flex flex-col items-center md:flex-row md:items-end gap-4 md:gap-6">
      {avatar}
      <div className="flex flex-col items-center md:items-start gap-8">
        {title}
        <div className="flex flex-col items-center md:flex-row md:items-center gap-2">
          {children}
        </div>
      </div>
    </div>
  )
}

interface OverviewAvatarProps {
  src: string
}

function Avatar({ src }: OverviewAvatarProps): JSX.Element {
  return <img src={src} className="inline-block h-24 w-24 md:h-36 md:w-36 rounded-lg border-4 border-gray-900 shadow-xl" />
}

function Title({ children }: OverviewProps): JSX.Element {
  return <h1 className="text-5xl text-center md:text-left text-white">{children}</h1>
}

function Figures({ children }: OverviewProps): JSX.Element {
  return (
    <ul className="md:border-l md:border-gray-800 flex flex-row gap-4 mt-4 md:mt-0 items-center md:pl-4 md:ml-2 text-sm md:text-base">
      {children}
    </ul>
  )
}

interface OverviewFigureProps {
  figure: string
  label: string
}

function Figure({ figure, label }: OverviewFigureProps) {
  return (
    <li className="flex gap-2 text-white">{figure}<span className="text-gray-300">{label}</span></li>
  )
}

function Actions({ children }: OverviewProps): JSX.Element {
  return <div className="flex flex-row gap-2">{children}</div>
}

function Aside({ children }: OverviewProps) {
  return (
    <aside className="flex flex-row gap-8 rounded-lg flex-none mt-4 lg:mt-0 bg-gray-800 p-4 text-white md:text-xs xl:text-base">
      {children}
    </aside>
  )
}

function Tabs({ children }: OverviewProps): JSX.Element {
  return (
    <nav className="flex flex-row justify-start overflow-scroll  md:justify-start sm:ml-4 md:ml-8 mt-10">
      {children}
    </nav>
  )
}

interface TabProps {
  href: string;
  children: ReactNode;
  icon?: (props: { className: string }) => JSX.Element;
}

function Tab({ href, children, icon: Icon }: TabProps): JSX.Element {
  const router = useRouter()

  return (
    <Link href={href} passHref>
      <a
        className={clsx(
          'flex flex-row flex-none px-6 justify-center border-b py-2.5 text-center text-sm font-medium text-white',
          router.asPath === href ? ' border-white' : 'border-gray-800  text-gray-300 hover:text-white'
        )}
      >
        {Icon && <Icon className="mr-4 h-5 w-5" />}
        {children}
      </a>
    </Link>
  );
}

function Divider() {
  return <div className="h-[1px] -mt-[1px] -z-10 bg-gray-800" />
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
}

export default Overview
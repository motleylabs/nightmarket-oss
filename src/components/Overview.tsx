import React, { ReactNode } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { Maybe } from './../graphql.types';

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
    <img
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
  figure: Maybe<string> | undefined;
  label: string;
}

function Figure({ figure, label }: OverviewFigureProps): JSX.Element {
  return (
    <li className="flex gap-2 text-xs text-white sm:text-sm md:text-base">
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
    <aside className="mt-4 flex flex-none flex-row gap-8 rounded-lg bg-gradient-radial from-gray-900 to-gray-800 p-4 text-white md:text-xs lg:mt-0 xl:text-base">
      {children}
    </aside>
  );
}

Overview.Aside = Aside;

interface OverviewTabsProps {
  children: JSX.Element[];
}

function Tabs({ children }: OverviewTabsProps) {
  return (
    <nav
      className={clsx(
        'relative mx-4 grid items-center justify-center gap-2 rounded-full border border-gray-800 px-1 py-1 md:mx-auto md:-mb-16 md:max-w-sm',
        `grid-cols-${children.length}`
      )}
    >
      {children}
    </nav>
  );
}

Overview.Tabs = Tabs;

function Tab(props: { href: string; label: string; active: boolean }) {
  return (
    <Link href={props.href} passHref>
      <a>
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
      </a>
    </Link>
  );
}
Overview.Tab = Tab;

// NB: Keeping this until changes are finished on the collection page
// function Tabs({ children }: OverviewTabsProps): JSX.Element {
//   return (
//     <nav
//       className={clsx(
//         'mx-auto mt-10 flex  overflow-auto'
//         // children.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
//       )}
//     >
//       {children}
//     </nav>
//   );
// }

// Overview.Tabs = Tabs;

// interface TabProps {
//   href: string;
//   children: ReactNode;
//   icon?: (props: { className: string }) => JSX.Element;
// }

// function Tab({ href, children, icon: Icon }: TabProps): JSX.Element {
//   const router = useRouter();

//   return (
//     <Link href={href} passHref>
//       <a
//         className={clsx(
//           'flex flex-none flex-row justify-center border-b px-6 py-2.5 text-center text-sm font-medium text-white',
//           router.asPath === href
//             ? ' border-white'
//             : 'border-gray-800  text-gray-300 hover:text-white'
//         )}
//       >
//         {Icon && <Icon className="mr-4 h-5 w-5" />}
//         {children}
//       </a>
//     </Link>
//   );
// }

// Overview.Tab = Tab;

function Divider(): JSX.Element {
  return <div className="-z-10 -mt-[1px] h-[1px] bg-gray-800" />;
}

Overview.Divider = Divider;

// save for later
// export function SegmentedControl() {
//   const [selectedTab, setSelectedTab] = useState('segment1');
//   return (
//     <div className={'rounded-lg bg-gray-200 p-[2px]'}>
//       <div className={'relative flex items-center'}>
//         {/* <!-- tab dividers --> */}
//         <div className={'absolute w-full'}>
//           <div className={'m-auto flex w-1/3 justify-between'}>
//             <div
//               className={clsx(
//                 'h-3 w-px rounded-full bg-gray-400 opacity-0 transition-opacity duration-100 ease-in-out',
//                 { 'opacity-100': selectedTab === 'segment3' }
//               )}
//             ></div>
//             <div
//               className={clsx(
//                 'h-3 w-px rounded-full bg-gray-400 opacity-0 transition-opacity duration-100 ease-in-out',
//                 { 'opacity-100': selectedTab === 'segment1' }
//               )}
//             ></div>
//           </div>
//         </div>

//         {/* <!-- white sliding tab block --> */}
//         <div
//           className={clsx(
//             'absolute inset-y-0 left-0 flex w-1/3 transform rounded-md bg-white shadow transition-all duration-200 ease-in-out',
//             {
//               'translate-x-0': selectedTab === 'segment1',
//               'translate-x-full': selectedTab === 'segment2',
//               'translate-x-[200%]': selectedTab === 'segment3',
//             }
//           )}
//         ></div>

//         {/* <!-- clickable buttons --> */}
//         <div
//           className={
//             'relative m-px flex flex-1 cursor-pointer items-center justify-center p-px text-sm font-semibold capitalize'
//           }
//           onClick={() => setSelectedTab('segment1')}
//         >
//           Segment 1
//         </div>
//         <div
//           className={
//             'relative m-px flex flex-1 cursor-pointer items-center justify-center p-px text-sm font-semibold capitalize'
//           }
//           onClick={() => setSelectedTab('segment2')}
//         >
//           Segment 2
//         </div>
//         <div
//           className={
//             'relative m-px flex flex-1 cursor-pointer items-center justify-center p-px text-sm font-semibold capitalize'
//           }
//           onClick={() => setSelectedTab('segment3')}
//         >
//           Segment 3
//         </div>
//       </div>
//     </div>
//   );
// }

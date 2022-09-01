import clsx from 'clsx';
import { FilterIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/outline';
import { ReactNode, Children, cloneElement } from 'react';
import { useTranslation } from 'next-i18next';

export function Sidebar(): JSX.Element {
  return <div></div>;
}

interface SidebarFilterIconProps {
  width?: number;
  height?: number;
  className?: string;
}
function SidebarFilterIcon({ height, width, className }: SidebarFilterIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 12H18M3 6H21M9 18H15"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

Sidebar.FilterIcon = SidebarFilterIcon;

interface SidebarControlProps {
  open: boolean;
  onChange: () => void;
}

function SidebarControl({ open, onChange }: SidebarControlProps): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <button
      className={clsx(
        'fixed bottom-8 left-1/2 z-40 -ml-[51px] flex flex-none flex-row justify-between',
        'rounded-full border-none bg-gray-800 py-2 px-4 text-white transition',
        'hover:border-white md:relative md:bottom-0 md:left-0 md:ml-0 md:border md:border-solid md:border-gray-900 md:bg-transparent',
        { 'md:w-72 lg:w-96': open }
      )}
      onClick={onChange}
    >
      <Sidebar.FilterIcon width={24} height={24} className="stroke-white" />
      <span className="md:hidden">{t('filters')}</span>
      {open ? (
        <ChevronLeftIcon width={24} height={24} className="hidden stroke-white md:inline-block" />
      ) : (
        <ChevronRightIcon width={24} height={24} className="hidden stroke-white md:inline-block" />
      )}
    </button>
  );
}

Sidebar.Control = SidebarControl;

interface SidebarPageProps {
  children: JSX.Element[];
  open?: boolean;
}

function SidebarPage({ children, open }: SidebarPageProps): JSX.Element {
  return (
    <section className="flex flex-row justify-start px-4 pb-6 md:px-8">
      {Children.map(children, (child) => cloneElement(child, { open }))}
    </section>
  );
}

Sidebar.Page = SidebarPage;

interface SidebarPanel {
  children: ReactNode;
  open?: boolean;
}

function SidebarPanel({ children, open }: SidebarPanel): JSX.Element {
  return (
    <aside
      className={clsx(
        'sidebar-scroll fixed top-0 bottom-0 left-0 right-0 z-30 h-full  flex-none bg-gray-900 pr-4 md:sticky md:top-[74px] md:z-0',
        open ? 'inline-block md:w-72 lg:w-96' : 'hidden'
      )}
    >
      {children}
    </aside>
  );
}

Sidebar.Panel = SidebarPanel;

interface SidebarContentProps {
  children: ReactNode;
  open?: boolean;
  className?: string;
}

function SidebarContent({ children, className }: SidebarContentProps): JSX.Element {
  return <article className={clsx('flex-grow', className)}>{children}</article>;
}

Sidebar.Content = SidebarContent;

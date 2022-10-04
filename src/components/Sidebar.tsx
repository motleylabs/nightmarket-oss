import clsx from 'clsx';
import { ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ReactNode, Children, cloneElement } from 'react';
import { useTranslation } from 'next-i18next';
import Button from './Button';

export function Sidebar(): JSX.Element {
  return <div></div>;
}

interface SidebarFilterIconProps {
  className?: string;
}
function SidebarFilterIcon({ className }: SidebarFilterIconProps) {
  return (
    <svg
      viewBox={`0 0 24 24`}
      className={className}
      stroke="currentColor"
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
  disabled?: boolean;
}

function SidebarControl({ open, onChange, disabled }: SidebarControlProps): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <div className={clsx({ 'hidden md:block': open && !disabled })}>
      <button
        className={clsx(
          'fixed bottom-8 left-1/2 z-40 -ml-[51px] flex flex-none flex-row justify-between rounded-full border-none bg-gray-800 py-2 px-4 text-white  transition',
          'enabled:hover:border-white disabled:text-gray-400 md:relative md:bottom-0 md:left-0 md:ml-0 md:border md:border-solid md:border-gray-900 md:bg-transparent',
          open && !disabled && 'md:w-72 lg:w-96'
        )}
        disabled={disabled}
        onClick={onChange}
      >
        <Sidebar.FilterIcon className={clsx('h-6 w-6')} />
        <span className="md:hidden">{t('filters')}</span>

        <ChevronRightIcon
          className={clsx('hidden h-6 w-6 md:inline-block', open && !disabled && 'rotate-180')}
        />
      </button>
    </div>
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
  onChange: () => void;
  disabled?: boolean;
}

function SidebarPanel({ children, open, onChange, disabled }: SidebarPanel): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <>
      <aside
        className={clsx(
          'fixed inset-0 z-30 h-full flex-none overflow-y-auto bg-themebg-900 pr-4  md:sticky md:top-[74px] md:z-0 md:max-h-[calc(100vh-74px)]',
          'text-white scrollbar-thin scrollbar-thumb-gray-600',
          open && !disabled ? 'inline-block md:w-72 lg:w-96' : 'hidden'
        )}
      >
        <div className="flex w-full justify-between px-2 pt-4 pb-2  md:hidden">
          <Sidebar.FilterIcon className={clsx('h-6 w-6')} />
          {t('filters')}
          <XMarkIcon onClick={onChange} className="h-6 w-6 cursor-pointer" />
        </div>
        {children}
        <div className="mt-24 md:hidden">
          <Button onClick={onChange} className="fixed bottom-8 left-0 right-0 ml-6 mr-10 h-12">
            Done
          </Button>
        </div>
      </aside>
    </>
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

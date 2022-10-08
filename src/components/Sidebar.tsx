import clsx from 'clsx';
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
    <div className={clsx('relative')}>
      <button
        className={clsx(
          'z-40  flex w-full flex-grow  items-center justify-between rounded-full border border-gray-800 bg-gray-800 py-3  px-4 text-white transition  hover:border-white',
          'enabled:hover:border-white disabled:text-gray-400 md:relative md:bottom-0 md:left-0 md:ml-0   ',
          open && !disabled && ''
        )}
        disabled={disabled}
        onClick={onChange}
      >
        <Sidebar.FilterIcon className={clsx('mr-2 hidden h-5 w-5 md:inline-block')} />
        <span className="">{t('filters')}</span>
        <ChevronRightIcon
          className={clsx(
            'ml-2 h-5 w-5 rotate-90 md:inline-block md:rotate-0',
            open && !disabled && 'md:rotate-180'
          )}
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
    <section className="mx-4 mb-6 flex gap-6 md:mx-10">
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
          'fixed inset-0 z-30 overflow-y-auto bg-black px-4 md:sticky md:top-[74px] md:max-h-[calc(100vh-74px)] md:px-0',
          'text-white scrollbar-thin scrollbar-thumb-gray-600',
          'no-scrollbar',
          open && !disabled ? 'w-full md:max-w-xs' : 'hidden'
        )}
      >
        <div className="flex w-full justify-between px-2 pt-4 pb-2  md:hidden">
          <Sidebar.FilterIcon className={clsx('h-6 w-6')} />
          {t('filters')}
          <XMarkIcon onClick={onChange} className="h-6 w-6 cursor-pointer" />
        </div>
        {children}
      </aside>
      {open && (
        // Fixes stacking order
        <div className="fixed  bottom-8 left-4 right-4 z-30 md:hidden">
          <Button onClick={onChange} className="w-full">
            Done
          </Button>
        </div>
      )}
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
  return <article className={clsx('', className)}>{children}</article>;
}

Sidebar.Content = SidebarContent;

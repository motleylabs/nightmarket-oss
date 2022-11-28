import clsx from 'clsx';
import { ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ReactNode, Children, cloneElement } from 'react';
import { useTranslation } from 'next-i18next';
import Button from './Button';

export function Sidebar(): JSX.Element {
  return <div></div>;
}

interface SidebarControlProps {
  label: string;
  open: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function SidebarControl({ open, label, onChange, disabled }: SidebarControlProps): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <div className="relative">
      <button
        className={clsx(
          'flex w-full flex-grow items-center justify-between rounded-full border border-gray-800 bg-gray-800 py-4 px-4 text-white transition enabled:hover:border-white',
          'enabled:hover:border-white disabled:text-gray-400 md:relative md:bottom-0 md:left-0 md:ml-0',
          open && !disabled && ''
        )}
        disabled={disabled}
        onClick={onChange}
      >
        <span className="pl-2">{label}</span>
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
          'fixed inset-0 z-10 flex-shrink-0 overflow-y-auto bg-black px-4 pb-24 pt-12 md:sticky md:top-[74px] md:z-0 md:max-h-[calc(100vh-74px)] md:px-0 md:pt-0',
          'text-white scrollbar-thin scrollbar-thumb-gray-600',
          'no-scrollbar',
          open && !disabled ? 'w-full md:flex md:max-w-xs' : 'hidden'
        )}
      >
        {children}
      </aside>

      {open && (
        // Fixes stacking order
        <>
          <div className="fixed top-0 z-50 flex w-full items-center justify-between bg-black py-4 pr-8 pl-2 text-white md:hidden">
            <div></div>
            {t('filters')}
            <XMarkIcon onClick={onChange} className="h-6 w-6 cursor-pointer" />
          </div>
          <div className="fixed bottom-8 left-4 right-4 z-50 md:hidden">
            <Button onClick={onChange} className="w-full">
              Done
            </Button>
          </div>
        </>
      )}
    </>
  );
}

Sidebar.Panel = SidebarPanel;

interface SidebarPillProps {
  key: string;
  label: string;
  onRemoveClick: () => void;
  className?: string;
}

function SidebarPill({ key, label, onRemoveClick, className }: SidebarPillProps) {
  return (
    <div
      className={clsx(
        'rounded-full bg-primary-900 bg-opacity-10 py-2 px-4 text-sm text-primary-500',
        className
      )}
      key={key}
    >
      <div className="flex gap-2">
        {label}
        <XMarkIcon className="h-4 w-4 cursor-pointer" onClick={onRemoveClick} />
      </div>
    </div>
  );
}
Sidebar.Pill = SidebarPill;
interface SidebarContentProps {
  children: ReactNode;
  open?: boolean;
  className?: string;
}

function SidebarContent({ children, className }: SidebarContentProps): JSX.Element {
  return <article className={clsx('w-full', className)}>{children}</article>;
}

Sidebar.Content = SidebarContent;

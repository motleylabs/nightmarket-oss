import { ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { Children, cloneElement } from 'react';

import liveIcon from '../../public/images/live-light.svg';
import refreshIcon from '../../public/images/refresh.svg';
import Button, { ButtonBackground, ButtonBorder, ButtonColor, ButtonSize } from './Button';
import { Toggle } from './Toggle';

export function Sidebar(): JSX.Element {
  return <div></div>;
}

interface SidebarControlProps {
  label: string;
  open: boolean;
  onChange: () => void;
  show?: boolean;
  isLive?: boolean;
  setIsLive?: Dispatch<SetStateAction<boolean>>;
  refresh?: () => void;
}

function SidebarControl({
  open,
  label,
  onChange,
  show = true,
  isLive = undefined,
  setIsLive,
  refresh,
}: SidebarControlProps) {
  if (!show) return null;

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        className={clsx(
          'flex w-full flex-grow items-center justify-between rounded-full border border-gray-800 bg-gray-800 py-4 px-4 text-white transition enabled:hover:border-white',
          'enabled:hover:border-white disabled:text-gray-400 md:relative md:bottom-0 md:left-0 md:ml-0',
          open && ''
        )}
        onClick={onChange}
      >
        {open && (
          <ChevronRightIcon className={clsx('h-5 w-5 rotate-90 md:inline-block md:rotate-180')} />
        )}
        <span className={clsx('pl-2', open && 'mr-2')}>{label}</span>
        {!open && (
          <ChevronRightIcon
            className={clsx('ml-2 h-5 w-5 rotate-90 md:inline-block md:rotate-0')}
          />
        )}
      </button>
      {isLive !== undefined && (
        <div className="flex items-center ml-3 min-w-[150px]">
          <Toggle
            classes="mr-3"
            value={isLive}
            onChange={(val) => {
              if (!!setIsLive) setIsLive(val);
            }}
          />
          <p className="text-white whitespace-nowrap mr-1">Live data</p>
          {isLive && (
            <div className="w-[24px] h-[24px] flex items-center">
              <Image src={liveIcon} alt="live-icon" />
            </div>
          )}
        </div>
      )}
      {!!refresh && (
        <div
          className="ml-3 flex flex-none items-center justify-center rounded-full border-[1px] border-[#262626] w-[48px] h-[48px] cursor-pointer"
          onClick={refresh}
        >
          <Image src={refreshIcon} alt="refresh-icon" />
        </div>
      )}
    </div>
  );
}

Sidebar.Control = SidebarControl;

interface SidebarPageProps {
  children: JSX.Element[];
  open?: boolean;
}

function SidebarPage({ children, open }: SidebarPageProps) {
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
          'fixed inset-0 z-30 flex-shrink-0 overflow-y-auto bg-black px-4 pb-24 pt-12 md:sticky md:top-[74px] md:z-0 md:max-h-[calc(100vh-74px)] md:px-0 md:pt-0',
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
            {t('filters', { ns: 'common' })}
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

export interface PillItem {
  key: string;
  label: string;
}
interface SidebarPillsProps {
  items: PillItem[];
  onRemove: (item: PillItem) => void;
  onClear?: () => void;
  className?: string;
  clearButtonFirst: boolean;
}

function SidebarPills({
  items,
  onRemove,
  onClear,
  className,
  clearButtonFirst,
}: SidebarPillsProps) {
  const { t } = useTranslation('common');
  return (
    <div className={clsx('mb-4 mt-4 flex flex-wrap gap-2 md:mb-2', className)}>
      {clearButtonFirst && items.length > 0 && (
        <Button
          background={ButtonBackground.Black}
          border={ButtonBorder.Gradient}
          color={ButtonColor.Gradient}
          size={ButtonSize.Tiny}
          onClick={onClear}
        >
          {t('clear', { ns: 'common' })}
        </Button>
      )}
      {items.map((item) => {
        return <Sidebar.Pill key={item.key} pillItem={item} onRemove={() => onRemove(item)} />;
      })}
      {!clearButtonFirst && items.length > 0 && (
        <Button
          background={ButtonBackground.Black}
          border={ButtonBorder.Gradient}
          color={ButtonColor.Gradient}
          size={ButtonSize.Tiny}
          onClick={onClear}
        >
          {t('clear', { ns: 'common' })}
        </Button>
      )}
    </div>
  );
}
Sidebar.Pills = SidebarPills;

interface SidebarPillProps {
  pillItem: PillItem;
  onRemove: () => void;
  className?: string;
}

function SidebarPill({ pillItem, onRemove, className }: SidebarPillProps) {
  return (
    <div
      className={clsx(
        'rounded-full bg-primary-900 bg-opacity-10 py-2 px-4 text-sm text-primary-500',
        className
      )}
      key={pillItem.key}
    >
      <div className="flex gap-2">
        {pillItem.label}
        <XMarkIcon className="h-4 w-4 cursor-pointer" onClick={onRemove} />
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

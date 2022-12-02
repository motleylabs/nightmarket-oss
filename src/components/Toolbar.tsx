import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import Button, { ButtonBackground, ButtonBorder, ButtonColor, ButtonSize } from './Button';

interface ToolbarProps {
  children: ReactNode;
  pills?: ReactNode;
  className?: string;
}

export function Toolbar({ children, pills, className }: ToolbarProps): JSX.Element {
  return (
    <header className={clsx('top-0 my-4 mx-4 flex flex-col gap-6 bg-black md:mx-10', className)}>
      <div className={'grid grid-cols-2 items-center justify-between gap-4 md:flex'}>
        {children}
      </div>
      {pills}
    </header>
  );
}

interface ToolbarPillsContainerProps {
  items: PillItem[];
  removeClick: (item: PillItem) => void;
  clearClick?: () => void;
  className?: string;
}

function ToolbarPills({ items, removeClick, clearClick, className }: ToolbarPillsContainerProps) {
  const { t } = useTranslation(['common']);
  return (
    <div className={clsx('flex flex-col gap-2 md:mt-0', className)}>
      {/* <span className="text-sm text-gray-200">{`${t('filters')}:`}</span> */}
      <div className="flex flex-wrap gap-2">
        <>
          {items.map((item) => {
            return (
              <Toolbar.Pill
                key={item.key}
                pillItem={item}
                onRemoveClick={() => removeClick(item)}
              />
            );
          })}
          {items.length > 0 && (
            <Button
              background={ButtonBackground.Black}
              border={ButtonBorder.Gradient}
              color={ButtonColor.Gradient}
              size={ButtonSize.Tiny}
              onClick={clearClick}
            >
              {t('clear')}
            </Button>
          )}
        </>
      </div>
    </div>
  );
}
Toolbar.Pills = ToolbarPills;

export interface PillItem {
  key: string;
  label: string;
}

interface ToolbarPillProps {
  pillItem: PillItem;
  onRemoveClick: () => void;
  className?: string;
}

function ToolbarPill({ pillItem, onRemoveClick, className }: ToolbarPillProps) {
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
        <XMarkIcon className="h-4 w-4 cursor-pointer" onClick={onRemoveClick} />
      </div>
    </div>
  );
}
Toolbar.Pill = ToolbarPill;

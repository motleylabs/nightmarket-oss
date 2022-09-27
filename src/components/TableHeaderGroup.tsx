import clsx from 'clsx';
import { ReactNode } from 'react';
import { RadioGroup } from '@headlessui/react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';

interface TableHeaderGroupProps<T> {
  children: ReactNode;
  value: T;
  onChange: (value: T | undefined) => void;
  className?: string;
}

export function TableHeaderGroup<T>({
  children,
  value,
  onChange,
  className,
}: TableHeaderGroupProps<T>): JSX.Element {
  return (
    <RadioGroup value={value} onChange={onChange} className={clsx('table-header-group', className)}>
      {children}
    </RadioGroup>
  );
}

interface TableHeaderGroupOptionProps<T> {
  children: ReactNode;
  active: boolean;
  value: T;
  disabled?: boolean;
  classname?: string;
}

function TableHeaderGroupOption<T>({
  children,
  value,
  active,
  disabled,
  classname,
}: TableHeaderGroupOptionProps<T>): JSX.Element {
  return (
    <RadioGroup.Option value={value} className="table-cell" disabled={disabled}>
      <div
        className={clsx(
          'flex gap-2 text-xs font-normal text-gray-300 hover:text-gray-200',
          !disabled ? 'cursor-pointer' : '',
          classname
        )}
      >
        {active && <ArrowUpIcon className="h-3 w-3 rotate-180 transform" />}
        {children}
      </div>
    </RadioGroup.Option>
  );
}

TableHeaderGroup.Option = TableHeaderGroupOption;

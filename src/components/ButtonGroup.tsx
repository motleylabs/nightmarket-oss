import clsx from 'clsx';
import { ReactNode } from 'react';
import { RadioGroup } from '@headlessui/react';

interface ButtonGroupProps<T> {
  style?: 'oval' | 'plain';
  children: ReactNode;
  value: T;
  onChange: (value: T | undefined) => void;
  className?: string;
}

export function ButtonGroup<T>({
  style = 'oval',
  children,
  value,
  onChange,
  className,
}: ButtonGroupProps<T>): JSX.Element {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className={clsx('flex max-w-full flex-row items-center justify-start gap-4', className, {
        'rounded-full border border-gray-800 px-1 py-1': style === 'oval',
        '': style === 'plain',
      })}
    >
      {children}
    </RadioGroup>
  );
}

interface ButtonGroupButtonProps<T> {
  children: ReactNode;
  active?: boolean;
  value: T;
}

function ButtonGroupOvalStyleOption<T>({
  children,
  value,
}: ButtonGroupButtonProps<T>): JSX.Element {
  return (
    <RadioGroup.Option
      value={value}
      className={({ checked }) =>
        clsx(
          'flex h-10 w-28 flex-row items-center justify-center rounded-full text-sm md:text-base',
          checked
            ? 'rounded-full bg-gray-800 text-white'
            : 'cursor-pointer bg-transparent text-gray-300 hover:bg-gray-800 hover:text-gray-200'
        )
      }
    >
      {children}
    </RadioGroup.Option>
  );
}

ButtonGroup.OvalStyleOption = ButtonGroupOvalStyleOption;

function ButtonGroupPlainStyleOption<T>({
  children,
  value,
}: ButtonGroupButtonProps<T>): JSX.Element {
  return (
    <RadioGroup.Option
      value={value}
      className={({ checked }) =>
        clsx(
          'flex flex-row items-center justify-center text-sm md:text-base',
          checked
            ? 'border-b border-b-white text-white'
            : 'cursor-pointer bg-transparent text-gray-300 hover:text-gray-200'
        )
      }
    >
      {children}
    </RadioGroup.Option>
  );
}

ButtonGroup.PlainStyleOption = ButtonGroupPlainStyleOption;

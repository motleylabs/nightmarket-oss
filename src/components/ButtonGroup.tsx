import clsx from 'clsx';
import { ReactNode } from 'react';
import { RadioGroup } from '@headlessui/react';

interface ButtonGroupProps<T> {
  children: ReactNode;
  value: T;
  onChange: (value: T | undefined) => void;
  className?: string;
}

export function ButtonGroup<T>({
  children,
  value,
  onChange,
  className,
}: ButtonGroupProps<T>): JSX.Element {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className={clsx(
        'flex max-w-full flex-row items-center justify-start gap-2 rounded-full border border-gray-800 px-1 py-1',
        className
      )}
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

function ButtonGroupOption<T>({ children, value }: ButtonGroupButtonProps<T>): JSX.Element {
  return (
    <RadioGroup.Option
      value={value}
      className={({ checked }) =>
        clsx(
          'flex h-10 w-28 flex-row items-center justify-center rounded-full text-sm md:text-base',
          checked
            ? 'rounded-full bg-gray-800 text-white'
            : 'cursor-pointer bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-gray-200'
        )
      }
    >
      {children}
    </RadioGroup.Option>
  );
}

ButtonGroup.Option = ButtonGroupOption;

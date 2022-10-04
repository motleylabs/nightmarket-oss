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
        'flex max-w-full flex-row items-center justify-start gap-2 rounded-full border border-themebg-600 px-1 py-1',
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
            ? 'rounded-full bg-themebg-800 text-themetext-900'
            : 'cursor-pointer bg-transparent text-themetext-700 hover:bg-themebg-700 hover:text-themetext-800'
        )
      }
    >
      {children}
    </RadioGroup.Option>
  );
}

ButtonGroup.Option = ButtonGroupOption;

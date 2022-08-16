import clsx from 'clsx';
import { ChangeEventHandler, ReactNode } from 'react';
import { RadioGroup } from '@headlessui/react';

interface ButtonGroupProps<T> {
  children: ReactNode;
  value: T;
  onChange: (value: T | undefined) => void;
}

export function ButtonGroup<T>({ children, value, onChange }: ButtonGroupProps<T>): JSX.Element {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className="flex flex-row items-center justify-start gap-2 rounded-full border border-gray-800 px-1 py-1"
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
          'flex h-8 w-24 flex-row items-center justify-center rounded-full md:w-28',
          checked
            ? 'bg-gray-700 text-white'
            : 'cursor-pointer bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-gray-200'
        )
      }
    >
      {children}
    </RadioGroup.Option>
  );
}

ButtonGroup.Option = ButtonGroupOption;

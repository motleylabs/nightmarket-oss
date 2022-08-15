import clsx from 'clsx';
import { ReactNode } from 'react';
import { RadioGroup } from '@headlessui/react';

interface ButtonGroupProps<T> {
  children: ReactNode;
  value: T;
  onChange: (selected: T) => void;
}

export function ButtonGroup<T = string>(props: ButtonGroupProps<T>): JSX.Element {
  return (
    <RadioGroup
      value={props.value}
      onChange={props.onChange}
      className="flex flex-row items-center justify-start gap-2 rounded-full border border-gray-800 px-1 py-1"
    >
      {props.children}
    </RadioGroup>
  );
}

interface ButtonGroupButtonProps<T> {
  children: ReactNode;
  value: T;
}

function ButtonGroupOption<T = string>({
  children,
  value,
}: ButtonGroupButtonProps<T>): JSX.Element {
  return (
    <RadioGroup.Option
      value={value}
      className={({ checked }) =>
        clsx(
          'flex h-8 w-24 flex-row items-center justify-center rounded-full md:w-28',
          checked ? 'bg-gray-700 text-white' : 'cursor-pointer bg-gray-900 text-gray-300'
        )
      }
    >
      {children}
    </RadioGroup.Option>
  );
}

ButtonGroup.Option = ButtonGroupOption;

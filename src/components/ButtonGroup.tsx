import clsx from 'clsx';
import { ReactNode } from 'react';
import { RadioGroup } from '@headlessui/react';

interface ButtonGroupProps {
  children: ReactNode;
  value: any;
  onChange: (selected: any) => void;
}

export function ButtonGroup({ children, value, onChange }: ButtonGroupProps): JSX.Element {
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

interface ButtonGroupButtonProps {
  children: ReactNode;
  active?: boolean;
  value: ReactNode;
}

function ButtonGroupOption({ children, value }: ButtonGroupButtonProps): JSX.Element {
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

import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

import clsx from 'clsx';
import React, { Fragment } from 'react';

export default function Select<T>(props: {
  value: T;
  onChange(value: T): void;
  options: { label: string; value: T }[];
  className?: string;
}) {
  return (
    <Listbox value={props.value} onChange={props.onChange}>
      {({ open }) => (
        <div className={clsx('relative', props.className)}>
          <Listbox.Button
            className={clsx(
              'relative w-full cursor-pointer rounded-full border border-gray-800 bg-gray-800 py-4 pl-5 pr-10 text-left text-base text-white shadow-md hover:border-white focus:outline-none focus-visible:border-gray-500 focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300',
              open && ''
            )}
          >
            <span className="block truncate text-center">
              {props.options.find((o) => o.value === props.value)?.label}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDownIcon
                className={clsx('h-5 w-5 text-white', open && 'rotate-180 transition-transform')}
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={clsx(
                'absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-auto rounded-lg bg-gray-800 py-4 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
              )}
            >
              {props.options.map((option, optionIdx) => (
                <Listbox.Option
                  key={optionIdx}
                  className={({ selected }) =>
                    clsx(
                      'relative mx-4 cursor-pointer select-none rounded-lg p-4 text-white hover:bg-gradient-primary hover:text-white',
                      {
                        'text-primary-500': selected,
                      }
                    )
                  }
                  value={option.value}
                >
                  <span className={clsx('', {})}>{option.label}</span>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}

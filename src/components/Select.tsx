import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import React, { Fragment, useState } from 'react';
import { Controller } from 'react-hook-form';

// often value and onChange => [value, onChange] = useState()

export default function Select<T>(props: {
  value: { label: string; value: T }; // TODO make better types, somethng with extend or similar
  onChange: any;
  options: { label: string; value: T }[];
}) {
  return (
    <Listbox value={props.value} onChange={props.onChange}>
      {({ open }) => (
        <div className="relative">
          <Listbox.Button
            className={clsx(
              'relative flex w-full flex-grow cursor-pointer rounded-full border border-gray-800 bg-gray-800 py-3 pl-4 pr-10 text-left text-base text-white shadow-md hover:border-white focus:outline-none focus-visible:border-gray-500 focus-visible:ring-2  focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300',
              open && ''
            )}
          >
            <span className="block truncate">
              {props.options.find((o) => o.value === props.value.value)?.label}
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
                'border-ima absolute z-30  mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-900 text-base shadow-lg ring-1 ring-black ring-opacity-5  focus:outline-none'
              )}
            >
              {props.options.map((option, optionIdx) => (
                <Listbox.Option
                  key={optionIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-4 ${
                      active ? 'bg-primary-850 text-white' : 'text-white'
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <span
                      className={clsx('block truncate', selected ? 'font-medium' : 'font-normal')}
                    >
                      {option.label}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}

export function ControlledSelect(props: {
  id: string;
  control: any;
  required?: boolean;
  options: {
    value: any;
    label: string;
  }[];
}) {
  return (
    <Controller
      control={props.control}
      name={props.id}
      rules={{ required: props.required }} //optional
      render={({
        field: { onChange, name, value },
        fieldState: { isDirty }, //optional
        formState: { errors }, //optional, but necessary if you want to show an error message
      }) => <Select value={value} onChange={onChange} options={props.options} />}
    />
  );
}

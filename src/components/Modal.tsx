import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';

import clsx from 'clsx';
import React, { Dispatch, Fragment, ReactNode, SetStateAction } from 'react';

import { BriceFont, HauoraFont } from '../fonts';

type ModalProps = {
  children: ReactNode;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  short?: boolean;
  title?: string;
  scroll?: boolean;
};

export default function Modal(props: ModalProps) {
  return (
    <Transition appear show={props.open} as={Fragment}>
      <Dialog
        as="div"
        className={`${BriceFont.variable} ${HauoraFont.variable} font-sans`}
        onClose={() => props.setOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={clsx(
              'fixed inset-0 z-40', // bg-black bg-opacity-25
              'bg-gray-800 bg-opacity-40 backdrop-blur-lg ',
              'transition-opacity duration-500 ease-in-out',
              'flex flex-col items-center justify-center',
              {
                'opacity-100': props.open,
                'opacity-0': !props.open,
                'pointer-events-auto': props.open,
                'pointer-events-none': !props.open,
              }
            )}
          />
        </Transition.Child>

        <div className={clsx('fixed inset-0 z-40 overflow-y-auto')}>
          <div
            className={clsx(
              'flex min-h-full items-center justify-center  text-center',
              !props.scroll ? 'p-4' : 'py-4'
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  'z-40 w-full max-w-md transform !overflow-visible rounded-2xl bg-gray-900  text-left align-middle transition-all',
                  'scrollbar-thumb-rounded-full relative flex h-full max-h-screen w-full flex-col overflow-y-auto bg-gray-900  text-white shadow-md scrollbar-thin scrollbar-track-gray-900  sm:h-auto  sm:max-w-2xl',
                  props.short ? 'sm:max-h-[30rem]' : 'sm:max-h-[50rem]',
                  props.scroll ? 'pt-6' : 'p-6'
                )}
              >
                <div className="flex items-center justify-between">
                  {props.title && (
                    <Dialog.Title as="h3" className="text-[32px] font-medium text-white">
                      {props.title}
                    </Dialog.Title>
                  )}
                  <button
                    type="button"
                    onClick={() => props.setOpen(false)}
                    className="z-50 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-gray-800 p-1 hover:bg-gray-700 hover:text-gray-100"
                  >
                    {/* <Close color={`#ffffff`} /> */}
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </button>
                </div>

                {props.children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

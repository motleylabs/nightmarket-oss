import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/solid';

import clsx from 'clsx';
import Image from 'next/image';
import React, { Dispatch, Fragment, ReactNode, SetStateAction } from 'react';

import arrowIcon from '../../../public/images/leaderboard/popup/arrow.svg';
import marketIcon from '../../../public/images/leaderboard/popup/market.svg';
import nftIcon from '../../../public/images/leaderboard/popup/nft.svg';
import pointsIcon from '../../../public/images/leaderboard/popup/points.svg';
import { BriceFont, HauoraFont } from '../../fonts';

type LeaderboardModal = {
  children?: ReactNode;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  short?: boolean;
  title?: string;
  scroll?: boolean;
  t: any;
};

export default function LeaderboardModal(props: LeaderboardModal) {
  const leaderboardNS = 'leaderboard';

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
                  'z-40 max-w-md transform !overflow-visible rounded-2xl bg-gray-900  text-left align-middle transition-all border-[1px] border-white border-opacity-10',
                  'scrollbar-thumb-rounded-full relative flex flex-col overflow-y-auto bg-gray-900 text-white shadow-md scrollbar-thin scrollbar-track-gray-900 w-[308px] h-[350px] px-10 pt-10 pb-8'
                )}
              >
                <div className="flex flex-col w-full items-center justify-start">
                  <p className="leading-6 text-sm font-medium font-sans text-gray-450">
                    {props.t('popup.howToEarn', { ns: leaderboardNS })}
                  </p>

                  <div className="relative flex flex-row items-start justify-center mt-3 mb-4">
                    <Image src={marketIcon} height={48} width={48} alt="market icon" />
                    <Image
                      src={nftIcon}
                      height={53}
                      width={57}
                      alt="market icon"
                      className="mr-[10px]  ml-[19px] object-cover w-full h-full"
                    />
                    <Image
                      src={pointsIcon}
                      height={48}
                      width={48}
                      alt="market icon"
                      className="object-fill "
                    />
                    <Image
                      src={arrowIcon}
                      // height={100}
                      width={57}
                      alt="arrow icon"
                      className="absolute object-fill -top-[25px] -right-[28px]"
                    />
                  </div>

                  <ol className="list-decimal text-sm font-medium font-sans text-gray-450 leading-[18px] pl-5">
                    <li>
                      <div className="flex flex-row">
                        {props.t('popup.open', { ns: leaderboardNS })}
                        <div className="flex flex-col">
                          <span className="text-transparent cursor-pointer bg-clip-text bg-gradient-to-r from-primary-900 to-primary-800 ml-1">
                            {props.t('popup.nftMarketplace', { ns: leaderboardNS })}
                          </span>

                          <span className="cursor-pointer bg-gradient-to-r from-primary-900 to-primary-800 h-[0.5px] ml-1 -mt-[3px]"></span>
                        </div>
                      </div>
                    </li>
                    <li>{props.t('popup.buySome', { ns: leaderboardNS })}</li>
                    <li>{props.t('popup.youWill', { ns: leaderboardNS })}</li>
                  </ol>
                </div>
                {/* {props.children} */}
                <div className="flex items-center justify-between mx-auto mt-8">
                  <button
                    type="button"
                    onClick={() => props.setOpen(false)}
                    className="z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 p-1 hover:bg-gray-700 hover:text-gray-100"
                  >
                    {/* <Close color={`#ffffff`} /> */}
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

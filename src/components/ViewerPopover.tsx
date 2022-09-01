import { CheckIcon, ChevronRightIcon, DuplicateIcon } from '@heroicons/react/outline';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import Link from 'next/link';
import React, { useState } from 'react';
import useViewer, { GetViewerData } from './../hooks/viewer';
import Popover from './Popover';

import { WalletDisconnectButton, WalletModalButton } from '@solana/wallet-adapter-react-ui';
import { shortenAddress } from '../modules/address';
import Button, { ButtonType } from './Button';

export default function ViewerPopover(props: { viewerData: GetViewerData }) {
  const { wallet, viewer } = props.viewerData;
  const [copied, setCopied] = useState(false);
  const copyPubKey = async () => {
    if (wallet.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Popover
      content={
        <div className=" rounded-lg bg-gray-900 p-4 text-white shadow-lg sm:w-96">
          {/* <div className="flex w-full justify-between">
            <img
              className="hidden h-20 w-20 rounded-full transition md:inline-block"
              src={wallet.previewImage as string}
              alt="profile image"
            />
            <Link href={'/profiles/' + wallet.address + '/collected'} passHref>
              <a className="ml-5 flex cursor-pointer items-center text-base hover:text-gray-300 ">
                <span className="">View profile</span>
                &nbsp;
                <ChevronRightIcon className="h-5 w-5" />
              </a>
            </Link>
          </div>
          <div className="mt-6 flex justify-between">
            <span className="text-xl font-semibold ">
              {`${((viewer.balance as number) / LAMPORTS_PER_SOL)?.toFixed(2)} SOL`}
            </span>
            <div className="flex items-center text-2xl font-medium">
              <div className={`flex flex-col items-center justify-start gap-4 lg:items-start`}>
                <span
                  className={`flex max-w-fit cursor-pointer gap-2 rounded-full px-2 py-1 font-mono text-xs shadow-lg shadow-black hover:text-gray-300`}
                  onClick={copyPubKey}
                >
                  {wallet.displayName}

                  {copied ? (
                    <CheckIcon className="h-4 w-4 " />
                  ) : (
                    <DuplicateIcon className="h-4 w-4 cursor-pointer " />
                  )}
                </span>
              </div>
            </div>
          </div>
          <WalletDisconnectButton
            startIcon={undefined}
            className="mt-4 flex w-full justify-center rounded-full bg-gray-800 text-white hover:!bg-gray-700"
          ></WalletDisconnectButton> */}
        </div>
      }
    >
      <img
        className="hidden h-10 w-10 cursor-pointer rounded-full transition md:inline-block"
        src={wallet.previewImage as string}
        alt="profile image"
      />
    </Popover>
  );
}

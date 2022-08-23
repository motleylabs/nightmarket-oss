import { CheckIcon, ChevronRightIcon, DuplicateIcon } from '@heroicons/react/outline';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import Link from 'next/link';
import React, { useState } from 'react';
import useViewer from './../hooks/viewer';
import Popover from './Popover';
import { Viewer, Wallet } from './../types';
import { WalletDisconnectButton, WalletModalButton } from '@solana/wallet-adapter-react-ui';
import { shortenAddress } from '../modules/address';
import Button, { ButtonType } from './Button';

export default function ViewerPopover(props: { viewer: Viewer; wallet: Wallet }) {
  const [copied, setCopied] = useState(false);
  const copyPubKey = async () => {
    if (props.wallet.address) {
      await navigator.clipboard.writeText(props.wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Popover
      href={'/profiles/' + props.wallet.address + '/collected'}
      content={
        <div className=" rounded-lg bg-gray-900 p-5 text-white shadow-lg sm:w-80">
          <div className="flex w-full justify-between">
            <img
              className="hidden h-20 w-20 rounded-full transition md:inline-block"
              src={props.wallet.previewImage}
              alt="profile image"
            />
            <Link href={'/profiles/' + props.wallet.address + '/collected'} passHref>
              <a className="ml-5 flex cursor-pointer items-center text-base hover:text-gray-300 ">
                <span className="">View profile</span>
                &nbsp;
                <ChevronRightIcon className="h-5 w-5" />
              </a>
            </Link>
          </div>
          <div className="mt-6 flex justify-between">
            <span className="text-xl font-semibold ">
              {`${(props.viewer.balance / LAMPORTS_PER_SOL)?.toFixed(2)} SOL`}
            </span>
            <div className="flex items-center text-2xl font-medium">
              <div className={`flex flex-col items-center justify-start gap-4 lg:items-start`}>
                <span
                  className={`flex max-w-fit cursor-pointer gap-2 rounded-full px-2 py-1 font-mono text-xs shadow-lg shadow-black hover:text-gray-300`}
                  onClick={copyPubKey}
                >
                  {props.wallet.displayName}
                  {/* {props.wallet.profile?.handle
                    ? '@' + props.wallet.profile?.handle
                    : shortenAddress(props.wallet.address)} */}
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
          >
            {/* <Button type={ButtonType.Secondary}>Disconnect</Button> */}
          </WalletDisconnectButton>
        </div>
      }
    >
      {/* <Link
      href={'/profiles/' + viewerQueryResult.data.wallet.address + '/collected'}
      passHref
    >
      <a> */}
      <img
        className="hidden h-10 w-10 cursor-pointer rounded-full transition md:inline-block"
        src={props.wallet.previewImage}
        alt="profile image"
      />
      {/* </a>
    </Link> */}
    </Popover>
  );
}

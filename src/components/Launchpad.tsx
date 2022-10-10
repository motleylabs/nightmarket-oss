import React, { FC, ReactNode } from 'react';
import Button, { ButtonType } from './Button';
import clsx from 'clsx';
import { millisecondsToMinutes, formatDistance } from 'date-fns';

type Active = FC;
type Upcoming = FC;
type Finished = FC;

interface LaunchpadProps {
    launchpadId: string;
    children: ReactNode;
    Active?: Active;
    Upcoming?: Upcoming;
    Finished?: Finished;
}

export default function Launchpad({children, launchpadId = "testLaunch"}: LaunchpadProps) {
    return (
        <>
            {children}
        </>
    )
}

export enum MintOption {
    Standard = 'standard',
    Dynamic = 'dynamic',
}

interface LaunchpadActiveProps {
    title: string;
    price: number;
    supply: number;
    minted: number;
    hasAccess?: boolean;
    isPublic?: boolean;
    mintType?: MintOption;
    onMint?: () => void;
}

function LaunchpadActive({onMint, title, price, supply, minted, hasAccess, isPublic = false, mintType = MintOption.Standard}: LaunchpadActiveProps) {
    const mintedPercentage = (minted/supply) * 100
    return (
        <div className="flex flex-col justify-between rounded-lg border-2 border-primary-700 p-4 bg-gray-900">
            <div className="flex flex-col gap-4">
                <div className="flex flex-row justify-between">
                {mintType === MintOption.Dynamic && (
                    <p className="text-xs text-gray-300 font-semibold">Dynamic pricing</p>
                )}
                {!isPublic && (
                    <div className="flex flex-row gap-2 items-center">
                        <div className={clsx("rounded-full w-2 h-2",
                        hasAccess ? 'bg-green-500' : 'bg-primary-700')}/>
                        <p className="text-xs text-gray-300 font-semibold">{hasAccess ? 'You are on the allowlist' : `You are not on the allowlist`}</p>
                    </div>
                )}
                </div>
                
                <div className="text-xl text-white font-bold flex flex-row justify-between">
                    <h6>{title}</h6>
                    <p><span className="text-xs text-gray-300 font-normal">{mintType === MintOption.Dynamic ? 'Current price' : 'Price'}</span> {price} SOL</p>
                </div>
                {/* TODO: add graph for dynamic pricing */}
                <div className="flex flex-row items-center justify-between pt-2">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-gray-300 font-normal">Minting</p>
                        <div className="flex flex-row gap-2 items-center">
                            <p className="text-base font-bold">{`${minted}/${supply}`}</p>
                            <div className="rounded-full w-32 bg-gray-700 h-2 flex">
                                <div className={clsx(
                                    "bg-primary-700 h-2 rounded-full",
                                    `w-[${mintedPercentage.toFixed(0)}%]`,
                                )}/>
                            </div>
                        </div>
                    </div>
                    <Button onClick={onMint} type={ButtonType.Primary} className="font-bold" disabled={!hasAccess}>Mint now</Button>
                </div>
            </div>
        </div>
    )
}

Launchpad.Active = LaunchpadActive

interface LaunchpadFinishedProps extends Omit<LaunchpadActiveProps, "hasAccess" | "isPublic"> {
    soldOut: boolean;
    soldOutTimeMilliseconds?: number;
}

function LaunchpadFinished({
    soldOut, 
    soldOutTimeMilliseconds, 
    onMint, 
    title, 
    price, 
    supply, 
    minted,
    mintType = MintOption.Standard 
}: LaunchpadFinishedProps){
    const mintedPercentage = (minted / supply) * 100
    return (
        <div className="flex flex-col justify-between rounded-lg p-4 bg-gray-900 opacity-75">
            <div className="flex flex-col gap-4">
                {mintType === MintOption.Dynamic && (
                    <p className="text-xs text-gray-300 font-semibold">Dynamic pricing</p>
                )}
                <div className="text-xl text-white font-bold flex flex-row justify-between">
                    <h6>{title}</h6>
                    <p><span className="text-xs text-gray-300 font-normal">{mintType === MintOption.Dynamic ? 'Finished price' : 'Price'}</span> {price} SOL</p>
                </div>
                <div className="flex flex-row items-center justify-between pt-2">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-gray-300 font-normal">Minted</p>
                        <div className="flex flex-row gap-2 items-center">
                            <p className="text-base font-bold">{`${minted}/${supply}`}</p>
                            <div className="rounded-full w-32 bg-gray-700 h-2 flex">
                                <div className={clsx(
                                    "bg-primary-700 h-2 rounded-full",
                                    `w-[${mintedPercentage.toFixed(0)}%]`,
                                )}/>
                            </div>
                        </div>
                    </div>
                    {/* TODO: format date to minutes, hours, days, etc */}
                    <h6 className="font-bold p-4 bg-black rounded-full text-gray-500">{soldOut ? soldOutTimeMilliseconds ? `Sold out in ${millisecondsToMinutes(soldOutTimeMilliseconds)} min` : 'Sold out' : 'Finished'}</h6>
                </div>
            </div>
        </div>
    )
}

Launchpad.Finished = LaunchpadFinished

interface LaunchpadUpcomingProps extends Omit<LaunchpadActiveProps, "minted"> {
    mintDate: Date;
}

function LaunchpadUpcoming({
    title,
    price,
    supply,
    mintDate,
    mintType,
    onMint,
    isPublic = false,
    hasAccess
} : LaunchpadUpcomingProps){
    return (
        <div className="flex flex-col justify-between rounded-lg border-2 border-gray-900 p-4 bg-gray-900">
            <div className="flex flex-col gap-4">
                <div className="flex flex-row justify-between">
                {mintType === MintOption.Dynamic && (
                    <p className="text-xs text-gray-300 font-semibold">Dynamic pricing</p>
                )}
                {!isPublic && (
                    <div className="flex flex-row gap-2 items-center">
                        <div className={clsx("rounded-full w-2 h-2",
                        hasAccess ? 'bg-green-500' : 'bg-primary-700')}/>
                        <p className="text-xs text-gray-300 font-semibold">{hasAccess ? 'You are on the allowlist' : `You are not on the allowlist`}</p>
                    </div>
                )}
                </div>
                
                <div className="text-xl text-white font-bold flex flex-row justify-between">
                    <h6>{title}</h6>
                    <p><span className="text-xs text-gray-300 font-normal">{mintType === MintOption.Dynamic ? 'Starting price' : 'Price'}</span> {price} SOL</p>
                </div>
                {/* TODO: add graph for dynamic pricing */}
                <div className="flex flex-row items-center justify-between pt-2">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs text-gray-300 font-normal">Supply</p>
                        <div className="flex flex-row gap-2 items-center">
                            <p className="text-base font-bold">{supply}</p>  
                        </div>
                    </div>
                    {/* TODO: build a countdown timer or use an off the shelf hook */}
                <h6 className="p-4 font-bold text-gray-500 rounded-full bg-black">Mint in <span className="text-primary-700">{formatDistance(mintDate, new Date())}</span></h6>
                </div>
            </div>
        </div>
    )
}

Launchpad.Upcoming = LaunchpadUpcoming;

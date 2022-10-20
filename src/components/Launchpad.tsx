import React, { FC, ReactNode } from 'react';
import Button, { ButtonBackground, ButtonColor } from './Button';
import clsx from 'clsx';
import { millisecondsToMinutes, formatDistance } from 'date-fns';
import { useTranslation } from 'next-i18next';
import useLaunchpad, { LaunchpadState } from '../hooks/launchpad';

type Active = FC;
type Upcoming = FC;
type Finished = FC;

interface RenderProps {
  onMint: () => Promise<void>;
  isMinting: boolean;
  launchpadState: LaunchpadState;
  children: any;
}

interface LaunchpadProps {
  candyMachineId: string;
  children: (args: RenderProps) => any;
  Active?: Active;
  Upcoming?: Upcoming;
  Finished?: Finished;
}

export default function Launchpad({ children, candyMachineId }: LaunchpadProps) {
  const { onMint, launchpadState, isMinting } = useLaunchpad(candyMachineId);

  return (
    <>
      {children({
        onMint,
        isMinting,
        launchpadState,
        children,
      })}
    </>
  );
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
  isMinting: boolean;
}

function LaunchpadActive({
  onMint,
  isMinting,
  title,
  price,
  supply,
  minted,
  hasAccess,
  isPublic = false,
  mintType = MintOption.Standard,
}: LaunchpadActiveProps) {
  const { t } = useTranslation('launchpad');
  const mintedPercentage = (minted / supply) * 100;
  return (
    <div className="flex flex-col justify-between rounded-lg border-2 border-primary-700 bg-gray-800 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between">
          {mintType === MintOption.Dynamic && (
            <p className="text-xs font-semibold text-gray-300">{t('phases.dynamic')}</p>
          )}
          {!isPublic && (
            <div className="flex flex-row items-center gap-2">
              <div
                className={clsx(
                  'h-2 w-2 rounded-full',
                  hasAccess ? 'bg-green-500' : 'bg-primary-700'
                )}
              />
              <p className="text-xs font-semibold text-gray-300">
                {hasAccess ? t('phases.allowed') : t('phases.notAllowed')}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-row justify-between text-xl font-bold text-white">
          <h6>{title}</h6>
          <p>
            <span className="text-xs font-normal text-gray-300">
              {mintType === MintOption.Dynamic ? t('phases.startingPrice') : t('phases.price')}
            </span>{' '}
            {price} SOL
          </p>
        </div>
        {/* TODO: add graph for dynamic pricing */}
        <div className="flex flex-row items-center justify-between pt-2">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-normal text-gray-300">{t('phases.minting')}</p>
            <div className="flex flex-row items-center gap-2">
              <p className="text-base font-bold">{`${minted}/${supply}`}</p>
              <div className="flex h-2 w-32 rounded-full bg-gray-700">
                <div
                  style={{ width: `${mintedPercentage.toFixed(0)}%` }}
                  className={clsx('h-2 rounded-full bg-primary-700')}
                />
              </div>
            </div>
          </div>
          <Button
            onClick={onMint}
            background={ButtonBackground.Gradient}
            color={ButtonColor.White}
            loading={isMinting}
            disabled={!hasAccess}
          >
            {t('phases.mint')}
          </Button>
        </div>
      </div>
    </div>
  );
}

Launchpad.Active = LaunchpadActive;

interface LaunchpadFinishedProps
  extends Omit<LaunchpadActiveProps, 'hasAccess' | 'isPublic' | 'isMinting'> {
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
  mintType = MintOption.Standard,
}: LaunchpadFinishedProps) {
  const { t } = useTranslation('launchpad');
  const mintedPercentage = (minted / supply) * 100;
  return (
    <div className="flex flex-col justify-between rounded-lg bg-gray-800 p-4 opacity-75">
      <div className="flex flex-col gap-4">
        {mintType === MintOption.Dynamic && (
          <p className="text-xs font-semibold text-gray-300">{t('phases.dynamic')}</p>
        )}
        <div className="flex flex-row justify-between text-xl font-bold text-white">
          <h6>{title}</h6>
          <p>
            <span className="text-xs font-normal text-gray-300">
              {mintType === MintOption.Dynamic ? t('phases.finishedPrice') : t('phases.price')}
            </span>{' '}
            {price} SOL
          </p>
        </div>
        <div className="flex flex-row items-center justify-between pt-2">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-normal text-gray-300">{t('phases.minted')}</p>
            <div className="flex flex-row items-center gap-2">
              <p className="text-base font-bold">{`${minted}/${supply}`}</p>
              <div className="flex h-2 w-32 rounded-full bg-gray-700">
                <div
                  style={{ width: `${mintedPercentage.toFixed(0)}%` }}
                  className={clsx('h-2 rounded-full bg-primary-700')}
                />
              </div>
            </div>
          </div>
          {/* TODO: format date to minutes, hours, days, etc */}
          <h6 className="rounded-full bg-black p-4 font-bold text-gray-500">
            {soldOut
              ? soldOutTimeMilliseconds
                ? `${t('phases.soldoutTime')} ${millisecondsToMinutes(soldOutTimeMilliseconds)} min`
                : t('phases.soldout')
              : t('phases.finished')}
          </h6>
        </div>
      </div>
    </div>
  );
}

Launchpad.Finished = LaunchpadFinished;

interface LaunchpadUpcomingProps extends Omit<LaunchpadActiveProps, 'minted' | 'isMinting'> {
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
  hasAccess,
}: LaunchpadUpcomingProps) {
  const { t } = useTranslation('launchpad');
  return (
    <div className="flex flex-col justify-between rounded-lg border-2 border-gray-800 bg-gray-800 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between">
          {mintType === MintOption.Dynamic && (
            <p className="text-xs font-semibold text-gray-300">{t('phases.dynamic')}</p>
          )}
          {!isPublic && (
            <div className="flex flex-row items-center gap-2">
              <div
                className={clsx(
                  'h-2 w-2 rounded-full',
                  hasAccess ? 'bg-green-500' : 'bg-primary-700'
                )}
              />
              <p className="text-xs font-semibold text-gray-300">
                {hasAccess ? t('phases.allowed') : t('phases.notAllowed')}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-row justify-between text-xl font-bold text-white">
          <h6>{title}</h6>
          <p>
            <span className="text-xs font-normal text-gray-300">
              {mintType === MintOption.Dynamic ? t('phases.dynamic') : t('phases.price')}
            </span>{' '}
            {price} SOL
          </p>
        </div>
        {/* TODO: add graph for dynamic pricing */}
        <div className="flex flex-row items-center justify-between pt-2">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-normal text-gray-300">{t('phases.supply')}</p>
            <div className="flex flex-row items-center gap-2">
              <p className="text-base font-bold">{supply}</p>
            </div>
          </div>
          {/* TODO: build a countdown timer or use an off the shelf hook */}
          <h6 className="rounded-full bg-black p-4 font-bold text-gray-500">
            {t('phases.upcomingMint')}{' '}
            <span className="text-primary-700">{formatDistance(mintDate, new Date())}</span>
          </h6>
        </div>
      </div>
    </div>
  );
}

Launchpad.Upcoming = LaunchpadUpcoming;

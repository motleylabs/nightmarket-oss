import {
  CurrencyDollarIcon,
  HandRaisedIcon,
  TagIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';

import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo, cloneElement, Children } from 'react';

import config from '../app.config';
import { formatToNow } from '../utils/date';
import type { Marketplace } from '../utils/marketplaces';
import { getMarketplace } from '../utils/marketplaces';
import { getSolFromLamports } from '../utils/price';
import { hideTokenDetails } from '../utils/tokens';
import Icon from './Icon';

export enum ActivityType {
  ListingCreated = 'LISTING',
  OfferCreated = 'BID',
  ListingCanceled = 'DELISTING',
  OfferCanceled = 'CANCEL_BID',
  Purchase = 'TRANSACTION',
}

interface ActivityProps {
  children: JSX.Element | JSX.Element[];
  avatar?: JSX.Element;
  meta: JSX.Element;
  type: ActivityType;
  actionButton?: ReactNode;
  source?: JSX.Element;
}

export function Activity({
  children,
  avatar,
  meta,
  type,
  actionButton,
  source,
}: ActivityProps): JSX.Element {
  return (
    <div className="rounded-2xl bg-gray-800 p-4 text-white">
      <div className="flex items-start justify-between ">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-start gap-2">
            {avatar && avatar}
            {cloneElement(meta, { type })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end justify-between">
            {Children.map(children, (child) => cloneElement(child, { type }))}
          </div>
          {actionButton}
        </div>
      </div>
      {source && (
        <div className={clsx('pt-1', avatar && 'pl-14')}>{cloneElement(source, { type })}</div>
      )}
    </div>
  );
}

interface ActivityMetaProps {
  title: JSX.Element;
  marketplaceAddress?: string;
  type?: ActivityType;
}
function ActivityMeta({ title, marketplaceAddress, type }: ActivityMetaProps): JSX.Element {
  const marketplace = useMemo<Marketplace | undefined>(
    () => getMarketplace(marketplaceAddress),
    [marketplaceAddress]
  );

  const isOwnMarket = useMemo<boolean>(
    () => marketplaceAddress === config.auctionHouseProgram,
    [marketplaceAddress]
  );

  return (
    <div className="flex flex-col gap-2">
      {cloneElement(title, { type })}
      <div className="flex flex-col items-start">
        <div className="flex flex-row justify-start items-center gap-2">
          <img
            width={16}
            height={16}
            src={isOwnMarket ? '/images/moon.svg' : marketplace?.logo}
            alt={`nft marketplace logo ${marketplaceAddress}`}
            className="object-fit h-5"
          />
          <div className="inline-block text-sm">{marketplace?.name}</div>
        </div>
      </div>
    </div>
  );
}

Activity.Meta = ActivityMeta;

interface ActivityTagProps {
  type?: ActivityType;
}

type IconComponent = React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;

function ActivityTag({ type }: ActivityTagProps) {
  const { t } = useTranslation('common');

  // @ts-ignore
  const [label, Icon] = useMemo<[] | [string, IconComponent]>(() => {
    switch (type) {
      case ActivityType.Purchase:
        return [t('purchase', { ns: 'common' }), CurrencyDollarIcon];
      case ActivityType.ListingCreated:
        return [t('listing', { ns: 'common' }), TagIcon];
      case ActivityType.OfferCreated:
        return [t('offer', { ns: 'common' }), HandRaisedIcon];
      case ActivityType.ListingCanceled:
        return [t('cancelledListing', { ns: 'common' }), NoSymbolIcon];
      case ActivityType.OfferCanceled:
        return [t('cancelledOffer', { ns: 'common' }), NoSymbolIcon];
      default:
        return [];
    }
  }, [type, t]);

  return (
    <div className="flex items-center">
      {Icon && <Icon className="mr-2 h-4 w-4 self-center text-white" />}
      <span className="inline-block text-sm">{label}</span>
    </div>
  );
}

Activity.Tag = ActivityTag;

function ActivityPrice({ amount }: { amount?: number }): JSX.Element {
  return (
    <div className={clsx('flex items-center gap-1', !amount && 'invisible')}>
      <Icon.Sol /> {amount ? getSolFromLamports(amount as number, 0, 3) : '—'}
    </div>
  );
}

Activity.Price = ActivityPrice;

function ActivityTimestamp({ signature, timeSince }: { signature?: string; timeSince?: number }) {
  if (!timeSince) {
    return null;
  }

  return (
    <div className="flex flex-row text-right text-sm text-gray-400 gap-1">
      {signature && (
        <div className="flex flex-row items-center gap-1">
          <Link
            target="_blank"
            rel="nofollow noreferrer"
            href={`https://explorer.solana.com/tx/${signature}`}
          >
            <Icon.Sol className="h-3.5 w-3.5" />
          </Link>
          <Link
            target="_blank"
            rel="nofollow noreferrer"
            href={`https://solscan.io/tx/${signature}`}
          >
            <Icon.SolScan width={12} height={12} className="cursor-pointer fill-gray-500" />
          </Link>
        </div>
      )}
      {formatToNow(timeSince)}
    </div>
  );
}

Activity.Timestamp = ActivityTimestamp;

interface ActivityWalletProps {
  buyer?: string | null;
  seller?: string | null;
}

function ActivityWallet({ buyer, seller }: ActivityWalletProps) {
  if (!buyer && !seller) return null;

  return (
    <div className="flex flex-row text-sm gap-1">
      {seller && (
        <Link href={`/profiles/${seller}`} className="flex transition hover:scale-[1.02]">
          {hideTokenDetails(seller)}
        </Link>
      )}
      {seller && buyer && <div className="flex text-gray-400">→</div>}
      {buyer && (
        <Link href={`/profiles/${buyer}`} className="flex transition hover:scale-[1.02]">
          {hideTokenDetails(buyer)}
        </Link>
      )}
    </div>
  );
}

Activity.Wallet = ActivityWallet;

function ActivitySkeleton(): JSX.Element {
  return <div className="h-20 animate-pulse rounded-2xl bg-gray-800" />;
}

Activity.Skeleton = ActivitySkeleton;

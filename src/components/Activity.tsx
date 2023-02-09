import { useTranslation } from 'next-i18next';
import { SVGProps, useMemo, cloneElement, Children, ReactNode } from 'react';
import { Wallet, Maybe, NftMarketplace } from './../graphql.types';
import {
  CurrencyDollarIcon,
  HandRaisedIcon,
  TagIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Icon from './Icon';

export enum ActivityType {
  ListingCreated = 'ListingCreated',
  OfferCreated = 'OfferCreated',
  ListingCanceled = 'ListingCanceled',
  OfferCanceled = 'OfferCanceled',
  Purchase = 'Purchase',
  Sales = 'Sales',
}

interface ActivityProps {
  children: JSX.Element | JSX.Element[];
  avatar?: JSX.Element;
  meta: JSX.Element;
  type: ActivityType;
  actionButton?: ReactNode;
}

export function Activity({
  children,
  avatar,
  meta,
  type,
  actionButton,
}: ActivityProps): JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-gray-800 p-4 text-white">
      <div className="flex flex-row justify-start gap-2">
        {avatar && avatar}
        {cloneElement(meta, { type })}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end justify-between">
          {Children.map(children, (child) => cloneElement(child, { type }))}
        </div>
        {actionButton}
      </div>
    </div>
  );
}

interface ActivityMetaProps {
  title: JSX.Element;
  marketplace: Maybe<NftMarketplace> | undefined;
  source?: JSX.Element;
  type?: ActivityType;
}
function ActivityMeta({ title, marketplace, source, type }: ActivityMetaProps): JSX.Element {
  return (
    <div className="flex flex-col justify-between">
      {cloneElement(title, { type })}
      <div className="flex flex-row items-center gap-2">
        <img
          src={marketplace?.logo as string}
          alt={`nft marketplace logo ${marketplace?.name}`}
          className="object-fit h-3 w-auto"
        />
        {source && (
          <span className="border-l-[1px] border-l-gray-600 pl-2">
            {cloneElement(source, { type })}
          </span>
        )}
      </div>
    </div>
  );
}

Activity.Meta = ActivityMeta;

interface ActivityTagProps {
  type?: ActivityType;
}

function ActivityTag({ type }: ActivityTagProps): JSX.Element {
  const { t } = useTranslation('common');

  const [label, Icon] = useMemo<
    [] | [string, any]
  >(() => {
    switch (type) {
      case ActivityType.Purchase:
      case ActivityType.Sales:
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
      <div className="inline-block">{label}</div>
    </div>
  );
}

Activity.Tag = ActivityTag;

function ActivityPrice({ amount }: { amount: Maybe<number> | undefined }): JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <Icon.Sol /> {amount}
    </div>
  );
}

Activity.Price = ActivityPrice;

function ActivityTimestamp({ timeSince }: { timeSince: Maybe<string> | undefined }): JSX.Element {
  if (!timeSince) {
    return <></>;
  }

  return <div className="text-right text-sm text-gray-400">{timeSince}</div>;
}

Activity.Timestamp = ActivityTimestamp;

interface ActivityWalletProps {
  wallet: Wallet;
}

function ActivityWallet({ wallet }: ActivityWalletProps): JSX.Element {
  return (
    <Link
      href={`/profiles/${wallet?.address}/collected`}
      className="flex items-center gap-1 text-[10px] transition hover:scale-[1.02]"
    >
      <img
        className="aspect-square w-4 rounded-full object-cover"
        src={wallet?.previewImage as string}
        alt={`wallet ${wallet?.address} avatar image`}
      />
      {wallet?.displayName}
    </Link>
  );
}

Activity.Wallet = ActivityWallet;

function ActivitySkeleton(): JSX.Element {
  return <div className="h-20 animate-pulse rounded-2xl bg-gray-800" />;
}

Activity.Skeleton = ActivitySkeleton;

import { useTranslation } from 'next-i18next';
import { SVGProps, useMemo, cloneElement, Children, ReactNode } from 'react';
import { Wallet, Maybe, NftMarketplace } from './../graphql.types';
import { CurrencyDollarIcon, HandRaisedIcon, TagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Icon from './Icon';

export enum ActivityType {
  Purchase = 'purchase',
  Sell = 'sell',
  Listing = 'listing',
  Offer = 'offer',
}

interface ActivityProps {
  children: JSX.Element | JSX.Element[];
  avatar: JSX.Element;
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
    <div className="mb-4 flex items-center justify-between rounded-2xl bg-gray-800 p-4 text-white">
      <div className="flex flex-row justify-start gap-2">
        {avatar}
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
      <div className="flex flex-row gap-2">
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
    [] | [string, (props: SVGProps<SVGSVGElement>) => JSX.Element]
  >(() => {
    switch (type) {
      case ActivityType.Purchase:
      case ActivityType.Sell:
        return [t('purchase'), CurrencyDollarIcon];
      case ActivityType.Listing:
        return [t('listing'), TagIcon];
      case ActivityType.Offer:
        return [t('offer'), HandRaisedIcon];
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
    <div className="flex items-center">
      <Icon.Sol /> {amount}
    </div>
  );
}

Activity.Price = ActivityPrice;

function ActivityTimestamp({ timeSince }: { timeSince: Maybe<string> | undefined }): JSX.Element {
  if (!timeSince) {
    return <></>;
  }

  return <div className="text-right text-xs text-gray-400">{timeSince}</div>;
}

Activity.Timestamp = ActivityTimestamp;

interface ActivityWalletProps {
  wallet: Wallet;
}

function ActivityWallet({ wallet }: ActivityWalletProps): JSX.Element {
  return (
    <Link
      href={`/profiles/${wallet?.address}/collected`}
      passHref
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
  return <div className="mb-4 h-20 rounded-2xl bg-gray-800" />;
}

Activity.Skeleton = ActivitySkeleton;

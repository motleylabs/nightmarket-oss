import { useTranslation } from 'next-i18next';
import { SVGProps, useMemo } from 'react';
import { Activity, Wallet } from '../types';
import { CurrencyDollarIcon, HandIcon, TagIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import { shortenAddress } from '../modules/address';
import clsx from 'clsx';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function ActivityItem({ activity }: { activity: Activity }): JSX.Element {
  const { t } = useTranslation('common');

  const [activityType, User, Icon] = useMemo<
    [] | [string, JSX.Element, (props: SVGProps<SVGSVGElement>) => JSX.Element]
  >(() => {
    switch (activity.activityType) {
      case 'purchase':
        return [
          t('activity.purchase'),
          <TwitterHandle key={activity.id} wallet={activity.wallets[1]} />,
          CurrencyDollarIcon,
        ];
      case 'listing':
        return [
          t('activity.listing'),
          <TwitterHandle key={activity.id} wallet={activity.wallets[0]} />,
          TagIcon,
        ];
      case 'offer':
        return [
          t('activity.offer'),
          <TwitterHandle key={activity.id} wallet={activity.wallets[0]} />,
          HandIcon,
        ];
      default:
        return [];
    }
  }, [activity.activityType, activity.id, activity.wallets, t]);

  return (
    <div
      key={activity.id}
      className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-gray-700 p-4 text-white"
    >
      <div className="flex items-center gap-4">
        <Link href={`/nfts/${activity.nft?.address}/details`} passHref>
          <a className=" transition hover:scale-[1.02]">
            <img
              className="aspect-square w-12 rounded-lg object-cover"
              src={activity.nft?.image}
              alt="nft"
            />
          </a>
        </Link>
        <div className="flex flex-col justify-between gap-2">
          <div className="flex items-center">
            {Icon && <Icon className="mr-2 h-5 w-5 self-center text-white" />}
            <div className="inline-block">{activityType}</div>
          </div>
          <div className="flex gap-3 text-white">
            <span className="text-xs">{shortenAddress(activity.marketplaceProgramAddress)}</span>
            <span className="text-[10px] text-gray-400">|</span>
            {User}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="self-center">{activity.solPrice} SOL</div>
        <div className="flex self-center text-[10px] text-gray-400">
          {formatDistanceToNow(parseISO(activity.createdAt), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}

function TwitterHandle({ wallet }: { wallet: Wallet }): JSX.Element {
  return (
    <Link href={`/profiles/${wallet.address}/collected`} passHref>
      <a className="flex items-center gap-1 text-[10px] transition hover:scale-[1.02]">
        <img
          className="aspect-square w-4 rounded-full object-cover"
          src={wallet.previewImage}
          alt={`wallet ${wallet.address} avatar image`}
        />
        {wallet.displayName}
      </a>
    </Link>
  );
}

function ActivitySkeleton(): JSX.Element {
  return <div className="mb-4 h-16 rounded bg-gray-800" />;
}

ActivityItem.Skeleton = ActivitySkeleton;

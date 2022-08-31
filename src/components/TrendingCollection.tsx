import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { Area, AreaChart } from 'recharts';
import { percentageDifference } from '../modules/number';
import Icon from './Icon';

type FloorData = {
  price: number;
};

interface TrendingCollectionProps {
  name: string;
  image: string;
  floor: number;
  volume: number;
  sales: number;
  marketcap: number;
  address: string;
  floorTrend: FloorData[];
}

export function TrendingCollection({
  name,
  image,
  floor,
  volume,
  sales,
  marketcap,
  floorTrend,
  address,
}: TrendingCollectionProps) {
  const priceChange = floorTrend[floorTrend.length - 1].price - floorTrend[0].price;
  const priceChangePercentage = percentageDifference(
    floorTrend[0].price,
    floorTrend[floorTrend.length - 1].price
  );
  const trendColor = priceChange >= 0 ? '#12B76A' : '#F04438';
  return (
    <>
      <td>
        <Link href={`/collections/${address}`}>
          <a className={'flex flex-row items-center gap-6 py-2 pl-4 lg:pl-0'}>
            <img
              src={image}
              alt={name}
              className="h-10 w-10 transform rounded-lg object-cover duration-500 ease-in-out hover:scale-110"
            />
            <h6 className="transform text-base font-semibold duration-500 ease-in-out hover:scale-105">
              {name}
            </h6>
          </a>
        </Link>
      </td>
      <td className="gap-2 pl-4 lg:pl-0">
        <div className="flex flex-row items-center gap-2">
          <Icon.Currency height={16} width={16} className={'text-white'} />
          <p className="text-base font-semibold">{floor}</p>
          <p
            className={clsx(clsx, 'flex items-center gap-1 text-xs', {
              'text-[#12B76A]': priceChange >= 0,
              'text-[#F04438]': priceChange < 0,
            })}
          >
            <ArrowUpIcon
              className={clsx(clsx, 'h-2 w-2', {
                'rotate-180 transform': priceChange < 0,
                'rotate-0 transform': priceChange >= 0,
              })}
            />
            {priceChangePercentage.toFixed(1)}%
          </p>
        </div>
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="flex flex-row items-center gap-2">
          <Icon.Currency height={16} width={16} className={'text-white'} />
          <p className="text-base font-semibold">{volume}</p>
        </div>
      </td>
      <td className="pl-4 lg:pl-0">
        <p className="text-base font-normal">{sales}</p>
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="flex flex-row items-center gap-2">
          <Icon.Currency height={16} width={16} className={'text-white'} />
          <p className="text-base font-normal">{marketcap.toFixed(1)}</p>
        </div>
      </td>
      <td className="pl-4 lg:pl-0">
        <AreaChart
          key={`${address}-collection-trend-chart`}
          width={120}
          height={40}
          data={floorTrend}
        >
          <Area
            dataKey={'price'}
            stroke={trendColor}
            strokeWidth={1}
            fill={trendColor}
            fillOpacity={0.2}
            type={'monotone'}
          ></Area>
        </AreaChart>
      </td>
    </>
  );
}

export function LoadingTrendingCollection() {
  return (
    <>
      <td className={'flex flex-row items-center gap-6 py-2 pl-4 lg:pl-0'}>
        <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-800" />
        <div className="h-4 w-36 animate-pulse rounded-md bg-gray-800" />
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="h-4 w-16 animate-pulse rounded-md bg-gray-800" />
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="h-4 w-12 animate-pulse rounded-md bg-gray-800" />
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="h-4 w-12 animate-pulse rounded-md bg-gray-800" />
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="h-4 w-20 animate-pulse rounded-md bg-gray-800" />
      </td>
      <td className="pl-4 lg:pl-0">
        <div className="h-6 w-36 animate-pulse rounded-md bg-gray-800" />
      </td>
    </>
  );
}
